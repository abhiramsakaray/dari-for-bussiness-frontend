import axios from 'axios';

// Use relative URL in development to leverage Vite proxy, or VITE_API_URL in production
const API_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add API key and token to requests
api.interceptors.request.use((config) => {
  // Add JWT token if available
  const token = localStorage.getItem('merchant_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Add API key if available
  const apiKey = localStorage.getItem('api_key');
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }

  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error info for debugging
    console.error('🔴 API Error (legacy client):', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - clearing auth and redirecting to login');
      localStorage.removeItem('merchant_token');
      localStorage.removeItem('api_key');
      localStorage.removeItem('merchant_email');
      localStorage.removeItem('merchant_name');
      window.location.href = '#/login';
    }
    return Promise.reject(error);
  }
);

export default api;
