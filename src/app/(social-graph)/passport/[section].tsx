import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/components/ui/Icon';
import { AnimatedProgressBar } from '@/components/social-graph/AnimatedProgressBar';
import { AnimatedCard, PassportPage } from '@/components/social-graph/PassportPage';
import {
  passportApi,
  passportKeys,
  usePassportHistory,
  usePassportLeaderboard,
  usePassportMissions,
  usePassportRewards,
  usePassportStamps,
  usePassportSummary,
} from '@/features/social-graph/passport.api';
import type { PassportSection } from '@/features/social-graph/passport.types';
import { useThemeStore } from '@/features/theme/theme.store';

const META: Record<PassportSection, { title: string; subtitle: string }> = {
  titles: { title: 'Titres', subtitle: 'Les titres ne sont pas encore fournis par le backend.' },
  statistics: { title: 'Statistiques', subtitle: 'Vos données de progression confirmées par YeYamo.' },
  timeline: { title: 'Historique XP', subtitle: 'Les derniers gains enregistrés par le backend.' },
  missions: { title: 'Missions', subtitle: 'Votre progression réelle dans les missions.' },
  collections: { title: 'Tampons', subtitle: 'Les destinations enregistrées dans votre Passeport.' },
  leaderboard: { title: 'Classement', subtitle: 'Classement global calculé par YeYamo.' },
  rewards: { title: 'Récompenses', subtitle: 'Récompenses accordées par YeYamo.' },
};

export default function PassportSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const key = (section && section in META ? section : 'statistics') as PassportSection;
  const meta = META[key];
  const summary = usePassportSummary();
  const history = usePassportHistory();
  const missions = usePassportMissions();
  const stamps = usePassportStamps();
  const leaderboard = usePassportLeaderboard();
  const rewards = usePassportRewards();

  const selected = key === 'statistics' ? summary : key === 'timeline' ? history : key === 'missions' ? missions : key === 'collections' ? stamps : key === 'leaderboard' ? leaderboard : key === 'rewards' ? rewards : summary;
  if (selected.isLoading) return <PassportPage title={meta.title} subtitle={meta.subtitle}><View className="py-12"><ActivityIndicator /></View></PassportPage>;
  if (selected.isError) return <PassportPage title={meta.title} subtitle={meta.subtitle}><Failure retry={() => void selected.refetch()} /></PassportPage>;

  return <PassportPage title={meta.title} subtitle={meta.subtitle}>{key === 'statistics' ? <Statistics /> : key === 'timeline' ? <Timeline /> : key === 'missions' ? <Missions /> : key === 'collections' ? <Stamps /> : key === 'leaderboard' ? <Leaderboard /> : key === 'rewards' ? <Rewards /> : <UnsupportedTitles />}</PassportPage>;
}

function Statistics() {
  const colors = useThemeStore((state) => state.colors);
  const { data } = usePassportSummary();
  if (!data) return null;
  const rows = [['XP total', data.totalXp], ['Niveau', data.level], ['Série actuelle', data.currentStreak], ['Meilleure série', data.longestStreak], ['Badges', data.earnedBadgesCount], ['Tampons', data.passportStampsCount]];
  return <View className="flex-row flex-wrap justify-between">{rows.map(([label, value], index) => <AnimatedCard key={String(label)} index={index} className="mb-3 w-[48.5%] p-4"><Text className="text-2xl font-extrabold" style={{ color: colors.text }}>{Number(value).toLocaleString('fr-FR')}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{label}</Text></AnimatedCard>)}</View>;
}

function Timeline() {
  const colors = useThemeStore((state) => state.colors);
  const { data } = usePassportHistory();
  const entries = data?.content ?? [];
  if (!entries.length) return <Empty title="Aucun gain XP enregistré." />;
  return <View>{entries.map((entry, index) => <AnimatedCard key={entry.id} index={index} className="mb-3 p-4"><View className="flex-row items-center"><View className="h-10 w-10 items-center justify-center rounded-full bg-[#FEE2E2]"><Icon name="flash" size={19} color="#EF4444" /></View><View className="ml-3 flex-1"><Text className="font-bold" style={{ color: colors.text }}>{entry.reason}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{new Date(entry.occurredAt).toLocaleString('fr-FR')}</Text></View><Text className="font-extrabold text-[#16A34A]">+{entry.points} XP</Text></View></AnimatedCard>)}</View>;
}

