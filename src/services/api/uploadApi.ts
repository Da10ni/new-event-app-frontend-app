import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
const { UPLOAD } = API_CONFIG.ENDPOINTS;
export const uploadApi = {
  uploadImage: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) formData.append('folder', folder);
    return axiosInstance.post(UPLOAD.IMAGE, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadImages: (files: File[], folder?: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    if (folder) formData.append('folder', folder);
    return axiosInstance.post(UPLOAD.IMAGES, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteImage: (publicId: string) => axiosInstance.delete(UPLOAD.IMAGE, { data: { publicId } }),
};
