const jwt = require('jsonwebtoken');
const {
  JWT_AUDIENCE,
  JWT_EXPIRES_IN,
  JWT_ISSUER,
  JWT_SECRET
} = require('../config/env');

function getAdminRole(admin) {
  return admin?.role || 'admin';
}

function signAdminToken(admin) {
  return jwt.sign(
    {
      id: String(admin._id),
      role: getAdminRole(admin)
    },
    JWT_SECRET,
    {
      audience: JWT_AUDIENCE,
      expiresIn: JWT_EXPIRES_IN,
      issuer: JWT_ISSUER,
      subject: String(admin._id)
    }
  );
}

function verifyAdminToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER
  });
}

module.exports = {
  getAdminRole,
  signAdminToken,
  verifyAdminToken
};
