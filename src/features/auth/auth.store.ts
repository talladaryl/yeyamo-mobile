import { create } from 'zustand';
import type { AuthUser } from './types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  // Actions
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (user, token) =>
    set({ user, token, isAuthenticated: true }),

  clearAuth: () =>
    set({ user: null, token: null, isAuthenticated: false }),

  setHydrated: (value) => set({ isHydrated: value }),
}));
