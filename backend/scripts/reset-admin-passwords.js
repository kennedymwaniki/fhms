/**
 * Script to reset passwords for admin accounts
 * This fixes the issue where admin accounts might not have passwords properly stored
 */
const bcrypt = require('bcrypt');
const db = require('../src/db/database');

async function resetAdminPasswords() {
  try {
    console.log('Starting admin password reset process...');

    // Admin accounts to reset
    const admins = [
      {
        email: 'kenny@gmail.com',
        password: '12345678',
      },
      {
        email: 'shekky@gmail.com',
        password: '12345678',
      },
      {
        email: 'lonny@gmail.com',
        password: '123456789',
      }
    ];

    for (const admin of admins) {
      console.log(`Processing account: ${admin.email}`);
      
      // Check if user exists
      const user = await db.get('SELECT * FROM users WHERE email = ?', [admin.email]);
      
      if (!user) {
        console.log(`User ${admin.email} not found - creating new admin account`);
        
        // Create the admin account if it doesn't exist
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        
        await db.run(
          'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
          [`${admin.email.split('@')[0].charAt(0).toUpperCase() + admin.email.split('@')[0].slice(1)} Admin`, 
            admin.email, 
            hashedPassword, 
            'admin', 
            '', 
            '']
        );
        
        console.log(`Created new admin account: ${admin.email}`);
      } else {
        console.log(`Resetting password for user: ${admin.email}`);
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        
        // Update the password
        await db.run(
          'UPDATE users SET password = ? WHERE email = ?',
          [hashedPassword, admin.email]
        );
        
        console.log(`Password reset successful for: ${admin.email}`);
      }
    }

    console.log('Admin password reset process completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin passwords:', error);
    process.exit(1);
  }
}

resetAdminPasswords();