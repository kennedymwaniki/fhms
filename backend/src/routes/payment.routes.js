const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
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

// Get pending payments (unpaid bookings)
router.get('/pending',
  authenticateToken,
  async (req, res) => {
    try {
      const bookings = await db.all(
        `SELECT b.*, d.first_name as deceased_first_name, d.last_name as deceased_last_name
         FROM bookings b
         JOIN deceased d ON b.deceased_id = d.id
         WHERE b.user_id = ? AND b.payment_status IN ('pending', 'partial')
         ORDER BY b.created_at DESC`,
        [req.user.id]
      );
      
      res.json({ bookings });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Initiate M-Pesa payment
router.post('/mpesa/initiate',
  authenticateToken,
  [
    body('phone').matches(/^254[17]\d{8}$/).withMessage('Invalid Safaricom phone number'),
    body('amount').isFloat({ min: 1 }).withMessage('Invalid amount'),
    body('booking_id').isInt().withMessage('Invalid booking ID')
  ],
  async (req, res) => {
    try {
      const { phone, amount, booking_id } = req.body;

      // Verify booking belongs to user and is pending payment
      const booking = await db.get(
        `SELECT * FROM bookings WHERE id = ? AND user_id = ? AND payment_status IN ('pending', 'partial')`,
        [booking_id, req.user.id]
      );

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found or payment not required' });
      }

      // TODO: Integrate with actual M-Pesa API
      // For now, create a pending payment record
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

      // TODO: Integrate with actual M-Pesa API for status check
      // For now, simulate a successful payment after a delay
      if (payment.status === 'processing') {
        // Simulate successful payment
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

        payment.status = 'completed';
      }

      res.json({ status: payment.status });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;