import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Avatar } from '@/components/ui/Avatar';
import type { Story } from '@/features/story/types';

interface StoryRingProps {
  story: Story;
  onPress: () => void;
  size?: number;
}

export function StoryRing({ story, onPress, size = 60 }: StoryRingProps) {
  const ringColor = story.viewed ? '#27272A' : '#7C3AED';
  const padding = 2;
  const innerSize = size - padding * 2 - 4;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="items-center gap-1">
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: ringColor,
          padding,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {story.media.type === 'image' ? (
          <Image
            source={{ uri: story.media.url }}
            style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2 }}
            contentFit="cover"
          />
        ) : (
          <Avatar
            uri={story.author.avatar_url}
            displayName={story.author.display_name}
            size={innerSize}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
