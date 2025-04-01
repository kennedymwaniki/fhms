const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');

// Fallback values for JWT in case environment variables are not loaded
const JWT_SECRET = process.env.JWT_SECRET || 'fhms_super_secret_key_replace_in_production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

// Register a new user
async function register(req, res) {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Create new user with 'client' role by default
    const result = await User.create({
      name,
      email,
      password,
      role: 'client', // Default role for registration
      phone,
      address
    });

    // Get the created user (without password)
    const user = await User.findById(result.id);

    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
}

// User login
async function login(req, res) {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // Return user info and token
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
}

// Get current user profile
async function getCurrentUser(req, res) {
  try {
    const userId = req.user.id;
    
    // Get user data from database
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
}

// Create staff user (admin only)
async function createStaffUser(req, res) {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone, address } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    // Validate role (only admins can create other admins)
    if (role !== 'client' && role !== 'morgue_attendant' && role !== 'admin') {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Create new user with specified role
    const result = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address
    });

    // Get the created user (without password)
    const user = await User.findById(result.id);

    res.status(201).json({
      message: 'Staff user created successfully',
      user
    });
  } catch (error) {
    console.error('Create staff user error:', error);
    res.status(500).json({ message: 'Server error while creating staff user' });
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
  createStaffUser
};