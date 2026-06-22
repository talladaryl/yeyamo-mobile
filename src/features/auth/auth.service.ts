import { secureStore } from '@/services/storage/secure-store';
import { reverbClient } from '@/services/socket/reverb.client';
import { useAuthStore } from './auth.store';
import { authApi } from './auth.api';
import type { LoginCredentials, RegisterCredentials } from './types';

export const authService = {
  /**
   * Called once on app boot — restores session from SecureStore.
   */
  async hydrate(): Promise<void> {
    try {
      const token = await secureStore.get(secureStore.KEYS.AUTH_TOKEN);
      if (token) {
        const { data: user } = await authApi.me();
        useAuthStore.getState().setAuth(user, token);
        reverbClient.connect(token);
      }
    } catch {
      // Token invalid/expired — wipe it
      await secureStore.clearAll();
    } finally {
      useAuthStore.getState().setHydrated(true);
    }
  },

  async login(credentials: LoginCredentials): Promise<void> {
    const { token, user } = await authApi.login(credentials);
    await secureStore.set(secureStore.KEYS.AUTH_TOKEN, token);
    await secureStore.set(secureStore.KEYS.USER_ID, String(user.id));
    useAuthStore.getState().setAuth(user, token);
    reverbClient.connect(token);
  },

  async register(credentials: RegisterCredentials): Promise<void> {
    const { token, user } = await authApi.register(credentials);
    await secureStore.set(secureStore.KEYS.AUTH_TOKEN, token);
    await secureStore.set(secureStore.KEYS.USER_ID, String(user.id));
    useAuthStore.getState().setAuth(user, token);
    reverbClient.connect(token);
  },

  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — clear local state regardless
    } finally {
      reverbClient.disconnect();
      await secureStore.clearAll();
      useAuthStore.getState().clearAuth();
    }
  },
};
