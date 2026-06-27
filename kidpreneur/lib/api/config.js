// Base API URL - will be set based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  IDEAS: {
    BASE: '/ideas',
    CREATE: '/ideas',
    GET_BY_ID: (id) => `/ideas/${id}`,
    UPDATE: (id) => `/ideas/${id}`,
    DELETE: (id) => `/ideas/${id}`,
  },
  // Add more endpoints as needed
};

export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export const getAuthHeaders = () => {
  // Get token from localStorage or cookie
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};
