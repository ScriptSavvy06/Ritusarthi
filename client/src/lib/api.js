import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/+$/, '')
  : 'https://ritusarthi-backend.onrender.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

export function buildAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function isStandardApiResponse(payload) {
  return Boolean(
    payload &&
      typeof payload === 'object' &&
      Object.prototype.hasOwnProperty.call(payload, 'success') &&
      Object.prototype.hasOwnProperty.call(payload, 'message')
  );
}

export function getResponseData(response, fallbackValue = null) {
  const payload = response?.data;

  if (isStandardApiResponse(payload)) {
    return payload.data ?? fallbackValue;
  }

  return payload ?? fallbackValue;
}

export function getResponseMessage(response, fallbackMessage = '') {
  const payload = response?.data;

  if (isStandardApiResponse(payload)) {
    const message = String(payload.message || '').trim();
    return message || fallbackMessage;
  }

  return fallbackMessage;
}

export function getApiErrorMessage(
  error,
  fallbackMessage = 'Something went wrong. Please retry.'
) {
  const rawMessage = String(error?.response?.data?.message || '').trim();

  if (error?.response?.status === 429) {
    return rawMessage || 'Too many requests. Please wait a few minutes and try again.';
  }

  if (!error?.response || error?.code === 'ECONNABORTED') {
    return 'Something went wrong. Please retry.';
  }

  if (/payment failed|payment verification failed|payment was not completed/i.test(rawMessage)) {
    return 'Payment failed. Please try again.';
  }

  if (/network|timeout|fetch/i.test(rawMessage)) {
    return 'Something went wrong. Please retry.';
  }

  return rawMessage || fallbackMessage;
}
