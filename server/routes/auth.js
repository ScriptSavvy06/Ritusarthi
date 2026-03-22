const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const verifyAdminAuth = require('../middleware/verifyAdminAuth');
const { JWT_SECRET } = require('../config/env');

const router = express.Router();

function buildAdminResponse(admin) {
  const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1d' });

  return {
    token,
    admin: {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      createdAt: admin.createdAt
    }
  };
}

function logAuthError(scope, error) {
  console.error(`[auth][${scope}]`, error);
}

router.post('/register', async (req, res) => {
  try {
    const username = (req.body.username || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Username, email, and password are required.' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long.' });
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({
        message:
          'Admin registration is disabled because an admin account already exists.'
      });
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: 'An admin already exists with that username or email.' });
    }

    const newAdmin = await Admin.create({ username, password, email });
    return res.status(201).json(buildAdminResponse(newAdmin));
  } catch (error) {
    logAuthError('register', error);

    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ message: 'An admin already exists with that username or email.' });
    }

    if (error?.name === 'ValidationError') {
      const validationMessage =
        Object.values(error.errors || {})[0]?.message ||
        'Invalid admin registration data.';

      return res.status(400).json({ message: validationMessage });
    }

    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const identifier = (req.body.identifier || req.body.username || '').trim();
    const password = req.body.password || '';

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: 'Username or email and password are required.' });
    }

    const admin = await Admin.findOne({
      $or: [{ username: identifier }, { email: identifier.toLowerCase() }]
    }).select('+password');

    if (!admin) {
      return res.status(401).json({ message: 'Invalid username/email or password.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username/email or password.' });
    }

    return res.json(buildAdminResponse(admin));
  } catch (error) {
    logAuthError('login', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

router.get('/me', verifyAdminAuth, (req, res) => {
  res.json({
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      createdAt: req.admin.createdAt
    }
  });
});

module.exports = router;
