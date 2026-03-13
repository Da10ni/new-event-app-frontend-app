import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
import type { ApiResponse, Review } from '../../types';
const { REVIEWS } = API_CONFIG.ENDPOINTS;
export const reviewApi = {
  create: (data: { booking: string; rating: number; title?: string; comment: string; detailedRatings?: Record<string, number> }) =>
    axiosInstance.post<ApiResponse<{ review: Review }>>(REVIEWS.BASE, data),
  update: (id: string, data: Record<string, unknown>) =>
    axiosInstance.patch<ApiResponse<{ review: Review }>>(`${REVIEWS.BASE}/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`${REVIEWS.BASE}/${id}`),
  addVendorReply: (id: string, comment: string) =>
    axiosInstance.post<ApiResponse<{ review: Review }>>(`${REVIEWS.BASE}/${id}/reply`, { comment }),
};
