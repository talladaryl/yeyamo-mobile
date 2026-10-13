import { useSafeAreaInsets } from 'react-native-safe-area-context';
/** Full floating-bar obstruction, including its safe-area offset and visual gap. */
export function useYeyamoTabBarHeight() {
  const insets = useSafeAreaInsets();
  return 64 + Math.max(insets.bottom, 10) + 8;
}
