// API Configuration
// Change USE_BACKEND to switch between local storage and backend API

export const API_CONFIG = {
  // Set to true to use Railway backend, false to use local storage
  USE_BACKEND: true,

  // Backend URLs
  LOCAL_BACKEND: 'http://localhost:3000',
  PRODUCTION_BACKEND: 'https://buzzit-production.up.railway.app',

  // Get the current backend URL
  getBackendURL() {
    return this.USE_BACKEND ? this.PRODUCTION_BACKEND : this.LOCAL_BACKEND;
  },

  // Check if backend is enabled
  isBackendEnabled() {
    return this.USE_BACKEND;
  },
};
