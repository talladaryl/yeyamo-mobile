import { secureStore } from '@/services/storage/secure-store';
import { reverbClient } from '@/services/socket/reverb.client';
import { MOCK_PARTNER_USER, MOCK_TOKEN, MOCK_USER } from '@/features/mock/mockData';
import { useAuthStore, type SessionMode } from './auth.store';
import { authApi } from './auth.api';
import type { AuthApiUser, AuthUser, LoginCredentials, RegisterCredentials } from './types';
import { useInterestsStore } from '@/features/interests/interests.store';
import { registerTokenRefreshedHandler } from '@/services/api/client';

function toAuthUser(user: AuthApiUser, displayName?: string): AuthUser {
  const identifier = user.email ?? user.phone ?? `user-${user.id}`;
  const name = displayName?.trim() || identifier.split('@')[0];
  return {
    id: user.id,
    username: name.toLowerCase().replace(/[^a-z0-9_]+/g, '_'),
    display_name: name,
    email: user.email ?? '',
    avatar_url: null,
    city: '',
    is_verified: Boolean(user.emailVerifiedAt),
    user_type: user.roles.includes('PARTNER') ? 'partner' : 'user',
    created_at: user.createdAt,
  };
}

async function persistSession(response: {
  accessToken: string;
  refreshToken: string;
  user: AuthApiUser;
}, displayName?: string): Promise<void> {
  const user = toAuthUser(response.user, displayName);
  await Promise.all([
    secureStore.set(secureStore.KEYS.AUTH_TOKEN, response.accessToken),
    secureStore.set(secureStore.KEYS.REFRESH_TOKEN, response.refreshToken),
    secureStore.set(secureStore.KEYS.USER_ID, String(user.id)),
    secureStore.set(secureStore.KEYS.SESSION_MODE, 'backend'),
  ]);
  useAuthStore.getState().setAuth(user, response.accessToken, 'backend');
  reverbClient.connect(response.accessToken);
}

registerTokenRefreshedHandler((accessToken) => {
  const state = useAuthStore.getState();
  if (state.user) state.setAuth(state.user, accessToken, state.sessionMode ?? 'backend');
  reverbClient.connect(accessToken);
});

async function persistDemoSession(mode: Exclude<SessionMode, 'backend'>): Promise<void> {
  const user = mode === 'demo-partner' ? MOCK_PARTNER_USER : MOCK_USER;
  await Promise.all([
    secureStore.set(secureStore.KEYS.AUTH_TOKEN, MOCK_TOKEN),
    secureStore.remove(secureStore.KEYS.REFRESH_TOKEN),
    secureStore.set(secureStore.KEYS.USER_ID, String(user.id)),
    secureStore.set(secureStore.KEYS.SESSION_MODE, mode),
  ]);
  reverbClient.disconnect();
  useAuthStore.getState().setAuth(user, MOCK_TOKEN, mode);
}

export const authService = {
  /**
   * Called once on app boot — restores session from SecureStore.
   */
  async hydrate(): Promise<void> {
    try {
      const token = await secureStore.get(secureStore.KEYS.AUTH_TOKEN);
      if (token) {
        const storedMode = await secureStore.get(secureStore.KEYS.SESSION_MODE);
        if (storedMode === 'demo-user' || storedMode === 'demo-partner') {
          const mockUser = storedMode === 'demo-partner' ? MOCK_PARTNER_USER : MOCK_USER;
          useAuthStore.getState().setAuth(mockUser, MOCK_TOKEN, storedMode);
          return;
        }

        const apiUser = await authApi.me();
        const user = toAuthUser(apiUser);
        useAuthStore.getState().setAuth(user, token, 'backend');
        await secureStore.set(secureStore.KEYS.SESSION_MODE, 'backend');
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
    await persistSession(await authApi.login(credentials));
  },

  async register(credentials: RegisterCredentials): Promise<void> {
    await persistSession(await authApi.register(credentials), credentials.display_name);
  },

  async loginDemo(kind: 'user' | 'partner'): Promise<void> {
    await persistDemoSession(kind === 'partner' ? 'demo-partner' : 'demo-user');
  },

  async logout(): Promise<void> {
    if (useAuthStore.getState().sessionMode?.startsWith('demo-')) {
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
