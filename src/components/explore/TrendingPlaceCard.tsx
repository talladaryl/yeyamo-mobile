import { TouchableOpacity, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import type { TrendingPlace } from '@/features/explore/types';

type TrendingPlaceCardProps = {
  place: TrendingPlace;
  onPress: () => void;
};

export function TrendingPlaceCard({ place, onPress }: TrendingPlaceCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-40 mr-3"
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: place.image_url }}
        style={{ width: 160, height: 120, borderRadius: 12 }}
        contentFit="cover"
      />
      
      <View className="mt-2">
        <Text className="text-white font-semibold text-sm" numberOfLines={1}>
          {place.name}
        </Text>
        
        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="star" size={14} color="#F59E0B" />
            <Text className="text-white text-xs">{place.rating}</Text>
          </View>
          
          <Text className="text-[#A1A1AA] text-xs">
            {place.distance_km < 1 
              ? `${(place.distance_km * 1000).toFixed(0)}m` 
              : `${place.distance_km}km`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
