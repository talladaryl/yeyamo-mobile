import { FlatList, View, Text } from 'react-native';
import { StoryRing } from './StoryRing';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/features/theme/theme.store';
import type { Story } from '@/features/story/types';
import type { EntityId } from '@/types/api.types';

type StoriesListProps = {
  stories: Story[];
  currentUserId?: EntityId;
};

export function StoriesList({ stories, currentUserId }: StoriesListProps) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);

  return (
    <View className="border-b" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
      <FlatList
        horizontal
        data={stories}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 py-3 gap-3"
        renderItem={({ item }) => (
          <View className="items-center gap-1">
            <StoryRing
              uri={item.author.avatar_url}
              displayName={item.author.display_name}
              isViewed={item.viewed}
              showAddButton={String(item.author.id) === String(currentUserId)}
              onPress={() => router.push(`/(story)/${item.id}`)}
              size={64}
            />
            <Text className="mt-1 max-w-[68px] text-xs" style={{ color: colors.text }} numberOfLines={1}>
              {String(item.author.id) === String(currentUserId) ? 'Votre story' : item.author.username}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
