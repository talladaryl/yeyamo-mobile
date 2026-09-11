import app from './app.json';
import type { ConfigContext, ExpoConfig } from 'expo/config';

// JSON imports widen literal values (for example, "portrait" becomes string).
// The file is the canonical Expo config, so retain Expo's configuration type here.
const base = app.expo as unknown as ExpoConfig;

/**
 * Native Google Maps needs its Android key at build time. Keeping the key in
 * an Expo public environment variable makes the release contract explicit
 * without committing any credential.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const merged = { ...base, ...config };
  const android = { ...base.android, ...config.android } as NonNullable<ExpoConfig['android']> & {
    config?: Record<string, unknown>;
  };
  const ios = { ...base.ios, ...config.ios } as NonNullable<ExpoConfig['ios']> & {
    config?: Record<string, unknown>;
  };
  return {
    ...merged,
    plugins: [
      ...((base.plugins ?? []) as unknown as NonNullable<ExpoConfig['plugins']>),
      'expo-image',
      'expo-web-browser',
    ],
    android: {
      ...android,
      config: {
        ...(android.config ?? {}),
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY,
        },
      },
    },
    ios: {
      ...ios,
      config: {
        ...(ios.config ?? {}),
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY,
      },
    },
  };
};
