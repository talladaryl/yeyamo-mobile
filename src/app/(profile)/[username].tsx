import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { MediaGrid } from '@/components/profile/MediaGrid';
import { useAuth } from '@/features/auth/useAuth';
import { useAuthStore } from '@/features/auth/auth.store';
import { useCreateConversation } from '@/features/chat/useChat';
import { FEED_QUERY_KEY } from '@/features/feed/useFeed';
import type { FeedPost } from '@/features/feed/types';
import { MOCK_FEED_POSTS } from '@/features/mock/mockData';
import type { ProfilePost, UserProfile } from '@/features/profile/types';
import { useFollowActions, useUserSearch } from '@/features/social/useSocial';
import { useThemeStore } from '@/features/theme/theme.store';
import type { PaginatedResponse } from '@/types/api.types';

type PublicProfileTab = 'posts' | 'reposts' | 'liked';

const PUBLIC_TABS: { id: PublicProfileTab; label: string; icon: string; activeIcon: string }[] = [
  { id: 'posts', label: 'Publications', icon: 'grid-outline', activeIcon: 'grid' },
  { id: 'reposts', label: 'Republications', icon: 'repeat-outline', activeIcon: 'repeat' },
  { id: 'liked', label: 'Vidéos aimées', icon: 'heart-outline', activeIcon: 'heart' },
];

const DEMO_GALLERY = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
  'https://images.unsplash.com/photo-1536323760109-ca8c07450053?w=600',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
];

