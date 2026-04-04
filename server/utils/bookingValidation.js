const mongoose = require('mongoose');
const {
  cleanString,
  isValidEmail,
  isValidName,
  isValidPhone,
  normalizePhone
} = require('./contactValidation');

const PAYMENT_STATUSES = ['pending', 'paid', 'failed'];

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(cleanString(value));
}

function validateBookingCreatePayload(payload) {
  const errors = {};
  const data = {};

  const userName = cleanString(payload.userName || payload.name);
  const email = cleanString(payload.email).toLowerCase();
  const phone = normalizePhone(payload.phone);
  const packageId = cleanString(payload.packageId);

  if (!userName) {
    errors.userName = 'Name is required.';
  } else if (!isValidName(userName)) {
    errors.userName =
      'Please provide a valid full name using letters, spaces, and common punctuation only.';
  } else {
    data.userName = userName;
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  } else {
    data.email = email;
  }

  if (!phone) {
    errors.phone = 'Phone number is required.';
  } else if (!isValidPhone(phone)) {
    errors.phone = 'Please provide a valid phone number.';
  } else {
    data.phone = phone;
  }

  if (!packageId) {
    errors.packageId = 'Package id is required.';
  } else if (!isValidObjectId(packageId)) {
    errors.packageId = 'Please provide a valid package id.';
  } else {
    data.packageId = packageId;
  }

  return {
    data,
    errors,
    isValid: Object.keys(errors).length === 0
  };
}

function validateInvoiceLookupPayload(payload) {
  const email = cleanString(payload.email).toLowerCase();

  if (!email) {
    return {
      data: {},
      errors: { email: 'Email is required to fetch the invoice.' },
      isValid: false
    };
  }

  if (!isValidEmail(email)) {
    return {
      data: {},
      errors: { email: 'Please provide a valid email address.' },
      isValid: false
    };
  }

  return {
    data: { email },
    errors: {},
    isValid: true
  };
}

module.exports = {
  PAYMENT_STATUSES,
  isValidObjectId,
  validateBookingCreatePayload,
  validateInvoiceLookupPayload
};
