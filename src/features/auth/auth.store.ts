import { create } from 'zustand';
import type { AuthUser } from './types';

export type SessionMode = 'backend' | 'demo-user' | 'demo-partner';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  sessionMode: SessionMode | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  // Actions
  setAuth: (user: AuthUser, token: string, sessionMode?: SessionMode) => void;
  clearAuth: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  sessionMode: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (user, token, sessionMode = 'backend') =>
    set({ user, token, sessionMode, isAuthenticated: true }),

  clearAuth: () =>
    set({ user: null, token: null, sessionMode: null, isAuthenticated: false }),

  setHydrated: (value) => set({ isHydrated: value }),
}));

export function isDemoSession(): boolean {
  return useAuthStore.getState().sessionMode?.startsWith('demo-') ?? false;
}
