const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const serviceRoutes = require('./src/routes/service.routes');
const bookingRoutes = require('./src/routes/booking.routes');
const deceasedRoutes = require('./src/routes/deceased.routes');
const documentRoutes = require('./src/routes/document.routes');
const feedbackRoutes = require('./src/routes/feedback.routes');
const paymentRoutes = require('./src/routes/payment.routes');

// Initialize database
const db = require('./src/db/database');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers with configuration for serving uploads
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from uploads directory with proper headers
app.use('/uploads', (req, res, next) => {
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/deceased', deceasedRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/payments', paymentRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Funeral Home Management System API' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;