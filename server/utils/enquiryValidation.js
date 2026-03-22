const ENQUIRY_STATUSES = ['new', 'contacted', 'closed'];

const STATUS_ALIASES = {
  new: 'new',
  contacted: 'contacted',
  closed: 'closed',
  New: 'new',
  Contacted: 'contacted',
  Closed: 'closed'
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

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
    } else if (name.length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    } else {
      data.name = name;
    }
  }

  if (!statusOnly && (!partial || payload.email !== undefined)) {
    const email = cleanString(payload.email).toLowerCase();
    if (!email) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = 'Please provide a valid email address.';
    } else {
      data.email = email;
    }
  }

  if (!statusOnly && (!partial || payload.phone !== undefined)) {
    const phone = cleanString(payload.phone);
    if (!phone) {
      errors.phone = 'Phone number is required.';
    } else if (!PHONE_REGEX.test(phone)) {
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
