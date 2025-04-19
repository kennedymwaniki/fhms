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


const consumerKey = process.env.CONSUMER_KEY || "your_consumer_key";
const consumerSecret = process.env.CONSUMER_SECRET || "your_consumer_secret";
const url =
  "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"; //sandbox
// const url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",  //live

// sandbox

//! in production we use the  live url and the credentials are gotten from the admin portal and email after registration in order for paybill or buygoods to work
//! in production passkey || verification type ||organization shportcode || organization name and M-pesa username are admin granted client must have registered for special till/paybill for intergration

const MPESA_BASE_URL = "https://sandbox.safaricom.co.ke";

//live
//  const MPESA_BASE_URL =  "https://api.safaricom.co.ke"

// middleware
const tokenMiddleWare = async (req, res, next) => {
  try {
    const encodedCredentials = Buffer.from(
      consumerKey + ":" + consumerSecret
    ).toString("base64");

    const headers = {
      Authorization: "Basic" + " " + encodedCredentials,
      "Content-Type": "application/json",
    };

    const response = await axios.get(url, { headers });
    req.MPESA_AUTHTOKEN = response.data.access_token;
    console.log(req.MPESA_AUTHTOKEN);
    console.log("Token generated successfully.");
    next();
  } catch (error) {
    console.log(error);
    throw new Error("Failed to get access token.");
  }
};

// stk push endpoint
app.post("/api/stk-push", tokenMiddleWare, async (req, res) => {
  // token is needed
  const { phoneNumber, amount } = req.body;
  const token = req.MPESA_AUTHTOKEN;

  try {
    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    // in production
    const password = Buffer.from(
      process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
    ).toString("base64");

    const formattedPhone = `254${phoneNumber.slice(-9)}`;

    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE, // store number for tills
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline", //CustomerBuyGoodsOnline - for till
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE, //till number for tills
        PhoneNumber: formattedPhone,
        CallBackURL: "https://mydomain.com/callback-url-path",
        AccountReference: formattedPhone,
        TransactionDesc: "anything here",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.status(200).json({
      message: `stk sent successfully to ${formattedPhone}`,
      data: response.data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error processing request" });
  }
});

// stk push query endpoint
app.post("/api/stk-push-query", tokenMiddleWare, async (req, res) => {
  const reqId = req.body.reqId;
  const token = req.MPESA_AUTHTOKEN;
  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);

  const password = Buffer.from(
    process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
  ).toString("base64");

  try {
    const response = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: reqId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.status(200).json({
      message: `stk query sent successfully`,
      data: response.data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error processing request" });
  }
});

// callback
app.post("/callback-url-path", (req, res) => {
  // handle the callback from safaricom here
  console.log("Callback received:", req.body);
  res.status(200).send("Callback received successfully");
});













app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;