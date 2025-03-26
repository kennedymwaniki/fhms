const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth.middleware');
const db = require('../db/database');

const router = express.Router();

// Validation middleware
const deceasedValidation = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('date_of_death').isISO8601().withMessage('Valid date of death is required'),
  body('date_of_birth').optional().isISO8601().withMessage('Invalid date of birth'),
  body('place_of_death').optional().trim(),
  body('cause_of_death').optional().trim(),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('identity_number').optional().trim(),
  body('religion').optional().trim(),
  body('notes').optional().trim(),
  body('storage_location').optional().trim(),
  body('next_of_kin').isArray().withMessage('Next of kin information is required'),
  body('next_of_kin.*.name').trim().notEmpty().withMessage('Next of kin name is required'),
  body('next_of_kin.*.relationship').trim().notEmpty().withMessage('Relationship is required'),
  body('next_of_kin.*.phone').trim().notEmpty().withMessage('Phone number is required'),
  body('next_of_kin.*.email').optional().isEmail().withMessage('Invalid email'),
  body('next_of_kin.*.address').optional().trim(),
  body('next_of_kin.*.is_primary').optional().isBoolean()
];

// Get all deceased records (with pagination and search)
router.get('/',
  authenticateToken,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM deceased';
      const params = [];

      if (search) {
        query += ` WHERE 
          first_name LIKE ? OR 
          last_name LIKE ? OR 
          identity_number LIKE ?`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const deceased = await db.all(query, params);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as count FROM deceased';
      if (search) {
        countQuery += ` WHERE 
          first_name LIKE ? OR 
          last_name LIKE ? OR 
          identity_number LIKE ?`;
      }
      const { count } = await db.get(
        countQuery, 
        search ? [params[0], params[1], params[2]] : []
      );

      // Get next of kin for each deceased
      for (let record of deceased) {
        record.next_of_kin = await db.all(
          'SELECT * FROM next_of_kin WHERE deceased_id = ?',
          [record.id]
        );
      }

      res.json({
        deceased,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get deceased by ID
router.get('/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const deceased = await db.get(
        'SELECT * FROM deceased WHERE id = ?',
        [req.params.id]
      );

      if (!deceased) {
        return res.status(404).json({ message: 'Deceased record not found' });
      }

      // Get next of kin
      deceased.next_of_kin = await db.all(
        'SELECT * FROM next_of_kin WHERE deceased_id = ?',
        [deceased.id]
      );

      res.json({ deceased });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create new deceased record
router.post('/',
  authenticateToken,
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('date_of_death').isISO8601().withMessage('Valid date of death is required'),
  body('place_of_death').optional().trim(),
  async (req, res) => {
    try {
      const {
        first_name, last_name, date_of_death, place_of_death
      } = req.body;

      // Create deceased record with basic information
      const result = await db.run(
        `INSERT INTO deceased (
          first_name, last_name, date_of_death,
          place_of_death, preparation_status,
          release_status
        ) VALUES (?, ?, ?, ?, 'pending', 'in_storage')`,
        [
          first_name, last_name, date_of_death,
          place_of_death
        ]
      );

      const newDeceased = await db.get(
        'SELECT * FROM deceased WHERE id = ?',
        [result.id]
      );

      res.status(201).json({
        message: 'Deceased record created successfully',
        deceased: newDeceased
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Admin route for creating complete deceased record
router.post('/complete',
  authenticateToken,
  authorizeRoles('admin', 'morgue_attendant'),
  deceasedValidation,
  async (req, res) => {
    try {
      const {
        first_name, last_name, date_of_birth, date_of_death,
        place_of_death, cause_of_death, gender, identity_number,
        religion, notes, storage_location, next_of_kin
      } = req.body;

      // Create deceased record
      const result = await db.run(
        `INSERT INTO deceased (
          first_name, last_name, date_of_birth, date_of_death,
          place_of_death, cause_of_death, gender, identity_number,
          religion, notes, storage_location, preparation_status,
          release_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'in_storage')`,
        [
          first_name, last_name, date_of_birth, date_of_death,
          place_of_death, cause_of_death, gender, identity_number,
          religion, notes, storage_location
        ]
      );

      // Add next of kin records
      for (const kin of next_of_kin) {
        await db.run(
          `INSERT INTO next_of_kin (
            deceased_id, name, relationship, phone, email,
            address, is_primary
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            result.id, kin.name, kin.relationship, kin.phone,
            kin.email, kin.address, kin.is_primary || false
          ]
        );
      }

      const newDeceased = await db.get(
        'SELECT * FROM deceased WHERE id = ?',
        [result.id]
      );
      newDeceased.next_of_kin = await db.all(
        'SELECT * FROM next_of_kin WHERE deceased_id = ?',
        [result.id]
      );

      res.status(201).json({
        message: 'Deceased record created successfully',
        deceased: newDeceased
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update deceased record
router.put('/:id',
  authenticateToken,
  authorizeRoles('admin', 'morgue_attendant'),
  deceasedValidation,
  async (req, res) => {
    try {
      const {
        first_name, last_name, date_of_birth, date_of_death,
        place_of_death, cause_of_death, gender, identity_number,
        religion, notes, storage_location, preparation_status,
        release_status, next_of_kin
      } = req.body;

      // Update deceased record
      const result = await db.run(
        `UPDATE deceased SET
          first_name = ?, last_name = ?, date_of_birth = ?,
          date_of_death = ?, place_of_death = ?, cause_of_death = ?,
          gender = ?, identity_number = ?, religion = ?, notes = ?,
          storage_location = ?, preparation_status = ?, release_status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          first_name, last_name, date_of_birth, date_of_death,
          place_of_death, cause_of_death, gender, identity_number,
          religion, notes, storage_location, preparation_status,
          release_status, req.params.id
        ]
      );

      if (!result.id) {
        return res.status(404).json({ message: 'Deceased record not found' });
      }

      // Update next of kin records
      // First delete existing records
      await db.run(
        'DELETE FROM next_of_kin WHERE deceased_id = ?',
        [req.params.id]
      );

      // Then add new records
      for (const kin of next_of_kin) {
        await db.run(
          `INSERT INTO next_of_kin (
            deceased_id, name, relationship, phone, email,
            address, is_primary
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            req.params.id, kin.name, kin.relationship, kin.phone,
            kin.email, kin.address, kin.is_primary || false
          ]
        );
      }

      const updatedDeceased = await db.get(
        'SELECT * FROM deceased WHERE id = ?',
        [req.params.id]
      );
      updatedDeceased.next_of_kin = await db.all(
        'SELECT * FROM next_of_kin WHERE deceased_id = ?',
        [req.params.id]
      );

      res.json({
        message: 'Deceased record updated successfully',
        deceased: updatedDeceased
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update preparation status
router.patch('/:id/preparation',
  authenticateToken,
  authorizeRoles('admin', 'morgue_attendant'),
  body('status')
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Invalid preparation status'),
  async (req, res) => {
    try {
      const result = await db.run(
        `UPDATE deceased 
         SET preparation_status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [req.body.status, req.params.id]
      );

      if (result.id) {
        const updatedDeceased = await db.get(
          'SELECT * FROM deceased WHERE id = ?',
          [req.params.id]
        );
        res.json({
          message: 'Preparation status updated successfully',
          deceased: updatedDeceased
        });
      } else {
        res.status(404).json({ message: 'Deceased record not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update release status
router.patch('/:id/release',
  authenticateToken,
  authorizeRoles('admin', 'morgue_attendant'),
  body('status')
    .isIn(['in_storage', 'released'])
    .withMessage('Invalid release status'),
  async (req, res) => {
    try {
      const result = await db.run(
        `UPDATE deceased 
         SET release_status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [req.body.status, req.params.id]
      );

      if (result.id) {
        const updatedDeceased = await db.get(
          'SELECT * FROM deceased WHERE id = ?',
          [req.params.id]
        );
        res.json({
          message: 'Release status updated successfully',
          deceased: updatedDeceased
        });
      } else {
        res.status(404).json({ message: 'Deceased record not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;