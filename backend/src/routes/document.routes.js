const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const { logDocumentActivity } = require('../utils/activityLogger');
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
    // Sanitize filename and add timestamp
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9\-_\.]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + sanitizedName);
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

// Error handling middleware for multer
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size cannot exceed 5MB' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Validation middleware
const documentValidation = [
  body('document_type')
    .isIn(['death_certificate', 'burial_permit', 'contract', 'invoice', 'receipt', 'other'])
    .withMessage('Invalid document type'),
  body('description').optional().trim(),
  body('booking_id').optional().isInt(),
  body('deceased_id').optional().isInt()
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

// Get user's documents
router.get('/my',
  authenticateToken,
  async (req, res) => {
    try {
      const query = `
        SELECT d.*, u.name as uploaded_by_name
        FROM documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.booking_id IN (
          SELECT id FROM bookings WHERE user_id = ?
        )
        OR d.uploaded_by = ?
        ORDER BY d.created_at DESC
      `;

      const documents = await db.all(query, [req.user.id, req.user.id]);
      res.json({ documents });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get document by ID
router.get('/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const document = await db.get(`
        SELECT d.*, u.name as uploaded_by_name
        FROM documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.id = ?
      `, [req.params.id]);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Check authorization
      const isOwner = document.uploaded_by === req.user.id;
      const hasAccess = await db.get(`
        SELECT 1 FROM bookings 
        WHERE id = ? AND user_id = ?
      `, [document.booking_id, req.user.id]);

      if (req.user.role !== 'admin' && !isOwner && !hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json({ document });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Download document
router.get('/:id/download',
  authenticateToken,
  async (req, res) => {
    try {
      const document = await db.get('SELECT * FROM documents WHERE id = ?', [req.params.id]);
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Check authorization
      const isOwner = document.uploaded_by === req.user.id;
      const hasAccess = await db.get(`
        SELECT 1 FROM bookings 
        WHERE id = ? AND user_id = ?
      `, [document.booking_id, req.user.id]);

      if (req.user.role !== 'admin' && !isOwner && !hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const filePath = path.join(__dirname, '../../uploads', document.file_path);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }

      res.download(filePath, document.name);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Upload new document
router.post('/',
  authenticateToken,
  upload.single('file'),
  uploadErrorHandler,
  documentValidation,
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { document_type, description, booking_id, deceased_id } = req.body;
      
      if (!document_type) {
        return res.status(400).json({ message: 'Document type is required' });
      }

      const file_path = req.file.filename;

      // If booking_id is provided, verify access
      if (booking_id) {
        const booking = await db.get('SELECT user_id FROM bookings WHERE id = ?', [booking_id]);
        if (!booking || (req.user.role !== 'admin' && booking.user_id !== req.user.id)) {
          return res.status(403).json({ message: 'Not authorized to add document to this booking' });
        }
      }

      const result = await db.run(
        `INSERT INTO documents (
          name, file_path, document_type, description,
          deceased_id, booking_id, uploaded_by, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.file.originalname,
          file_path,
          document_type,
          description || null,
          deceased_id || null,
          booking_id || null,
          req.user.id,
          'pending'
        ]
      );

      const document = await db.get(
        `SELECT d.*, u.name as uploaded_by_name 
         FROM documents d
         LEFT JOIN users u ON d.uploaded_by = u.id
         WHERE d.id = ?`,
        [result.lastID]
      );

      // Log document upload
      await logDocumentActivity('uploaded', document.id, req.user.id, 
        `Document uploaded: ${document.name} (${document_type})${booking_id ? ` for booking #${booking_id}` : ''}`
      );

      res.status(201).json({
        message: 'Document uploaded successfully',
        document
      });
    } catch (error) {
      console.error('Document upload error:', error);
      if (req.file) {
        try {
          fs.unlinkSync(path.join(__dirname, '../../uploads', req.file.filename));
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
      res.status(500).json({ message: error.message });
    }
  }
);

// Update document status (admin only)
router.patch('/:id/status',
  authenticateToken,
  authorizeRoles('admin'),
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  body('notes').optional().trim(),
  async (req, res) => {
    try {
      const { status, notes } = req.body;
      
      const document = await db.get('SELECT * FROM documents WHERE id = ?', [req.params.id]);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const result = await db.run(
        `UPDATE documents 
         SET status = ?, review_notes = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, notes || null, req.user.id, req.params.id]
      );

      const updatedDocument = await db.get(
        `SELECT d.*, u.name as uploaded_by_name 
         FROM documents d
         LEFT JOIN users u ON d.uploaded_by = u.id
         WHERE d.id = ?`,
        [req.params.id]
      );

      // Log document status update
      await logDocumentActivity(
        'status_updated',
        document.id,
        req.user.id,
        `Document ${status}: ${document.name}${notes ? ` - ${notes}` : ''}`
      );

      res.json({
        message: 'Document status updated successfully',
        document: updatedDocument
      });
    } catch (error) {
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

      const filePath = path.join(__dirname, '../../uploads', document.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete database record
      await db.run('DELETE FROM documents WHERE id = ?', [req.params.id]);

      // Log document deletion
      await logDocumentActivity('deleted', document.id, req.user.id, `Document deleted: ${document.name}`);

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;