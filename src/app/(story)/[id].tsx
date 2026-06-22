import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { SafeAreaView } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { useStoryDetail, useMarkStoryViewed } from '@/features/story/useStory';
import { timeAgo } from '@/utils/format';

const STORY_DURATION_MS = 5000;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const storyId = Number(id);

  const { data: story, isLoading } = useStoryDetail(storyId);
  const { mutate: markViewed } = useMarkStoryViewed();

  const progress = useRef(new Animated.Value(0)).current;
  const [isPaused, setIsPaused] = useState(false);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const videoUri = story?.media.type === 'video' ? story.media.url : '';
  const player = useVideoPlayer(story?.media.type === 'video' ? videoUri : null, (p) => {
    p.loop = false;
    p.play();
  });

  // Mark viewed once loaded
  useEffect(() => {
    if (story) {
      markViewed(storyId);
    }
  }, [story, storyId, markViewed]);

  // Progress bar animation
  useEffect(() => {
    if (!story || isLoading) return;

    progress.setValue(0);
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION_MS,
      useNativeDriver: false,
    });

    animRef.current.start(({ finished }) => {
      if (finished) router.back();
    });

    return () => animRef.current?.stop();
  }, [story, isLoading, progress, router]);

  // Pause / resume on press hold
  const handlePressIn = () => {
    setIsPaused(true);
    animRef.current?.stop();
    if (story?.media.type === 'video') player.pause();
  };

  const handlePressOut = () => {
    setIsPaused(false);
    animRef.current?.start(({ finished }) => {
      if (finished) router.back();
    });
    if (story?.media.type === 'video') player.play();
  };

  if (isLoading || !story) {
    return (
      <View className="flex-1 bg-black" />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Media */}
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="absolute inset-0"
      >
        {story.media.type === 'video' ? (
          <VideoView
            player={player}
            style={{ width: SCREEN_WIDTH, flex: 1 }}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <Image
            source={{ uri: story.media.url }}
            style={{ flex: 1 }}
            contentFit="cover"
          />
        )}
      </TouchableOpacity>

      {/* Dark top gradient hint */}
      <View className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

      {/* Progress bar */}
      <View className="absolute top-12 left-3 right-3 h-1 bg-white/30 rounded-full overflow-hidden">
        <Animated.View
          className="h-full bg-white rounded-full"
          style={{
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>

      {/* Author header */}
      <View className="absolute top-16 left-4 right-12 flex-row items-center gap-2 mt-2">
        <Avatar
          uri={story.author.avatar_url}
          displayName={story.author.display_name}
          size={36}
        />
        <Text className="text-white font-semibold text-sm">
          @{story.author.username}
        </Text>
        <Text className="text-white/60 text-xs">{timeAgo(story.created_at)}</Text>
      </View>

      {/* Close button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-16 right-4 mt-2 w-8 h-8 items-center justify-center"
      >
        <Text className="text-white text-lg">✕</Text>
      </TouchableOpacity>

      {/* Paused indicator */}
      {isPaused ? (
        <View className="absolute inset-0 items-center justify-center pointer-events-none">
          <View className="bg-black/50 rounded-full w-14 h-14 items-center justify-center">
            <Text className="text-white text-xl">⏸</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
