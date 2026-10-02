import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { useNetworkStore } from '@/features/network/network.store';

export function OfflineBanner() {
  const offline = useNetworkStore((state) => state.isConnected === false);
  const insets = useSafeAreaInsets();
  if (!offline) return null;
  return <View pointerEvents="none" style={{ position: 'absolute', zIndex: 1000, top: insets.top + 4, left: 16, right: 16, height: 36, borderRadius: 18, backgroundColor: '#27272A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
    <Icon name="cloud-offline-outline" size={17} color="#FFFFFF" />
    <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 13, marginLeft: 7 }}>Vous êtes hors ligne</Text>
  </View>;
}