export default function PublicProfileScreen() {
  const params = useLocalSearchParams<{ username?: string | string[] }>();
  const username = Array.isArray(params.username) ? params.username[0] : params.username ?? '';
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = useThemeStore((state) => state.colors);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<PublicProfileTab>('posts');
  const [isFollowing, setFollowing] = useState(false);
  const { data: users = [], isLoading } = useUserSearch(username);
  const { follow, unfollow } = useFollowActions();
  const createConversation = useCreateConversation();
  const knownFeedPosts = useMemo(() => {
    if (isDemo) return MOCK_FEED_POSTS;
    return queryClient
      .getQueriesData<InfiniteData<PaginatedResponse<FeedPost>>>({ queryKey: FEED_QUERY_KEY })
      .flatMap(([, data]) => data?.pages.flatMap((page) => page.data) ?? []);
  }, [isDemo, queryClient]);
  const feedPosts = useMemo(() => knownFeedPosts.filter((post) => post.author.username === username), [knownFeedPosts, username]);
  const feedAuthor = feedPosts[0]?.author ?? MOCK_FEED_POSTS.find((post) => post.author.username === username)?.author;
  const searchResult = users.find((item) => item.username === username) ?? users[0];
  const isOwnProfile = Boolean(currentUser && currentUser.username === username);

  useEffect(() => {
    if (isOwnProfile) router.replace('/(tabs)/profile');
  }, [isOwnProfile, router]);

  const profile = useMemo<UserProfile | null>(() => {
    const source = searchResult ?? feedAuthor;
    if (!source) return null;
    return {
      id: source.id,
      username: source.username,
      display_name: source.display_name,
      avatar_url: source.avatar_url,
      cover_url: null,
      bio: 'Découvertes, sorties et moments partagés avec la communauté Yeyamo.',
      city: 'Cameroun',
      is_verified: source.is_verified,
      is_partner: source.user_type === 'partner',
      followers_count: (source as { followers_count?: number }).followers_count ?? 1200 + Number(source.id) * 37,
      following_count: 186,
      posts_count: Math.max(feedPosts.length, 9),
      is_following: (source as { is_following?: boolean }).is_following ?? false,
      is_followed_by: false,
      created_at: '',
    };
  }, [feedAuthor, feedPosts.length, searchResult]);

  useEffect(() => {
    if (profile) setFollowing(profile.is_following);
  }, [profile]);

  const postContent = useMemo<ProfilePost[]>(() => {
    if (!profile) return [];
    const actual = feedPosts.map<ProfilePost>((post) => ({
      id: post.id,
      type: post.type,
      thumbnail_url: post.media[0]?.thumbnail_url ?? post.media[0]?.url ?? '',
      media: post.media,
      likes_count: post.likes_count,
      comments_count: post.comments_count,
      created_at: post.created_at,
    }));
    if (!isDemo) return actual;
    const generated = DEMO_GALLERY.map<ProfilePost>((image, index) => ({
      id: `${profile.id}-public-${index}`,
      type: index % 3 === 0 ? 'video' : 'image',
      thumbnail_url: image,
      media: [],
      likes_count: 320 + index * 913,
      comments_count: 18 + index * 11,
      created_at: new Date(Date.now() - index * 86_400_000).toISOString(),
    }));
    return [...actual, ...generated.filter((item) => !actual.some((post) => String(post.id) === String(item.id)))].slice(0, 9);
  }, [feedPosts, isDemo, profile]);

  const contentByTab: Record<PublicProfileTab, ProfilePost[]> = {
    posts: postContent,
    reposts: postContent.slice(2, 8).reverse(),
    liked: postContent.slice(1, 7),
  };

  if (isOwnProfile || isLoading) {
    return <SafeScreen><Stack.Screen options={{ headerShown: false }} /><View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View></SafeScreen>;
  }

  if (!profile) {
    return (
      <SafeScreen>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-row items-center px-3 py-2"><TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} className="h-11 w-11 items-center justify-center"><Icon name="chevron-back" size={26} color={colors.text} /></TouchableOpacity></View>
        <View className="flex-1 items-center justify-center px-8"><Icon name="person-circle-outline" size={64} color={colors.textMuted} /><Text className="mt-4 text-lg font-bold" style={{ color: colors.text }}>Profil introuvable</Text></View>
      </SafeScreen>
    );
  }

  const toggleFollow = () => {
    const next = !isFollowing;
    setFollowing(next);
    const mutation = next ? follow : unfollow;
    mutation.mutate(profile.id, { onError: () => setFollowing(!next) });
  };

  const openConversation = async () => {
    try {
      const conversation = await createConversation.mutateAsync(profile.id);
      router.push(`/(chat)/${conversation.data.id}`);
    } catch {
      Alert.alert('Conversation impossible', "La conversation n'a pas pu être créée.");
    }
  };

  const shareProfile = async () => {
    try {
      await Share.share({ title: profile.display_name, message: `Découvre @${profile.username} sur Yeyamo : https://yeyamo.app/@${profile.username}`, url: `https://yeyamo.app/@${profile.username}` });
    } catch {
      Alert.alert('Partage impossible', "Le profil n'a pas pu être partagé.");
    }
  };

  return (
    <SafeScreen style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]}>
        <View className="h-14 flex-row items-center px-3">
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} className="h-11 w-11 items-center justify-center" accessibilityLabel="Retour"><Icon name="chevron-back" size={27} color={colors.text} /></TouchableOpacity>
          <Text className="flex-1 text-center text-base font-extrabold" style={{ color: colors.text }}>@{profile.username}</Text>
          <TouchableOpacity onPress={() => void shareProfile()} className="h-11 w-11 items-center justify-center" accessibilityLabel="Partager ce profil"><Icon name="arrow-redo-outline" size={26} color={colors.text} /></TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert('Profil', 'Bloquer, masquer ou signaler ce profil.')} className="h-11 w-11 items-center justify-center" accessibilityLabel="Plus d’options"><Icon name="ellipsis-horizontal" size={25} color={colors.text} /></TouchableOpacity>
        </View>

        <View className="items-center px-5 pb-5 pt-3">
          <View className="rounded-full border-[3px] border-[#1689FF] p-[3px]"><Avatar uri={profile.avatar_url} displayName={profile.display_name} size={96} /></View>
          <View className="mt-3 flex-row items-center gap-1.5"><Text className="text-xl font-extrabold" style={{ color: colors.text }}>{profile.display_name}</Text>{profile.is_verified ? <Icon name="checkmark-circle" size={18} color="#1689FF" /> : null}</View>
          <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>@{profile.username}</Text>
          {profile.bio ? <Text className="mt-3 max-w-[330px] text-center text-sm leading-5" style={{ color: colors.text }}>{profile.bio}</Text> : null}
          <View className="mt-5 w-full flex-row items-center justify-center">
            <ProfileMetric value={profile.following_count} label="Abonnements" />
            <MetricDivider />
            <ProfileMetric value={profile.followers_count} label="Abonnés" />
            <MetricDivider />
            <ProfileMetric value={postContent.reduce((sum, post) => sum + post.likes_count, 0)} label="J’aime" />
          </View>
          <View className="mt-5 w-full flex-row gap-2">
            <TouchableOpacity onPress={toggleFollow} disabled={follow.isPending || unfollow.isPending} className={`flex-1 items-center rounded-xl py-3 ${isFollowing ? '' : 'bg-[#EF4444]'}`} style={isFollowing ? { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border } : undefined}><Text className="font-extrabold" style={{ color: isFollowing ? colors.text : '#FFFFFF' }}>{isFollowing ? 'Abonné' : 'Suivre'}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => void openConversation()} disabled={createConversation.isPending} className="flex-1 items-center rounded-xl border py-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="font-extrabold" style={{ color: colors.text }}>{createConversation.isPending ? 'Ouverture…' : 'Message'}</Text></TouchableOpacity>
          </View>
          {profile.is_followed_by ? <Text className="mt-3 text-xs" style={{ color: colors.textSecondary }}>Vous suit également</Text> : null}
        </View>

        <View className="flex-row border-b" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
          {PUBLIC_TABS.map((tab) => <ProfileTabButton key={tab.id} tab={tab} active={activeTab === tab.id} onPress={() => setActiveTab(tab.id)} />)}
        </View>

        {contentByTab[activeTab].length ? (
          <MediaGrid posts={contentByTab[activeTab]} onPostPress={(id) => router.push(`/(post)/${id}`)} />
        ) : (
          <View className="items-center px-8 py-20"><Icon name={PUBLIC_TABS.find((tab) => tab.id === activeTab)?.icon ?? 'grid-outline'} size={42} color={colors.textMuted} /><Text className="mt-4 text-base font-bold" style={{ color: colors.text }}>Aucun contenu public</Text><Text className="mt-1 text-center text-sm" style={{ color: colors.textSecondary }}>Les contenus visibles dans cette section apparaîtront ici.</Text></View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

function ProfileTabButton({ tab, active, onPress }: { tab: (typeof PUBLIC_TABS)[number]; active: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity onPress={onPress} className="flex-1 items-center border-b-2 py-3" style={{ borderColor: active ? colors.primary : 'transparent' }} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={tab.label}>
      <Icon name={active ? tab.activeIcon : tab.icon} size={24} color={active ? colors.primary : colors.textMuted} />
    </TouchableOpacity>
  );
}

function ProfileMetric({ value, label }: { value: number; label: string }) {
  const colors = useThemeStore((state) => state.colors);
  const formatted = value > 999 ? `${(value / 1000).toFixed(value > 9999 ? 0 : 1)}K` : String(value);
  return <View className="flex-1 items-center"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>{formatted}</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{label}</Text></View>;
}

function MetricDivider() {
  const colors = useThemeStore((state) => state.colors);
  return <View className="h-8 w-px" style={{ backgroundColor: colors.border }} />;
}
