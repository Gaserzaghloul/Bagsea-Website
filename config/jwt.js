const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
 //this is the secret key used to sign the token ,, esmo kda ahhh 

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id,
            email: user.email,
            username: user.username
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken
}; 