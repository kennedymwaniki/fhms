const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const db = require('../db/database');

const router = express.Router();

// Validation middleware
const serviceValidation = [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration_minutes').optional().isInt({ min: 1 }).withMessage('Duration must be a positive number'),
  body('description').optional().trim(),
  body('category')
    .isIn(['preparation', 'ceremony', 'burial', 'cremation', 'transportation', 'other'])
    .withMessage('Invalid service category')
];

// Get all services
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM services WHERE is_active = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY name';
    const services = await db.all(query, params);
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await db.get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new service (admin only)
router.post('/',
  authenticateToken,
  authorizeRoles('admin'),
  serviceValidation,
  async (req, res) => {
    try {
      const { name, description, price, duration_minutes, category } = req.body;
      const result = await db.run(
        'INSERT INTO services (name, description, price, duration_minutes, category) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, duration_minutes, category]
      );
      
      const newService = await db.get('SELECT * FROM services WHERE id = ?', [result.id]);
      res.status(201).json({ message: 'Service created successfully', service: newService });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update service (admin only)
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  serviceValidation,
  async (req, res) => {
    try {
      const { name, description, price, duration_minutes, category, is_active } = req.body;
      const result = await db.run(
        `UPDATE services 
         SET name = ?, description = ?, price = ?, duration_minutes = ?, 
             category = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, description, price, duration_minutes, category, is_active, req.params.id]
      );
      
      if (result.id) {
        const updatedService = await db.get('SELECT * FROM services WHERE id = ?', [req.params.id]);
        res.json({ message: 'Service updated successfully', service: updatedService });
      } else {
        res.status(404).json({ message: 'Service not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete service (admin only)
router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      // Soft delete by setting is_active to false
      const result = await db.run(
        'UPDATE services SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [req.params.id]
      );
      
      if (result.id) {
        res.json({ message: 'Service deleted successfully' });
      } else {
        res.status(404).json({ message: 'Service not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;