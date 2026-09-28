import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useYeyamoTabBarHeight } from '@/components/navigation/useYeyamoTabBarHeight';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/ViewStates';
import { PublicationGrid } from '@/components/profile/PublicationGrid';
import { StoryRing } from '@/components/story/StoryRing';
import { useAuth } from '@/features/auth/useAuth';
import { useProfileSettings } from '@/features/settings/useSettings';
import { useProfileStats, useUserPublications } from '@/features/profile/useProfile';
import { useUnreadCount } from '@/features/notifications/useNotifications';
import { useThemeStore } from '@/features/theme/theme.store';
import { useStories } from '@/features/story/useStory';
import { traceProfileRuntime, traceStoryRuntime } from '@/features/social/social.runtime-trace';

const explorerSections = [
  ['Accès rapide', [['images-outline', 'Mes publications', '/(profile)/publications'], ['heart-outline', 'Mes favoris', '/(profile)/favorites'], ['calendar-outline', 'Mes sorties', '/(profile)/events'], ['star-outline', 'Mes avis', '/(profile)/reviews'], ['notifications-outline', 'Notifications', '/(profile)/notifications'], ['settings-outline', 'Paramètres', '/(profile)/settings']]],
  ['Réseau social', [['search-outline', 'Rechercher des utilisateurs', '/(profile)/search'], ['people-outline', 'Suggestions à suivre', '/(profile)/suggestions'], ['person-add-outline', 'Trouver des amis', '/(profile)/find-friends'], ['pulse-outline', 'Activité du réseau', '/(profile)/activity'], ['options-outline', 'Paramètres du réseau social', '/(profile)/social-settings'], ['airplane-outline', 'Passeport Yeyamo', '/(social-graph)/passport']]],
  ['Mes activités', [['ticket-outline', 'Mes billets', '/(profile)/tickets'], ['calendar-number-outline', 'Mes réservations', '/(profile)/reservations'], ['location-outline', 'Mes suggestions de lieux', '/(profile)/place-suggestions'], ['albums-outline', 'Mes collections', '/(collections)']]],
  ['Culture et découvertes', [['language-outline', 'Progression linguistique', '/(profile)/language-progress'], ['leaf-outline', 'Mes contributions culturelles', '/(profile)/culture-contributions'], ['trophy-outline', 'Mes défis culturels', '/(profile)/culture-challenges'], ['color-palette-outline', 'Œuvres enregistrées', '/(profile)/saved-artworks'], ['people-circle-outline', 'Artisans suivis', '/(profile)/followed-artisans'], ['receipt-outline', 'Commandes d’œuvres', '/(profile)/artwork-orders']]],
] as const;
const explorerPlannerSection = ['Aventures', [['calendar-clear-outline', 'Gérer vos plannings', '/(profile)/plannings']]] as const;
const partnerSections = [
  ['Gestion partenaire', [['business-outline', 'Mes établissements', '/(partner-dashboard)/establishments'], ['calendar-outline', 'Mes événements', '/(partner-dashboard)/events'], ['calendar-number-outline', 'Réservations', '/(partner-dashboard)/reservations'], ['star-outline', 'Avis clients', '/(partner-dashboard)/reviews']]],
  ['Créer et publier', [['add-circle-outline', 'Ajouter un établissement', '/(partner)/add-place-step1'], ['calendar-clear-outline', 'Créer un événement', '/(partner)/add-event-step1'], ['images-outline', 'Nouvelle publication', '/(partner)/publication'], ['book-outline', 'Partager une story', '/(partner)/story']]],
  ['Compte professionnel', [['stats-chart-outline', 'Statistiques', '/(partner-dashboard)/statistics'], ['settings-outline', 'Paramètres partenaire', '/(partner-dashboard)/settings'], ['help-circle-outline', 'Aide et assistance', '/(profile)/support']]],
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const colors = useThemeStore((state) => state.colors);
  const tabBarHeight = useYeyamoTabBarHeight();
  const profile = useProfileSettings();
  const publications = useUserPublications();
  const stats = useProfileStats();
  const unread = useUnreadCount();
  const stories = useStories();
  const [menuOpen, setMenuOpen] = useState(false);
  traceProfileRuntime('PROFILE_LOAD', { flow: 'profile', viewerUserId: user?.id ?? null, profileState: profile.status });

  if (!user) return null;
  if (profile.isLoading) return <LoadingState label="Chargement du profil…" />;
  if (profile.isError || !profile.data) return <ErrorState title="Profil indisponible" message="Impossible de récupérer vos informations." retry={() => void profile.refetch()} />;

  const data = profile.data;
  const sections = user.user_type === 'partner' ? partnerSections : [explorerPlannerSection, ...explorerSections];
  const ownStories = (stories.data ?? []).filter((story) => String(story.author_auth_user_id) === String(user.id));
  const ownStory = ownStories.find((story) => !story.viewed) ?? ownStories[0];
  traceProfileRuntime('PROFILE_GRID_RENDER', { flow: 'profile', viewerUserId: user.id, postCount: publications.data?.length ?? 0, hasOwnActiveStory: Boolean(ownStory) });

  const share = () => void Share.share({ title: `Profil de ${data.display_name}`, message: `Découvrez le profil de ${data.display_name} sur Yeyamo.`, url: `https://yeyamo.app/@${data.username}` });
  const navigate = (route: string) => { setMenuOpen(false); router.push(route as Href); };
  const openOwnStory = () => {
    if (!ownStory) return;
    traceStoryRuntime('STORY_RING_RESOLUTION', { flow: 'profile', storyId: String(ownStory.id), profileId: String(ownStory.author.id), active: true });
    router.push({ pathname: '/(story)/[id]', params: { id: String(ownStory.id), storyIds: ownStories.map((story) => String(story.id)).join(',') } });
  };

  return (
    <SafeScreen style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: tabBarHeight + 18 }} showsVerticalScrollIndicator={false}>
        <View className="h-14 flex-row items-center px-3">
          <TouchableOpacity onPress={() => router.push('/(profile)/find-friends')} className="h-11 w-11 items-center justify-center" accessibilityLabel="Trouver des amis"><Icon name="person-add-outline" size={25} color={colors.text} /></TouchableOpacity>
          <Text className="flex-1 text-center font-extrabold" style={{ color: colors.text }}>@{data.username}</Text>
          <TouchableOpacity onPress={share} className="h-11 w-11 items-center justify-center" accessibilityLabel="Partager le profil"><Icon name="arrow-redo-outline" size={25} color={colors.text} /></TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuOpen(true)} className="h-11 w-11 items-center justify-center" accessibilityLabel="Ouvrir le menu"><Icon name="menu" size={28} color={colors.text} /></TouchableOpacity>
        </View>
        <View className="items-center px-5 pb-5 pt-4">
          {ownStory ? <StoryRing uri={data.avatar_url} displayName={data.display_name} size={100} isViewed={ownStory.viewed} showAddButton onPress={openOwnStory} /> : <Avatar uri={data.avatar_url} displayName={data.display_name} size={100} />}
          <Text className="mt-4 text-xl font-extrabold" style={{ color: colors.text }}>{data.display_name}</Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>@{data.username}</Text>
          {data.bio ? <Text className="mt-3 text-center leading-6" style={{ color: colors.textSecondary }}>{data.bio}</Text> : null}
          <View className="mt-5 w-full flex-row items-center justify-center"><Stat value={stats.data?.following_count} label="Abonnements" onPress={() => router.push('/(profile)/following')} /><Divider /><Stat value={stats.data?.followers_count} label="Abonnés" onPress={() => router.push('/(profile)/followers')} /><Divider /><Stat value={stats.data?.publications_count} label="Publications" /></View>
          <View className="mt-5 flex-row gap-2"><TouchableOpacity onPress={() => router.push('/(profile)/edit-profile')} className="min-w-36 items-center rounded-lg border px-5 py-2.5" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="font-bold" style={{ color: colors.text }}>Modifier le profil</Text></TouchableOpacity><TouchableOpacity onPress={share} className="h-10 w-11 items-center justify-center rounded-lg border" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Icon name="share-outline" size={20} color={colors.text} /></TouchableOpacity></View>
        </View>
        <View className="border-y px-4 py-3" style={{ borderColor: colors.border }}><Text className="font-bold" style={{ color: colors.text }}>Publications</Text></View>
        {publications.isLoading ? <View className="h-40"><LoadingState label="Chargement des publications…" /></View> : publications.isError ? <View className="h-40"><ErrorState title="Publications indisponibles" retry={() => void publications.refetch()} /></View> : publications.data?.length ? <PublicationGrid publications={publications.data} onPressPublication={(postId) => router.push(`/(post)/${postId}`)} /> : <View className="h-48"><EmptyState title="Aucune publication" message="Vos publications réellement créées apparaîtront ici." /></View>}
      </ScrollView>
      <ProfileMenu visible={menuOpen} onClose={() => setMenuOpen(false)} sections={sections} data={data} unread={unread.data} colors={colors} navigate={navigate} logout={logout} />
    </SafeScreen>
  );
}

