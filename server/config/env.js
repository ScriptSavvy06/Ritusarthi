const DEFAULT_CLIENT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://rituusaarthhii-tours-travels.vercel.app'
];

const CLIENT_ORIGINS = [
  ...new Set(
    [
      ...DEFAULT_CLIENT_ORIGINS,
      ...(process.env.CLIENT_URLS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    ]
  )
];

const JWT_SECRET =
  process.env.JWT_SECRET || 'development-only-rituusaarthhii-secret';

if (!process.env.JWT_SECRET) {
  console.warn(
    '[auth] JWT_SECRET is not set. Using a development fallback secret. Change this before production.'
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

module.exports = {
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL || '',
  CLIENT_ORIGINS,
  JWT_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  PORT: Number(process.env.PORT) || 5000,
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || '',
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || '',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: parseBooleanEnvValue(process.env.SMTP_SECURE, false),
  SMTP_SERVICE: process.env.SMTP_SERVICE || '',
  SMTP_USER: process.env.SMTP_USER || ''
};
