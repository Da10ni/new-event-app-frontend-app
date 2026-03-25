const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REGISTER_VENDOR: '/auth/register/vendor',
      REFRESH: '/auth/refresh-token',
      LOGOUT: '/auth/logout',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_EMAIL: '/auth/verify-email',
      CHANGE_PASSWORD: '/auth/change-password',
    },
    USERS: { ME: '/users/me' },
    VENDORS: {
      BASE: '/vendors',
      ME_PROFILE: '/vendors/me/profile',
      ME_DASHBOARD: '/vendors/me/dashboard',
      ME_AVAILABILITY: '/vendors/me/availability',
      ME_LISTINGS: '/vendors/me/listings',
      ME_BOOKINGS: '/vendors/me/bookings',
    },
    LISTINGS: { BASE: '/listings', FEATURED: '/listings/featured', CITIES: '/listings/cities' },
    CATEGORIES: { BASE: '/categories' },
    BOOKINGS: { BASE: '/bookings', MY: '/bookings/my' },
    PAYMENTS: { CREATE_INTENT: '/payments/create-intent', CONFIRM: '/payments/confirm' },
    REVIEWS: { BASE: '/reviews' },
    NOTIFICATIONS: { BASE: '/notifications', UNREAD_COUNT: '/notifications/unread-count', READ_ALL: '/notifications/read-all' },
    FAVORITES: { BASE: '/favorites' },
    UPLOAD: { IMAGE: '/upload/image', IMAGES: '/upload/images' },
    MESSAGES: { CONVERSATIONS: '/messages/conversations', UNREAD_COUNT: '/messages/unread-count' },
  },
};