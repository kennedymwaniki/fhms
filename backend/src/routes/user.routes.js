const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const db = require('../db/database');

const router = express.Router();

// Validation middleware
const updateUserValidation = [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('password').optional().isLength({ min: 6 })
];

// Get admin dashboard statistics
router.get('/admin/statistics', 
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      console.log('Fetching total users count');
      const { count: totalUsers } = await db.get(
        "SELECT COUNT(*) as count FROM users WHERE role != 'admin'"
      );
      console.log('Total users count:', totalUsers);
    } catch (error) {
      console.error('Error fetching total users count:', error.message);
      throw error;
    }

    try {
      console.log('Fetching active bookings count');
      const { count: activeBookings } = await db.get(
        "SELECT COUNT(*) as count FROM bookings WHERE status IN ('pending', 'confirmed', 'in_progress')"
      );
      console.log('Active bookings count:', activeBookings);
    } catch (error) {
      console.error('Error fetching active bookings count:', error.message);
      throw error;
    }

    try {
      console.log('Fetching monthly revenue');
      const { revenue } = await db.get(`
        SELECT COALESCE(SUM(total_amount), 0) as revenue 
        FROM bookings 
        WHERE payment_status = 'paid' 
        AND created_at >= datetime('now', '-30 days')`
      );
      console.log('Monthly revenue:', revenue);
    } catch (error) {
      console.error('Error fetching monthly revenue:', error.message);
      throw error;
    }

    try {
      console.log('Fetching pending documents count');
      const { count: pendingDocs } = await db.get(
        "SELECT COUNT(*) as count FROM documents WHERE status = 'pending'"
      );
      console.log('Pending documents count:', pendingDocs);
    } catch (error) {
      console.error('Error fetching pending documents count:', error.message);
      throw error;
    }

    try {
      console.log('Fetching pending bookings count');
      const { count: pendingBookings } = await db.get(
        "SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'"
      );
      console.log('Pending bookings count:', pendingBookings);
    } catch (error) {
      console.error('Error fetching pending bookings count:', error.message);
      throw error;
    }

    try {
      console.log('Fetching recent activities');
      const recentActivities = await db.all(`
        SELECT 
          'booking' as type,
          b.id,
          b.status as action,
          u.name as client_name,
          b.created_at,
          CASE 
            WHEN b.status = 'pending' THEN 'New booking created by ' || u.name
            WHEN b.status = 'confirmed' THEN 'Booking #' || b.id || ' confirmed'
            WHEN b.status = 'completed' THEN 'Service completed for booking #' || b.id
            ELSE 'Booking #' || b.id || ' ' || b.status
          END as message
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        ORDER BY b.created_at DESC
        LIMIT 10
      `);
      console.log('Recent activities:', recentActivities);
    } catch (error) {
      console.error('Error fetching recent activities:', error.message);
      throw error;
    }
  }
);

// Get all users (admin only)
router.get('/', 
  authenticateToken, 
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, role } = req.query;
      const result = await User.getAll(parseInt(page), parseInt(limit), role);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get user by ID
router.get('/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Only allow admins to view other users' details
      if (req.user.role !== 'admin' && req.user.id !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update user
router.put('/:id',
  authenticateToken,
  updateUserValidation,
  async (req, res) => {
    try {
      // Only allow users to update their own profile unless they're an admin
      if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const result = await User.update(req.params.id, req.body);
      if (result.id) {
        const updatedUser = await User.findById(req.params.id);
        res.json({ message: 'User updated successfully', user: updatedUser });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete user (admin only)
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const result = await User.delete(req.params.id);
      if (result.id) {
        res.json({ message: 'User deleted successfully' });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;