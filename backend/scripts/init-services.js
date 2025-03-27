const db = require('../src/db/database');

async function initializeServices() {
    try {
        const services = [
            {
                name: 'Basic Funeral Service',
                description: 'Traditional funeral service including basic casket, viewing, and ceremony',
                price: 50000,
                duration_minutes: 120,
                category: 'ceremony'
            },
            {
                name: 'Premium Funeral Package',
                description: 'Complete funeral service with premium casket, extended viewing, ceremony, and transportation',
                price: 85000,
                duration_minutes: 180,
                category: 'ceremony'
            },
            {
                name: 'Cremation Service',
                description: 'Complete cremation service with urn and memorial service',
                price: 45000,
                duration_minutes: 120,
                category: 'cremation'
            },
            {
                name: 'Body Preparation',
                description: 'Professional embalming and preparation services',
                price: 25000,
                duration_minutes: 180,
                category: 'preparation'
            },
            {
                name: 'Transportation Service',
                description: 'Hearse and family vehicle service for funeral proceedings',
                price: 15000,
                duration_minutes: 240,
                category: 'transportation'
            },
            {
                name: 'Burial Service',
                description: 'Complete burial service including grave preparation and ceremony',
                price: 40000,
                duration_minutes: 120,
                category: 'burial'
            }
        ];

        for (const service of services) {
            // Check if service already exists
            const existing = await db.get('SELECT * FROM services WHERE name = ?', [service.name]);
            if (existing) {
                console.log(`Service ${service.name} already exists`);
                continue;
            }

            // Insert service
            await db.run(
                'INSERT INTO services (name, description, price, duration_minutes, category) VALUES (?, ?, ?, ?, ?)',
                [service.name, service.description, service.price, service.duration_minutes, service.category]
            );
            console.log(`Created service: ${service.name}`);
        }

        console.log('Services initialization completed');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing services:', error);
        process.exit(1);
    }
}

initializeServices();