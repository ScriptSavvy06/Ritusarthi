const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]*$/;

function cleanString(value) {
  return typeof value === 'string' ? value.replace(/\u0000/g, '').trim() : '';
}

function normalizePhone(value) {
  return cleanString(value).replace(/\s+/g, ' ');
}

function isValidEmail(value) {
  return EMAIL_REGEX.test(cleanString(value).toLowerCase());
}

function isValidName(value, { minLength = 2, maxLength = 80 } = {}) {
  const name = cleanString(value);
  return (
    Boolean(name) &&
    name.length >= minLength &&
    name.length <= maxLength &&
    NAME_REGEX.test(name)
  );
}

function isValidPhone(value) {
  const phone = normalizePhone(value);
  const digitCount = phone.replace(/\D/g, '').length;

  return PHONE_REGEX.test(phone) && digitCount >= 7 && digitCount <= 15;
}

module.exports = {
  EMAIL_REGEX,
  NAME_REGEX,
  PHONE_REGEX,
  cleanString,
  isValidEmail,
  isValidName,
  isValidPhone,
  normalizePhone
};
