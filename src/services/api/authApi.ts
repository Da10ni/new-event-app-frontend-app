import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../../types';
const { AUTH } = API_CONFIG.ENDPOINTS;
export const authApi = {
  login: (data: LoginRequest) => axiosInstance.post<ApiResponse<AuthResponse>>(AUTH.LOGIN, data),
  register: (data: RegisterRequest) => axiosInstance.post<ApiResponse<AuthResponse>>(AUTH.REGISTER, data),
  registerVendor: (data: Record<string, unknown>) => axiosInstance.post<ApiResponse<AuthResponse>>(AUTH.REGISTER_VENDOR, data),
  logout: (refreshToken: string) => axiosInstance.post(AUTH.LOGOUT, { refreshToken }),
  forgotPassword: (email: string) => axiosInstance.post(AUTH.FORGOT_PASSWORD, { email }),
  resetPassword: (data: { email: string; otp: string; newPassword: string }) => axiosInstance.post(AUTH.RESET_PASSWORD, data),
  verifyEmail: (data: { email: string; otp: string }) => axiosInstance.post(AUTH.VERIFY_EMAIL, data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => axiosInstance.post(AUTH.CHANGE_PASSWORD, data),
};
