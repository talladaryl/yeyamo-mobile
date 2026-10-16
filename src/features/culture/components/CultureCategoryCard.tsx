import { Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

export function CultureCategoryCard({ title, subtitle, imageUrl, icon = 'grid-outline', onPress }: { title: string; subtitle?: string; imageUrl?: string; icon?: string; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="mb-3 flex-1 overflow-hidden rounded-3xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }} activeOpacity={0.84} accessibilityRole="button" accessibilityLabel={title}>
    <View className="aspect-[1.45] justify-end overflow-hidden" style={{ backgroundColor: colors.elevated }}>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={{ position: 'absolute', width: '100%', height: '100%' }} contentFit="cover" transition={120} /> : <View className="absolute inset-0 items-center justify-center"><Icon name={icon} size={36} color={colors.primary} /></View>}
      <View className="absolute inset-0 bg-black/25" />
      <View className="p-3"><Text className="text-base font-extrabold text-white" numberOfLines={2}>{title}</Text>{subtitle ? <Text className="mt-1 text-[11px] text-white/90" numberOfLines={1}>{subtitle}</Text> : null}</View>
    </View>
  </TouchableOpacity>;
}
