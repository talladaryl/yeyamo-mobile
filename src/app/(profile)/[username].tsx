import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { MediaGrid } from '@/components/profile/MediaGrid';
import { Icon } from '@/components/ui/Icon';

// Mock data - replace with real API
const mockProfile = {
  id: 1,
  username: 'explore.cameroon',
  display_name: 'Explore Cameroon',
  avatar_url: null,
  cover_url: null,
  bio: 'Un peu de tourisme à découvrir 🇨🇲\nPartagez-nous vos expériences !',
  city: 'Yaoundé, Cameroun',
  is_verified: true,
  is_partner: true,
  followers_count: 45234,
  following_count: 312,
  posts_count: 156,
  is_following: false,
  is_followed_by: false,
  created_at: new Date().toISOString(),
};

const mockPosts = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  type: i % 3 === 0 ? 'video' : 'image',
  thumbnail_url: 'https://via.placeholder.com/400',
  media: [],
  likes_count: Math.floor(Math.random() * 10000),
  comments_count: Math.floor(Math.random() * 500),
  created_at: new Date().toISOString(),
})) as any;

export default function ProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'bookings'>('posts');

  const isLoading = false;
  const profile = mockProfile;
  const posts = mockPosts;

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center">
        <ActivityIndicator color="#EF4444" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: profile.username,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="pl-4">
              <Icon library="ionicons" name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity className="pr-4">
              <Icon library="ionicons" name="ellipsis-vertical" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView>
        <ProfileHeader
          profile={profile}
          onFollowPress={() => console.log('Follow pressed')}
          onMessagePress={() => console.log('Message pressed')}
        />

        {/* Tabs */}
        <View className="flex-row border-b border-[#27272A]">
          <TouchableOpacity
            onPress={() => setActiveTab('posts')}
            className={`flex-1 py-3 items-center border-b-2 ${
              activeTab === 'posts' ? 'border-[#EF4444]' : 'border-transparent'
            }`}
            activeOpacity={0.8}
          >
            <Icon
              library="material"
              name="grid-on"
              size={24}
              color={activeTab === 'posts' ? '#EF4444' : '#52525B'}
            />
          </TouchableOpacity>

          {profile.is_partner && (
            <TouchableOpacity
              onPress={() => setActiveTab('bookings')}
              className={`flex-1 py-3 items-center border-b-2 ${
                activeTab === 'bookings' ? 'border-[#EF4444]' : 'border-transparent'
              }`}
              activeOpacity={0.8}
            >
              <Icon
                library="material"
                name="hotel"
                size={24}
                color={activeTab === 'bookings' ? '#EF4444' : '#52525B'}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {activeTab === 'posts' ? (
          <MediaGrid posts={posts} onPostPress={(id) => router.push(`/(post)/${id}`)} />
        ) : (
          <View className="p-6 items-center">
            <Text className="text-[#A1A1AA] text-center">
              Réservations disponibles bientôt
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
