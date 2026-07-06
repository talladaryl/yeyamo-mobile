// Carte de lieu favori
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { FavoritePlace } from '@/features/profile/types';

interface FavoritePlaceCardProps {
  place: FavoritePlace;
  onPress: () => void;
  onTogglePriority?: () => void;
}

export function FavoritePlaceCard({ place, onPress, onTogglePriority }: FavoritePlaceCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#161616] rounded-xl overflow-hidden mb-3"
      activeOpacity={0.7}
    >
      {/* Image */}
      <Image
        source={{ uri: place.cover_photo_url }}
        className="w-full h-48"
        resizeMode="cover"
      />

      {/* Informations */}
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-white font-semibold text-lg" numberOfLines={1}>
              {place.name}
            </Text>
            <Text className="text-[#A1A1AA] text-sm" numberOfLines={1}>
              {place.category.name} • {place.city}
            </Text>
          </View>

          {/* Flag priorité */}
          {onTogglePriority && (
            <TouchableOpacity onPress={onTogglePriority} className="ml-2">
              <Ionicons
                name={place.is_priority ? 'flag' : 'flag-outline'}
                size={22}
                color={place.is_priority ? '#EF4444' : '#A1A1AA'}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Note */}
        <View className="flex-row items-center">
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text className="text-white text-sm font-semibold ml-1">
            {place.rating.toFixed(1)}
          </Text>
          <Text className="text-[#A1A1AA] text-sm ml-1">
            ({place.reviews_count} avis)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
