const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone').optional().trim(),
  body('address').optional().trim()
];

const loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const staffUserValidation = [
  ...registerValidation,
  body('role')
    .isIn(['admin', 'morgue_attendant'])
    .withMessage('Invalid role specified')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post(
  '/staff',
  authenticateToken,
  authorizeRoles('admin'),
  staffUserValidation,
  authController.createStaffUser
);

module.exports = router;