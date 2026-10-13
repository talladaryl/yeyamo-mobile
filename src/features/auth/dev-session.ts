import type { QueryClient } from '@tanstack/react-query';
import { useChatStore } from '@/features/chat/chat.store';
import { useCountryStore } from '@/features/country/country.store';
import { useInterestsStore } from '@/features/interests/interests.store';
import { reverbClient } from '@/services/socket/reverb.client';
import { secureStore } from '@/services/storage/secure-store';
import { useAuthStore } from './auth.store';

/**
 * Development-only equivalent of a fresh unauthenticated installation.
 *
 * The stable device id and Expo push token deliberately survive this local
 * reset. No backend unregister call is made, so the next login can upsert the
 * same physical device instead of creating a new local device identity.
 */
export async function clearLocalDevelopmentSession(queryClient: QueryClient): Promise<void> {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;

  console.info('DEV_FORCE_CLEAN_SESSION_START');
  reverbClient.disconnect();
  await Promise.all([
    secureStore.remove(secureStore.KEYS.AUTH_TOKEN),
    secureStore.remove(secureStore.KEYS.REFRESH_TOKEN),
    secureStore.remove(secureStore.KEYS.USER_ID),
    secureStore.remove(secureStore.KEYS.AUTH_USER),
    secureStore.remove(secureStore.KEYS.SESSION_MODE),
    secureStore.remove(secureStore.KEYS.INTERESTS),
    secureStore.remove(secureStore.KEYS.HAS_SELECTED_INTERESTS),
    secureStore.remove(secureStore.KEYS.INTEREST_PROFILE),
    useCountryStore.getState().reset(),
  ]);
  useAuthStore.getState().clearAuth();
  useInterestsStore.getState().reset();
  useChatStore.getState().reset();
  queryClient.clear();
  console.info('DEV_FORCE_CLEAN_SESSION_DONE');
}
