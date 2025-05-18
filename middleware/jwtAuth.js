//this is a function that resolves the token and checks if it is valid ,, mawgoda fe file config/jwt.js
const { verifyToken } = require('../config/jwt');

const jwtAuth = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization; //read the header that contains the token
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    // Add user info to request
    req.user = decoded;
    next(); 
};

module.exports = jwtAuth; 