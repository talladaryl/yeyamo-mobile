import { secureStore } from '@/services/storage/secure-store';
import { reverbClient } from '@/services/socket/reverb.client';
import ENV from '@/config/env';
import { MOCK_TOKEN, MOCK_USER } from '@/features/mock/mockData';
import { useAuthStore } from './auth.store';
import { authApi } from './auth.api';
import type { LoginCredentials, RegisterCredentials } from './types';
import { useInterestsStore } from '@/features/interests/interests.store';

export const authService = {
  /**
   * Called once on app boot — restores session from SecureStore.
   */
  async hydrate(): Promise<void> {
    try {
      const token = await secureStore.get(secureStore.KEYS.AUTH_TOKEN);
      if (token) {
        if (ENV.USE_MOCKS) {
          useAuthStore.getState().setAuth(MOCK_USER, token);
          return;
        }

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
    if (ENV.USE_MOCKS) {
      await secureStore.set(secureStore.KEYS.AUTH_TOKEN, MOCK_TOKEN);
      await secureStore.set(secureStore.KEYS.USER_ID, String(MOCK_USER.id));
      useAuthStore.getState().setAuth(
        { ...MOCK_USER, email: credentials.email || MOCK_USER.email },
        MOCK_TOKEN,
      );
      return;
    }

    const { token, user } = await authApi.login(credentials);
    await secureStore.set(secureStore.KEYS.AUTH_TOKEN, token);
    await secureStore.set(secureStore.KEYS.USER_ID, String(user.id));
    useAuthStore.getState().setAuth(user, token);
    reverbClient.connect(token);
  },

  async register(credentials: RegisterCredentials): Promise<void> {
    if (ENV.USE_MOCKS) {
      const user = {
        ...MOCK_USER,
        username: credentials.username || MOCK_USER.username,
        display_name: credentials.display_name || MOCK_USER.display_name,
        email: credentials.email || MOCK_USER.email,
        city: credentials.city || MOCK_USER.city,
      };

      await secureStore.set(secureStore.KEYS.AUTH_TOKEN, MOCK_TOKEN);
      await secureStore.set(secureStore.KEYS.USER_ID, String(user.id));
      useAuthStore.getState().setAuth(user, MOCK_TOKEN);
      return;
    }

    const { token, user } = await authApi.register(credentials);
    await secureStore.set(secureStore.KEYS.AUTH_TOKEN, token);
    await secureStore.set(secureStore.KEYS.USER_ID, String(user.id));
    useAuthStore.getState().setAuth(user, token);
    reverbClient.connect(token);
  },

  async logout(): Promise<void> {
    if (ENV.USE_MOCKS) {
      await secureStore.clearAll();
      useAuthStore.getState().clearAuth();
      useInterestsStore.getState().reset();
      return;
    }

    try {
      await authApi.logout();
    } catch {
      // Best-effort — clear local state regardless
    } finally {
      reverbClient.disconnect();
      await secureStore.clearAll();
      useAuthStore.getState().clearAuth();
      useInterestsStore.getState().reset();
    }
  },
};
