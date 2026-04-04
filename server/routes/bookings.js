const express = require('express');
const Booking = require('../models/Booking');
const Package = require('../models/Package');
const { sendNewBookingNotification } = require('../utils/email');
const { buildInvoiceData } = require('../utils/invoice');
const { sendError, sendSuccess } = require('../utils/apiResponse');
const {
  isValidObjectId,
  validateBookingCreatePayload,
  validateInvoiceLookupPayload
} = require('../utils/bookingValidation');
const logger = require('../utils/logger');
const { serializeBooking } = require('../utils/serializers');

const router = express.Router();

function logBookingError(scope, error) {
  logger.error(`[bookings][${scope}]`, error);
}

router.post('/create', async (req, res) => {
  const { data, errors, isValid } = validateBookingCreatePayload(req.body);

  if (!isValid) {
    return sendError(res, {
      statusCode: 400,
      message: 'Please correct the highlighted booking fields.',
      errors
    });
  }

  try {
    const pkg = await Package.findOne({
      _id: data.packageId,
      isActive: true
    })
      .select('_id title price')
      .lean();

    if (!pkg) {
      return sendError(res, {
        statusCode: 404,
        message: 'The selected package is no longer available.'
      });
    }

    const booking = await Booking.create({
      ...data,
      packageId: pkg._id,
      packageName: pkg.title,
      price: Number(pkg.price) || 0,
      paymentStatus: 'pending',
      bookingDate: new Date()
    });

    void sendNewBookingNotification(booking);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Booking created successfully. Complete payment to confirm it.',
      data: {
        booking: serializeBooking(booking)
      }
    });
  } catch (error) {
    logBookingError('create', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to create your booking right now.'
    });
  }
});

router.get('/:id/invoice', async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return sendError(res, {
      statusCode: 400,
      message: 'Invalid booking id.'
    });
  }

  const { data, errors, isValid } = validateInvoiceLookupPayload(req.query);

  if (!isValid) {
    return sendError(res, {
      statusCode: 400,
      message: 'A valid booking email is required to download the invoice.',
      errors
    });
  }

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return sendError(res, {
        statusCode: 404,
        message: 'Booking not found.'
      });
    }

    if (booking.paymentStatus !== 'paid') {
      return sendError(res, {
        statusCode: 409,
        message: 'Invoice will be available after payment is completed.'
      });
    }

    if (booking.email !== data.email) {
      return sendError(res, {
        statusCode: 403,
        message: 'The provided email does not match this booking.'
      });
    }

    return sendSuccess(res, {
      message: 'Invoice generated successfully.',
      data: buildInvoiceData(booking)
    });
  } catch (error) {
    logBookingError('invoice', error);
    return sendError(res, {
      statusCode: 500,
      message: 'Unable to generate the invoice right now.'
    });
  }
});

module.exports = router;
