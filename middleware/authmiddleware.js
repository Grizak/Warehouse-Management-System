// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to check if user is authenticated and has the required role
function authorize(...allowedRoles) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Authorization token is required" });
        }

        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: "Invalid or expired token" });
            }

            // Check if user has one of the allowed roles
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ error: "Access denied" });
            }

            req.user = user;
            next();
        });
    };
}

module.exports = authorize;
