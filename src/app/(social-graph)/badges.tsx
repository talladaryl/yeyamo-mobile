import { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { BadgeCard, categoryLabel } from '@/components/social-graph/BadgeCard';
import { useUserBadges } from '@/features/social-graph/useBadges';
import { useThemeStore } from '@/features/theme/theme.store';

export default function BadgesScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const [category, setCategory] = useState('Tous');
  const { data: badges = [], isLoading, isError, refetch } = useUserBadges();
  const categories = useMemo(() => ['Tous', ...Array.from(new Set(badges.map((item) => categoryLabel(item.category))))], [badges]);
  const visible = useMemo(() => category === 'Tous' ? badges : badges.filter((item) => categoryLabel(item.category) === category), [badges, category]);
  const unlocked = badges.filter((item) => item.is_unlocked).length;
  return <SafeScreen><View className="flex-row items-center border-b px-4 pb-3 pt-2" style={{ borderColor: colors.border }}><TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(social-graph)/passport')} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="chevron-back" size={22} color={colors.text} /></TouchableOpacity><View className="ml-3 flex-1"><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Galerie des badges</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>{unlocked} débloqués sur {badges.length}</Text></View><View className="h-10 w-10 items-center justify-center rounded-full bg-[#FEE2E2]"><Icon name="trophy" size={21} color="#EF4444" /></View></View>{isError ? <View className="flex-1 items-center justify-center px-8"><Icon name="cloud-offline-outline" size={42} color={colors.textMuted} /><Text className="mt-3 text-center" style={{ color: colors.textSecondary }}>Impossible de charger les badges.</Text><TouchableOpacity onPress={() => refetch()} className="mt-4 rounded-full bg-[#EF4444] px-5 py-2.5"><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity></View> : <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, padding: 16 }}>{categories.map((item) => <TouchableOpacity key={item} onPress={() => setCategory(item)} className="rounded-full border px-4 py-2" style={{ backgroundColor: category === item ? '#EF4444' : colors.card, borderColor: category === item ? '#EF4444' : colors.border }}><Text className="text-xs font-bold" style={{ color: category === item ? '#FFFFFF' : colors.textSecondary }}>{item}</Text></TouchableOpacity>)}</ScrollView><View className="px-4">{isLoading ? <Text style={{ color: colors.textSecondary }}>Chargement…</Text> : visible.map((badge) => <BadgeCard key={badge.id} badge={badge} onPress={() => router.push(`/(social-graph)/badges/${badge.id}`)} />)}</View></ScrollView>}</SafeScreen>;
}
