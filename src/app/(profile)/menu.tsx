import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/features/auth/useAuth';
import { useUnreadCount } from '@/features/notifications/useNotifications';
import { useThemeStore } from '@/features/theme/theme.store';
import { traceProfileRuntime } from '@/features/social/social.runtime-trace';

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

export default function ProfileMenuScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const unread = useUnreadCount();
  const colors = useThemeStore((state) => state.colors);
  const sections = user?.user_type === 'partner' ? partnerSections : [explorerPlannerSection, ...explorerSections];

  const navigate = (route: string) => {
    traceProfileRuntime('PROFILE_MENU_NAVIGATION', { flow: 'profile-menu', viewerAuthUserId: user?.id ?? null, destination: route });
    router.push(route as never);
  };
  const confirmLogout = () => Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Se déconnecter', style: 'destructive', onPress: () => void logout() },
  ]);

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center border-b px-3 py-2" style={{ borderColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center" accessibilityLabel="Retour"><Icon name="chevron-back" size={26} color={colors.text} /></TouchableOpacity>
        <Text className="ml-1 flex-1 text-xl font-extrabold" style={{ color: colors.text }}>Menu</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        <View className="flex-row items-center px-5 pb-2 pt-5"><Avatar uri={user?.avatar_url ?? null} displayName={user?.display_name ?? 'Yeyamo'} size={48} /><View className="ml-3"><Text className="font-extrabold" style={{ color: colors.text }}>{user?.display_name}</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>@{user?.username}</Text></View></View>
        {sections.map(([title, items]) => <View key={title} className="px-4 pt-6"><Text className="mb-2 px-1 text-xs font-bold uppercase" style={{ color: colors.textMuted }}>{title}</Text><View className="overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>{items.map(([icon, label, route], index) => <MenuRow key={route} icon={icon} label={label} badge={route.includes('notifications') ? unread.data : undefined} isLast={index === items.length - 1} onPress={() => navigate(route)} />)}</View></View>)}
        <View className="px-4 pt-6"><TouchableOpacity onPress={confirmLogout} className="flex-row items-center rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }} accessibilityLabel="Se déconnecter"><Icon name="log-out-outline" size={21} color="#EF4444" /><Text className="ml-3 font-bold text-[#EF4444]">Se déconnecter</Text></TouchableOpacity></View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuRow({ icon, label, badge, isLast, onPress }: { icon: string; label: string; badge?: number; isLast: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="flex-row items-center px-4 py-3.5" style={{ borderBottomWidth: isLast ? 0 : 1, borderColor: colors.border }}><View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: colors.elevated }}><Icon name={icon} size={19} color={colors.text} /></View><Text className="ml-3 flex-1 text-sm font-semibold" style={{ color: colors.text }}>{label}</Text>{badge ? <View className="mr-2 min-w-5 items-center rounded-full px-1.5 py-0.5" style={{ backgroundColor: colors.primary }}><Text className="text-[10px] font-bold text-white">{badge > 99 ? '99+' : badge}</Text></View> : null}<Icon name="chevron-forward" size={18} color={colors.textMuted} /></TouchableOpacity>;
}
