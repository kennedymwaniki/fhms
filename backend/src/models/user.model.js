const bcrypt = require('bcrypt');
const db = require('../db/database');

class User {
  // Find user by email
  static async findByEmail(email) {
    return await db.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  // Find user by ID
  static async findById(id) {
    return await db.get('SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = ?', [id]);
  }

  // Create a new user
  static async create(userData) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Insert the user
    const result = await db.run(
      'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [userData.name, userData.email, hashedPassword, userData.role || 'client', userData.phone, userData.address]
    );
    
    return result;
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
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;