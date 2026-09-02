import { TouchableOpacity, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import type { TrendingPlace } from '@/features/explore/types';
import { useThemeStore } from '@/features/theme/theme.store';

type TrendingPlaceCardProps = {
  place: TrendingPlace;
  onPress: () => void;
};

export function TrendingPlaceCard({ place, onPress }: TrendingPlaceCardProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-56 mr-4"
      activeOpacity={0.9}
    >
      <View className="overflow-hidden rounded-2xl" style={{ backgroundColor: colors.card }}>
        <Image
          source={{ uri: place.image_url }}
          style={{ width: '100%', height: 148 }}
          contentFit="cover"
        />
      </View>
      
      <View className="mt-3 px-1">
        <Text className="text-sm font-semibold" style={{ color: colors.text }} numberOfLines={1}>
          {place.name}
        </Text>
        <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }} numberOfLines={1}>
          {place.city}
        </Text>
        
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="star" size={14} color="#F59E0B" />
            <Text className="text-xs" style={{ color: colors.text }}>{place.rating}</Text>
          </View>
          
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {place.distance_km < 1 
              ? `${(place.distance_km * 1000).toFixed(0)}m` 
              : `${place.distance_km}km`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
