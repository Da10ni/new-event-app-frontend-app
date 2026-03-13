import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
const { VENDORS } = API_CONFIG.ENDPOINTS;
export const vendorApi = {
  getAll: (params?: Record<string, unknown>) => axiosInstance.get(VENDORS.BASE, { params }),
  getBySlug: (slug: string) => axiosInstance.get(`${VENDORS.BASE}/${slug}`),
  getMyProfile: () => axiosInstance.get(VENDORS.ME_PROFILE),
  updateProfile: (data: Record<string, unknown>) => axiosInstance.patch(VENDORS.ME_PROFILE, data),
  toggleAvailability: () => axiosInstance.patch(VENDORS.ME_AVAILABILITY),
  getMyListings: (params?: Record<string, unknown>) => axiosInstance.get(VENDORS.ME_LISTINGS, { params }),
  getMyBookings: (params?: Record<string, unknown>) => axiosInstance.get(VENDORS.ME_BOOKINGS, { params }),
};
