const DEFAULT_CLIENT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://rituusaarthhii-tours-travels.vercel.app'
];
const MINIMUM_JWT_SECRET_LENGTH = 32;

function cleanEnvValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanCsvEnvValue(value) {
  return cleanEnvValue(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const CLIENT_ORIGINS = [
  ...new Set(
    [
      ...DEFAULT_CLIENT_ORIGINS,
      ...cleanCsvEnvValue(process.env.CLIENT_URL),
      ...cleanCsvEnvValue(process.env.CLIENT_URLS)
    ]
  )
];

const JWT_SECRET = cleanEnvValue(process.env.JWT_SECRET);

if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is required. Please add it to server/.env before starting the server.'
  );
}

if (JWT_SECRET.length < MINIMUM_JWT_SECRET_LENGTH) {
  throw new Error(
    `JWT_SECRET must be at least ${MINIMUM_JWT_SECRET_LENGTH} characters long for production-safe signing.`
  );
}

function parseBooleanEnvValue(value, fallback = false) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (['true', '1', 'yes', 'y', 'on'].includes(normalizedValue)) {
    return true;
  }

  if (['false', '0', 'no', 'n', 'off'].includes(normalizedValue)) {
    return false;
  }

  return fallback;
}

function parseNumberEnvValue(value, fallback) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

module.exports = {
  ADMIN_NOTIFICATION_EMAIL:
    cleanEnvValue(process.env.ADMIN_NOTIFICATION_EMAIL) ||
    cleanEnvValue(process.env.ADMIN_EMAIL),
  ADMIN_REGISTRATION_ENABLED: parseBooleanEnvValue(
    process.env.ADMIN_REGISTRATION_ENABLED,
    false
  ),
  ADMIN_REGISTRATION_TOKEN: cleanEnvValue(process.env.ADMIN_REGISTRATION_TOKEN),
  API_RATE_LIMIT_MAX: parseNumberEnvValue(process.env.API_RATE_LIMIT_MAX, 200),
  CLIENT_ORIGINS,
  JWT_SECRET,
  JWT_AUDIENCE: cleanEnvValue(process.env.JWT_AUDIENCE) || 'ritusarthi-admin',
  JWT_EXPIRES_IN: cleanEnvValue(process.env.JWT_EXPIRES_IN) || '1d',
  JWT_ISSUER: cleanEnvValue(process.env.JWT_ISSUER) || 'ritusarthi-api',
  LOGIN_RATE_LIMIT_MAX: parseNumberEnvValue(process.env.LOGIN_RATE_LIMIT_MAX, 5),
  MONGO_URI: cleanEnvValue(process.env.MONGO_URI),
  NODE_ENV: cleanEnvValue(process.env.NODE_ENV) || 'development',
  PORT: Number(process.env.PORT) || 5000,
  RATE_LIMIT_WINDOW_MINUTES: parseNumberEnvValue(
    process.env.RATE_LIMIT_WINDOW_MINUTES,
    15
  ),
  RAZORPAY_CURRENCY: cleanEnvValue(process.env.RAZORPAY_CURRENCY || 'INR') || 'INR',
  RAZORPAY_KEY_ID: cleanEnvValue(process.env.RAZORPAY_KEY_ID),
  RAZORPAY_KEY_SECRET: cleanEnvValue(process.env.RAZORPAY_KEY_SECRET),
  SMTP_FROM_EMAIL:
    cleanEnvValue(process.env.SMTP_FROM_EMAIL) || cleanEnvValue(process.env.EMAIL_USER),
  SMTP_FROM_NAME:
    cleanEnvValue(process.env.SMTP_FROM_NAME) || 'Rituu Saarthhii Tours & Travels',
  SMTP_HOST: cleanEnvValue(process.env.SMTP_HOST),
  SMTP_PASS:
    cleanEnvValue(process.env.SMTP_PASS) || cleanEnvValue(process.env.EMAIL_PASS),
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: parseBooleanEnvValue(process.env.SMTP_SECURE, false),
  SMTP_SERVICE:
    cleanEnvValue(process.env.SMTP_SERVICE) || cleanEnvValue(process.env.EMAIL_SERVICE),
  SMTP_USER:
    cleanEnvValue(process.env.SMTP_USER) || cleanEnvValue(process.env.EMAIL_USER)
};
