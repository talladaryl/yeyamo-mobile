import * as SecureStore from 'expo-secure-store';

const KEYS = {
  AUTH_TOKEN: 'yeyamo_auth_token',
  REFRESH_TOKEN: 'yeyamo_refresh_token',
  USER_ID: 'yeyamo_user_id',
  SESSION_MODE: 'yeyamo_session_mode',
  HAS_SEEN_ONBOARDING: 'yeyamo_has_seen_onboarding',
  INTERESTS: 'yeyamo_interests',
  HAS_SELECTED_INTERESTS: 'yeyamo_has_selected_interests',
  DEVICE_ID: 'yeyamo_device_id',
  EXPO_PUSH_TOKEN: 'yeyamo_expo_push_token',
} as const;

type StoreKey = (typeof KEYS)[keyof typeof KEYS];

async function set(key: StoreKey, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

async function get(key: StoreKey): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

async function remove(key: StoreKey): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

async function clearAll(): Promise<void> {
  await Promise.all(Object.values(KEYS).map((k) => SecureStore.deleteItemAsync(k)));
}

async function clearAuthSession(): Promise<void> {
  await Promise.all([
    KEYS.AUTH_TOKEN,
    KEYS.REFRESH_TOKEN,
    KEYS.USER_ID,
    KEYS.SESSION_MODE,
    KEYS.EXPO_PUSH_TOKEN,
  ].map((key) => SecureStore.deleteItemAsync(key)));
}

export const secureStore = { set, get, remove, clearAll, clearAuthSession, KEYS };
