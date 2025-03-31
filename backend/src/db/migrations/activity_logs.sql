-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(50) NOT NULL, -- 'booking', 'user', 'payment', 'document', etc.
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'completed', etc.
    reference_id INTEGER, -- ID of the related record (booking_id, user_id, etc.)
    details TEXT, -- Additional details about the activity
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);