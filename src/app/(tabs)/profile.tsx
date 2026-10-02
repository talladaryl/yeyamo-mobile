import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useYeyamoTabBarHeight } from '@/components/navigation/useYeyamoTabBarHeight';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/ViewStates';
import { YeyamoModal } from '@/components/ui/YeyamoModal';
import { PublicationGrid } from '@/components/profile/PublicationGrid';
import { StoryRing } from '@/components/story/StoryRing';
import { useAuth } from '@/features/auth/useAuth';
import { useProfileSettings } from '@/features/settings/useSettings';
import { useProfileStats, useUserLikedPublications, useUserPublications, useUserSavedPublications } from '@/features/profile/useProfile';
import { useUserCollections } from '@/features/collections/useCollections';
import { useThemeStore } from '@/features/theme/theme.store';
import { useStories } from '@/features/story/useStory';
import { traceProfileRuntime, traceStoryRuntime } from '@/features/social/social.runtime-trace';
import type { UserPublication } from '@/features/profile/types';

type ProfileTab = 'posts' | 'reposts' | 'collections' | 'likes' | 'saved';

const PROFILE_TABS: { id: ProfileTab; label: string; icon: string; activeIcon: string }[] = [
  { id: 'posts', label: 'Publications', icon: 'grid-outline', activeIcon: 'grid' },
  { id: 'reposts', label: 'Republications', icon: 'repeat-outline', activeIcon: 'repeat' },
  { id: 'collections', label: 'Collections', icon: 'albums-outline', activeIcon: 'albums' },
  { id: 'likes', label: 'J’aime', icon: 'heart-outline', activeIcon: 'heart' },
  { id: 'saved', label: 'Favoris', icon: 'bookmark-outline', activeIcon: 'bookmark' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colors = useThemeStore((state) => state.colors);
  const tabBarHeight = useYeyamoTabBarHeight();
  const profile = useProfileSettings();
  const publications = useUserPublications();
  const stats = useProfileStats();
  const stories = useStories();
  const [selectedTab, setSelectedTab] = useState<ProfileTab>('posts');
  const collections = useUserCollections(selectedTab === 'collections');
  const likes = useUserLikedPublications(selectedTab === 'likes');
  const saved = useUserSavedPublications(selectedTab === 'saved');
  const [storyChooserOpen, setStoryChooserOpen] = useState(false);

  const data = profile.data;
  const posts = useMemo(() => publications.data ?? [], [publications.data]);
  const likedPosts = useMemo(() => likes.data ?? [], [likes.data]);
  const savedPosts = useMemo(() => saved.data ?? [], [saved.data]);
  const displayedPosts = selectedTab === 'likes' ? likedPosts : selectedTab === 'saved' ? savedPosts : posts;
  const ownStories = useMemo(
    () => (stories.data ?? []).filter((story) => String(story.author_auth_user_id) === String(user?.id)),
    [stories.data, user?.id],
  );
  const ownStory = ownStories.find((story) => !story.viewed) ?? ownStories[0];
  const publicationCount = publications.isSuccess ? posts.length : undefined;
  const refreshing = publications.isRefetching || profile.isRefetching || stats.isRefetching || (selectedTab === 'likes' && likes.isRefetching) || (selectedTab === 'saved' && saved.isRefetching) || (selectedTab === 'collections' && collections.isRefetching);

  useEffect(() => {
    traceProfileRuntime('PROFILE_LOAD', { flow: 'profile', viewerAuthUserId: user?.id ?? null, profileStatus: profile.status, postsStatus: publications.status });
  }, [profile.status, publications.status, user?.id]);

  useEffect(() => {
    if (!data || !user) return;
    traceProfileRuntime('PROFILE_IDENTITY_RESOLVED', { flow: 'profile', viewerAuthUserId: user.id, profileId: user.id, hasAvatar: Boolean(data.avatar_url), hasBio: Boolean(data.bio) });
  }, [data, user]);

  useEffect(() => {
    const selectedPosts = selectedTab === 'likes' ? likedPosts : selectedTab === 'saved' ? savedPosts : posts;
    traceProfileRuntime('PROFILE_GRID_STATE', {
      viewerAuthUserId: user?.id ?? null,
      profileId: user?.id ?? null,
      selectedTab,
      rawPostCount: selectedPosts.length,
      mappedPostCount: selectedPosts.length,
      mediaResolvedCount: selectedPosts.filter((post) => Boolean(post.media_url)).length,
      renderableCount: selectedPosts.length,
      queryStatus: selectedTab === 'likes' ? likes.status : selectedTab === 'saved' ? saved.status : publications.status,
      isFetching: selectedTab === 'likes' ? likes.isFetching : selectedTab === 'saved' ? saved.isFetching : publications.isFetching,
      isRefreshing: refreshing,
    });
    traceProfileRuntime('PROFILE_GRID_RENDER', { flow: 'profile', viewerAuthUserId: user?.id ?? null, selectedTab, postCount: selectedPosts.length, hasOwnActiveStory: Boolean(ownStory) });
  }, [likedPosts, likes.isFetching, likes.status, ownStory, posts, publications.isFetching, publications.status, refreshing, saved.isFetching, saved.status, savedPosts, selectedTab, user?.id]);

  useEffect(() => {
    if (selectedTab !== 'reposts') return;
    traceProfileRuntime('PROFILE_REPOSTS_REQUEST', { flow: 'profile', source: 'backend-contract-missing' });
    traceProfileRuntime('PROFILE_REPOSTS_RESPONSE', { flow: 'profile', status: 'MISSING', postCount: 0 });
  }, [selectedTab]);

  useEffect(() => {
    if (selectedTab !== 'collections') return;
    traceProfileRuntime('PROFILE_COLLECTIONS_REQUEST', { flow: 'profile', viewerAuthUserId: user?.id ?? null });
  }, [selectedTab, user?.id]);

  useEffect(() => {
    if (selectedTab !== 'collections' || !collections.isSuccess) return;
    traceProfileRuntime('PROFILE_COLLECTIONS_RESPONSE', { flow: 'profile', collectionCount: collections.data.length });
  }, [collections.data, collections.isSuccess, selectedTab]);

  const selectTab = useCallback((tab: ProfileTab) => {
    setSelectedTab(tab);
    traceProfileRuntime('PROFILE_TAB_CHANGED', { flow: 'profile', selectedTab: tab, viewerAuthUserId: user?.id ?? null });
  }, [user?.id]);

  const refresh = useCallback(async () => {
    traceProfileRuntime('PROFILE_REFRESH_START', { flow: 'profile', selectedTab, viewerAuthUserId: user?.id ?? null });
    const activeTabRefetch = selectedTab === 'likes' ? likes.refetch : selectedTab === 'saved' ? saved.refetch : selectedTab === 'collections' ? collections.refetch : undefined;
    await Promise.all([profile.refetch(), publications.refetch(), stats.refetch(), activeTabRefetch?.()]);
    traceProfileRuntime('PROFILE_REFRESH_COMPLETE', { flow: 'profile', selectedTab, viewerAuthUserId: user?.id ?? null });
  }, [collections.refetch, likes.refetch, profile, publications, saved.refetch, selectedTab, stats, user?.id]);

  const onPublicationPress = useCallback((post: UserPublication) => {
    const destination = `/(post)/${post.id}`;
    traceProfileRuntime('PROFILE_GRID_ITEM_PRESS', {
      viewerAuthUserId: user?.id ?? null,
      profileId: user?.id ?? null,
      postId: String(post.id),
      mediaId: post.media_id == null ? null : String(post.media_id),
      mediaType: post.media_type ?? post.type,
      selectedTab,
      destination,
    });
    router.push(`/(post)/${post.id}`);
  }, [router, selectedTab, user?.id]);

  if (!user) return null;
  if (profile.isLoading) return <LoadingState label="Chargement du profil…" />;
  if (profile.isError || !data) return <ErrorState title="Profil indisponible" message="Impossible de récupérer vos informations." retry={() => void profile.refetch()} />;

  const share = () => void Share.share({ title: `Profil de ${data.display_name}`, message: `Découvrez le profil de ${data.display_name} sur Yeyamo.`, url: `https://yeyamo.app/@${data.username}` });
  const openOwnStory = () => {
    if (!ownStory) return;
    traceStoryRuntime('STORY_RING_RESOLUTION', { flow: 'profile', storyId: String(ownStory.id), profileId: String(ownStory.author.id), active: true });
    router.push({ pathname: '/(story)/[id]', params: { id: String(ownStory.id), storyIds: ownStories.map((story) => String(story.id)).join(',') } });
  };
  const openStoryCreator = () => router.push('/(create)/story');
  const openOwnStoryChooser = () => { if (ownStory) setStoryChooserOpen(true); };

  const content = () => {
    if (selectedTab === 'reposts') return <ProfileEmptyState icon="repeat-outline" title="Aucun repost" message="Les republications apparaîtront ici lorsqu’un contrat backend persistant sera disponible." />;
    if (selectedTab === 'collections') {
      if (collections.isLoading) return <View className="h-40"><LoadingState label="Chargement des collections…" /></View>;
      if (collections.isError) return <View className="h-40"><ErrorState title="Collections indisponibles" retry={() => void collections.refetch()} /></View>;
      if (!collections.data?.length) return <ProfileEmptyState icon="albums-outline" title="Aucune collection" message="Vos collections de lieux apparaîtront ici." />;
      return <View className="gap-2 px-4 py-4">{collections.data.map((collection) => <TouchableOpacity key={collection.id} onPress={() => router.push('/(collections)')} className="rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }} accessibilityLabel={`Ouvrir la collection ${collection.name}`}><Text className="font-bold" style={{ color: colors.text }}>{collection.name}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{collection.places_count} lieu{collection.places_count > 1 ? 'x' : ''} · {collection.visibility === 'public' ? 'Publique' : 'Privée'}</Text></TouchableOpacity>)}</View>;
    }
    const query = selectedTab === 'likes' ? likes : publications;
    if (selectedTab === 'saved') {
      if (saved.isLoading) return <View className="h-40"><LoadingState label="Chargement des favoris..." /></View>;
      if (saved.isError) return <View className="h-40"><ErrorState title="Favoris indisponibles" retry={() => void saved.refetch()} /></View>;
      if (!savedPosts.length) return <ProfileEmptyState icon="bookmark-outline" title="Aucun favori" message="Les publications enregistrees apparaissent ici." />;
      return <PublicationGrid publications={savedPosts} onPressPublication={onPublicationPress} />;
    }
    if (query.isLoading) return <View className="h-40"><LoadingState label={selectedTab === 'likes' ? 'Chargement des mentions J’aime…' : 'Chargement des publications…'} /></View>;
    if (query.isError) return <View className="h-40"><ErrorState title={selectedTab === 'likes' ? 'Mentions J’aime indisponibles' : 'Publications indisponibles'} retry={() => void query.refetch()} /></View>;
    if (!displayedPosts.length) return <ProfileEmptyState icon={selectedTab === 'likes' ? 'heart-outline' : 'grid-outline'} title={selectedTab === 'likes' ? 'Aucune publication aimée' : 'Aucune publication'} message={selectedTab === 'likes' ? 'Les publications que vous aimez apparaîtront ici.' : 'Vos publications réellement créées apparaîtront ici.'} />;
    return <PublicationGrid publications={displayedPosts} onPressPublication={onPublicationPress} />;
  };

  return (
    <SafeScreen style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarHeight + 18 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />}>
        <View className="h-14 flex-row items-center px-3">
          <TouchableOpacity onPress={() => router.push('/(profile)/find-friends')} className="h-11 w-11 items-center justify-center" accessibilityLabel="Trouver des amis"><Icon name="person-add-outline" size={25} color={colors.text} /></TouchableOpacity>
          <Text className="flex-1 text-center font-extrabold" style={{ color: colors.text }}>@{data.username}</Text>
          <TouchableOpacity onPress={share} className="h-11 w-11 items-center justify-center" accessibilityLabel="Partager le profil"><Icon name="arrow-redo-outline" size={25} color={colors.text} /></TouchableOpacity>
          <TouchableOpacity onPress={() => { traceProfileRuntime('PROFILE_MENU_OPEN', { flow: 'profile', viewerAuthUserId: user.id }); router.push('/(profile)/menu'); }} className="h-11 w-11 items-center justify-center" accessibilityLabel="Ouvrir le menu"><Icon name="menu" size={28} color={colors.text} /></TouchableOpacity>
        </View>
        <View className="items-center px-5 pb-5 pt-4">
          {ownStory ? <StoryRing uri={data.avatar_url} displayName={data.display_name} size={100} isViewed={ownStory.viewed} showAddButton addButtonSize={32} onAddPress={openStoryCreator} onPress={openOwnStoryChooser} /> : <View><Avatar uri={data.avatar_url} displayName={data.display_name} size={100} /><TouchableOpacity onPress={openStoryCreator} className="absolute -bottom-1 -right-1 h-8 w-8 items-center justify-center rounded-full border-2" style={{ borderColor: colors.background, backgroundColor: colors.primary }} accessibilityLabel="Ajouter une story"><Icon name="add" size={22} color="#FFFFFF" /></TouchableOpacity></View>}
          <Text className="mt-4 text-xl font-extrabold" style={{ color: colors.text }}>{data.display_name}</Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>@{data.username}</Text>
          {data.bio ? <Text className="mt-3 text-center leading-6" style={{ color: colors.textSecondary }}>{data.bio}</Text> : null}
          <View className="mt-5 w-full flex-row items-center justify-center"><Stat value={stats.data?.following_count} label="Abonnements" onPress={() => router.push('/(profile)/following')} /><Divider /><Stat value={stats.data?.followers_count} label="Abonnés" onPress={() => router.push('/(profile)/followers')} /><Divider /><Stat value={publicationCount} label="Publications" /></View>
          <View className="mt-5 flex-row gap-2"><TouchableOpacity onPress={() => router.push('/(profile)/edit-profile')} className="min-w-36 items-center rounded-lg border px-5 py-2.5" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="font-bold" style={{ color: colors.text }}>Modifier le profil</Text></TouchableOpacity><TouchableOpacity onPress={share} className="h-10 w-11 items-center justify-center rounded-lg border" style={{ backgroundColor: colors.card, borderColor: colors.border }} accessibilityLabel="Partager le profil"><Icon name="share-outline" size={20} color={colors.text} /></TouchableOpacity></View>
        </View>
        <View className="flex-row border-y" style={{ backgroundColor: colors.background, borderColor: colors.border }}>{PROFILE_TABS.map((tab) => <ProfileTabButton key={tab.id} tab={tab} active={selectedTab === tab.id} onPress={() => selectTab(tab.id)} />)}</View>
        {content()}
      </ScrollView>
      <YeyamoModal visible={storyChooserOpen} onClose={() => setStoryChooserOpen(false)} title="Votre story">
        <View className="gap-2 pb-2">
          <Text className="text-sm" style={{ color: colors.textSecondary }}>Choisissez ce que vous souhaitez ouvrir.</Text>
          <TouchableOpacity onPress={() => setStoryChooserOpen(false)} className="rounded-xl border px-4 py-3" style={{ borderColor: colors.border, backgroundColor: colors.card }} accessibilityLabel="Voir le profil"><Text className="font-bold" style={{ color: colors.text }}>Voir le profil</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => { setStoryChooserOpen(false); openOwnStory(); }} className="rounded-xl px-4 py-3" style={{ backgroundColor: colors.primary }} accessibilityLabel="Voir la story"><Text className="font-bold text-white">Voir la story</Text></TouchableOpacity>
        </View>
      </YeyamoModal>
    </SafeScreen>
  );
}

function ProfileTabButton({ tab, active, onPress }: { tab: (typeof PROFILE_TABS)[number]; active: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="flex-1 items-center border-b-2 py-3" style={{ borderColor: active ? colors.primary : 'transparent' }} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={tab.label}><Icon name={active ? tab.activeIcon : tab.icon} size={23} color={active ? colors.primary : colors.textMuted} /></TouchableOpacity>;
}

function ProfileEmptyState({ icon, title, message }: { icon: string; title: string; message: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="h-52"><EmptyState icon={<Icon name={icon} size={42} color={colors.textMuted} />} title={title} message={message} /></View>;
}

function Stat({ value, label, onPress }: { value?: number; label: string; onPress?: () => void }) { const colors = useThemeStore((state) => state.colors); return <TouchableOpacity disabled={!onPress} onPress={onPress} className="min-w-24 items-center px-3"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>{value == null ? '—' : value > 999 ? `${(value / 1000).toFixed(1)}K` : value}</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{label}</Text></TouchableOpacity>; }
function Divider() { const colors = useThemeStore((state) => state.colors); return <View className="h-8 w-px" style={{ backgroundColor: colors.border }} />; }
