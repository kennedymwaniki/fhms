const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const { logBookingActivity } = require('../utils/activityLogger');
const db = require('../db/database');

const router = express.Router();

// Validation middleware
const bookingValidation = [
  body('deceased_id').isInt().withMessage('Deceased ID is required'),
  body('services').isArray().withMessage('Services array is required'),
  body('services.*.service_id').isInt().withMessage('Service ID is required'),
  body('services.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('services.*.scheduled_date').optional().isISO8601().withMessage('Invalid date format'),
  body('notes').optional().trim()
];

// Get all bookings (with filters)
router.get('/',
  authenticateToken,
  async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      let query = `
        SELECT b.*, 
               d.first_name as deceased_first_name, 
               d.last_name as deceased_last_name,
               u.name as client_name
        FROM bookings b
        JOIN deceased d ON b.deceased_id = d.id
        JOIN users u ON b.user_id = u.id
      `;
      const params = [];

      // Add filters
      if (status) {
        query += ' WHERE b.status = ?';
        params.push(status);
      }

      // Add user-specific filter for non-admin users
      if (req.user.role !== 'admin') {
        query += status ? ' AND' : ' WHERE';
        query += ' b.user_id = ?';
        params.push(req.user.id);
      }

      query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const bookings = await db.all(query, params);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as count FROM bookings b';
      if (status || req.user.role !== 'admin') {
        countQuery += ' WHERE';
        const whereConditions = [];
        if (status) whereConditions.push('b.status = ?');
        if (req.user.role !== 'admin') whereConditions.push('b.user_id = ?');
        countQuery += ' ' + whereConditions.join(' AND');
      }
      const { count } = await db.get(countQuery, params.slice(0, -2));

      res.json({
        bookings,
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

// Get my bookings (client)
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        b.*,
        d.first_name as deceased_first_name,
        d.last_name as deceased_last_name,
        GROUP_CONCAT(s.name) as service_names
      FROM bookings b
      LEFT JOIN deceased d ON b.deceased_id = d.id
      LEFT JOIN booking_services bs ON b.id = bs.booking_id
      LEFT JOIN services s ON bs.service_id = s.id
      WHERE b.user_id = ?
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `;

    const bookings = await db.all(query, [req.user.id]);

    // Fetch services for each booking
    for (let booking of bookings) {
      const services = await db.all(`
        SELECT bs.*, s.name as service_name, s.price as service_price
        FROM booking_services bs
        JOIN services s ON bs.service_id = s.id
        WHERE bs.booking_id = ?
      `, [booking.id]);
      
      booking.services = services;
    }

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get booking by ID
router.get('/:id',
  authenticateToken,
  async (req, res) => {
    try {
      // Get booking details
      const booking = await db.get(`
        SELECT b.*, 
               d.first_name as deceased_first_name, 
               d.last_name as deceased_last_name,
               u.name as client_name
        FROM bookings b
        JOIN deceased d ON b.deceased_id = d.id
        JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
      `, [req.params.id]);

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check authorization
      if (req.user.role !== 'admin' && req.user.id !== booking.user_id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Get booking services
      const services = await db.all(`
        SELECT bs.*, s.name as service_name, s.price as service_price
        FROM booking_services bs
        JOIN services s ON bs.service_id = s.id
        WHERE bs.booking_id = ?
      `, [req.params.id]);

      booking.services = services;
      res.json({ booking });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create new booking
router.post('/',
  authenticateToken,
  bookingValidation,
  async (req, res) => {
    try {
      const { deceased_id, services, notes } = req.body;
      let totalAmount = 0;

      // Calculate total amount and verify services
      for (const service of services) {
        const serviceData = await db.get(
          'SELECT price FROM services WHERE id = ? AND is_active = 1',
          [service.service_id]
        );
        if (!serviceData) {
          return res.status(400).json({ 
            message: `Service with ID ${service.service_id} not found or inactive` 
          });
        }
        totalAmount += serviceData.price * service.quantity;
      }

      // Create booking
      const result = await db.run(
        `INSERT INTO bookings 
         (user_id, deceased_id, status, total_amount, payment_status, notes)
         VALUES (?, ?, 'pending', ?, 'pending', ?)`,
        [req.user.id, deceased_id, totalAmount, notes]
      );

      // Add booking services
      for (const service of services) {
        await db.run(
          `INSERT INTO booking_services 
           (booking_id, service_id, quantity, price_at_booking, status)
           VALUES (?, ?, ?, (SELECT price FROM services WHERE id = ?), 'pending')`,
          [result.id, service.service_id, service.quantity, service.service_id]
        );
      }

      const newBooking = await db.get(
        'SELECT * FROM bookings WHERE id = ?',
        [result.id]
      );

      // Log booking creation
      await logBookingActivity('created', newBooking.id, req.user.id, `New booking created for deceased ID: ${deceased_id}`);

      res.status(201).json({
        message: 'Booking created successfully',
        booking: newBooking
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update booking status (admin or morgue_attendant only)
router.patch('/:id/status',
  authenticateToken,
  authorizeRoles('admin', 'morgue_attendant'),
  body('status')
    .isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  async (req, res) => {
    try {
      // First check if booking exists
      const existingBooking = await db.get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
      if (!existingBooking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Update the booking status
      await db.run(
        `UPDATE bookings 
         SET status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [req.body.status, req.params.id]
      );

      // Fetch the updated booking with all necessary joins
      const updatedBooking = await db.get(`
        SELECT b.*, 
               d.first_name as deceased_first_name, 
               d.last_name as deceased_last_name,
               u.name as client_name
        FROM bookings b
        JOIN deceased d ON b.deceased_id = d.id
        JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
      `, [req.params.id]);
      
      // Get booking services
      const services = await db.all(`
        SELECT bs.*, s.name as service_name, s.price as service_price
        FROM booking_services bs
        JOIN services s ON bs.service_id = s.id
        WHERE bs.booking_id = ?
      `, [req.params.id]);

      updatedBooking.services = services;
        
      // Log booking status update
      await logBookingActivity(
        'status_updated', 
        updatedBooking.id, 
        req.user.id, 
        `Booking status updated to: ${req.body.status}`
      );

      res.json({
        message: 'Booking status updated successfully',
        booking: updatedBooking
      });
    } catch (error) {
      console.error('Status update error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Update payment status (admin only)
router.patch('/:id/payment',
  authenticateToken,
  authorizeRoles('admin'),
  body('payment_status')
    .isIn(['pending', 'partial', 'paid', 'refunded'])
    .withMessage('Invalid payment status'),
  async (req, res) => {
    try {
      // First check if booking exists
      const existingBooking = await db.get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
      if (!existingBooking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Update payment status
      await db.run(
        `UPDATE bookings 
         SET payment_status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [req.body.payment_status, req.params.id]
      );

      // Fetch the updated booking with all necessary joins
      const updatedBooking = await db.get(`
        SELECT b.*, 
               d.first_name as deceased_first_name, 
               d.last_name as deceased_last_name,
               u.name as client_name
        FROM bookings b
        JOIN deceased d ON b.deceased_id = d.id
        JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
      `, [req.params.id]);

      // Get booking services
      const services = await db.all(`
        SELECT bs.*, s.name as service_name, s.price as service_price
        FROM booking_services bs
        JOIN services s ON bs.service_id = s.id
        WHERE bs.booking_id = ?
      `, [req.params.id]);

      updatedBooking.services = services;

      // Log payment status update
      await logBookingActivity(
        'payment_status_updated', 
        updatedBooking.id, 
        req.user.id, 
        `Payment status updated to: ${req.body.payment_status}`
      );

      res.json({
        message: 'Payment status updated successfully',
        booking: updatedBooking
      });
    } catch (error) {
      console.error('Payment status update error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;