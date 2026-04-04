export const ENQUIRY_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' }
];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]*$/;

const ENQUIRY_STATUS_LABELS = Object.fromEntries(
  ENQUIRY_STATUS_OPTIONS.map((status) => [status.value, status.label])
);

const STATUS_ALIASES = {
  new: 'new',
  contacted: 'contacted',
  closed: 'closed',
  New: 'new',
  Contacted: 'contacted',
  Closed: 'closed'
};

export function normalizeEnquiryStatus(value) {
  if (!value) {
    return 'new';
  }

  return STATUS_ALIASES[value] || STATUS_ALIASES[String(value).trim().toLowerCase()] || 'new';
}

export function getEnquiryStatusLabel(value) {
  return ENQUIRY_STATUS_LABELS[normalizeEnquiryStatus(value)] || 'New';
}

export function getEnquiryStatusClasses(value) {
  const status = normalizeEnquiryStatus(value);

  if (status === 'contacted') {
    return 'bg-blue-100 text-blue-700';
  }

  if (status === 'closed') {
    return 'bg-green-100 text-green-700';
  }

  return 'bg-amber-100 text-amber-700';
}

export function formatDateTime(value) {
  if (!value) {
    return 'Not available';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export function formatDateOnly(value) {
  if (!value) {
    return 'Flexible';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Flexible';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium'
  }).format(date);
}

export function validateEnquiryFormData(formData) {
  const errors = {};
  const name = String(formData.name || '').trim();
  const email = String(formData.email || '').trim().toLowerCase();
  const phone = String(formData.phone || '').trim();
  const phoneDigits = phone.replace(/\D/g, '');

  if (!name) {
    errors.name = 'Name is required.';
  } else if (name.length < 2 || name.length > 80 || !NAME_REGEX.test(name)) {
    errors.name =
      'Please enter a valid full name using letters, spaces, and common punctuation.';
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!phone) {
    errors.phone = 'Phone number is required.';
  } else if (
    !PHONE_REGEX.test(phone) ||
    phoneDigits.length < 7 ||
    phoneDigits.length > 15
  ) {
    errors.phone = 'Please provide a valid phone number.';
  }

  if (String(formData.message || '').trim().length > 1000) {
    errors.message = 'Message must be 1000 characters or fewer.';
  }

  return errors;
}
