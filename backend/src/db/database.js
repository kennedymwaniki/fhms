const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize the SQLite database connection
const db = new sqlite3.Database(path.join(__dirname, '../../data/fhms.db'), (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Function to initialize the database and run migrations
function initializeDatabase() {
  const migrationsPath = path.join(__dirname, 'migrations/activity_logs.sql');

  // Read and execute the SQL script for activity_logs
  try {
    const sqlScript = fs.readFileSync(migrationsPath, 'utf-8');
    db.exec(sqlScript);
    console.log('Successfully ran activity_logs migration.');
  } catch (error) {
    console.error('Error running activity_logs migration:', error.message);
  }
}

initializeDatabase();

module.exports = db;