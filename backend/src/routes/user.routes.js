const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const User = require('../models/user.model');

const router = express.Router();

// Validation middleware
const updateUserValidation = [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('password').optional().isLength({ min: 6 })
];

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