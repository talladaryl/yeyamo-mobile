import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { MediaGrid } from '@/components/profile/MediaGrid';
import { ProfileSafetySheet } from '@/components/profile/ProfileSafetySheet';
import { StoryRing } from '@/components/story/StoryRing';
import { useAuth } from '@/features/auth/useAuth';
import { useCreateConversation } from '@/features/chat/useChat';
import type { ProfilePost, UserProfile } from '@/features/profile/types';
import { usePublicProfilePublications } from '@/features/profile/useProfile';
import { useFollowActions, useUserSearch } from '@/features/social/useSocial';
import { useThemeStore } from '@/features/theme/theme.store';
import { useStories } from '@/features/story/useStory';
import { traceProfileRuntime, traceStoryRuntime } from '@/features/social/social.runtime-trace';

export default function PublicProfileScreen() {
  const params = useLocalSearchParams<{ username?: string | string[] }>();
  const username = Array.isArray(params.username) ? params.username[0] : params.username ?? '';
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { user: currentUser } = useAuth();
  const storiesQuery = useStories();
  const [isFollowing, setFollowing] = useState(false);
  const [safetySheetOpen, setSafetySheetOpen] = useState(false);
  const { data: users = [], isLoading } = useUserSearch(username);
  const searchResult = users.find((item) => item.username === username) ?? users[0];
  const publicPosts = usePublicProfilePublications(searchResult?.content_author_id);
  const { follow, unfollow } = useFollowActions();
  const createConversation = useCreateConversation();
  const isOwnProfile = Boolean(
    currentUser
    && (currentUser.username === username || searchResult?.content_author_id === String(currentUser.id)),
  );

  useEffect(() => {
    if (isOwnProfile) router.replace('/(tabs)/profile');
  }, [isOwnProfile, router]);

  const profile = useMemo<UserProfile | null>(() => {
    if (!searchResult) return null;
    return {
      id: searchResult.id,
      username: searchResult.username,
      display_name: searchResult.display_name,
      avatar_url: searchResult.avatar_url,
      cover_url: null,
      bio: searchResult.bio ?? null,
      city: null,
      is_verified: searchResult.is_verified,
      is_partner: searchResult.user_type === 'partner',
      followers_count: searchResult.followers_count ?? 0,
      following_count: searchResult.following_count ?? 0,
      posts_count: publicPosts.data?.length ?? 0,
      is_following: searchResult.is_following,
      is_followed_by: false,
      created_at: '',
    };
  }, [publicPosts.data?.length, searchResult]);

  useEffect(() => {
    if (profile) setFollowing(profile.is_following);
  }, [profile]);

  const postContent = useMemo<ProfilePost[]>(() => (publicPosts.data ?? []).map((post) => ({
    id: post.id,
    type: post.type,
    thumbnail_url: post.media_url,
    media: [],
    caption: post.caption ?? null,
    likes_count: post.likes_count,
    comments_count: post.comments_count,
    created_at: post.created_at,
  })), [publicPosts.data]);
  const profileStories = profile ? (storiesQuery.data ?? []).filter((story) => String(story.author.id) === String(profile.id)) : [];
  const profileStory = profileStories.find((story) => !story.viewed) ?? profileStories[0];

  if (isOwnProfile || isLoading || (Boolean(searchResult?.content_author_id) && publicPosts.isLoading)) {
    return <SafeScreen><Stack.Screen options={{ headerShown: false }} /><View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View></SafeScreen>;
  }
  if (!profile) return <SafeScreen><Stack.Screen options={{ headerShown: false }} /><View className="flex-row items-center px-3 py-2"><TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} className="h-11 w-11 items-center justify-center" accessibilityLabel="Retour"><Icon name="chevron-back" size={26} color={colors.text} /></TouchableOpacity></View><View className="flex-1 items-center justify-center px-8"><Icon name="person-circle-outline" size={64} color={colors.textMuted} /><Text className="mt-4 text-lg font-bold" style={{ color: colors.text }}>Profil introuvable</Text></View></SafeScreen>;

  const toggleFollow = () => {
    const next = !isFollowing;
    setFollowing(next);
    (next ? follow : unfollow).mutate(profile.id, { onError: () => setFollowing(!next) });
  };
  const openConversation = async () => {
    const recipientAuthUserId = searchResult?.content_author_id;
    if (!recipientAuthUserId) {
      Alert.alert('Conversation indisponible', 'Ce profil ne peut pas encore être contacté.');
      return;
    }
    try { const conversation = await createConversation.mutateAsync(recipientAuthUserId); router.push(`/(chat)/${conversation.data.id}`); }
    catch { Alert.alert('Conversation impossible', "La conversation n'a pas pu être créée."); }
  };
  const shareProfile = async () => {
    try { await Share.share({ title: profile.display_name, message: `Découvre @${profile.username} sur Yeyamo : https://yeyamo.app/@${profile.username}`, url: `https://yeyamo.app/@${profile.username}` }); }
    catch { Alert.alert('Partage impossible', "Le profil n'a pas pu être partagé."); }
  };

  return <SafeScreen style={{ backgroundColor: colors.background }}>
    <Stack.Screen options={{ headerShown: false }} />
    <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]}>
      <View className="h-14 flex-row items-center px-3"><TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} className="h-11 w-11 items-center justify-center" accessibilityLabel="Retour"><Icon name="chevron-back" size={27} color={colors.text} /></TouchableOpacity><Text className="flex-1 text-center text-base font-extrabold" style={{ color: colors.text }}>@{profile.username}</Text><TouchableOpacity onPress={() => void shareProfile()} className="h-11 w-11 items-center justify-center" accessibilityLabel="Partager ce profil"><Icon name="arrow-redo-outline" size={26} color={colors.text} /></TouchableOpacity><TouchableOpacity onPress={() => setSafetySheetOpen(true)} className="h-11 w-11 items-center justify-center" accessibilityLabel="Plus d’options"><Icon name="ellipsis-horizontal" size={25} color={colors.text} /></TouchableOpacity></View>
      <View className="items-center px-5 pb-5 pt-3">
        {profileStory ? <StoryRing uri={profile.avatar_url} displayName={profile.display_name} size={102} isViewed={profileStory.viewed} onPress={() => { traceStoryRuntime('STORY_RING_RESOLUTION', { flow: 'public-profile', storyId: String(profileStory.id), profileId: String(profile.id), active: true }); router.push({ pathname: '/(story)/[id]', params: { id: String(profileStory.id), storyIds: profileStories.map((story) => String(story.id)).join(',') } }); }} /> : <Avatar uri={profile.avatar_url} displayName={profile.display_name} size={96} />}
        <View className="mt-3 flex-row items-center gap-1.5"><Text className="text-xl font-extrabold" style={{ color: colors.text }}>{profile.display_name}</Text>{profile.is_verified ? <Icon name="checkmark-circle" size={18} color="#1689FF" /> : null}</View><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>@{profile.username}</Text>{profile.bio ? <Text className="mt-3 max-w-[330px] text-center text-sm leading-5" style={{ color: colors.text }}>{profile.bio}</Text> : null}
        <View className="mt-5 w-full flex-row items-center justify-center"><ProfileMetric value={profile.following_count} label="Abonnements" /><MetricDivider /><ProfileMetric value={profile.followers_count} label="Abonnés" /><MetricDivider /><ProfileMetric value={profile.posts_count} label="Publications" /></View>
        <View className="mt-5 w-full flex-row gap-2"><TouchableOpacity onPress={toggleFollow} disabled={follow.isPending || unfollow.isPending} className={`flex-1 items-center rounded-xl py-3 ${isFollowing ? '' : 'bg-[#EF4444]'}`} style={isFollowing ? { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border } : undefined}><Text className="font-extrabold" style={{ color: isFollowing ? colors.text : '#FFFFFF' }}>{isFollowing ? 'Abonné' : 'Suivre'}</Text></TouchableOpacity><TouchableOpacity onPress={() => void openConversation()} disabled={createConversation.isPending} className="flex-1 items-center rounded-xl border py-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="font-extrabold" style={{ color: colors.text }}>{createConversation.isPending ? 'Ouverture…' : 'Message'}</Text></TouchableOpacity></View>
      </View>
      <View className="flex-row border-b" style={{ backgroundColor: colors.background, borderColor: colors.border }}><View className="flex-1 items-center border-b-2 py-3" style={{ borderColor: colors.primary }} accessibilityRole="tab" accessibilityState={{ selected: true }} accessibilityLabel="Publications"><Icon name="grid" size={24} color={colors.primary} /></View></View>
      {publicPosts.isError ? <View className="items-center px-8 py-20"><Icon name="alert-circle-outline" size={42} color={colors.textMuted} /><Text className="mt-4 text-base font-bold" style={{ color: colors.text }}>Publications indisponibles</Text></View> : postContent.length ? <MediaGrid posts={postContent} onPostPress={(id) => { traceProfileRuntime('PROFILE_GRID_ITEM_PRESS', { flow: 'public-profile', viewerAuthUserId: currentUser?.id ?? null, profileId: String(profile.id), postId: String(id), selectedTab: 'posts', destination: `/(post)/${id}` }); router.push(`/(post)/${id}`); }} /> : <View className="items-center px-8 py-20"><Icon name="grid-outline" size={42} color={colors.textMuted} /><Text className="mt-4 text-base font-bold" style={{ color: colors.text }}>Aucune publication</Text><Text className="mt-1 text-center text-sm" style={{ color: colors.textSecondary }}>Les publications publiques de ce profil apparaîtront ici.</Text></View>}
    </ScrollView>
    <ProfileSafetySheet visible={safetySheetOpen} onClose={() => setSafetySheetOpen(false)} profileId={String(profile.id)} displayName={profile.display_name} />
  </SafeScreen>;
}

function ProfileMetric({ value, label }: { value: number; label: string }) { const colors = useThemeStore((state) => state.colors); const formatted = value > 999 ? `${(value / 1000).toFixed(value > 9999 ? 0 : 1)}K` : String(value); return <View className="flex-1 items-center"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>{formatted}</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{label}</Text></View>; }
function MetricDivider() { const colors = useThemeStore((state) => state.colors); return <View className="h-8 w-px" style={{ backgroundColor: colors.border }} />; }
