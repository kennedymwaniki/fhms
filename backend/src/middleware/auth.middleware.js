const jwt = require('jsonwebtoken');

// Fallback value for JWT secret in case environment variable is not loaded
const JWT_SECRET = process.env.JWT_SECRET || 'fhms_super_secret_key_replace_in_production';

function authenticateToken(req, res, next) {
  // Get the authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
}

// Role-based authorization middleware
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied: You do not have permission to perform this action' 
      });
    }
    
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};