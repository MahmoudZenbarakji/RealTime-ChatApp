import { create } from 'zustand';
import type { AuthState, User, Counselor } from '../types';
import { authAPI } from '../services/api';
import { initializeSocket, disconnectSocket } from '../services/socket';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setCounselorProfile: (profile: Counselor | null) => void;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      counselorProfile: null,

      login: async (email: string, password: string) => {
        const response = await authAPI.login(email, password);
        const { user, accessToken, refreshToken, counselorProfile } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Initialize socket connection
        initializeSocket(accessToken);

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          counselorProfile: counselorProfile || null,
        });
      },

      register: async (data) => {
        const response = await authAPI.register(data);
        const { user, accessToken, refreshToken, counselorProfile } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Initialize socket connection
        initializeSocket(accessToken);

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          counselorProfile: counselorProfile || null,
        });
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          disconnectSocket();

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            counselorProfile: null,
          });
        }
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      setCounselorProfile: (profile) => {
        set({ counselorProfile: profile });
      },
    })
);

