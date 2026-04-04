const express = require('express');
const Booking = require('../models/Booking');
const { sendBookingPaymentSuccessNotification } = require('../utils/email');
const { buildInvoiceData } = require('../utils/invoice');
const { sendError, sendSuccess } = require('../utils/apiResponse');
const { cleanString } = require('../utils/contactValidation');
const { isValidObjectId } = require('../utils/bookingValidation');
const logger = require('../utils/logger');
const {
  getBookingOrderId,
  getBookingPaymentId,
  serializeBooking
} = require('../utils/serializers');
const {
  RAZORPAY_CURRENCY,
  RAZORPAY_KEY_ID,
  createRazorpayOrder,
  verifyRazorpaySignature
} = require('../utils/razorpay');

const router = express.Router();

function logPaymentError(scope, error) {
  logger.error(`[payment][${scope}]`, error);
}

async function markBookingPaymentFailed(booking, values = {}) {
  if (!booking || booking.paymentStatus === 'paid') {
    return booking;
  }

  booking.paymentStatus = 'failed';
  booking.orderId = values.orderId || booking.orderId || booking.razorpayOrderId || '';
  booking.paymentId =
    values.paymentId || booking.paymentId || booking.razorpayPaymentId || '';
  booking.paymentFailureReason =
    values.failureReason || booking.paymentFailureReason || 'Payment failed.';
  booking.razorpayOrderId = booking.orderId;
  booking.razorpayPaymentId = booking.paymentId;
  booking.paymentVerifiedAt = null;
  await booking.save();
  return booking;
}

router.post('/create-order', async (req, res) => {
  const bookingId = cleanString(req.body.bookingId);

  if (!bookingId || !isValidObjectId(bookingId)) {
    return sendError(res, {
      statusCode: 400,
      message: 'A valid booking id is required.'
    });
  }

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return sendError(res, {
        statusCode: 404,
        message: 'Booking not found.'
      });
    }

    if (booking.paymentStatus === 'paid') {
      return sendError(res, {
        statusCode: 409,
        message: 'This booking has already been paid.',
        data: {
          booking: serializeBooking(booking),
          invoice: buildInvoiceData(booking)
        }
      });
    }

    const amountInPaise = Math.round((Number(booking.price) || 0) * 100);

    if (amountInPaise <= 0) {
      return sendError(res, {
        statusCode: 400,
        message: 'This booking does not have a valid payable amount.'
      });
    }

    const order = await createRazorpayOrder({
      amount: amountInPaise,
      receipt: `booking_${String(booking._id).slice(-12)}`,
      notes: {
        bookingId: String(booking._id),
        packageName: booking.packageName,
        customerName: booking.userName
      }
    });

    booking.orderId = order.id;
    booking.razorpayOrderId = order.id;
    booking.paymentId = '';
    booking.razorpayPaymentId = '';
    booking.paymentStatus = 'pending';
    booking.paymentFailureReason = '';
    booking.paymentVerifiedAt = null;
    await booking.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Payment order created successfully.',
      data: {
        keyId: RAZORPAY_KEY_ID,
        currency: RAZORPAY_CURRENCY,
        orderId: order.id,
        amount: order.amount,
        booking: serializeBooking(booking)
      }
    });
  } catch (error) {
    logPaymentError('create-order', error);
    return sendError(res, {
      statusCode: error.statusCode || 500,
      message: error.message || 'Unable to start the payment right now.'
    });
  }
});

