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
};

export default ENV;