function ProfileMenu({ visible, onClose, sections, data, unread, colors, navigate, logout }: { visible: boolean; onClose: () => void; sections: readonly (readonly [string, readonly (readonly [string, string, string])[]])[]; data: { avatar_url: string | null; display_name: string; username: string }; unread?: number; colors: ReturnType<typeof useThemeStore.getState>['colors']; navigate: (route: string) => void; logout: () => void }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><View className="flex-1 flex-row"><Pressable className="flex-1 bg-black/45" onPress={onClose} /><View className="w-[88%] border-l" style={{ backgroundColor: colors.background, borderColor: colors.border }}><View className="flex-row items-center border-b px-4 pb-3 pt-14" style={{ borderColor: colors.border }}><Avatar uri={data.avatar_url} displayName={data.display_name} size={44} /><View className="ml-3 flex-1"><Text className="font-extrabold" style={{ color: colors.text }}>{data.display_name}</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>@{data.username}</Text></View><TouchableOpacity onPress={onClose} className="p-2"><Icon name="close" size={25} color={colors.text} /></TouchableOpacity></View><ScrollView contentContainerStyle={{ paddingBottom: 34 }}>{sections.map(([title, items]) => <View key={title} className="px-4 pt-6"><Text className="mb-2 px-1 text-xs font-bold uppercase" style={{ color: colors.textMuted }}>{title}</Text><View className="overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>{items.map(([icon, label, route], index) => <MenuRow key={route} icon={icon} label={label} badge={route.includes('notifications') ? unread : undefined} isLast={index === items.length - 1} onPress={() => navigate(route)} />)}</View></View>)}<View className="px-4 pt-6"><TouchableOpacity onPress={() => Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Se déconnecter', style: 'destructive', onPress: logout }])} className="flex-row items-center rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Icon name="log-out-outline" size={21} color={colors.primary} /><Text className="ml-3 font-bold" style={{ color: colors.primary }}>Se déconnecter</Text></TouchableOpacity></View></ScrollView></View></View></Modal>;
}

function Stat({ value, label, onPress }: { value?: number; label: string; onPress?: () => void }) { const colors = useThemeStore((state) => state.colors); return <TouchableOpacity disabled={!onPress} onPress={onPress} className="min-w-24 items-center px-3"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>{value == null ? '—' : value > 999 ? `${(value / 1000).toFixed(1)}K` : value}</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{label}</Text></TouchableOpacity>; }
function Divider() { const colors = useThemeStore((state) => state.colors); return <View className="h-8 w-px" style={{ backgroundColor: colors.border }} />; }
function MenuRow({ icon, label, badge, isLast, onPress }: { icon: string; label: string; badge?: number; isLast: boolean; onPress: () => void }) { const colors = useThemeStore((state) => state.colors); return <TouchableOpacity onPress={onPress} className="flex-row items-center px-4 py-3.5" style={{ borderBottomWidth: isLast ? 0 : 1, borderColor: colors.border }}><View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: colors.elevated }}><Icon name={icon} size={19} color={colors.text} /></View><Text className="ml-3 flex-1 text-sm font-semibold" style={{ color: colors.text }}>{label}</Text>{badge ? <View className="mr-2 min-w-5 items-center rounded-full px-1.5 py-0.5" style={{ backgroundColor: colors.primary }}><Text className="text-[10px] font-bold text-white">{badge > 99 ? '99+' : badge}</Text></View> : null}<Icon name="chevron-forward" size={18} color={colors.textMuted} /></TouchableOpacity>; }
