import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
import type { ApiResponse, PaymentIntentResponse } from '../../types';

const { PAYMENTS } = API_CONFIG.ENDPOINTS;

export const paymentApi = {
  createIntent: (bookingId: string) =>
    axiosInstance.post<ApiResponse<PaymentIntentResponse>>(PAYMENTS.CREATE_INTENT, { bookingId }),

  confirm: (bookingId: string) =>
    axiosInstance.post<ApiResponse<{ status: string }>>(PAYMENTS.CONFIRM, { bookingId }),
};