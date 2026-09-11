import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { AnimatedProgressBar } from '@/components/social-graph/AnimatedProgressBar';
import { PassportSectionTitle } from '@/components/social-graph/PassportPage';
import {
  usePassportBadges,
  usePassportMissions,
  usePassportRewards,
  usePassportStamps,
  usePassportSummary,
} from '@/features/social-graph/passport.api';
import { useThemeStore } from '@/features/theme/theme.store';

const MODULES = [
  { label: 'Badges', icon: 'trophy', color: '#F59E0B', route: '/(social-graph)/badges' },
  { label: 'Missions', icon: 'flag', color: '#EF4444', route: '/(social-graph)/passport/missions' },
  { label: 'Statistiques', icon: 'stats-chart', color: '#2563EB', route: '/(social-graph)/passport/statistics' },
  { label: 'Historique XP', icon: 'time', color: '#F97316', route: '/(social-graph)/passport/timeline' },
  { label: 'Tampons', icon: 'albums', color: '#06B6D4', route: '/(social-graph)/passport/collections' },
  { label: 'Classement', icon: 'podium', color: '#16A34A', route: '/(social-graph)/passport/leaderboard' },
  { label: 'Récompenses', icon: 'gift', color: '#EC4899', route: '/(social-graph)/passport/rewards' },
] as const;

export default function PassportScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const summaryQuery = usePassportSummary();
  const badgesQuery = usePassportBadges();
  const missionsQuery = usePassportMissions();
  const stampsQuery = usePassportStamps();
  const rewardsQuery = usePassportRewards();
  const summary = summaryQuery.data;

  if (summaryQuery.isLoading) {
    return <SafeScreen><ActivityIndicator className="mt-20" color={colors.primary} /></SafeScreen>;
  }

  if (summaryQuery.isError || !summary) {
    return <SafeScreen><View className="flex-1 items-center justify-center px-8"><Icon name="alert-circle-outline" size={42} color={colors.textMuted} /><Text className="mt-4 text-center font-bold" style={{ color: colors.text }}>Impossible de charger votre Passeport</Text><TouchableOpacity onPress={() => void summaryQuery.refetch()} className="mt-4 rounded-xl bg-[#EF4444] px-4 py-3"><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity></View></SafeScreen>;
  }

  const progress = summary.nextLevelThreshold > summary.currentLevelThreshold
    ? Math.min(100, Math.max(0, (summary.currentLevelXp / (summary.nextLevelThreshold - summary.currentLevelThreshold)) * 100))
    : 0;
  const isPartialError = badgesQuery.isError || missionsQuery.isError || stampsQuery.isError || rewardsQuery.isError;

  return (
    <SafeScreen>
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="chevron-back" size={22} color={colors.text} /></TouchableOpacity>
        <Text className="text-lg font-extrabold" style={{ color: colors.text }}>Passeport YeYamo</Text>
        <TouchableOpacity onPress={() => router.push('/(social-graph)/passport/rewards')} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="gift-outline" size={21} color={colors.text} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="rounded-3xl bg-[#EF4444] p-5">
          <Text className="text-xs font-bold uppercase tracking-widest text-white/70">Votre progression</Text>
          <Text className="mt-2 text-3xl font-extrabold text-white">Niveau {summary.level}</Text>
          <Text className="mt-1 text-sm font-semibold text-white/90">{summary.totalXp.toLocaleString('fr-FR')} XP au total</Text>
          <View className="mt-5"><View className="mb-2 flex-row justify-between"><Text className="text-xs text-white/80">Niveau suivant</Text><Text className="text-xs font-bold text-white">{summary.xpToNextLevel.toLocaleString('fr-FR')} XP restants</Text></View><View className="rounded-full bg-white/25 p-1"><AnimatedProgressBar value={progress} color="#FFFFFF" height={8} /></View></View>
          <View className="mt-5 flex-row border-t border-white/20 pt-4"><Metric label="Série actuelle" value={`${summary.currentStreak} j`} /><Metric label="Meilleure série" value={`${summary.longestStreak} j`} divided /><Metric label="Tampons" value={String(summary.passportStampsCount)} divided /></View>
        </View>

        {isPartialError ? <View className="mt-4 rounded-xl border border-[#F59E0B] p-3"><Text className="text-xs text-[#92400E]">Certaines données du Passeport sont temporairement indisponibles. Les valeurs affichées restent celles confirmées par le backend.</Text></View> : null}
        <PassportSectionTitle title="Mon Passeport" />
        <View className="flex-row flex-wrap justify-between">{MODULES.map((item) => <ModuleCard key={item.label} {...item} onPress={() => router.push(item.route as Href)} />)}</View>

        <PassportSectionTitle title="Résumé" />
        <View className="gap-3"><SummaryRow icon="trophy" label="Badges obtenus" value={String(summary.earnedBadgesCount)} /><SummaryRow icon="flag" label="Missions actives" value={String((missionsQuery.data ?? []).filter((mission) => mission.userStatus === 'ACTIVE').length)} /><SummaryRow icon="gift" label="Récompenses disponibles" value={String(summary.availableRewardsCount)} /><SummaryRow icon="albums" label="Tampons enregistrés" value={String(stampsQuery.data?.length ?? summary.passportStampsCount)} /></View>
      </ScrollView>
    </SafeScreen>
  );
}

function Metric({ label, value, divided }: { label: string; value: string; divided?: boolean }) { return <View className={`flex-1 ${divided ? 'border-l border-white/20 pl-3' : ''}`}><Text className="text-[9px] uppercase text-white/65">{label}</Text><Text className="mt-1 text-xs font-extrabold text-white">{value}</Text></View>; }
function ModuleCard({ label, icon, color, onPress }: { label: string; icon: string; color: string; onPress: () => void }) { const colors = useThemeStore((state) => state.colors); return <TouchableOpacity onPress={onPress} className="mb-3 w-[48.5%] flex-row items-center rounded-2xl border p-3.5" style={{ backgroundColor: colors.card, borderColor: colors.border }}><View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}><Icon name={icon} size={22} color={color} /></View><Text className="ml-3 flex-1 text-xs font-bold" style={{ color: colors.text }}>{label}</Text></TouchableOpacity>; }
function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) { const colors = useThemeStore((state) => state.colors); return <View className="flex-row items-center rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Icon name={icon} size={20} color="#EF4444" /><Text className="ml-3 flex-1 font-semibold" style={{ color: colors.text }}>{label}</Text><Text className="font-extrabold" style={{ color: colors.text }}>{value}</Text></View>; }
