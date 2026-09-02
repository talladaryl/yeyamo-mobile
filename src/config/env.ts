import Constants from 'expo-constants';
import { Platform } from 'react-native';

const metroHost = Constants.expoConfig?.hostUri?.replace(/^.*?:\/\//, '').split(':')[0];
const localHost = metroHost || (Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1');

function localUrl(configured: string | undefined, protocol: 'http' | 'ws', port: number, path = '') {
  if (configured && configured !== 'auto') {
    return configured.replace(/\/$/, '');
  }
  return `${protocol}://${localHost}:${port}${path}`;
}

const ENV = {
  API_BASE_URL: localUrl(process.env.EXPO_PUBLIC_API_BASE_URL, 'http', 8083),
  MESSAGING_WS_URL: localUrl(
    process.env.EXPO_PUBLIC_MESSAGING_WS_URL,
    'ws',
    8104,
    '/ws/messaging',
  ),
  APP_ENV: (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as
    | 'development'
    | 'staging'
    | 'production',
  GOOGLE_MAPS_ANDROID_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY,
  GOOGLE_MAPS_IOS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY,
  GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  TURNSTILE_SITE_KEY: process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY,
  TURNSTILE_CHALLENGE_URL:
    process.env.EXPO_PUBLIC_TURNSTILE_CHALLENGE_URL ?? 'https://yeyamo.com/turnstile',
};

const platformMapsKey = Platform.OS === 'android' ? ENV.GOOGLE_MAPS_ANDROID_API_KEY : ENV.GOOGLE_MAPS_IOS_API_KEY;
if (!platformMapsKey && ENV.APP_ENV !== 'development') throw new Error(`Clé Google Maps ${Platform.OS} absente`);

export default ENV;
