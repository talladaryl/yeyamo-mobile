import { TouchableOpacity, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import type { TrendingPlace } from '@/features/explore/types';
import { useThemeStore } from '@/features/theme/theme.store';

type PlaceListItemProps = {
  place: TrendingPlace;
  onPress: () => void;
  onBookmark?: () => void;
};

export function PlaceListItem({ place, onPress, onBookmark }: PlaceListItemProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3 flex-row overflow-hidden rounded-2xl border"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: place.image_url }}
        style={{ width: 120, height: 120 }}
        contentFit="cover"
      />

      <View className="flex-1 p-3 justify-between">
        <View>
          <Text className="mb-1 text-base font-bold" style={{ color: colors.text }} numberOfLines={1}>
            {place.name}
          </Text>

          <View className="flex-row items-center gap-1 mb-2">
            <Icon library="ionicons" name="location" size={14} color={colors.textSecondary} />
            <Text className="text-xs" style={{ color: colors.textSecondary }}>{place.city}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="star" size={16} color="#F59E0B" />
            <Text className="text-sm font-semibold" style={{ color: colors.text }}>
              {place.rating}
            </Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              ({place.reviews_count} avis)
            </Text>
          </View>

          <Text className="text-[#EF4444] text-sm font-semibold">
            {place.distance_km}km
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onBookmark}
        className="absolute top-3 right-3"
        activeOpacity={0.7}
      >
        <View className="bg-black/50 w-8 h-8 rounded-full items-center justify-center">
          <Icon library="ionicons" name="bookmark-outline" size={18} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
