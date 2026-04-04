const {
  cleanString,
  isValidEmail,
  isValidName,
  isValidPhone,
  normalizePhone
} = require('./contactValidation');

const ENQUIRY_STATUSES = ['new', 'contacted', 'closed'];

const STATUS_ALIASES = {
  new: 'new',
  contacted: 'contacted',
  closed: 'closed',
  New: 'new',
  Contacted: 'contacted',
  Closed: 'closed'
};

function normalizeStatus(value) {
  if (!value) {
    return undefined;
  }

  return STATUS_ALIASES[value] || STATUS_ALIASES[cleanString(value).toLowerCase()];
}

function validateEnquiryPayload(payload, options = {}) {
  const { partial = false, statusOnly = false } = options;
  const errors = {};
  const data = {};

  if (!statusOnly && (!partial || payload.name !== undefined)) {
    const name = cleanString(payload.name);
    if (!name) {
      errors.name = 'Name is required.';
    } else if (!isValidName(name)) {
      errors.name =
        'Please provide a valid full name using letters, spaces, and common punctuation only.';
    } else {
      data.name = name;
    }
  }

  if (!statusOnly && (!partial || payload.email !== undefined)) {
    const email = cleanString(payload.email).toLowerCase();
    if (!email) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please provide a valid email address.';
    } else {
      data.email = email;
    }
  }

  if (!statusOnly && (!partial || payload.phone !== undefined)) {
    const phone = normalizePhone(payload.phone);
    if (!phone) {
      errors.phone = 'Phone number is required.';
    } else if (!isValidPhone(phone)) {
      errors.phone = 'Please provide a valid phone number.';
    } else {
      data.phone = phone;
    }
  }

  if (!statusOnly && (!partial || payload.package !== undefined)) {
    const packageName = cleanString(payload.package);
    if (packageName.length > 120) {
      errors.package = 'Package name must be 120 characters or fewer.';
    } else if (packageName) {
      data.package = packageName;
      data.destination = packageName;
    }
  }

  if (!statusOnly && (!partial || payload.destination !== undefined)) {
    const destination = cleanString(payload.destination);
    if (destination.length > 120) {
      errors.destination = 'Destination must be 120 characters or fewer.';
    } else if (destination) {
      data.destination = destination;
    }
  }

  if (!statusOnly && (!partial || payload.message !== undefined)) {
    const message = cleanString(payload.message);
    if (message.length > 1000) {
      errors.message = 'Message must be 1000 characters or fewer.';
    } else if (message) {
      data.message = message;
    }
  }

  if (!statusOnly && (!partial || payload.travelDate !== undefined)) {
    if (payload.travelDate) {
      const travelDate = new Date(payload.travelDate);
      if (Number.isNaN(travelDate.getTime())) {
        errors.travelDate = 'Please provide a valid travel date.';
      } else {
        data.travelDate = travelDate;
      }
    }
  }

  if (statusOnly || payload.status !== undefined) {
    const normalizedStatus = normalizeStatus(payload.status);
    if (payload.status !== undefined && !normalizedStatus) {
      errors.status = `Status must be one of: ${ENQUIRY_STATUSES.join(', ')}.`;
    } else if (normalizedStatus) {
      data.status = normalizedStatus;
    }
  }

  return {
    data,
    errors,
    isValid: Object.keys(errors).length === 0
  };
}

module.exports = {
  ENQUIRY_STATUSES,
  normalizeStatus,
  validateEnquiryPayload
};
