import type { ConfigContext, ExpoConfig } from 'expo/config';
import appJson from './app.json';

export default ({ config }: ConfigContext): ExpoConfig => {
  const base = appJson.expo as ExpoConfig;
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
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY ?? '',
        iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY ?? '',
      },
    ],
    '@react-native-community/datetimepicker',
    'expo-web-browser',
    ],
  });
};
