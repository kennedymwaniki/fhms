const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const db = require('../db/database');

const router = express.Router();

// Validation middleware
const feedbackValidation = [
  body('booking_id').isInt().withMessage('Booking ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim(),
  body('is_public').optional().isBoolean()
];

// Get all feedback (with filters)
router.get('/',
  async (req, res) => {
    try {
      const { booking_id, is_public, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT f.*, u.name as client_name
        FROM feedback f
        LEFT JOIN users u ON f.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (booking_id) {
        query += ' AND f.booking_id = ?';
        params.push(booking_id);
      }

      if (is_public !== undefined) {
        query += ' AND f.is_public = ?';
        params.push(is_public === 'true');
      } else {
        // By default, only show public feedback for non-authenticated users
        if (!req.user) {
          query += ' AND f.is_public = 1';
        }
      }

      query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const feedback = await db.all(query, params);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as count FROM feedback f WHERE 1=1';
      if (booking_id) countQuery += ' AND f.booking_id = ?';
      if (is_public !== undefined) {
        countQuery += ' AND f.is_public = ?';
      } else if (!req.user) {
        countQuery += ' AND f.is_public = 1';
      }
      
      const { count } = await db.get(countQuery, params.slice(0, -2));

      res.json({
        feedback,
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

// Get feedback by ID
router.get('/:id',
  async (req, res) => {
    try {
      const feedback = await db.get(
        `SELECT f.*, u.name as client_name
         FROM feedback f
         LEFT JOIN users u ON f.user_id = u.id
         WHERE f.id = ?`,
        [req.params.id]
      );

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      // Check if feedback is private and user is authorized
      if (!feedback.is_public && (!req.user || (req.user.role !== 'admin' && req.user.id !== feedback.user_id))) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json({ feedback });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Submit new feedback
router.post('/',
  authenticateToken,
  feedbackValidation,
  async (req, res) => {
    try {
      const { booking_id, rating, comment, is_public = false } = req.body;

      // Verify booking exists and belongs to user
      const booking = await db.get(
        'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
        [booking_id, req.user.id]
      );

      if (!booking) {
        return res.status(404).json({ 
          message: 'Booking not found or you are not authorized to submit feedback for this booking' 
        });
      }

      // Check if user has already submitted feedback for this booking
      const existingFeedback = await db.get(
        'SELECT * FROM feedback WHERE booking_id = ? AND user_id = ?',
        [booking_id, req.user.id]
      );

      if (existingFeedback) {
        return res.status(400).json({ 
          message: 'You have already submitted feedback for this booking' 
        });
      }

      const result = await db.run(
        `INSERT INTO feedback (
          user_id, booking_id, rating, comment, is_public
        ) VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, booking_id, rating, comment, is_public]
      );

      const newFeedback = await db.get(
        `SELECT f.*, u.name as client_name
         FROM feedback f
         LEFT JOIN users u ON f.user_id = u.id
         WHERE f.id = ?`,
        [result.id]
      );

      res.status(201).json({
        message: 'Feedback submitted successfully',
        feedback: newFeedback
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update feedback
router.put('/:id',
  authenticateToken,
  feedbackValidation,
  async (req, res) => {
    try {
      const feedback = await db.get('SELECT * FROM feedback WHERE id = ?', [req.params.id]);
      
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      // Check if user is authorized to update
      if (req.user.role !== 'admin' && req.user.id !== feedback.user_id) {
        return res.status(403).json({ message: 'Not authorized to update this feedback' });
      }

      const { rating, comment, is_public } = req.body;

      const result = await db.run(
        `UPDATE feedback 
         SET rating = ?, comment = ?, is_public = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [rating, comment, is_public, req.params.id]
      );

      const updatedFeedback = await db.get(
        `SELECT f.*, u.name as client_name
         FROM feedback f
         LEFT JOIN users u ON f.user_id = u.id
         WHERE f.id = ?`,
        [req.params.id]
      );

      res.json({
        message: 'Feedback updated successfully',
        feedback: updatedFeedback
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete feedback
router.delete('/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const feedback = await db.get('SELECT * FROM feedback WHERE id = ?', [req.params.id]);
      
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }

      // Check if user is authorized to delete
      if (req.user.role !== 'admin' && req.user.id !== feedback.user_id) {
        return res.status(403).json({ message: 'Not authorized to delete this feedback' });
      }

      await db.run('DELETE FROM feedback WHERE id = ?', [req.params.id]);

      res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;