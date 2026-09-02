// Grille de publications (style Instagram)
import { View, Text, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UserPublication } from '@/features/profile/types';
import type { EntityId } from '@/types/api.types';

interface PublicationGridProps {
  publications: UserPublication[];
  onPressPublication: (id: EntityId) => void;
}

export function PublicationGrid({ publications, onPressPublication }: PublicationGridProps) {
  const { width } = useWindowDimensions();
  const itemSize = (width - 4) / 3;
  const renderItem = (item: UserPublication) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => onPressPublication(item.id)}
      className="p-0.5"
      style={{ width: itemSize, height: itemSize }}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.media_url }}
        className="w-full h-full"
        resizeMode="cover"
      />
      {/* Indicateur vidéo */}
      {item.type === 'video' && (
        <View className="absolute top-2 right-2">
          <Ionicons name="play-circle" size={20} color="#FFFFFF" />
        </View>
      )}
      {/* Nombre de likes */}
      {item.likes_count > 0 && (
        <View className="absolute bottom-2 left-2 flex-row items-center bg-black/50 px-2 py-1 rounded-full">
          <Ionicons name="heart" size={12} color="#FFFFFF" />
          <View className="w-1" />
          <Text className="text-white text-xs font-semibold">{item.likes_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-row flex-wrap">{publications.map(renderItem)}</View>
  );
}
