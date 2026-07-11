import { View, Text, TouchableOpacity, Dimensions, StatusBar, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { mockStories } from '@/features/story/mockData';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function StoryViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const story = mockStories.find(s => s.id === Number(id)) || mockStories[0];
  const STORY_DURATION = 5000; // 5 seconds

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalRef.current!);
            router.back();
            return 100;
          }
          return prev + (100 / (STORY_DURATION / 100));
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  const handlePressIn = () => {
    setIsPaused(true);
  };

  const handlePressOut = () => {
    setIsPaused(false);
  };

  const handleTapLeft = () => {
    // Go to previous story
    router.back();
  };

  const handleTapRight = () => {
    // Go to next story
    router.back();
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden />
      
      {/* Background Image */}
      <Image
        source={{ uri: story.media.url }}
        style={{ width, height }}
        contentFit="cover"
      />

      {/* Gradient Overlays */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 150,
        }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
        }}
      />

      {/* Progress Bar */}
      <View className="absolute top-12 left-4 right-4">
        <View className="h-0.5 bg-white/30 rounded-full overflow-hidden">
          <View 
            className="h-full bg-white rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      {/* Header */}
      <View className="absolute top-16 left-4 right-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <Image
            source={{ uri: story.author.avatar_url || '' }}
            style={{ width: 36, height: 36 }}
            className="rounded-full border-2 border-white"
          />
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-white font-semibold text-base">
                {story.author.display_name}
              </Text>
              {story.author.is_verified && (
                <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
              )}
            </View>
            <Text className="text-white/80 text-xs">Il y a 45 min</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tap Areas for Navigation */}
      <View className="absolute inset-0 flex-row">
        <Pressable 
          className="flex-1"
          onPress={handleTapLeft}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        />
        <Pressable 
          className="flex-1"
          onPress={handleTapRight}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        />
      </View>

      {/* Story Text Content */}
      {story.text && (
        <View className="absolute left-6 right-6" style={{ bottom: height * 0.25 }}>
          <Text className="text-white text-xl font-bold text-center leading-7 shadow-lg">
            {story.text}
          </Text>
        </View>
      )}

      {/* Location Tag */}
      {story.location_tag && (
        <View className="absolute left-6 right-6" style={{ bottom: height * 0.18 }}>
          <View className="flex-row items-center justify-center gap-1 bg-black/40 px-4 py-2 rounded-full self-center">
            <Ionicons name="location" size={14} color="#FFFFFF" />
            <Text className="text-white text-sm font-medium">
              {story.location_tag.name}, {story.location_tag.city}
            </Text>
          </View>
        </View>
      )}

      {/* Bottom Actions */}
      <View className="absolute bottom-8 left-4 right-4">
        <View className="flex-row items-center justify-between">
          {/* Reply Input */}
          <TouchableOpacity 
            onPress={() => setShowReply(true)}
            className="flex-1 mr-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full px-5 py-3"
          >
            <Text className="text-white/80 text-sm">Répondre à cette story</Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity>
              <Ionicons name="heart-outline" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="paper-plane-outline" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
