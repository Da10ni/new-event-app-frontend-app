import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
import type { ApiResponse, Listing, ListingFilter } from '../../types';
const { LISTINGS } = API_CONFIG.ENDPOINTS;
export const listingApi = {
  getAll: (params?: ListingFilter) => axiosInstance.get<ApiResponse<{ listings: Listing[] }>>(LISTINGS.BASE, { params }),
  getBySlug: (slug: string) => axiosInstance.get<ApiResponse<{ listing: Listing }>>(`${LISTINGS.BASE}/${slug}`),
  getFeatured: () => axiosInstance.get<ApiResponse<{ listings: Listing[] }>>(LISTINGS.FEATURED),
  getCities: () => axiosInstance.get<ApiResponse<{ cities: { name: string; listings: number; image: string }[] }>>(LISTINGS.CITIES),
  create: (data: Record<string, unknown>) => axiosInstance.post(LISTINGS.BASE, data),
  update: (id: string, data: Record<string, unknown>) => axiosInstance.patch(`${LISTINGS.BASE}/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`${LISTINGS.BASE}/${id}`),
  getReviews: (id: string, params?: Record<string, unknown>) => axiosInstance.get(`${LISTINGS.BASE}/${id}/reviews`, { params }),
};