const db = require('../db/database');

async function logActivity(type, action, referenceId, details, userId) {
    try {
        await db.run(
            `INSERT INTO activity_logs (type, action, reference_id, details, user_id)
             VALUES (?, ?, ?, ?, ?)`,
            [type, action, referenceId, details, userId]
        );
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw - we don't want activity logging to break main functionality
    }
}

// Helper functions for common activities
async function logUserActivity(action, userId, details) {
    return logActivity('user', action, userId, details, userId);
}

async function logBookingActivity(action, bookingId, userId, details) {
    return logActivity('booking', action, bookingId, details, userId);
}

async function logPaymentActivity(action, paymentId, userId, details) {
    return logActivity('payment', action, paymentId, details, userId);
}

async function logDocumentActivity(action, documentId, userId, details) {
    return logActivity('document', action, documentId, details, userId);
}

module.exports = {
    logActivity,
    logUserActivity,
    logBookingActivity,
    logPaymentActivity,
    logDocumentActivity
};