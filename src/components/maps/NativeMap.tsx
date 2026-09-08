import { Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

const googleMapsAndroidApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY;

if (__DEV__ && Platform.OS === 'android' && !googleMapsAndroidApiKey) {
  console.warn(
    'Google Maps est utilisé sans EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY. Configurez une clé Android restreinte avant de tester la carte native.',
  );
}

export const NativeMap = MapView;
export const NativeMarker = Marker;
export const NativePolyline = Polyline;
export { PROVIDER_GOOGLE };
export type NativeMapRef = MapView;
