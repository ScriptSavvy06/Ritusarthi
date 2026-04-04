const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config();

const { CLIENT_ORIGINS, MONGO_URI, PORT } = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiRateLimiter, loginRateLimiter } = require('./middleware/rateLimiters');
const { sendSuccess } = require('./utils/apiResponse');
const logger = require('./utils/logger');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || CLIENT_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS origin is not allowed.'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  })
);

app.use(express.json({ limit: '1mb' }));
app.use('/api', apiRateLimiter);
app.use('/api/auth/login', loginRateLimiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin', require('./routes/admin'));

app.get('/health', (req, res) => {
  return sendSuccess(res, {
    message: 'API health check passed.',
    data: { status: 'ok' }
  });
});

app.get('/', (req, res) => {
  return sendSuccess(res, {
    message: 'Rituu Saarthhii API is running.',
    data: {
      status: 'online'
    }
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

if (!MONGO_URI) {
  logger.error('MONGO_URI is not configured. Please update server/.env.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info('Connected to MongoDB: rituusaarthii');
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection error.', err);
    process.exit(1);
  });
