import axios from 'axios';
import type { User, Counselor, ChatRoom, Message, Rating, Statistics } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { name: string; email: string; password: string; role?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async (): Promise<{ success: boolean; data: User }> => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (data: { name?: string; profilePicture?: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
  getCounselors: async (): Promise<{ success: boolean; data: Counselor[] }> => {
    const response = await api.get('/users/counselors');
    return response.data;
  },
  getCounselorById: async (id: string): Promise<{ success: boolean; data: Counselor }> => {
    const response = await api.get(`/users/counselors/${id}`);
    return response.data;
  },
  getChatHistory: async (): Promise<{ success: boolean; data: ChatRoom[] }> => {
    const response = await api.get('/users/chats');
    return response.data;
  },
  getMessages: async (chatRoomId: string): Promise<{ success: boolean; data: Message[] }> => {
    const response = await api.get(`/users/chats/${chatRoomId}/messages`);
    return response.data;
  },
};

// Counselor API
export const counselorAPI = {
  getProfile: async (): Promise<{ success: boolean; data: Counselor }> => {
    const response = await api.get('/counselors/profile');
    return response.data;
  },
  updateProfile: async (data: {
    specialization?: string;
    bio?: string;
    experience?: number;
    certifications?: string[];
    isAvailable?: boolean;
  }) => {
    const response = await api.put('/counselors/profile', data);
    return response.data;
  },
  getPendingChats: async (): Promise<{ success: boolean; data: ChatRoom[] }> => {
    const response = await api.get('/counselors/chats/pending');
    return response.data;
  },
  getActiveChats: async (): Promise<{ success: boolean; data: ChatRoom[] }> => {
    const response = await api.get('/counselors/chats/active');
    return response.data;
  },
  acceptChat: async (chatRoomId: string) => {
    const response = await api.post(`/counselors/chats/${chatRoomId}/accept`);
    return response.data;
  },
  declineChat: async (chatRoomId: string) => {
    const response = await api.post(`/counselors/chats/${chatRoomId}/decline`);
    return response.data;
  },
  resolveSession: async (chatRoomId: string) => {
    const response = await api.post(`/counselors/chats/${chatRoomId}/resolve`);
    return response.data;
  },
  getChatHistory: async (): Promise<{ success: boolean; data: ChatRoom[] }> => {
    const response = await api.get('/counselors/chats');
    return response.data;
  },
  getUserProfile: async (chatRoomId: string) => {
    const response = await api.get(`/counselors/chats/${chatRoomId}/user`);
    return response.data;
  },
  getMessages: async (chatRoomId: string): Promise<{ success: boolean; data: Message[] }> => {
    const response = await api.get(`/counselors/chats/${chatRoomId}/messages`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (): Promise<{ success: boolean; data: User[] }> => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  toggleBlockUser: async (userId: string) => {
    const response = await api.put(`/admin/users/${userId}/block`);
    return response.data;
  },
  getCounselors: async (): Promise<{ success: boolean; data: Counselor[] }> => {
    const response = await api.get('/admin/counselors');
    return response.data;
  },
  addCounselor: async (data: {
    name: string;
    email: string;
    password: string;
    specialization: string;
    bio?: string;
    experience?: number;
    certifications?: string[];
  }) => {
    const response = await api.post('/admin/counselors', data);
    return response.data;
  },
  updateCounselor: async (counselorId: string, data: {
    specialization?: string;
    bio?: string;
    experience?: number;
    certifications?: string[];
    isAvailable?: boolean;
  }) => {
    const response = await api.put(`/admin/counselors/${counselorId}`, data);
    return response.data;
  },
  deleteCounselor: async (counselorId: string) => {
    const response = await api.delete(`/admin/counselors/${counselorId}`);
    return response.data;
  },
  getStatistics: async (): Promise<{ success: boolean; data: Statistics }> => {
    const response = await api.get('/admin/statistics');
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  createChatRoom: async (counselorId: string): Promise<{ success: boolean; data: ChatRoom }> => {
    const response = await api.post('/chat/create', { counselorId });
    return response.data;
  },
  rateCounselor: async (data: { chatRoomId: string; rating: number; comment?: string }) => {
    const response = await api.post('/chat/rate', data);
    return response.data;
  },
};

export default api;

