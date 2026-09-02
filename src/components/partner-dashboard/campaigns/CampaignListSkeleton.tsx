import { View } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';

export function CampaignListSkeleton() {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="gap-4 px-4 pt-3">
      {[0, 1].map((item) => (
        <View key={item} className="overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="h-32" style={{ backgroundColor: colors.elevated }} />
          <View className="gap-3 p-4">
            <View className="h-5 w-2/3 rounded" style={{ backgroundColor: colors.elevated }} />
            <View className="h-3 w-1/2 rounded" style={{ backgroundColor: colors.elevated }} />
            <View className="h-2 rounded-full" style={{ backgroundColor: colors.elevated }} />
          </View>
        </View>
      ))}
    </View>
  );
}
