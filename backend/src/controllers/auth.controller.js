const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const { logUserActivity } = require('../utils/activityLogger');
const db = require('../db/database');

// Fallback value for JWT secret and expiration in case environment variable is not loaded
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

    // Check if user already exists - with better error handling
    try {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
    } catch (error) {
      console.error('Error checking existing user:', error);
      // Don't stop registration if the check fails - might be DB connectivity issue
    }

    // Create new user with 'client' role by default
    const result = await User.create({
      name,
      email,
      password,
      role: 'client',
      phone: phone || '',
      address: address || ''
    });

    // Get the created user (without password)
    const user = await User.findById(result.lastID || result.id);

    // Log the registration
    try {
      await logUserActivity('registered', user.id, `New user registration: ${user.name}`);
    } catch (logError) {
      console.error('Error logging user activity:', logError);
      // Continue despite logging error
    }

    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration: ' + error.message });
  }
}

// User login
async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Try to find the user
    let user;
    try {
      user = await User.findByEmail(email);
    } catch (error) {
      console.error('Error finding user:', error);
      return res.status(500).json({ message: 'Error finding user account' });
    }
    
    if (!user) {
      console.log('No user found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', { id: user.id, email: user.email, hasPassword: !!user.password, role: user.role });

    // Recovery for admin accounts with missing passwords
    if (!user.password && user.role === 'admin') {
      console.log('Admin account found with missing password. Auto-recovering...');
      
      // Default admin passwords
      const adminPasswords = {
        'kenny@gmail.com': '12345678',
        'shekky@gmail.com': '12345678',
        'lonny@gmail.com': '123456789',
        'default': '12345678' // fallback password
      };
      
      // Get default password for this admin or use fallback
      const defaultPassword = adminPasswords[email] || adminPasswords.default;
      
      // Set new password for admin
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
      
      console.log('Admin account recovered with default password');
      
      // Now the user has a password, continue with login
      user.password = hashedPassword;
    }

    // Regular account with missing password - can't auto-fix
    if (!user.password) {
      console.log('Account has no password and is not an admin:', email);
      return res.status(400).json({ message: 'Account setup incomplete. Please contact support.' });
    }

    // Compare password directly with bcrypt (simplifying)
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Password comparison error:', error);
      
      // Special handling for admin accounts only
      if (user.role === 'admin') {
        console.log('Attempting to recover admin account after password error');
        
        // Admin account recovery
        const adminPassword = email === 'lonny@gmail.com' ? '123456789' : '12345678';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
        
        // Try comparing with new password
        isPasswordValid = await bcrypt.compare(password, hashedPassword);
      }
    }
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
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
    
    // Log the successful login activity
    try {
      await logUserActivity('login', user.id, `User login: ${user.email}`);
    } catch (logError) {
      console.error('Error logging user activity:', logError);
      // Continue despite logging error
    }

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
    res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
}

// Create staff user (admin only)
async function createStaffUser(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone, address } = req.body;
    
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    if (role !== 'client' && role !== 'morgue_attendant' && role !== 'admin') {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const result = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address
    });

    const user = await User.findById(result.id);

    // Log staff user creation
    try {
      await logUserActivity('created', user.id, `Staff user created: ${user.name} (${role})`);
    } catch (logError) {
      console.error('Error logging user activity:', logError);
      // Continue despite logging error
    }

    res.status(201).json({
      message: 'Staff user created successfully',
      user
    });
  } catch (error) {
    console.error('Create staff user error:', error);
    res.status(500).json({ message: 'Server error while creating staff user' });
  }
}

// Get current user profile
async function getCurrentUser(req, res) {
  try {
    const userId = req.user.id;
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

module.exports = {
  register,
  login,
  getCurrentUser,
  createStaffUser
};