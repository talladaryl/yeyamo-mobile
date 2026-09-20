import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { useMarkStoryViewed, useStories, useStoryDetail } from '@/features/story/useStory';
import type { Story } from '@/features/story/types';

const { width, height } = Dimensions.get('window');

function StoryVideo({ uri, paused }: { uri: string; paused: boolean }) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
  });

  useEffect(() => {
    if (paused) player.pause();
    else player.play();
  }, [paused, player]);

  return <VideoView player={player} style={{ width, height }} contentFit="cover" nativeControls={false} />;
}

function formatCreatedAt(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return 'À l’instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `Il y a ${hours} h`;
}

function storyDurationMs(story: Story) {
  const preferred = story.media.type === 'video' && story.media.duration_seconds
    ? story.media.duration_seconds
    : story.duration_seconds;
  return Math.min(60, Math.max(5, preferred || 5)) * 1000;
}

export default function StoryViewerScreen() {
  const { id, storyIds } = useLocalSearchParams<{ id: string; storyIds?: string }>();
  const router = useRouter();
  const { data: stories = [] } = useStories();
  const detail = useStoryDetail(id);
  const { mutate: markViewed } = useMarkStoryViewed();
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const requestedIds = useMemo(() => (storyIds ? storyIds.split(',').filter(Boolean) : [id]).map(String), [id, storyIds]);
  const sequence = useMemo(() => {
    const byId = new Map(stories.map((story) => [String(story.id), story]));
    const resolved = requestedIds.map((storyId) => byId.get(storyId)).filter((story): story is Story => Boolean(story));
    return resolved.length ? resolved : detail.data ? [detail.data] : [];
  }, [detail.data, requestedIds, stories]);
  const sequenceKey = sequence.map((story) => String(story.id)).join(',');
  const currentStory = sequence[index];
  const currentStoryId = currentStory?.id;
  const currentStoryViewed = currentStory?.viewed;
  const duration = currentStory ? storyDurationMs(currentStory) : 5_000;

  useEffect(() => {
    const selectedIndex = sequence.findIndex((story) => String(story.id) === String(id));
    if (selectedIndex >= 0) setIndex(selectedIndex);
  }, [id, sequence, sequenceKey]);

  useEffect(() => {
    setProgress(0);
    setIsPaused(false);
    if (currentStoryId && !currentStoryViewed) markViewed(currentStoryId);
  }, [currentStoryId, currentStoryViewed, markViewed]);

  const goPrevious = useCallback(() => {
    setIndex((current) => {
      if (current > 0) return current - 1;
      router.back();
      return current;
    });
  }, [router]);

  const goNext = useCallback(() => {
    setIndex((current) => {
      if (current < sequence.length - 1) return current + 1;
      router.back();
      return current;
    });
  }, [router, sequence.length]);

  useEffect(() => {
    if (!currentStoryId || isPaused) return;
    const startedAt = Date.now() - progress * duration;
    const timer = setInterval(() => {
      const next = Math.min(1, (Date.now() - startedAt) / duration);
      setProgress(next);
      if (next >= 1) goNext();
    }, 50);
    return () => clearInterval(timer);
  }, [currentStoryId, duration, goNext, isPaused, progress]);

  if (detail.isLoading && !currentStory) {
    return <View className="flex-1 items-center justify-center bg-black"><StatusBar hidden /><ActivityIndicator color="#FFFFFF" /></View>;
  }

  if (!currentStory) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-8">
        <StatusBar hidden />
        <Text className="text-center text-base text-white">Cette story n’est plus disponible.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-5 rounded-full bg-white px-5 py-3" accessibilityRole="button">
          <Text className="font-bold text-black">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden />
      {currentStory.media.type === 'video'
        ? <StoryVideo uri={currentStory.media.url} paused={isPaused} />
        : <Image source={{ uri: currentStory.media.url }} style={{ width, height }} contentFit="cover" />}

      <LinearGradient colors={['rgba(0,0,0,0.65)', 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 170 }} pointerEvents="none" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 230 }} pointerEvents="none" />

      <View className="absolute inset-0 flex-row">
        <Pressable className="flex-1" onPress={goPrevious} onPressIn={() => setIsPaused(true)} onPressOut={() => setIsPaused(false)} accessibilityLabel="Story précédente" />
        <Pressable className="flex-1" onPress={goNext} onPressIn={() => setIsPaused(true)} onPressOut={() => setIsPaused(false)} accessibilityLabel="Story suivante" />
      </View>

      <View className="absolute left-4 right-4 top-12 flex-row gap-1.5" pointerEvents="none">
        {sequence.map((story, storyIndex) => {
          const segmentProgress = storyIndex < index ? 1 : storyIndex === index ? progress : 0;
          return <View key={String(story.id)} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"><View className="h-full rounded-full bg-white" style={{ width: `${segmentProgress * 100}%` }} /></View>;
        })}
      </View>

      <View className="absolute left-4 right-4 top-16 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <Image source={{ uri: currentStory.author.avatar_url || undefined }} style={{ width: 36, height: 36 }} className="rounded-full border-2 border-white" />
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-base font-semibold text-white">{currentStory.author.display_name}</Text>
              {currentStory.author.is_verified ? <Ionicons name="checkmark-circle" size={14} color="#60A5FA" /> : null}
            </View>
            <Text className="text-xs text-white/80">{formatCreatedAt(currentStory.created_at)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-black/35" accessibilityLabel="Fermer la story">
          <Ionicons name="close" size={25} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {currentStory.text ? <View className="absolute left-6 right-6" style={{ bottom: height * 0.24 }} pointerEvents="none"><Text className="text-center text-xl font-bold leading-7 text-white">{currentStory.text}</Text></View> : null}
    </View>
  );
}
