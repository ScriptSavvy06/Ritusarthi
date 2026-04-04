const express = require('express');
const Booking = require('../models/Booking');
const verifyAdminAuth = require('../middleware/verifyAdminAuth');
const { sendError, sendSuccess } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const { serializeBooking } = require('../utils/serializers');

const router = express.Router();

function logAdminError(scope, error) {
  logger.error(`[admin][${scope}]`, error);
}

router.get('/bookings', verifyAdminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();

    return sendSuccess(res, {
      message: 'Bookings loaded successfully.',
      data: bookings.map(serializeBooking)
    });
  } catch (error) {
    logAdminError('bookings', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to load bookings.'
    });
  }
});

module.exports = router;
