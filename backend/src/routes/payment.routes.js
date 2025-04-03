const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const { logPaymentActivity } = require('../utils/activityLogger');
const db = require('../db/database');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

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

// Get user's pending payments/bookings that need payment
router.get('/pending',
  authenticateToken,
  async (req, res) => {
    try {
      const bookings = await db.all(
        `SELECT b.*, 
                d.first_name as deceased_first_name, 
                d.last_name as deceased_last_name
         FROM bookings b
         JOIN deceased d ON b.deceased_id = d.id
         WHERE b.user_id = ? AND b.payment_status IN ('pending', 'partial')
         ORDER BY b.created_at DESC`,
        [req.user.id]
      );
      
      // Get services for each booking
      for (const booking of bookings) {
        booking.services = await db.all(
          `SELECT bs.*, s.name as service_name, s.price as service_price
           FROM booking_services bs
           JOIN services s ON bs.service_id = s.id
           WHERE bs.booking_id = ?`,
          [booking.id]
        );
      }
      
      res.json({ bookings });
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

// Generate financial report (admin only)
router.get('/report',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { timeframe = 'month', type = 'all' } = req.query;
      
      // Calculate date range based on timeframe
      const endDate = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'half_year':
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1); // Default to 1 month
      }
      
      // Format dates for SQL query
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Get payments and bookings data - Fixed query to properly join with deceased table
      const paymentsQuery = `
        SELECT p.*, d.first_name as deceased_first_name, d.last_name as deceased_last_name, 
               u.name as client_name, u.email as client_email
        FROM payments p
        JOIN bookings b ON p.booking_id = b.id
        JOIN deceased d ON b.deceased_id = d.id
        JOIN users u ON b.user_id = u.id
        WHERE p.created_at BETWEEN ? AND ?
        ORDER BY p.created_at DESC
      `;

      const servicesQuery = `
        SELECT s.id, s.name, s.price, COUNT(bs.booking_id) as booking_count,
               SUM(s.price) as total_revenue
        FROM services s
        LEFT JOIN booking_services bs ON s.id = bs.service_id
        LEFT JOIN bookings b ON bs.booking_id = b.id
        WHERE b.created_at BETWEEN ? AND ? OR b.created_at IS NULL
        GROUP BY s.id
        ORDER BY total_revenue DESC
      `;

      const paymentsData = await db.all(paymentsQuery, [startDateStr, endDateStr]);
      const servicesData = await db.all(servicesQuery, [startDateStr, endDateStr]);
      
      // Get summary statistics
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT b.id) as total_bookings,
          SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_revenue,
          COUNT(DISTINCT CASE WHEN p.status = 'pending' OR p.status = 'processing' THEN p.id END) as pending_payments,
          SUM(CASE WHEN p.status = 'pending' OR p.status = 'processing' THEN p.amount ELSE 0 END) as pending_amount
        FROM bookings b
        LEFT JOIN payments p ON b.id = p.booking_id
        WHERE b.created_at BETWEEN ? AND ?
      `;
      
      const statsData = await db.get(statsQuery, [startDateStr, endDateStr]);
      
      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'FHMS';
      workbook.lastModifiedBy = 'FHMS';
      workbook.created = new Date();
      workbook.modified = new Date();
      
      // Add a summary sheet
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 }
      ];
      
      // Add summary data
      summarySheet.addRow({ metric: 'Report Period', value: `${startDateStr} to ${endDateStr}` });
      summarySheet.addRow({ metric: 'Total Bookings', value: statsData?.total_bookings || 0 });
      summarySheet.addRow({ metric: 'Total Revenue', value: statsData?.total_revenue || 0 });
      summarySheet.addRow({ metric: 'Pending Payments', value: statsData?.pending_payments || 0 });
      summarySheet.addRow({ metric: 'Pending Amount', value: statsData?.pending_amount || 0 });
      
      // Style the summary sheet
      summarySheet.getRow(1).font = { bold: true };
      summarySheet.getCell('B3').numFmt = '$#,##0.00';
      summarySheet.getCell('B5').numFmt = '$#,##0.00';
      
      // Add a payments sheet
      if (type === 'all' || type === 'payments') {
        const paymentsSheet = workbook.addWorksheet('Payments');
        paymentsSheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Client', key: 'client', width: 30 },
          { header: 'Deceased', key: 'deceased', width: 30 },
          { header: 'Amount', key: 'amount', width: 15 },
          { header: 'Method', key: 'method', width: 15 },
          { header: 'Status', key: 'status', width: 15 }
        ];
        
        // Add header row
        const headerRow = paymentsSheet.getRow(1);
        headerRow.font = { bold: true };
        
        // Add payment data
        paymentsData.forEach(payment => {
          paymentsSheet.addRow({
            id: payment.id,
            date: new Date(payment.created_at).toLocaleDateString(),
            client: payment.client_name,
            deceased: `${payment.deceased_first_name} ${payment.deceased_last_name}`,
            amount: payment.amount,
            method: payment.payment_method,
            status: payment.status
          });
        });
        
        // Format the amount column
        paymentsSheet.getColumn('amount').numFmt = '$#,##0.00';
      }
      
      // Add a services sheet
      if (type === 'all' || type === 'services') {
        const servicesSheet = workbook.addWorksheet('Services');
        servicesSheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Service Name', key: 'name', width: 40 },
          { header: 'Price', key: 'price', width: 15 },
          { header: 'Bookings', key: 'bookings', width: 15 },
          { header: 'Total Revenue', key: 'revenue', width: 20 }
        ];
        
        // Add header row
        const headerRow = servicesSheet.getRow(1);
        headerRow.font = { bold: true };
        
        // Add service data
        servicesData.forEach(service => {
          servicesSheet.addRow({
            id: service.id,
            name: service.name,
            price: service.price,
            bookings: service.booking_count,
            revenue: service.total_revenue
          });
        });
        
        // Format the price and revenue columns
        servicesSheet.getColumn('price').numFmt = '$#,##0.00';
        servicesSheet.getColumn('revenue').numFmt = '$#,##0.00';
      }
      
      // Create directory for reports if it doesn't exist
      const reportsDir = path.join(__dirname, '../../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `Financial_Report_${timeframe}_${timestamp}.xlsx`;
      const filePath = path.join(reportsDir, fileName);
      
      // Save workbook
      await workbook.xlsx.writeFile(filePath);
      
      // Send the file as a response
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Error sending report file:', err);
        }
        
        // Delete the file after sending
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;