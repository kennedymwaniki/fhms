const bcrypt = require('bcrypt');
const db = require('../src/db/database');

async function createAdminUsers() {
    try {
        const admins = [
            {
                name: 'Kenny Admin',
                email: 'kenny@gmail.com',
                password: '12345678',
                role: 'admin',
                phone: '',
                address: ''
            },
            {
                name: 'Shekky Admin',
                email: 'shekky@gmail.com',
                password: '12345678',
                role: 'admin',
                phone: '',
                address: ''
            },
            {
                name: 'Lonny Admin',
                email: 'lonny@gmail.com',
                password: '123456789',
                role: 'admin',
                phone: '',
                address: ''
            }
        ];

        for (const admin of admins) {
            // Check if admin already exists
            const existing = await db.get('SELECT * FROM users WHERE email = ?', [admin.email]);
            if (existing) {
                console.log(`User ${admin.email} already exists`);
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(admin.password, 10);

            // Insert admin user
            await db.run(
                'INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
                [admin.name, admin.email, hashedPassword, admin.role, admin.phone, admin.address]
            );

            console.log(`Created admin user: ${admin.email}`);
        }

        console.log('Admin users creation completed');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin users:', error);
        process.exit(1);
    }
}

createAdminUsers();