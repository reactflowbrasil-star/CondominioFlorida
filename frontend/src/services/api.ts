/// <reference types="vite/client" />
import axios from 'axios';
import type { AuthResponse, LoginData, Booking, BookingCreate, Area, User, Notification } from '@/types';

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api/v1',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data),
  refresh: (refreshToken: string) => api.post<{ accessToken: string }>('/auth/refresh', { refreshToken }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get<{ user: User }>('/auth/me'),
  createFirstAdmin: (data: any) => api.post('/auth/first-admin', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.post('/auth/change-password', data),
};

export const areaAPI = {
  getAll: (params?: { includeInactive?: boolean }) => api.get<{ data: Area[] }>('/areas', { params }),
  getById: (id: string) => api.get<{ area: Area }>(`/areas/${id}`),
  getAvailability: (id: string, date: string) => api.get<{ availableSlots: string[] }>(`/areas/${id}/availability`, { params: { date } }),
};

export const bookingAPI = {
  getAll: (params?: any) => api.get<{ data: Booking[]; total: number; page: number; limit: number }>('/bookings', { params }),
  getById: (id: string) => api.get<{ booking: Booking }>(`/bookings/${id}`),
  create: (data: BookingCreate) => api.post<{ booking: Booking }>('/bookings', data),
  cancel: (id: string, data?: { reason?: string }) => api.patch<{ booking: Booking }>(`/bookings/${id}/cancel`, data),
  getMyBookings: (params?: any) => api.get<{ data: Booking[]; total: number }>('/bookings/my', { params }),
  getQrCode: (id: string) => api.get<{ qrCodeUrl: string }>(`/bookings/${id}/qr-code`),
};

export const adminAPI = {
  getAllUsers: (params?: any) => api.get<{ data: User[]; total: number; page: number; limit: number }>('/residents', { params }),
  updateUserStatus: (id: string, data: { status: string }) => api.patch<{ user: User }>(`/residents/${id}/status`, data),
  resetPassword: (id: string, data: { newPassword: string }) => api.patch(`/residents/${id}/reset-password`, data),
  getAllBookings: (params?: any) => api.get<{ data: Booking[]; total: number; page: number; limit: number }>('/bookings', { params }),
  approveBooking: (id: string) => api.patch<{ booking: Booking }>(`/bookings/${id}/approve`, {}),
  rejectBooking: (id: string, data: { reason: string }) => api.patch<{ booking: Booking }>(`/bookings/${id}/reject`, data),
  getAllMaintenance: (params?: any) => api.get('/maintenance-blocks', { params }),
  createMaintenance: (data: any) => api.post('/maintenance-blocks', data),
  deleteMaintenance: (id: string) => api.delete(`/maintenance-blocks/${id}`),
  getSettings: () => api.get<{ settings: Record<string, any> }>('/auth/settings'),
  updateSetting: (data: { key: string; value: any }) => api.post('/auth/settings', data),
};

export const notificationAPI = {
  getAll: () => api.get<Notification[]>('/notifications'),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
};
