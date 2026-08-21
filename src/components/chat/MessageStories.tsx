import { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import type { Story } from '@/features/story/types';
import type { EntityId } from '@/types/api.types';

type MessageStoriesProps = {
  stories: Story[];
  currentUserId?: EntityId;
};

export function MessageStories({ stories, currentUserId }: MessageStoriesProps) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const activeStories = useMemo(() => {
    const now = Date.now();
    return stories.filter((story, index, all) => (
      new Date(story.expires_at).getTime() > now
      && all.findIndex((candidate) => String(candidate.author.id) === String(story.author.id)) === index
    ));
  }, [stories]);

  if (!activeStories.length) return null;

  return (
    <View className="pb-3 pt-2">
      <View className="mb-3 flex-row items-center justify-between px-4">
        <Text className="text-sm font-extrabold" style={{ color: colors.text }}>Stories</Text>
        <Text className="text-xs" style={{ color: colors.textSecondary }}>{activeStories.length} active{activeStories.length > 1 ? 's' : ''}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 16 }}>
        {activeStories.map((story) => {
          const isOwn = String(story.author.id) === String(currentUserId);
          return (
            <TouchableOpacity key={String(story.id)} onPress={() => router.push(`/(story)/${story.id}`)} className="w-[70px] items-center" activeOpacity={0.82} accessibilityLabel={`Voir la story de ${story.author.display_name}`}>
              <View className="relative rounded-full border-[3px] border-[#1689FF] p-[3px]">
                <Avatar uri={story.author.avatar_url} displayName={story.author.display_name} size={56} />
                {isOwn ? <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#1689FF]"><Icon name="add" size={15} color="#FFFFFF" /></View> : null}
              </View>
              <Text className="mt-2 max-w-[70px] text-xs font-semibold" style={{ color: colors.text }} numberOfLines={1}>{isOwn ? 'Votre story' : story.author.display_name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