function Missions() {
  const colors = useThemeStore((state) => state.colors);
  const { data } = usePassportMissions();
  if (!data?.length) return <Empty title="Aucune mission disponible." />;
  return <View>{data.map((mission, index) => <AnimatedCard key={mission.id} index={index} className="mb-3 p-4"><Text className="text-base font-extrabold" style={{ color: colors.text }}>{mission.title}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{mission.description}</Text>{mission.objectives.map((objective) => <View key={objective.id} className="mt-4"><View className="mb-1 flex-row justify-between"><Text className="text-xs" style={{ color: colors.text }}>{objective.label}</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>{objective.current}/{objective.target}</Text></View><AnimatedProgressBar value={objective.target ? (objective.current / objective.target) * 100 : 0} height={7} /></View>)}<Text className="mt-4 text-xs font-bold text-[#F59E0B]">{mission.rewardAmount} XP · {mission.userStatus}</Text></AnimatedCard>)}</View>;
}

function Stamps() {
  const colors = useThemeStore((state) => state.colors);
  const { data } = usePassportStamps();
  if (!data?.length) return <Empty title="Aucun tampon de Passeport pour le moment." />;
  return <View>{data.map((stamp, index) => <AnimatedCard key={stamp.id} index={index} className="mb-3 flex-row items-center p-4"><View className="h-11 w-11 items-center justify-center rounded-xl bg-[#E0F2FE]"><Icon name="location" size={21} color="#0284C7" /></View><View className="ml-3 flex-1"><Text className="font-bold" style={{ color: colors.text }}>Destination {stamp.destinationId}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{new Date(stamp.stampedAt).toLocaleDateString('fr-FR')}</Text></View></AnimatedCard>)}</View>;
}

function Leaderboard() {
  const colors = useThemeStore((state) => state.colors);
  const { data } = usePassportLeaderboard();
  if (!data?.length) return <Empty title="Classement indisponible pour le moment." />;
  return <View>{data.map((entry, index) => <AnimatedCard key={entry.userId} index={index} className="mb-2 flex-row items-center p-3"><Text className="w-10 text-center font-extrabold text-[#EF4444]">#{entry.rank}</Text><View className="flex-1"><Text className="font-bold" style={{ color: colors.text }}>Utilisateur YeYamo</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>Niveau {entry.level}</Text></View><Text className="font-extrabold" style={{ color: colors.text }}>{entry.totalXp.toLocaleString('fr-FR')} XP</Text></AnimatedCard>)}</View>;
}

function Rewards() {
  const colors = useThemeStore((state) => state.colors);
  const client = useQueryClient();
  const { data } = usePassportRewards();
  const claim = useMutation({ mutationFn: passportApi.claimReward, onSuccess: () => void client.invalidateQueries({ queryKey: passportKeys.rewards() }) });
  if (!data?.length) return <Empty title="Aucune récompense accordée pour le moment." />;
  return <View>{data.map((reward, index) => <AnimatedCard key={reward.id} index={index} className="mb-3 p-4"><Text className="font-extrabold" style={{ color: colors.text }}>{reward.title}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{reward.code}</Text><View className="mt-3 flex-row items-center justify-between"><Text className="text-xs font-bold text-[#EF4444]">{reward.status}</Text>{reward.status === 'AVAILABLE' ? <TouchableOpacity disabled={claim.isPending} onPress={() => claim.mutate(reward.id)} className="rounded-full bg-[#EF4444] px-3 py-2"><Text className="text-xs font-bold text-white">Réclamer</Text></TouchableOpacity> : null}</View></AnimatedCard>)}</View>;
}

function UnsupportedTitles() { return <Empty title="Le backend ne fournit pas encore de titres de voyageur. Aucune donnée de démonstration n’est affichée." />; }
function Empty({ title }: { title: string }) { const colors = useThemeStore((state) => state.colors); return <View className="items-center py-16"><Icon name="information-circle-outline" size={36} color={colors.textMuted} /><Text className="mt-3 text-center" style={{ color: colors.textSecondary }}>{title}</Text></View>; }
function Failure({ retry }: { retry: () => void }) { const colors = useThemeStore((state) => state.colors); return <View className="items-center py-16"><Icon name="alert-circle-outline" size={36} color={colors.textMuted} /><Text className="mt-3 text-center" style={{ color: colors.textSecondary }}>Impossible de charger ces données.</Text><TouchableOpacity onPress={retry} className="mt-4 rounded-xl bg-[#EF4444] px-4 py-3"><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity></View>; }
