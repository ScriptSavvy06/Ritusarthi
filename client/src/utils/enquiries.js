export const ENQUIRY_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' }
];

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

  if (!formData.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required.';
  }

  if (!formData.phone.trim()) {
    errors.phone = 'Phone number is required.';
  }

  if (formData.message.trim().length > 1000) {
    errors.message = 'Message must be 1000 characters or fewer.';
  }

  return errors;
}
