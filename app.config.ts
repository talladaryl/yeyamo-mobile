import type { ConfigContext, ExpoConfig } from 'expo/config';
import appJson from './app.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  const base = appJson.expo as ExpoConfig;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? 'CHANGE_ME.apps.googleusercontent.com';
  const iosUrlScheme = `com.googleusercontent.apps.${iosClientId.split('.')[0]}`;
  return ({
    ...config,
    ...base,
    android: {
      ...base.android,
      config: {
        ...base.android?.config,
        googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY ?? '' },
      },
    },
    ios: {
      ...base.ios,
      config: {
        ...base.ios?.config,
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY ?? '',
      },
    },
    plugins: [
      ...(base.plugins ?? []),
      '@react-native-community/datetimepicker',
      ['@react-native-google-signin/google-signin', { iosUrlScheme }],
    ],
  });
};
