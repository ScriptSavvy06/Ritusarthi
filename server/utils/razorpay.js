const crypto = require('crypto');
const {
  RAZORPAY_CURRENCY,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET
} = require('../config/env');

function isRazorpayConfigured() {
  return Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
}

function createConfigurationError() {
  const error = new Error(
    'Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env.'
  );
  error.statusCode = 503;
  return error;
}

function getBasicAuthHeader() {
  return `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`;
}

async function createOrderWithApiFallback(payload) {
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: getBasicAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  let responseBody = {};

  try {
    responseBody = await response.json();
  } catch (error) {
    responseBody = {};
  }

  if (!response.ok) {
    const error = new Error(
      responseBody.error?.description || 'Unable to create the Razorpay order.'
    );
    error.statusCode = response.status || 502;
    throw error;
  }

  return responseBody;
}

async function createRazorpayOrder({ amount, receipt, notes = {} }) {
  if (!isRazorpayConfigured()) {
    throw createConfigurationError();
  }

  const payload = {
    amount,
    currency: RAZORPAY_CURRENCY,
    receipt,
    notes
  };

  try {
    const Razorpay = require('razorpay');
    const client = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });

    return await client.orders.create(payload);
  } catch (error) {
    if (error?.code !== 'MODULE_NOT_FOUND') {
      throw error;
    }

    return createOrderWithApiFallback(payload);
  }
}

function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  if (!isRazorpayConfigured()) {
    throw createConfigurationError();
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

module.exports = {
  RAZORPAY_CURRENCY,
  RAZORPAY_KEY_ID,
  createRazorpayOrder,
  isRazorpayConfigured,
  verifyRazorpaySignature
};
