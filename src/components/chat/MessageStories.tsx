import { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { groupActiveStories, type Story, type StoryAuthorGroup } from '@/features/story/types';
import type { EntityId } from '@/types/api.types';

type MessageStoriesProps = {
  stories: Story[];
  currentUserId?: EntityId;
};

function storyRoute(group: StoryAuthorGroup) {
  const firstUnseen = group.stories.find((story) => !story.viewed) ?? group.stories[0];
  return {
    pathname: '/(story)/[id]',
    params: { id: String(firstUnseen.id), storyIds: group.stories.map((story) => String(story.id)).join(',') },
  } as const;
}

export function MessageStories({ stories, currentUserId }: MessageStoriesProps) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const activeGroups = useMemo(() => groupActiveStories(stories), [stories]);

  if (!activeGroups.length) return null;

  return (
    <View className="pb-3 pt-2">
      <View className="mb-3 flex-row items-center justify-between px-4">
        <Text className="text-sm font-extrabold" style={{ color: colors.text }}>Stories</Text>
        <Text className="text-xs" style={{ color: colors.textSecondary }}>{activeGroups.length} active{activeGroups.length > 1 ? 's' : ''}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 16 }}>
        {activeGroups.map((group) => {
          const isOwn = String(group.author.id) === String(currentUserId);
          return (
            <TouchableOpacity key={String(group.author.id)} onPress={() => router.push(storyRoute(group))} className="w-[70px] items-center" activeOpacity={0.82} accessibilityLabel={`Voir les stories de ${group.author.display_name}`}>
              <View className="relative rounded-full border-[3px] border-[#1689FF] p-[3px]" style={{ opacity: group.viewed ? 0.55 : 1 }}>
                <Avatar uri={group.author.avatar_url} displayName={group.author.display_name} size={56} />
                {isOwn ? <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#1689FF]"><Icon name="add" size={15} color="#FFFFFF" /></View> : null}
              </View>
              <Text className="mt-2 max-w-[70px] text-xs font-semibold" style={{ color: colors.text }} numberOfLines={1}>{isOwn ? 'Votre story' : group.author.display_name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
