const jwt = require('jsonwebtoken');
require('dotenv').config();

const createJWT = (payload) => {
    const key = process.env.JWT_SECRET;
    const options = { expiresIn: process.env.JWT_EXPIRES_IN };
    try {
        return jwt.sign(payload, key, options);
    } catch (error) {
        console.error('Error creating JWT:', error);
        return null;
    }
};
const createJWTResetPassword = (payload) => {
    const key = process.env.JWT_SECRET;
    const options = { expiresIn: '5m' };
    try {
        return jwt.sign(payload, key, options);
    } catch (error) {
        console.error('Error creating JWT:', error);
        return null;
    }
};
const createRefreshToken = (payload) => {
    const key = process.env.REFRESH_TOKEN_SECRET;
    const options = { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN };
    try {
        return jwt.sign(payload, key, options);
    } catch (error) {
        console.error('Error creating refresh token:', error);
        return null;
    }
};

const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

const verifyToken = (token, key) => {
    try {
        return jwt.verify(token, key);
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
};

const verifyAccessToken = (token) => verifyToken(token, process.env.JWT_SECRET);
const verifyRefreshToken = (token) => verifyToken(token, process.env.REFRESH_TOKEN_SECRET);

const checkAccessToken = (req, res, next) => {
    console.log("=== CHECK ACCESS TOKEN ===");
    console.log("Headers:", req.headers);
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    console.log("Auth header:", authHeader);
    console.log("Token:", token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
        console.log("No token found");
        return res.status(401).json({
            EC: -1,
            data: '',
            EM: 'Not authenticated user'
        });
    }

    const verifiedToken = verifyAccessToken(token);
    console.log("Verified token:", verifiedToken);
    
    if (!verifiedToken) {
        console.log("Token verification failed");
        return res.status(401).json({ message: 'Invalid or expired access token' });
    }

    req.user = verifiedToken;
    console.log("Token verified successfully, user:", req.user);
    next();
};
const createJWTVerifyEmail = (payload) => {
  const key = process.env.JWT_SECRET;
  const options = { expiresIn: '5m' };
  return jwt.sign(payload, key, options);
};
module.exports = {
    createJWT,
    createRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    checkAccessToken,
    decodeToken,
    createJWTResetPassword,
    createJWTVerifyEmail
};
