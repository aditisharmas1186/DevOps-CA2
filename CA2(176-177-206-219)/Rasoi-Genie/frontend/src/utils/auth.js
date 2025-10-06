// Authentication utilities
export const authUtils = {
  // Token management
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  removeToken: () => {
    localStorage.removeItem('token');
  },

  // User management
  setUser: (username) => {
    localStorage.setItem('username', username);
  },

  getUser: () => {
    return localStorage.getItem('username');
  },

  removeUser: () => {
    localStorage.removeItem('username');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = authUtils.getToken();
    const user = authUtils.getUser();
    return !!(token && user);
  },

  // Clear all auth data
  clearAuth: () => {
    authUtils.removeToken();
    authUtils.removeUser();
  },

  // Form validation helpers
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password) => {
    return password.length >= 6;
  },

  validateUsername: (username) => {
    return username.length >= 3;
  }
};