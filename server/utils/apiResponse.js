function sendSuccess(
  res,
  { statusCode = 200, message = 'Request completed successfully.', data = null } = {}
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

function sendError(
  res,
  { statusCode = 500, message = 'Something went wrong.', errors, data } = {}
) {
  const responseBody = {
    success: false,
    message
  };

  if (errors && Object.keys(errors).length > 0) {
    responseBody.errors = errors;
  }

  if (data !== undefined) {
    responseBody.data = data;
  }

  return res.status(statusCode).json(responseBody);
}

module.exports = {
  sendError,
  sendSuccess
};
