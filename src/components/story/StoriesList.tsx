import { FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/features/theme/theme.store';
import { groupActiveStories, type Story, type StoryAuthorGroup } from '@/features/story/types';
import type { EntityId } from '@/types/api.types';
import { StoryRing } from './StoryRing';

type StoriesListProps = {
  stories: Story[];
  currentUserId?: EntityId;
  overlay?: boolean;
};

function storyRoute(group: StoryAuthorGroup) {
  const firstUnseen = group.stories.find((story) => !story.viewed) ?? group.stories[0];
  return {
    pathname: '/(story)/[id]',
    params: {
      id: String(firstUnseen.id),
      storyIds: group.stories.map((story) => String(story.id)).join(','),
    },
  } as const;
}

export function StoriesList({ stories, currentUserId, overlay = false }: StoriesListProps) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const groups = groupActiveStories(stories);

  if (!groups.length) return null;

  return (
    <View
      className="border-b"
      style={{ backgroundColor: overlay ? 'rgba(0,0,0,0.48)' : colors.background, borderColor: overlay ? 'rgba(255,255,255,0.14)' : colors.border }}
    >
      <FlatList
        horizontal
        data={groups}
        keyExtractor={(item) => String(item.author.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-4 py-3"
        renderItem={({ item }) => {
          const isOwn = String(item.author.id) === String(currentUserId);
          return (
            <View className="items-center gap-1">
              <StoryRing
                uri={item.author.avatar_url}
                displayName={item.author.display_name}
                isViewed={item.viewed}
                showAddButton={isOwn}
                onPress={() => router.push(storyRoute(item))}
                size={64}
              />
              <Text className="mt-1 max-w-[68px] text-xs" style={{ color: overlay ? '#FFFFFF' : colors.text }} numberOfLines={1}>
                {isOwn ? 'Votre story' : item.author.username}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}
