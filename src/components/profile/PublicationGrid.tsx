// Grille de publications (style Instagram)
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UserPublication } from '@/features/profile/types';

interface PublicationGridProps {
  publications: UserPublication[];
  onPressPublication: (id: number) => void;
}

export function PublicationGrid({ publications, onPressPublication }: PublicationGridProps) {
  const renderItem = ({ item }: { item: UserPublication }) => (
    <TouchableOpacity
      onPress={() => onPressPublication(item.id)}
      className="flex-1 aspect-square p-0.5"
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
    <FlatList
      data={publications}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={3}
      scrollEnabled={false}
      contentContainerClassName="p-0"
    />
  );
}
