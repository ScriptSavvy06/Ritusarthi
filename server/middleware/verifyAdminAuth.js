const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { JWT_SECRET } = require('../config/env');

async function verifyAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Admin authentication is required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('_id username email createdAt');

    if (!admin) {
      return res.status(401).json({ message: 'Admin account not found.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
}

module.exports = verifyAdminAuth;
