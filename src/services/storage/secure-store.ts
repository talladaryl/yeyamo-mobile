import * as SecureStore from 'expo-secure-store';

const KEYS = {
  AUTH_TOKEN: 'yeyamo_auth_token',
  USER_ID: 'yeyamo_user_id',
  HAS_SEEN_ONBOARDING: 'yeyamo_has_seen_onboarding',
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

export const secureStore = { set, get, remove, clearAll, KEYS };
