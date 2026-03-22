const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { CLIENT_ORIGINS, MONGO_URI, PORT } = require('./config/env');

const app = express();

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

app.use('/api/auth', require('./routes/auth'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/enquiries', require('./routes/enquiries'));

app.get('/', (req, res) => {
  res.send('Rituu Saarthhii API is running...');
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    message:
      err.message === 'CORS origin is not allowed.'
        ? 'Request blocked by CORS policy.'
        : 'Something went wrong on the server.'
  });
});

if (!MONGO_URI) {
  console.error('MONGO_URI is not configured. Please update server/.env.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB: rituusaarthii');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
