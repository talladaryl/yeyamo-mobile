import { Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE as GOOGLE_PROVIDER } from 'react-native-maps';

const googleMapsAndroidApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY;

if (__DEV__ && Platform.OS === 'android' && !googleMapsAndroidApiKey) {
  console.warn(
    'Google Maps est utilisé sans EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY. Configurez une clé Android restreinte avant de tester la carte native.',
  );
}

export const NativeMap = MapView;
export const NativeMarker = Marker;
export const NativePolyline = Polyline;
// Google Maps needs an iOS native API-key configuration at build time. Forcing
// it without that configuration renders a black map. Apple Maps is available
// out of the box on iOS; Android continues to use the configured Google map.
export const PROVIDER_GOOGLE = Platform.OS === 'android' ? GOOGLE_PROVIDER : undefined;
export type NativeMapRef = MapView;
