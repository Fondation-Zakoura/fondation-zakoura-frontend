// src/services/api.ts

import axios from 'axios';
import type { Partner, FilterOption, ApiResponse } from '../types/partners';

const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: { 'Accept': 'application/json' }
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
  getPartners: async (filters: Record<string, string | number | boolean | undefined>, page: number = 1): Promise<ApiResponse<Partner>> => {
    const response = await apiClient.get('/partners', { params: { ...filters, page } });
    return response.data;
  },
  getOptions: async (endpoint: string): Promise<FilterOption[]> => {
    const response = await apiClient.get<ApiResponse<FilterOption>>(endpoint);
    return response.data.data;
  },
  addPartner: async (data: FormData): Promise<{data: Partner}> => {
    const response = await apiClient.post('/partners', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  updatePartner: async (id: number, data: FormData): Promise<{data: Partner}> => {
    data.append('_method', 'PUT');
    const response = await apiClient.post(`/partners/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  deletePartners: async (ids: number[]): Promise<void> => {
    await apiClient.post('/partners/bulk-delete', { ids }); // Use a dedicated endpoint for soft delete
  }
};
