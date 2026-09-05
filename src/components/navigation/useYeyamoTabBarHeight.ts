import { useSafeAreaInsets } from 'react-native-safe-area-context';
export function useYeyamoTabBarHeight() { const insets = useSafeAreaInsets(); return 64 + insets.bottom; }
