const rateLimit = require('express-rate-limit');
const {
  API_RATE_LIMIT_MAX,
  LOGIN_RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MINUTES
} = require('../config/env');
const { sendError } = require('../utils/apiResponse');

const windowMs = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;

function buildRateLimiter({ limit, message }) {
  return rateLimit({
    limit,
    windowMs,
    standardHeaders: true,
    legacyHeaders: false,
    handler(req, res, next, options) {
      return sendError(res, {
        statusCode: options.statusCode,
        message
      });
    }
  });
}

const apiRateLimiter = buildRateLimiter({
  limit: API_RATE_LIMIT_MAX,
  message: 'Too many requests. Please wait a few minutes before trying again.'
});

const loginRateLimiter = buildRateLimiter({
  limit: LOGIN_RATE_LIMIT_MAX,
  message: 'Too many login attempts. Please try again in 15 minutes.'
});

module.exports = {
  apiRateLimiter,
  loginRateLimiter
};
