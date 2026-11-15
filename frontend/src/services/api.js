import axios from 'axios';

// In production or on live servers, use relative path '/api/v1' to prevent CORS and cross-origin cookie issues
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  if (import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost')) {
    return '/api/v1';
  }
  return envUrl || 'http://localhost/aurelia-salon/backend/public/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data || {
      success: false,
      message: error.message || 'Network error occurred',
    };
    return Promise.reject(errorData);
  }
);

export default api;

