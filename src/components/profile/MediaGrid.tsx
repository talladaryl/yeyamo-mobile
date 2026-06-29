import { FlatList, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import { formatCount } from '@/utils/format';
import type { ProfilePost } from '@/features/profile/types';

const { width } = Dimensions.get('window');
const itemSize = (width - 6) / 3; // 3 columns with 2px gap

type MediaGridProps = {
  posts: ProfilePost[];
  onPostPress: (postId: number) => void;
};

export function MediaGrid({ posts, onPostPress }: MediaGridProps) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => String(item.id)}
      numColumns={3}
      columnWrapperStyle={{ gap: 2 }}
      contentContainerStyle={{ gap: 2 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => onPostPress(item.id)}
          activeOpacity={0.9}
          style={{ width: itemSize, height: itemSize }}
        >
          <Image
            source={{ uri: item.thumbnail_url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />

          {/* Video indicator */}
          {item.type === 'video' && (
            <View className="absolute top-2 right-2">
              <Icon library="ionicons" name="play" size={20} color="#FFFFFF" />
            </View>
          )}

          {/* Carousel indicator */}
          {item.type === 'carousel' && (
            <View className="absolute top-2 right-2">
              <Icon library="ionicons" name="copy-outline" size={18} color="#FFFFFF" />
            </View>
          )}

          {/* Stats overlay */}
          <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Icon library="ionicons" name="heart" size={16} color="#FFFFFF" />
              <Text className="text-white text-xs font-semibold">
                {formatCount(item.likes_count)}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon library="ionicons" name="chatbubble" size={14} color="#FFFFFF" />
              <Text className="text-white text-xs font-semibold">
                {formatCount(item.comments_count)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
