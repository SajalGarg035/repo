const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/config');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      throw new Error('No authentication token provided');
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth;
