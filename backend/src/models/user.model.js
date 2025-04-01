const bcrypt = require('bcrypt');
const db = require('../db/database');

class User {
  // Find user by email
  static async findByEmail(email) {
    console.log('Executing findByEmail query for email:', email);
    try {
      // Check if email is valid
      if (!email || typeof email !== 'string') {
        console.error('Invalid email parameter:', email);
        return null;
      }

      // Make sure to explicitly select all fields including password
      const user = await db.get('SELECT id, name, email, password, role, phone, address, created_at FROM users WHERE email = ? COLLATE NOCASE', [email.trim()]);
      console.log('User found for email:', email, !!user, user ? 'with password:' + !!user.password : 'no user');
      return user;
    } catch (error) {
      console.error('Error in findByEmail:', error.message);
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    return await db.get('SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = ?', [id]);
  }

  // Create a new user
  static async create(userData) {
    try {
      // Validate required fields
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('Required fields missing (name, email, or password)');
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Handle null/undefined fields
      const phone = userData.phone || '';
      const address = userData.address || '';
      const role = userData.role || 'client';
      
      // Insert the user
      const result = await db.run(
        'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
        [userData.name, userData.email.toLowerCase().trim(), hashedPassword, role, phone, address]
      );
      
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user details
  static async update(id, userData) {
    const updateFields = [];
    const values = [];
    
    // Only update provided fields
    if (userData.name) {
      updateFields.push('name = ?');
      values.push(userData.name);
    }
    
    if (userData.phone) {
      updateFields.push('phone = ?');
      values.push(userData.phone);
    }
    
    if (userData.address) {
      updateFields.push('address = ?');
      values.push(userData.address);
    }
    
    // Only admins can update role
    if (userData.role) {
      updateFields.push('role = ?');
      values.push(userData.role);
    }
    
    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      updateFields.push('password = ?');
      values.push(hashedPassword);
    }
    
    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add id to values array
    values.push(id);
    
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    
    return await db.run(query, values);
  }

  // Get all users (with pagination and optional filtering)
  static async getAll(page = 1, limit = 10, role = null) {
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, name, email, role, phone, created_at FROM users';
    const params = [];
    
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const users = await db.all(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as count FROM users';
    if (role) {
      countQuery += ' WHERE role = ?';
    }
    
    const countResult = await db.get(countQuery, role ? [role] : []);
    const total = countResult.count;
    
    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Delete a user
  static async delete(id) {
    return await db.run('DELETE FROM users WHERE id = ?', [id]);
  }

  // Compare password for login
  static async comparePassword(plainPassword, hashedPassword) {
    // Better validation with detailed error messages
    if (!plainPassword) {
      console.error('plainPassword is missing or empty');
      throw new Error('Login error: Password is required');
    }
    
    if (!hashedPassword) {
      console.error('hashedPassword is missing or empty');
      throw new Error('Authentication error - password data incomplete');
    }
    
    // Safety check for non-string values
    if (typeof plainPassword !== 'string' || typeof hashedPassword !== 'string') {
      console.error('Password type error:', { 
        plainPasswordType: typeof plainPassword,
        hashedPasswordType: typeof hashedPassword
      });
      throw new Error('Invalid password format');
    }
    
    // Compare passwords with bcrypt
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('bcrypt comparison error:', error);
      throw new Error('Password comparison failed');
    }
  }
}

module.exports = User;