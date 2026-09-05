import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { useYeyamoTabBarHeight } from '@/components/navigation/useYeyamoTabBarHeight';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/features/auth/useAuth';
import { useProfileStats, useUserPublications } from '@/features/profile/useProfile';
import { useUnreadCount } from '@/features/notifications/useNotifications';
import { useThemeStore } from '@/features/theme/theme.store';
import { FEATURE_FLAGS } from '@/config/featureFlags';

type ProfileTab = 'posts' | 'archive' | 'reposts' | 'favorites' | 'liked';

type ProfileMedia = {
  id: number;
  image: string;
  views: string;
  type: 'video' | 'image';
};

type ArchiveStory = {
  id: number;
  image: string;
  date: string;
};

type Highlight = {
  id: number;
  title: string;
  cover: string;
  storyIds: number[];
};

const ACTIVE_STORY = {
  image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080',
  caption: 'Un nouveau moment à Kribi',
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
};

const ARCHIVED_STORIES: ArchiveStory[] = [
  { id: 1, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', date: '12 août' },
  { id: 2, image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500', date: '8 août' },
  { id: 3, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500', date: '2 août' },
  { id: 4, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500', date: '28 juil.' },
  { id: 5, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500', date: '20 juil.' },
  { id: 6, image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500', date: '14 juil.' },
];

const EXTRA_MEDIA: ProfileMedia[] = [
  { id: 101, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', views: '274.9K', type: 'video' },
  { id: 102, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500', views: '3.2M', type: 'video' },
  { id: 103, image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=500', views: '15.7K', type: 'video' },
  { id: 104, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500', views: '82.4K', type: 'video' },
  { id: 105, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500', views: '46.8K', type: 'video' },
  { id: 106, image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500', views: '126K', type: 'video' },
  { id: 107, image: 'https://images.unsplash.com/photo-1536323760109-ca8c07450053?w=500', views: '9.6K', type: 'video' },
  { id: 108, image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500', views: '71.2K', type: 'video' },
  { id: 109, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500', views: '33.1K', type: 'video' },
];

const PROFILE_TABS: { id: ProfileTab; icon: string; activeIcon: string; label: string }[] = [
  { id: 'posts', icon: 'grid-outline', activeIcon: 'grid', label: 'Publications' },
  { id: 'archive', icon: 'lock-closed-outline', activeIcon: 'lock-closed', label: 'Stories archivées' },
  { id: 'reposts', icon: 'repeat-outline', activeIcon: 'repeat', label: 'Republications' },
  { id: 'favorites', icon: 'bookmark-outline', activeIcon: 'bookmark', label: 'Favoris' },
  { id: 'liked', icon: 'heart-outline', activeIcon: 'heart', label: 'Vidéos aimées' },
];

const EXPLORER_MENU_SECTIONS = [
  {
    title: 'Accès rapide',
    items: [
      ['images-outline', 'Mes publications', '/(profile)/publications'],
      ['heart-outline', 'Mes favoris', '/(profile)/favorites'],
      ['calendar-outline', 'Mes sorties', '/(profile)/events'],
      ['star-outline', 'Mes avis', '/(profile)/reviews'],
      ['notifications-outline', 'Notifications', '/(profile)/notifications'],
      ['settings-outline', 'Paramètres', '/(profile)/settings'],
    ],
  },
  {
    title: 'Réseau social',
    items: [
      ['search-outline', 'Rechercher des utilisateurs', '/(profile)/search'],
      ['people-outline', 'Suggestions à suivre', '/(profile)/suggestions'],
      ['person-add-outline', 'Trouver des amis', '/(profile)/find-friends'],
      ['pulse-outline', 'Activité du réseau', '/(profile)/activity'],
      ['options-outline', 'Paramètres du réseau social', '/(profile)/social-settings'],
      ['airplane-outline', 'Passeport Yeyamo', '/(social-graph)/passport'],
    ],
  },
  {
    title: 'Mes activités',
    items: [
      ['ticket-outline', 'Mes billets', '/(profile)/tickets'],
      ['calendar-number-outline', 'Mes réservations', '/(profile)/reservations'],
      ['albums-outline', 'Mes collections', '/(collections)'],
    ],
  },
  {
    title: 'Culture et découvertes',
    items: [
      ['language-outline', 'Progression linguistique', '/(profile)/language-progress'],
      ['leaf-outline', 'Mes contributions culturelles', '/(profile)/culture-contributions'],
      ['trophy-outline', 'Mes défis culturels', '/(profile)/culture-challenges'],
      ['color-palette-outline', 'Œuvres enregistrées', '/(profile)/saved-artworks'],
      ['people-circle-outline', 'Artisans suivis', '/(profile)/followed-artisans'],
      ['receipt-outline', 'Commandes d’œuvres', '/(profile)/artwork-orders'],
    ],
  },
] as const;

const PARTNER_MENU_SECTIONS = [
  {
    title: 'Gestion partenaire',
    items: [
      ['business-outline', 'Mes établissements', '/(partner-dashboard)/establishments'],
      ['calendar-outline', 'Mes événements', '/(partner-dashboard)/events'],
      ['color-palette-outline', 'Mes œuvres', '/(partner-dashboard)/artworks'],
      ['receipt-outline', 'Commandes d’œuvres', '/(partner-dashboard)/artwork-orders'],
      ['calendar-number-outline', 'Réservations', '/(partner-dashboard)/reservations'],
      ['star-outline', 'Avis clients', '/(partner-dashboard)/reviews'],
    ],
  },
  {
    title: 'Créer et publier',
    items: [
      ['add-circle-outline', 'Ajouter un établissement', '/(partner)/add-place-step1'],
      ['calendar-clear-outline', 'Créer un événement', '/(partner)/add-event-step1'],
      ['images-outline', 'Nouvelle publication', '/(partner)/publication'],
      ['pricetag-outline', 'Créer une offre', '/(partner)/offer'],
      ['book-outline', 'Partager une story', '/(partner)/story'],
    ],
  },
  {
    title: 'Piloter mon activité',
    items: [
      ['stats-chart-outline', 'Statistiques', '/(partner-dashboard)/statistics'],
      ...(FEATURE_FLAGS.partner_finance_enabled
        ? [['wallet-outline', 'Finances et transactions', '/(partner-dashboard)/finance'] as const]
        : []),
      ...(FEATURE_FLAGS.campaigns_enabled
        ? [['megaphone-outline', 'Campagnes publicitaires', '/(partner-dashboard)/campaigns'] as const]
        : []),
      ...(FEATURE_FLAGS.promotions_enabled
        ? [['gift-outline', 'Promotions', '/(partner-dashboard)/promotions'] as const]
        : []),
      ['notifications-outline', 'Notifications professionnelles', '/(partner-dashboard)/notifications'],
    ],
  },
  {
    title: 'Compte professionnel',
    items: [
      ['person-circle-outline', 'Profil artisan', '/(partner-dashboard)/artisan-profile'],
      ['analytics-outline', 'Statistiques artisan', '/(partner-dashboard)/artisan-statistics'],
      ['settings-outline', 'Paramètres partenaire', '/(partner-dashboard)/settings'],
      ['help-circle-outline', 'Aide et assistance', '/(profile)/support'],
    ],
  },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const colors = useThemeStore((state) => state.colors);
  const { width } = useWindowDimensions();
  const tabBarHeight = useYeyamoTabBarHeight();
  const { data: publications = [] } = useUserPublications();
  const { data: stats } = useProfileStats();
  const { data: unreadNotifications = 0 } = useUnreadCount();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isCreateHighlightOpen, setCreateHighlightOpen] = useState(false);
  const [isStoryOpen, setStoryOpen] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(null);
  const [highlightName, setHighlightName] = useState('');
  const [selectedStoryIds, setSelectedStoryIds] = useState<number[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([
    { id: 1, title: 'Voyages', cover: ARCHIVED_STORIES[0].image, storyIds: [1, 2] },
    { id: 2, title: 'Sorties', cover: ARCHIVED_STORIES[3].image, storyIds: [4, 5] },
  ]);

  const tileSize = (width - 4) / 3;
  const hasActiveStory = new Date(ACTIVE_STORY.expiresAt).getTime() > Date.now();
  const postMedia = useMemo<ProfileMedia[]>(() => {
    const fromApi = publications.map((post) => ({
      id: Number(post.id),
      image: post.media_url,
      views: post.likes_count > 999 ? `${(post.likes_count / 1000).toFixed(1)}K` : String(post.likes_count),
      type: post.type === 'video' ? 'video' as const : 'image' as const,
    }));
    return [...fromApi, ...EXTRA_MEDIA.filter((item) => !fromApi.some((post) => post.id === item.id))];
  }, [publications]);

  if (!user) return null;

  const isPartner = user.user_type === 'partner';
  const menuSections = isPartner ? PARTNER_MENU_SECTIONS : EXPLORER_MENU_SECTIONS;
  const likedCount = publications.reduce((total, item) => total + item.likes_count, 0);
  const contentByTab: Record<Exclude<ProfileTab, 'archive'>, ProfileMedia[]> = {
    posts: postMedia,
    reposts: EXTRA_MEDIA.slice(2, 8),
    favorites: EXTRA_MEDIA.slice(1, 7),
    liked: EXTRA_MEDIA.slice(3, 9),
  };

  const shareProfile = async () => {
    await Share.share({
      title: `Profil de ${user.display_name}`,
      message: `Découvre le profil de ${user.display_name} sur Yeyamo : https://yeyamo.app/@${user.username}`,
      url: `https://yeyamo.app/@${user.username}`,
    });
  };

  const createHighlight = () => {
    if (!highlightName.trim() || selectedStoryIds.length === 0) return;
    const cover = ARCHIVED_STORIES.find((story) => story.id === selectedStoryIds[0])?.image;
    if (!cover) return;
    setHighlights((current) => [...current, { id: Date.now(), title: highlightName.trim(), cover, storyIds: selectedStoryIds }]);
    setHighlightName('');
    setSelectedStoryIds([]);
    setCreateHighlightOpen(false);
  };

  const navigateFromMenu = (route: string) => {
    setMenuOpen(false);
    router.push(route as Href);
  };

  return (
    <SafeScreen style={{ backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 12 }}
      >
        <View className="h-14 flex-row items-center px-3">
          <TouchableOpacity onPress={() => router.push('/(profile)/find-friends')} className="h-11 w-11 items-center justify-center" accessibilityLabel="Trouver des amis">
            <Icon name="person-add-outline" size={25} color={colors.text} />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-base font-extrabold" style={{ color: colors.text }}>@{user.username}</Text>
          <TouchableOpacity onPress={shareProfile} className="h-11 w-11 items-center justify-center" accessibilityLabel="Partager le profil">
            <Icon name="arrow-redo-outline" size={27} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuOpen(true)} className="h-11 w-11 items-center justify-center" accessibilityLabel="Ouvrir le menu du profil">
            <Icon name="menu" size={30} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View className="items-center px-5 pb-2 pt-3">
          <TouchableOpacity onPress={() => hasActiveStory ? setStoryOpen(true) : router.push('/(create)/story')} activeOpacity={0.85} className="relative" accessibilityLabel={hasActiveStory ? 'Voir votre story active' : 'Créer une story'}>
            <View className="rounded-full border-[3px] p-[3px]" style={{ borderColor: hasActiveStory ? '#1689FF' : 'transparent' }}>
              <Avatar uri={user.avatar_url} displayName={user.display_name} size={100} />
            </View>
            <TouchableOpacity onPress={(event) => { event.stopPropagation(); router.push('/(create)/story'); }} className="absolute bottom-1 right-0 h-8 w-8 items-center justify-center rounded-full border-[3px] border-white bg-[#1689FF]" accessibilityLabel="Créer une story">
              <Icon name="add" size={21} color="#FFFFFF" />
            </TouchableOpacity>
          </TouchableOpacity>

          <View className="mt-3 flex-row items-center gap-1.5">
            <Text className="text-xl font-extrabold" style={{ color: colors.text }}>{user.display_name}</Text>
            {user.is_verified ? <Icon name="checkmark-circle" size={17} color="#1689FF" /> : null}
          </View>
          <Text className="mt-0.5 text-sm" style={{ color: colors.textSecondary }}>@{user.username}</Text>
          {user.city ? <View className="mt-1 flex-row items-center gap-1"><Icon name="location-outline" size={13} color={colors.textMuted} /><Text className="text-xs" style={{ color: colors.textSecondary }}>{user.city}</Text></View> : null}

          <View className="mt-5 w-full flex-row items-center justify-center">
            <ProfileStat value={stats?.following_count ?? 340} label="Abonnements" onPress={() => router.push('/(profile)/following')} />
            <Divider />
            <ProfileStat value={stats?.followers_count ?? 2300} label="Abonnés" onPress={() => router.push('/(profile)/followers')} />
            <Divider />
            <ProfileStat value={likedCount || 115} label="J’aime" />
          </View>

          <View className="mt-5 flex-row gap-2">
            <TouchableOpacity onPress={() => router.push('/(profile)/edit-profile')} className="min-w-36 items-center rounded-lg border px-5 py-2.5" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <Text className="text-sm font-bold" style={{ color: colors.text }}>Modifier le profil</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={shareProfile} className="h-10 w-11 items-center justify-center rounded-lg border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <Icon name="share-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 18, paddingTop: 12, gap: 16 }}>
          <TouchableOpacity onPress={() => setCreateHighlightOpen(true)} className="w-[74px] items-center" activeOpacity={0.8}>
            <View className="h-[66px] w-[66px] items-center justify-center rounded-full border-2" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <Icon name="add" size={30} color={colors.text} />
            </View>
            <Text className="mt-2 text-xs font-medium" style={{ color: colors.text }}>Nouveau</Text>
          </TouchableOpacity>
          {highlights.map((highlight) => (
            <TouchableOpacity key={highlight.id} onPress={() => setActiveHighlight(highlight)} className="w-[74px] items-center" activeOpacity={0.8}>
              <View className="rounded-full border-2 p-[3px]" style={{ borderColor: colors.border }}>
                <Image source={{ uri: highlight.cover }} style={{ width: 60, height: 60, borderRadius: 30 }} contentFit="cover" />
              </View>
              <Text className="mt-2 max-w-[74px] text-xs font-medium" style={{ color: colors.text }} numberOfLines={1}>{highlight.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="flex-row border-b" style={{ borderColor: colors.border }}>
          {PROFILE_TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)} className="relative h-12 flex-1 items-center justify-center" accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{ selected }}>
                <Icon name={selected ? tab.activeIcon : tab.icon} size={23} color={selected ? colors.text : colors.textMuted} />
                {selected ? <View className="absolute bottom-0 h-0.5 w-full" style={{ backgroundColor: colors.text }} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'archive' ? (
          <View className="flex-row flex-wrap" style={{ gap: 2 }}>
            {ARCHIVED_STORIES.map((story) => (
              <TouchableOpacity key={story.id} onPress={() => setActiveHighlight({ id: story.id, title: story.date, cover: story.image, storyIds: [story.id] })} style={{ width: tileSize, height: tileSize * 1.28 }} activeOpacity={0.85}>
                <Image source={{ uri: story.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                <View className="absolute left-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-black/55"><Icon name="lock-closed" size={14} color="#FFFFFF" /></View>
                <Text className="absolute bottom-2 left-2 text-[11px] font-semibold text-white">{story.date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap" style={{ gap: 2 }}>
            {contentByTab[activeTab].map((item) => (
              <TouchableOpacity key={`${activeTab}-${item.id}`} onPress={() => router.push(`/(post)/${item.id}`)} style={{ width: tileSize, height: tileSize * 1.25 }} activeOpacity={0.85}>
                <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                {activeTab === 'reposts' ? <View className="absolute right-2 top-2 rounded-full bg-black/55 p-1"><Icon name="repeat" size={14} color="#FFFFFF" /></View> : null}
                {activeTab === 'favorites' ? <View className="absolute right-2 top-2 rounded-full bg-black/55 p-1"><Icon name="bookmark" size={14} color="#FFFFFF" /></View> : null}
                {activeTab === 'liked' ? <View className="absolute right-2 top-2 rounded-full bg-black/55 p-1"><Icon name="heart" size={14} color="#FFFFFF" /></View> : null}
                <View className="absolute bottom-2 left-2 flex-row items-center gap-1"><Icon name="play" size={15} color="#FFFFFF" /><Text className="text-xs font-bold text-white">{item.views}</Text></View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={isMenuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <View className="flex-1 flex-row">
          <Pressable className="flex-1 bg-black/45" onPress={() => setMenuOpen(false)} />
          <View className="w-[88%] border-l" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
            <View className="flex-row items-center border-b px-4 pb-3 pt-14" style={{ borderColor: colors.border }}>
              <Avatar uri={user.avatar_url} displayName={user.display_name} size={44} />
              <View className="ml-3 flex-1"><Text className="font-extrabold" style={{ color: colors.text }}>{user.display_name}</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>@{user.username}</Text></View>
              <TouchableOpacity onPress={() => setMenuOpen(false)} className="h-10 w-10 items-center justify-center"><Icon name="close" size={25} color={colors.text} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 34 }}>
              {isPartner ? <View className="px-4 pt-5"><TouchableOpacity onPress={() => navigateFromMenu('/(partner-dashboard)/dashboard')} className="flex-row items-center rounded-2xl bg-[#EF4444] p-4"><Icon name="stats-chart" size={22} color="#FFFFFF" /><View className="ml-3 flex-1"><Text className="font-bold text-white">Tableau de bord partenaire</Text><Text className="text-xs text-white/80">Gérer votre activité professionnelle</Text></View><Icon name="chevron-forward" size={20} color="#FFFFFF" /></TouchableOpacity></View> : null}
              {menuSections.map((section) => (
                <View key={section.title} className="px-4 pt-6">
                  <Text className="mb-2 px-1 text-xs font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>{section.title}</Text>
                  <View className="overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    {section.items.map(([icon, label, route], index) => <MenuRow key={route} icon={icon} label={label} badge={route === '/(profile)/notifications' || route === '/(partner-dashboard)/notifications' ? unreadNotifications : undefined} isLast={index === section.items.length - 1} onPress={() => navigateFromMenu(route)} />)}
                  </View>
                </View>
              ))}
              <View className="px-4 pt-6"><TouchableOpacity onPress={() => Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Se déconnecter', style: 'destructive', onPress: logout }])} className="flex-row items-center rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Icon name="log-out-outline" size={21} color="#EF4444" /><Text className="ml-3 font-bold text-[#EF4444]">Se déconnecter</Text></TouchableOpacity></View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isCreateHighlightOpen} transparent animationType="slide" onRequestClose={() => setCreateHighlightOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setCreateHighlightOpen(false)}>
          <Pressable className="max-h-[82%] rounded-t-[30px] px-4 pb-9 pt-3" style={{ backgroundColor: colors.background }} onPress={(event) => event.stopPropagation()}>
            <View className="mb-4 h-1 w-10 self-center rounded-full" style={{ backgroundColor: colors.border }} />
            <Text className="text-xl font-extrabold" style={{ color: colors.text }}>Nouveau Highlight</Text>
            <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>Choisissez les stories archivées à conserver sur votre profil.</Text>
            <TextInput value={highlightName} onChangeText={setHighlightName} placeholder="Nom du Highlight" placeholderTextColor={colors.textMuted} maxLength={24} className="mt-5 h-12 rounded-2xl border px-4" style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 18 }}>
              {ARCHIVED_STORIES.map((story) => {
                const selected = selectedStoryIds.includes(story.id);
                return <TouchableOpacity key={story.id} onPress={() => setSelectedStoryIds((current) => selected ? current.filter((id) => id !== story.id) : [...current, story.id])} className="relative" activeOpacity={0.8}><Image source={{ uri: story.image }} style={{ width: 92, height: 138, borderRadius: 15, borderWidth: selected ? 3 : 0, borderColor: '#1689FF' }} contentFit="cover" />{selected ? <View className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full bg-[#1689FF]"><Icon name="checkmark" size={18} color="#FFFFFF" /></View> : null}<Text className="absolute bottom-2 left-2 text-[11px] font-semibold text-white">{story.date}</Text></TouchableOpacity>;
              })}
            </ScrollView>
            <TouchableOpacity disabled={!highlightName.trim() || selectedStoryIds.length === 0} onPress={createHighlight} className="items-center rounded-2xl py-4" style={{ backgroundColor: highlightName.trim() && selectedStoryIds.length ? '#1689FF' : colors.elevated }}><Text className="font-bold" style={{ color: highlightName.trim() && selectedStoryIds.length ? '#FFFFFF' : colors.textMuted }}>Créer le Highlight</Text></TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <StoryViewer visible={isStoryOpen} image={ACTIVE_STORY.image} title="Votre story" caption={ACTIVE_STORY.caption} onClose={() => setStoryOpen(false)} />
      <StoryViewer visible={Boolean(activeHighlight)} image={activeHighlight?.cover ?? ''} title={activeHighlight?.title ?? ''} caption={activeHighlight ? `${activeHighlight.storyIds.length} story${activeHighlight.storyIds.length > 1 ? 's' : ''}` : ''} onClose={() => setActiveHighlight(null)} />
    </SafeScreen>
  );
}

function ProfileStat({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity disabled={!onPress} onPress={onPress} className="min-w-24 items-center px-3"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>{value > 999 ? `${(value / 1000).toFixed(1)}K` : value}</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{label}</Text></TouchableOpacity>;
}

function Divider() {
  const colors = useThemeStore((state) => state.colors);
  return <View className="h-8 w-px" style={{ backgroundColor: colors.border }} />;
}

function MenuRow({ icon, label, badge, isLast, onPress }: { icon: string; label: string; badge?: number; isLast: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="flex-row items-center px-4 py-3.5" style={{ borderBottomWidth: isLast ? 0 : 1, borderColor: colors.border }}><View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: colors.elevated }}><Icon name={icon} size={19} color={colors.text} /></View><Text className="ml-3 flex-1 text-sm font-semibold" style={{ color: colors.text }}>{label}</Text>{badge ? <View className="mr-2 min-w-5 items-center rounded-full bg-[#EF4444] px-1.5 py-0.5"><Text className="text-[10px] font-bold text-white">{badge > 99 ? '99+' : badge}</Text></View> : null}<Icon name="chevron-forward" size={18} color={colors.textMuted} /></TouchableOpacity>;
}

function StoryViewer({ visible, image, title, caption, onClose }: { visible: boolean; image: string; title: string; caption: string; onClose: () => void }) {
  return <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}><View className="flex-1 bg-black"><Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} contentFit="cover" /><View className="absolute left-3 right-3 top-14 h-1 overflow-hidden rounded-full bg-white/35"><View className="h-full w-full bg-white" /></View><View className="absolute left-4 right-4 top-20 flex-row items-center"><View className="h-9 w-9 items-center justify-center rounded-full bg-[#1689FF]"><Icon name="sparkles" size={18} color="#FFFFFF" /></View><View className="ml-3 flex-1"><Text className="font-bold text-white">{title}</Text><Text className="text-xs text-white/75">À la une</Text></View><TouchableOpacity onPress={onClose} className="h-11 w-11 items-center justify-center"><Icon name="close" size={29} color="#FFFFFF" /></TouchableOpacity></View><View className="absolute bottom-14 left-5 right-5"><Text className="text-base font-semibold text-white">{caption}</Text></View></View></Modal>;
}
