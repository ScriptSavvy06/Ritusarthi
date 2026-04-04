function getTimestamp() {
  return new Date().toISOString();
}

function serializeError(error) {
  if (!error) {
    return undefined;
  }

  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    statusCode: error.statusCode
  };
}

function writeLog(level, message, meta) {
  const output = `[${getTimestamp()}] [${level.toUpperCase()}] ${message}`;

  if (level === 'error') {
    if (meta !== undefined) {
      console.error(output, meta);
      return;
    }

    console.error(output);
    return;
  }

  if (meta !== undefined) {
    console.log(output, meta);
    return;
  }

  console.log(output);
}

function info(message, meta) {
  writeLog('info', message, meta);
}

function warn(message, meta) {
  writeLog('warn', message, meta);
}

function error(message, err) {
  writeLog('error', message, serializeError(err) || err);
}

module.exports = {
  error,
  info,
  warn
};
