import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import type { Establishment } from '@/features/partner-dashboard/types';
import { useThemeStore } from '@/features/theme/theme.store';

interface EstablishmentCardProps {
  establishment: Establishment;
  onPress: () => void;
}

export function EstablishmentCard({ establishment, onPress }: EstablishmentCardProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3 overflow-hidden rounded-2xl border"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: establishment.image_url }}
        style={{ width: '100%', height: 140 }}
        contentFit="cover"
      />
      <View className="p-3">
        <Text className="mb-1 text-base font-semibold" style={{ color: colors.text }}>
          {establishment.name}
        </Text>
        <Text className="mb-2 text-xs" style={{ color: colors.textSecondary }}>
          {establishment.category}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="star" size={14} color="#F59E0B" />
            <Text className="text-sm font-semibold" style={{ color: colors.text }}>
              {establishment.rating}
            </Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              ({establishment.reviews_count} avis)
            </Text>
          </View>
          <Text className="max-w-[46%] text-right text-xs" style={{ color: colors.textSecondary }} numberOfLines={1}>
            {establishment.address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
