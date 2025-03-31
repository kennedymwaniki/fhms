const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const { logPaymentActivity } = require('../utils/activityLogger');
const db = require('../db/database');

const router = express.Router();

// Get user's payments
router.get('/my',
  authenticateToken,
  async (req, res) => {
    try {
      const payments = await db.all(
        `SELECT p.*, b.total_amount as booking_amount
         FROM payments p
         JOIN bookings b ON p.booking_id = b.id
         WHERE b.user_id = ?
         ORDER BY p.created_at DESC`,
        [req.user.id]
      );
      
      res.json({ payments });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Initialize M-Pesa payment
router.post('/mpesa/initiate',
  authenticateToken,
  body('booking_id').isInt().withMessage('Booking ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('phone').matches(/^[0-9+]{10,13}$/).withMessage('Valid phone number is required'),
  async (req, res) => {
    try {
      const { booking_id, amount, phone } = req.body;

      // Verify booking exists and requires payment
      const booking = await db.get(
        `SELECT * FROM bookings WHERE id = ? AND user_id = ? AND payment_status IN ('pending', 'partial')`,
        [booking_id, req.user.id]
      );

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found or payment not required' });
      }

      // Create payment record
      const result = await db.run(
        `INSERT INTO payments (
          booking_id, amount, payment_method, transaction_id,
          mpesa_phone, status
        ) VALUES (?, ?, 'mpesa', ?, ?, 'processing')`,
        [
          booking_id,
          amount,
          'MP' + Date.now(), // Simulated transaction ID
          phone
        ]
      );

      // Update booking payment status
      await db.run(
        `UPDATE bookings 
         SET payment_status = 'partial',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [booking_id]
      );

      // Log payment initiation
      await logPaymentActivity('initiated', result.lastID, req.user.id, `M-Pesa payment initiated: $${amount} for booking #${booking_id}`);

      res.json({
        message: 'M-Pesa payment initiated',
        transactionId: result.id
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Verify M-Pesa payment status
router.get('/mpesa/verify/:transactionId',
  authenticateToken,
  async (req, res) => {
    try {
      const payment = await db.get(
        `SELECT p.*, b.user_id
         FROM payments p
         JOIN bookings b ON p.booking_id = b.id
         WHERE p.id = ?`,
        [req.params.transactionId]
      );

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      if (payment.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Simulate successful payment after processing
      if (payment.status === 'processing') {
        // Update payment status
        await db.run(
          `UPDATE payments 
           SET status = 'completed',
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [payment.id]
        );

        // Update booking payment status
        await db.run(
          `UPDATE bookings 
           SET payment_status = 'paid',
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [payment.booking_id]
        );

        // Log payment completion
        await logPaymentActivity('completed', payment.id, req.user.id, `Payment completed for booking #${payment.booking_id}`);

        payment.status = 'completed';
      }

      res.json({ status: payment.status });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;