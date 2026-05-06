// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: '/auth/signup',
    SIGNIN: '/auth/signin',
    SIGNOUT: '/auth/signout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  // Predictions
  PREDICT: '/predict',
  PREDICT_AND_SAVE: '/predict-and-save',
  // Detections
  DETECTIONS: '/detections',
  DETECTION_BY_ID: (id) => `/detections/${id}`,
  // Profile
  PROFILE: '/profile',
  PROFILE_UPLOAD_PHOTO: '/profile/upload-photo',
  // Admin
  ADMIN_STATS: '/admin/stats',
  // Health
  HEALTH: '/health',
}

export const HTTP_HEADERS = {
  JSON: {
    'Content-Type': 'application/json',
  },
}

export const API_TIMEOUT = 30000 // 30 seconds