router.post('/verify', async (req, res) => {
  const bookingId = cleanString(req.body.bookingId);
  const orderId = cleanString(req.body.razorpay_order_id);
  const paymentId = cleanString(req.body.razorpay_payment_id);
  const signature = cleanString(req.body.razorpay_signature);

  if (!bookingId || !isValidObjectId(bookingId)) {
    return sendError(res, {
      statusCode: 400,
      message: 'A valid booking id is required.'
    });
  }

  if (!orderId || !paymentId || !signature) {
    return sendError(res, {
      statusCode: 400,
      message: 'Payment verification details are incomplete.'
    });
  }

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return sendError(res, {
        statusCode: 404,
        message: 'Booking not found.'
      });
    }

    const currentOrderId = getBookingOrderId(booking);
    const currentPaymentId = getBookingPaymentId(booking);

    if (booking.paymentStatus === 'paid') {
      if (currentOrderId === orderId && currentPaymentId === paymentId) {
        return sendSuccess(res, {
          message: 'Payment already verified.',
          data: {
            booking: serializeBooking(booking),
            invoice: buildInvoiceData(booking)
          }
        });
      }

      return sendError(res, {
        statusCode: 409,
        message: 'This booking has already been paid and cannot be charged again.',
        data: {
          booking: serializeBooking(booking),
          invoice: buildInvoiceData(booking)
        }
      });
    }

    if (currentOrderId && currentOrderId !== orderId) {
      await markBookingPaymentFailed(booking, {
        orderId,
        paymentId,
        failureReason: 'Payment verification failed because the order id did not match.'
      });

      return sendError(res, {
        statusCode: 400,
        message: 'Payment verification failed. Please try again or contact support.'
      });
    }

    const isSignatureValid = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature
    });

    if (!isSignatureValid) {
      await markBookingPaymentFailed(booking, {
        orderId,
        paymentId,
        failureReason: 'Payment verification failed because the Razorpay signature was invalid.'
      });

      return sendError(res, {
        statusCode: 400,
        message: 'Payment verification failed. Please try again or contact support.'
      });
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        paymentStatus: { $ne: 'paid' }
      },
      {
        $set: {
          paymentStatus: 'paid',
          orderId,
          paymentId,
          paymentFailureReason: '',
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          paymentVerifiedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedBooking) {
      const latestBooking = await Booking.findById(bookingId);

      if (latestBooking?.paymentStatus === 'paid') {
        return sendSuccess(res, {
          message: 'Payment already verified.',
          data: {
            booking: serializeBooking(latestBooking),
            invoice: buildInvoiceData(latestBooking)
          }
        });
      }

      return sendError(res, {
        statusCode: 409,
        message:
          'Payment status changed while verification was in progress. Please refresh and retry.'
      });
    }

    void sendBookingPaymentSuccessNotification(updatedBooking);

    return sendSuccess(res, {
      message: 'Payment verified successfully.',
      data: {
        booking: serializeBooking(updatedBooking),
        invoice: buildInvoiceData(updatedBooking)
      }
    });
  } catch (error) {
    logPaymentError('verify', error);
    return sendError(res, {
      statusCode: error.statusCode || 500,
      message: error.message || 'Unable to verify the payment right now.'
    });
  }
});

router.post('/failure', async (req, res) => {
  const bookingId = cleanString(req.body.bookingId);
  const orderId = cleanString(req.body.orderId || req.body.razorpay_order_id);
  const paymentId = cleanString(req.body.paymentId || req.body.razorpay_payment_id);
  const failureReason = cleanString(req.body.failureReason || req.body.message);

  if (!bookingId || !isValidObjectId(bookingId)) {
    return sendError(res, {
      statusCode: 400,
      message: 'A valid booking id is required.'
    });
  }

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return sendError(res, {
        statusCode: 404,
        message: 'Booking not found.'
      });
    }

    if (booking.paymentStatus === 'paid') {
      return sendError(res, {
        statusCode: 409,
        message: 'This booking is already marked as paid and cannot be changed to failed.',
        data: {
          booking: serializeBooking(booking),
          invoice: buildInvoiceData(booking)
        }
      });
    }

    const updatedBooking = await markBookingPaymentFailed(booking, {
      orderId,
      paymentId,
      failureReason:
        failureReason || 'Payment was not completed. Please retry the checkout.'
    });

    return sendSuccess(res, {
      message: 'Payment failure recorded successfully.',
      data: {
        booking: serializeBooking(updatedBooking)
      }
    });
  } catch (error) {
    logPaymentError('failure', error);
    return sendError(res, {
      statusCode: error.statusCode || 500,
      message: error.message || 'Unable to record the payment failure right now.'
    });
  }
});

module.exports = router;
