import { FlatList, View, Text } from 'react-native';
import { StoryRing } from './StoryRing';
import { useRouter } from 'expo-router';

type Story = {
  id: number;
  author: {
    id: number;
    username: string;
    display_name: string;
    avatar_url?: string | null;
  };
  is_viewed: boolean;
};

type StoriesListProps = {
  stories: Story[];
  currentUserId?: number;
};

export function StoriesList({ stories, currentUserId }: StoriesListProps) {
  const router = useRouter();

  return (
    <View className="bg-[#0A0A0A] border-b border-[#27272A]">
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
              isViewed={item.is_viewed}
              showAddButton={item.author.id === currentUserId}
              onPress={() => router.push(`/(story)/${item.id}`)}
              size={64}
            />
            <Text className="text-white text-xs mt-1 max-w-[68px]" numberOfLines={1}>
              {item.author.id === currentUserId ? 'Votre story' : item.author.username}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
