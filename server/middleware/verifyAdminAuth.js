const Admin = require('../models/Admin');
const { sendError } = require('../utils/apiResponse');
const { verifyAdminToken } = require('../utils/auth');
const { serializeAdmin } = require('../utils/serializers');

async function verifyAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, {
        statusCode: 401,
        message: 'Admin authentication is required.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAdminToken(token);

    if (decoded.role !== 'admin') {
      return sendError(res, {
        statusCode: 403,
        message: 'You do not have permission to access this resource.'
      });
    }

    const admin = await Admin.findById(decoded.id).select(
      '_id username email role createdAt'
    );

    if (!admin) {
      return sendError(res, {
        statusCode: 401,
        message: 'Admin account not found.'
      });
    }

    const normalizedRole = admin.role || 'admin';

    if (!admin.role) {
      await Admin.updateOne({ _id: admin._id }, { $set: { role: normalizedRole } });
    }

    if (normalizedRole !== 'admin') {
      return sendError(res, {
        statusCode: 403,
        message: 'You do not have permission to access this resource.'
      });
    }

    req.admin = serializeAdmin({
      ...admin.toObject(),
      role: normalizedRole
    });
    req.auth = {
      adminId: decoded.id,
      role: decoded.role
    };
    return next();
  } catch (error) {
    const message =
      error?.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Admin authentication is invalid. Please log in again.';

    return sendError(res, {
      statusCode: 401,
      message
    });
  }
}

module.exports = verifyAdminAuth;
