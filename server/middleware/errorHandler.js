const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

function notFoundHandler(req, res) {
  return sendError(res, {
    statusCode: 404,
    message: `Route not found: ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  const statusCode =
    Number(err?.statusCode) ||
    (err?.name === 'ValidationError' ? 400 : 500);

  const isCorsError = err?.message === 'CORS origin is not allowed.';
  const message =
    statusCode >= 500
      ? isCorsError
        ? 'Request blocked by CORS policy.'
        : 'Something went wrong on the server.'
      : err?.message || 'Request failed.';

  logger.error(`${req.method} ${req.originalUrl}`, err);

  return sendError(res, {
    statusCode,
    message,
    errors: err?.errors
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
