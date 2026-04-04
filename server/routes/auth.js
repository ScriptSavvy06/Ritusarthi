const express = require('express');
const Admin = require('../models/Admin');
const verifyAdminAuth = require('../middleware/verifyAdminAuth');
const {
  ADMIN_REGISTRATION_ENABLED,
  ADMIN_REGISTRATION_TOKEN
} = require('../config/env');
const { sendError, sendSuccess } = require('../utils/apiResponse');
const { signAdminToken } = require('../utils/auth');
const { cleanString, isValidEmail } = require('../utils/contactValidation');
const logger = require('../utils/logger');
const { serializeAdmin } = require('../utils/serializers');

const router = express.Router();

function buildAdminResponse(admin) {
  return {
    token: signAdminToken(admin),
    admin: serializeAdmin(admin)
  };
}

function logAuthError(scope, error) {
  logger.error(`[auth][${scope}]`, error);
}

function validateRegistrationPayload(payload) {
  const errors = {};
  const data = {};
  const username = cleanString(payload.username);
  const email = cleanString(payload.email).toLowerCase();
  const password = typeof payload.password === 'string' ? payload.password : '';

  if (!username) {
    errors.username = 'Username is required.';
  } else if (username.length < 3) {
    errors.username = 'Username must be at least 3 characters long.';
  } else if (username.length > 40) {
    errors.username = 'Username must be 40 characters or fewer.';
  } else {
    data.username = username;
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  } else {
    data.email = email;
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  } else if (password.length > 128) {
    errors.password = 'Password must be 128 characters or fewer.';
  } else {
    data.password = password;
  }

  return {
    data,
    errors,
    isValid: Object.keys(errors).length === 0
  };
}

function getRegistrationToken(req) {
  return cleanString(
    req.headers['x-admin-registration-token'] || req.body.registrationToken
  );
}

router.post('/register', async (req, res) => {
  if (!ADMIN_REGISTRATION_ENABLED) {
    return sendError(res, {
      statusCode: 403,
      message:
        'Admin registration is disabled. Create admin users through a secure setup flow.'
    });
  }

  if (ADMIN_REGISTRATION_TOKEN && getRegistrationToken(req) !== ADMIN_REGISTRATION_TOKEN) {
    return sendError(res, {
      statusCode: 403,
      message: 'A valid admin registration token is required.'
    });
  }

  const { data, errors, isValid } = validateRegistrationPayload(req.body);

  if (!isValid) {
    return sendError(res, {
      statusCode: 400,
      message: 'Please correct the highlighted admin registration fields.',
      errors
    });
  }

  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return sendError(res, {
        statusCode: 403,
        message:
          'Admin registration is disabled because an admin account already exists.'
      });
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ username: data.username }, { email: data.email }]
    });

    if (existingAdmin) {
      return sendError(res, {
        statusCode: 400,
        message: 'An admin already exists with that username or email.'
      });
    }

    const newAdmin = await Admin.create(data);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Admin account created successfully.',
      data: buildAdminResponse(newAdmin)
    });
  } catch (error) {
    logAuthError('register', error);

    if (error?.code === 11000) {
      return sendError(res, {
        statusCode: 409,
        message: 'An admin already exists with that username or email.'
      });
    }

    if (error?.name === 'ValidationError') {
      const validationMessage =
        Object.values(error.errors || {})[0]?.message ||
        'Invalid admin registration data.';

      return sendError(res, {
        statusCode: 400,
        message: validationMessage
      });
    }

    return sendError(res, {
      statusCode: 500,
      message: 'Server error during registration.'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const identifier = cleanString(req.body.identifier || req.body.username);
    const password = req.body.password || '';

    if (!identifier || !password) {
      return sendError(res, {
        statusCode: 400,
        message: 'Username or email and password are required.'
      });
    }

    const admin = await Admin.findOne({
      $or: [{ username: identifier }, { email: identifier.toLowerCase() }]
    }).select('+password role');

    if (!admin) {
      return sendError(res, {
        statusCode: 401,
        message: 'Invalid username/email or password.'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return sendError(res, {
        statusCode: 401,
        message: 'Invalid username/email or password.'
      });
    }

    const normalizedRole = admin.role || 'admin';

    if (!admin.role) {
      await Admin.updateOne({ _id: admin._id }, { $set: { role: normalizedRole } });
    }

    if (normalizedRole !== 'admin') {
      return sendError(res, {
        statusCode: 403,
        message: 'You do not have permission to access this account.'
      });
    }

    return sendSuccess(res, {
      message: 'Login successful.',
      data: buildAdminResponse({
        ...admin.toObject(),
        role: normalizedRole
      })
    });
  } catch (error) {
    logAuthError('login', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Server error during login.'
    });
  }
});

router.get('/me', verifyAdminAuth, (req, res) => {
  return sendSuccess(res, {
    message: 'Admin session is valid.',
    data: {
      admin: req.admin
    }
  });
});

module.exports = router;
