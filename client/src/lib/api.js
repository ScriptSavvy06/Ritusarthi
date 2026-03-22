import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim() || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

export function buildAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getApiErrorMessage(
  error,
  fallbackMessage = 'Something went wrong. Please try again.'
) {
  return error.response?.data?.message || fallbackMessage;
}
