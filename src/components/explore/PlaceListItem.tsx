import { TouchableOpacity, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import type { TrendingPlace } from '@/features/explore/types';

type PlaceListItemProps = {
  place: TrendingPlace;
  onPress: () => void;
  onBookmark?: () => void;
};

export function PlaceListItem({ place, onPress, onBookmark }: PlaceListItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row bg-[#161616] rounded-2xl overflow-hidden mb-3"
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: place.image_url }}
        style={{ width: 120, height: 120 }}
        contentFit="cover"
      />

      <View className="flex-1 p-3 justify-between">
        <View>
          <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>
            {place.name}
          </Text>

          <View className="flex-row items-center gap-1 mb-2">
            <Icon library="ionicons" name="location" size={14} color="#A1A1AA" />
            <Text className="text-[#A1A1AA] text-xs">{place.city}</Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="star" size={16} color="#F59E0B" />
            <Text className="text-white text-sm font-semibold">
              {place.rating}
            </Text>
            <Text className="text-[#A1A1AA] text-xs">
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
