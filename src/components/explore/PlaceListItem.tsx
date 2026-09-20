import { TouchableOpacity, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

export type PlaceListItemModel = {
  id: string | number;
  name: string;
  city?: string | null;
  image_url?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  distance_km?: number | null;
};

type PlaceListItemProps = {
  place: PlaceListItemModel;
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
      {place.image_url ? <Image source={{ uri: place.image_url }} style={{ width: 120, height: 120 }} contentFit="cover" /> : <View className="w-[120px] items-center justify-center" style={{ backgroundColor: colors.elevated }}><Icon name="location-outline" size={28} color={colors.textMuted} /></View>}

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
          {place.rating != null ? <View className="flex-row items-center gap-1"><Icon library="ionicons" name="star" size={16} color="#F59E0B" /><Text className="text-sm font-semibold" style={{ color: colors.text }}>{place.rating}</Text>{place.reviews_count != null ? <Text className="text-xs" style={{ color: colors.textSecondary }}>({place.reviews_count} avis)</Text> : null}</View> : <Text className="text-xs" style={{ color: colors.textSecondary }}>Informations à découvrir</Text>}
          {place.distance_km != null ? <Text className="text-[#EF4444] text-sm font-semibold">{place.distance_km}km</Text> : null}
        </View>
      </View>

      {onBookmark ? (
        <TouchableOpacity
          onPress={onBookmark}
          className="absolute top-3 right-3"
          activeOpacity={0.7}
        >
          <View className="bg-black/50 w-8 h-8 rounded-full items-center justify-center">
            <Icon library="ionicons" name="bookmark-outline" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}
