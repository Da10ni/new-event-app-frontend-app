import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
import type { ApiResponse, User } from '../../types';
const { USERS } = API_CONFIG.ENDPOINTS;
export const userApi = {
  getProfile: () => axiosInstance.get<ApiResponse<{ user: User }>>(USERS.ME),
  updateProfile: (data: Record<string, unknown>) => axiosInstance.patch<ApiResponse<{ user: User }>>(USERS.ME, data),
  deleteAccount: () => axiosInstance.delete(USERS.ME),
};
