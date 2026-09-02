// Item de lieu dans une collection
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CollectionPlace } from '@/features/collections/types';

interface CollectionPlaceItemProps {
  place: CollectionPlace;
  onPress: () => void;
  onTogglePriority?: () => void;
}

export function CollectionPlaceItem({ place, onPress, onTogglePriority }: CollectionPlaceItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row bg-white dark:bg-[#161616] rounded-xl p-3 mb-3"
      activeOpacity={0.7}
    >
      {/* Image */}
      <Image
        source={{ uri: place.cover_photo_url }}
        className="w-20 h-20 rounded-lg"
        resizeMode="cover"
      />

      {/* Informations */}
      <View className="flex-1 ml-3 justify-between">
        <View>
          <Text className="text-[#18181B] dark:text-white font-semibold text-base" numberOfLines={1}>
            {place.name}
          </Text>
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm" numberOfLines={1}>
            {place.category.name} • {place.city}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text className="text-[#18181B] dark:text-white text-sm ml-1">
            {place.rating.toFixed(1)}
          </Text>
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm ml-1">
            ({place.reviews_count} avis)
          </Text>
        </View>

        {place.added_at && (
          <Text className="text-[#52525B] text-xs mt-1">
            Enregistré le {new Date(place.added_at).toLocaleDateString('fr-FR')}
          </Text>
        )}
      </View>

      {/* Flag priorité */}
      {onTogglePriority && (
        <TouchableOpacity onPress={onTogglePriority} className="ml-2 self-start">
          <Ionicons
            name={place.is_priority ? 'flag' : 'flag-outline'}
            size={20}
            color={place.is_priority ? '#EF4444' : '#A1A1AA'}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
