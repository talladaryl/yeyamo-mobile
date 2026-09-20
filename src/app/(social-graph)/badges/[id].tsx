import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useBadgeDetails } from '@/features/social-graph/useBadges';
import { useThemeStore } from '@/features/theme/theme.store';

/** Badge detail intentionally renders only fields supplied by gamification-service. */
export default function BadgeDetailScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: badge, isLoading, isError, refetch } = useBadgeDetails(id);
  if (isLoading) return <SafeScreen><ActivityIndicator className="mt-20" color={colors.primary} /></SafeScreen>;
  if (isError || !badge) return <SafeScreen><View className="flex-1 items-center justify-center px-8"><Text style={{ color: colors.textSecondary }}>Badge introuvable.</Text><TouchableOpacity onPress={() => void refetch()} className="mt-4 rounded-xl bg-[#EF4444] px-4 py-3"><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity></View></SafeScreen>;
  return <SafeScreen><View className="flex-row items-center border-b px-4 pb-3 pt-2" style={{ borderColor: colors.border }}><TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="chevron-back" size={22} color={colors.text} /></TouchableOpacity><Text className="ml-3 flex-1 text-lg font-extrabold" style={{ color: colors.text }}>Détail du badge</Text></View><ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 36 }}><View className="items-center rounded-3xl border p-6" style={{ backgroundColor: colors.card, borderColor: colors.border }}><View className="h-24 w-24 items-center justify-center rounded-full bg-[#FEF2F2]"><Icon name="trophy" size={48} color="#EF4444" /></View><Text className="mt-5 text-center text-2xl font-extrabold" style={{ color: colors.text }}>{badge.name}</Text><Text className="mt-4 text-center text-sm leading-6" style={{ color: colors.textSecondary }}>{badge.description}</Text></View><View className="mt-5 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="text-xs font-bold uppercase" style={{ color: colors.textMuted }}>Statut vérifié</Text><Text className="mt-2 font-bold text-[#16A34A]">Obtenu le {badge.unlocked_at ? new Intl.DateTimeFormat('fr-FR').format(new Date(badge.unlocked_at)) : 'date non disponible'}</Text><Text className="mt-3 text-xs leading-5" style={{ color: colors.textSecondary }}>Le backend ne fournit pas de progression, niveaux ou actions XP pour ce badge. Ces valeurs ne sont donc pas inventées dans l’application.</Text></View></ScrollView></SafeScreen>;
}
