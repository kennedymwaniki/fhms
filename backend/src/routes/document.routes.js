const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const db = require('../db/database');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, and DOC files are allowed.'));
    }
  }
});

// Validation middleware
const documentValidation = [
  body('document_type')
    .isIn(['death_certificate', 'burial_permit', 'contract', 'invoice', 'receipt', 'other'])
    .withMessage('Invalid document type'),
  body('deceased_id').optional().isInt(),
  body('booking_id').optional().isInt()
];

// Get all documents (with filters)
router.get('/',
  authenticateToken,
  async (req, res) => {
    try {
      const { deceased_id, booking_id, document_type, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT d.*, u.name as uploaded_by_name 
        FROM documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE 1=1
      `;
      const params = [];

      if (deceased_id) {
        query += ' AND d.deceased_id = ?';
        params.push(deceased_id);
      }
      if (booking_id) {
        query += ' AND d.booking_id = ?';
        params.push(booking_id);
      }
      if (document_type) {
        query += ' AND d.document_type = ?';
        params.push(document_type);
      }

      // Non-admin users can only see documents related to their bookings
      if (req.user.role !== 'admin') {
        query += ` AND (
          d.booking_id IN (SELECT id FROM bookings WHERE user_id = ?) OR
          d.uploaded_by = ?
        )`;
        params.push(req.user.id, req.user.id);
      }

      query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const documents = await db.all(query, params);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as count FROM documents d WHERE 1=1';
      if (deceased_id) countQuery += ' AND d.deceased_id = ?';
      if (booking_id) countQuery += ' AND d.booking_id = ?';
      if (document_type) countQuery += ' AND d.document_type = ?';
      if (req.user.role !== 'admin') {
        countQuery += ` AND (
          d.booking_id IN (SELECT id FROM bookings WHERE user_id = ?) OR
          d.uploaded_by = ?
        )`;
      }
      
      const { count } = await db.get(countQuery, params.slice(0, -2));

      res.json({
        documents,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Upload new document
router.post('/',
  authenticateToken,
  upload.single('file'),
  documentValidation,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { document_type, deceased_id, booking_id } = req.body;
      const file_path = path.relative(path.join(__dirname, '../../uploads'), req.file.path);

      const result = await db.run(
        `INSERT INTO documents (
          name, file_path, document_type, deceased_id,
          booking_id, uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          req.file.originalname,
          file_path,
          document_type,
          deceased_id || null,
          booking_id || null,
          req.user.id
        ]
      );

      const document = await db.get(
        `SELECT d.*, u.name as uploaded_by_name 
         FROM documents d
         LEFT JOIN users u ON d.uploaded_by = u.id
         WHERE d.id = ?`,
        [result.id]
      );

      res.status(201).json({
        message: 'Document uploaded successfully',
        document
      });
    } catch (error) {
      // Clean up uploaded file if database operation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete document
router.delete('/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const document = await db.get('SELECT * FROM documents WHERE id = ?', [req.params.id]);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Check authorization
      if (req.user.role !== 'admin' && req.user.id !== document.uploaded_by) {
        return res.status(403).json({ message: 'Not authorized to delete this document' });
      }

      // Delete file from filesystem
      const filePath = path.join(__dirname, '../../uploads', document.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete database record
      await db.run('DELETE FROM documents WHERE id = ?', [req.params.id]);

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;