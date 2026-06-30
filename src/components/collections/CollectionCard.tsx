// Carte de collection pour la grille
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CollectionSummary } from '@/features/collections/types';

interface CollectionCardProps {
  collection: CollectionSummary;
  onPress: () => void;
}

export function CollectionCard({ collection, onPress }: CollectionCardProps) {
  const visibilityIcon =
    collection.visibility === 'private'
      ? 'lock-closed'
      : collection.visibility === 'friends'
      ? 'people'
      : 'earth';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#161616] rounded-xl overflow-hidden"
      activeOpacity={0.7}
    >
      {/* Image de couverture */}
      {collection.cover_image_url ? (
        <Image
          source={{ uri: collection.cover_image_url }}
          className="w-full h-32"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-32 bg-[#27272A] items-center justify-center">
          <Ionicons name="images-outline" size={40} color="#52525B" />
        </View>
      )}

      {/* Informations */}
      <View className="p-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-white font-semibold text-base flex-1" numberOfLines={1}>
            {collection.name}
          </Text>
          <Ionicons name={visibilityIcon} size={14} color="#A1A1AA" />
        </View>
        <Text className="text-[#A1A1AA] text-sm">
          {collection.places_count} {collection.places_count > 1 ? 'lieux' : 'lieu'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
