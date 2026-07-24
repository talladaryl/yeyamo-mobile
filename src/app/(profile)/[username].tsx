import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { MediaGrid } from '@/components/profile/MediaGrid';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/features/auth/auth.store';
import { useFollowActions, useUserSearch } from '@/features/social/useSocial';
import { useCreateConversation } from '@/features/chat/useChat';

// Mock data - replace with real API
const mockProfile = {
  id: 1,
  username: 'explore.cameroon',
  display_name: 'Explore Cameroon',
  avatar_url: null,
  cover_url: null,
  bio: 'Un peu de tourisme à découvrir\nPartagez-nous vos expériences !',
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
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const { data: users, isLoading } = useUserSearch(username ?? '');
  const { follow, unfollow } = useFollowActions();
  const createConversation = useCreateConversation();

  const result = users?.find((item) => item.username === username) ?? users?.[0];
  const profile = isDemo ? mockProfile : result ? {
    id: result.id,
    username: result.username,
    display_name: result.display_name,
    avatar_url: result.avatar_url,
    cover_url: null,
    bio: result.bio ?? null,
    city: null,
    is_verified: result.is_verified,
    is_partner: false,
    followers_count: result.followers_count,
    following_count: 0,
    posts_count: 0,
    is_following: result.is_following,
    is_followed_by: false,
    created_at: '',
  } : null;
  const posts = isDemo ? mockPosts : [];

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-[#0A0A0A] items-center justify-center">
        <ActivityIndicator color="#EF4444" />
      </View>
    );
  }

  if (!profile) {
    return <View className="flex-1 items-center justify-center"><Text>Profil introuvable</Text></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0A0A0A]">
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
          onFollowPress={() => profile.is_following ? unfollow.mutate(profile.id) : follow.mutate(profile.id)}
          onMessagePress={async () => {
            const conversation = await createConversation.mutateAsync(profile.id);
            router.push(`/(chat)/${conversation.data.id}`);
          }}
        />

        {/* Tabs */}
        <View className="flex-row border-b border-[#E4E4E7] dark:border-[#27272A]">
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
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-center">
              Réservations disponibles bientôt
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
