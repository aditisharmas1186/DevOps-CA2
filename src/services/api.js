import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  verify: () => api.get('/auth/verify'),
};

// Data API
export const dataAPI = {
  upload: (formData) => api.post('/data/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDatasets: () => api.get('/data/datasets'),
  updateMappings: (datasetId, mappings) => 
    api.put(`/data/datasets/${datasetId}/mappings`, { mappings }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (params) => api.get('/analytics/dashboard', { params }),
  generateAnalytics: (period) => api.post(`/analytics/generate/${period}`),
  getRevenueTrends: (params) => api.get('/analytics/revenue-trends', { params }),
};

// AI API
export const aiAPI = {
  getInsights: (query, period) => api.post('/ai/insights', { query, period }),
  getSummary: (period) => api.get(`/ai/summary/${period}`),
  getForecast: (metric, horizon) => api.post('/ai/forecast', { metric, horizon }),
  getRecommendations: () => api.get('/ai/recommendations'),
};

// Billing API
export const billingAPI = {
  getPlans: () => api.get('/billing/plans'),
  getSubscription: () => api.get('/billing/subscription'),
  createCheckoutSession: (planId) => api.post('/billing/create-checkout-session', { planId }),
  checkoutSuccess: (sessionId) => api.post('/billing/checkout-success', { sessionId }),
  cancelSubscription: () => api.post('/billing/cancel-subscription'),
  reactivateSubscription: () => api.post('/billing/reactivate-subscription'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  updatePreferences: (preferences) => api.put('/user/preferences', preferences),
  deleteAccount: () => api.delete('/user/account'),
};

export default api;