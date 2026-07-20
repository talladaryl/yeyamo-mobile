import { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { AnimatedProgressBar } from '@/components/social-graph/AnimatedProgressBar';
import { AnimatedCard, PassportPage, PassportSectionTitle } from '@/components/social-graph/PassportPage';
import { MOCK_PASSPORT } from '@/features/social-graph/passport.mockData';
import { usePassportStore } from '@/features/social-graph/passport.store';
import type { MissionType, PassportSection } from '@/features/social-graph/passport.types';
import { useThemeStore } from '@/features/theme/theme.store';

const META: Record<PassportSection, { title: string; subtitle: string }> = {
  titles: { title: 'Titres de voyageur', subtitle: 'Votre identité évolue avec vos aventures' },
  statistics: { title: 'Statistiques', subtitle: 'Le résumé vivant de votre activité' },
  timeline: { title: 'Chronologie', subtitle: 'L’histoire de votre voyage YeYamo' },
  missions: { title: 'Missions', subtitle: 'Relevez des défis et gagnez de l’XP' },
  collections: { title: 'Collections du Passeport', subtitle: 'Complétez votre carnet de découvertes' },
  leaderboard: { title: 'Classements', subtitle: 'Mesurez-vous aux explorateurs de la communauté' },
  rewards: { title: 'Récompenses', subtitle: 'Tout ce que vos aventures ont débloqué' },
};

export default function PassportSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const key = (section && section in META ? section : 'statistics') as PassportSection;
  const meta = META[key];
  return <PassportPage title={meta.title} subtitle={meta.subtitle}>{key === 'titles' ? <Titles /> : key === 'statistics' ? <Statistics /> : key === 'timeline' ? <Timeline /> : key === 'missions' ? <Missions /> : key === 'collections' ? <Collections /> : key === 'leaderboard' ? <Leaderboard /> : <Rewards />}</PassportPage>;
}

function Titles() {
  const colors = useThemeStore((state) => state.colors);
  return <View>{MOCK_PASSPORT.titles.map((title, index) => <AnimatedCard key={title.id} index={index} className="mb-3 p-4"><View className="flex-row"><View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: title.unlocked ? '#FEE2E2' : colors.elevated }}><Icon name={title.unlocked ? title.icon : 'lock-closed'} size={26} color={title.unlocked ? '#EF4444' : colors.textMuted} /></View><View className="ml-3 flex-1"><View className="flex-row items-center justify-between"><Text className="flex-1 text-base font-extrabold" style={{ color: title.unlocked ? colors.text : colors.textSecondary }}>{title.name}</Text><Text className="text-[10px] font-bold" style={{ color: title.unlocked ? '#16A34A' : colors.textMuted }}>{title.unlocked ? 'DÉBLOQUÉ' : `${title.xpRequired.toLocaleString('fr-FR')} XP`}</Text></View><Text className="mb-3 mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>{title.description}</Text><AnimatedProgressBar value={title.progress} color={title.unlocked ? '#16A34A' : '#EF4444'} height={7} /></View></View></AnimatedCard>)}</View>;
}

function Statistics() {
  const colors = useThemeStore((state) => state.colors);
  const weekly = [32, 46, 38, 70, 56, 84, 68];
  return <View><View className="flex-row flex-wrap justify-between">{MOCK_PASSPORT.statistics.map((stat, index) => <AnimatedCard key={stat.id} index={index} className="mb-3 w-[48.5%] p-4"><View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${stat.color}18` }}><Icon name={stat.icon} size={21} color={stat.color} /></View><Text className="mt-4 text-2xl font-extrabold" style={{ color: colors.text }}>{stat.value.toLocaleString('fr-FR')}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{stat.label}</Text></AnimatedCard>)}</View><PassportSectionTitle title="Activité des 7 derniers jours" /><AnimatedCard className="p-4"><View className="h-44 flex-row items-end justify-between border-b" style={{ borderColor: colors.border }}>{weekly.map((value, index) => <View key={index} className="w-[9%] rounded-t-lg bg-[#EF4444]" style={{ height: `${value}%`, opacity: 0.45 + index * 0.07 }} />)}</View><View className="mt-2 flex-row justify-between">{['L','M','M','J','V','S','D'].map((day, index) => <Text key={`${day}${index}`} className="text-[10px]" style={{ color: colors.textMuted }}>{day}</Text>)}</View></AnimatedCard><PassportSectionTitle title="Régularité" /><View className="flex-row gap-3"><Streak value={MOCK_PASSPORT.currentStreak} label="Série actuelle" icon="flame" color="#EF4444" /><Streak value={MOCK_PASSPORT.bestStreak} label="Meilleure série" icon="trophy" color="#F59E0B" /></View></View>;
}

function Streak({ value, label, icon, color }: { value: number; label: string; icon: string; color: string }) { const colors = useThemeStore((state) => state.colors); return <AnimatedCard className="flex-1 items-center p-5"><View className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${color}18` }}><Icon name={icon} size={26} color={color} /></View><Text className="mt-3 text-3xl font-extrabold" style={{ color: colors.text }}>{value}</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>{label}</Text></AnimatedCard>; }

function Timeline() {
  const colors = useThemeStore((state) => state.colors);
  return <View>{MOCK_PASSPORT.timeline.map((event, index) => <View key={event.id} className="flex-row"><View className="items-center"><View className="h-12 w-12 items-center justify-center rounded-full border-4" style={{ backgroundColor: `${event.color}18`, borderColor: colors.background }}><Icon name={event.icon} size={22} color={event.color} /></View>{index < MOCK_PASSPORT.timeline.length - 1 ? <View className="w-0.5 flex-1" style={{ backgroundColor: colors.border }} /> : null}</View><AnimatedCard index={index} className="mb-4 ml-3 flex-1 p-4"><Text className="text-[10px] font-bold uppercase" style={{ color: event.color }}>{event.date}</Text><Text className="mt-1 text-base font-extrabold" style={{ color: colors.text }}>{event.title}</Text><Text className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>{event.subtitle}</Text></AnimatedCard></View>)}</View>;
}

function Missions() {
  const [type, setType] = useState<MissionType>('daily');
  const claimed = usePassportStore((state) => state.claimedMissionIds);
  const claim = usePassportStore((state) => state.claimMission);
  const colors = useThemeStore((state) => state.colors);
  const missions = useMemo(() => MOCK_PASSPORT.missions.filter((mission) => mission.type === type), [type]);
  return <View><View className="mb-4 flex-row rounded-2xl p-1" style={{ backgroundColor: colors.elevated }}>{(['daily','weekly','special'] as MissionType[]).map((value) => <TouchableOpacity key={value} onPress={() => setType(value)} className="flex-1 rounded-xl py-2.5" style={{ backgroundColor: type === value ? colors.card : 'transparent' }}><Text className="text-center text-xs font-bold" style={{ color: type === value ? '#EF4444' : colors.textSecondary }}>{value === 'daily' ? 'Quotidiennes' : value === 'weekly' ? 'Hebdo' : 'Spéciales'}</Text></TouchableOpacity>)}</View>{missions.map((mission, index) => { const complete = mission.progress >= mission.target; const isClaimed = claimed.includes(mission.id); return <AnimatedCard key={mission.id} index={index} className="mb-3 p-4"><View className="flex-row"><View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#FEE2E2]"><Icon name={mission.icon} size={23} color="#EF4444" /></View><View className="ml-3 flex-1"><View className="flex-row justify-between"><Text className="flex-1 text-base font-extrabold" style={{ color: colors.text }}>{mission.title}</Text><Text className="text-xs font-extrabold text-[#F59E0B]">+{mission.xpReward} XP</Text></View><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{mission.description}</Text><View className="mt-3"><AnimatedProgressBar value={(mission.progress / mission.target) * 100} height={7} /></View><View className="mt-3 flex-row items-center justify-between"><Text className="text-[11px]" style={{ color: colors.textMuted }}><Icon name="time-outline" size={11} color={colors.textMuted} /> {mission.timeLeft}</Text>{complete ? <TouchableOpacity disabled={isClaimed} onPress={() => claim(mission.id)} className="rounded-full px-3 py-1.5" style={{ backgroundColor: isClaimed ? colors.elevated : '#EF4444' }}><Text className="text-xs font-bold" style={{ color: isClaimed ? colors.textMuted : '#FFFFFF' }}>{isClaimed ? 'Récupérée' : 'Récupérer'}</Text></TouchableOpacity> : <Text className="text-xs font-bold" style={{ color: colors.text }}>{mission.progress}/{mission.target}</Text>}</View></View></View></AnimatedCard>; })}</View>;
}

function Collections() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors);
  return <View><View className="flex-row flex-wrap justify-between">{MOCK_PASSPORT.collections.map((item, index) => { const progress = (item.current / item.target) * 100; return <AnimatedCard key={item.id} index={index} className="mb-3 w-[48.5%] p-4"><View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}18` }}><Icon name={item.icon} size={22} color={item.color} /></View><Text className="mt-3 text-sm font-extrabold" style={{ color: colors.text }}>{item.name}</Text><Text className="mb-3 mt-1 text-xs" style={{ color: colors.textSecondary }}>{item.current} sur {item.target}</Text><AnimatedProgressBar value={progress} color={item.color} height={7} /></AnimatedCard>; })}</View><TouchableOpacity onPress={() => router.push('/(collections)')} className="mt-3 flex-row items-center justify-center rounded-2xl border p-4" style={{ borderColor: '#EF4444' }}><Icon name="albums-outline" size={20} color="#EF4444" /><Text className="ml-2 font-bold text-[#EF4444]">Ouvrir mes collections enregistrées</Text></TouchableOpacity></View>;
}

function Leaderboard() {
  const [scope, setScope] = useState('National'); const colors = useThemeStore((state) => state.colors); const scopes = ['National','Régional','Amis','Explorateurs','Voyageurs'];
  return <View><View className="mb-5 flex-row flex-wrap gap-2">{scopes.map((value) => <TouchableOpacity key={value} onPress={() => setScope(value)} className="rounded-full border px-3 py-2" style={{ backgroundColor: scope === value ? '#EF4444' : colors.card, borderColor: scope === value ? '#EF4444' : colors.border }}><Text className="text-xs font-bold" style={{ color: scope === value ? '#FFFFFF' : colors.textSecondary }}>{value}</Text></TouchableOpacity>)}</View><View className="mb-5 flex-row items-end justify-center"><Podium entry={MOCK_PASSPORT.leaderboard[1]} place={2} /><Podium entry={MOCK_PASSPORT.leaderboard[0]} place={1} featured /><Podium entry={MOCK_PASSPORT.leaderboard[2]} place={3} /></View>{MOCK_PASSPORT.leaderboard.map((entry, index) => <AnimatedCard key={entry.id} index={index} className={`mb-2 flex-row items-center p-3 ${entry.isCurrentUser ? 'border-[#EF4444]' : ''}`}><Text className="w-9 text-center font-extrabold" style={{ color: entry.isCurrentUser ? '#EF4444' : colors.textSecondary }}>#{entry.rank}</Text><Avatar uri={entry.avatarUrl} displayName={entry.name} size={42} /><View className="ml-3 flex-1"><Text className="font-bold" style={{ color: colors.text }}>{entry.name}{entry.isCurrentUser ? ' (vous)' : ''}</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>{entry.city}</Text></View><Text className="font-extrabold text-[#EF4444]">{entry.xp.toLocaleString('fr-FR')} XP</Text></AnimatedCard>)}</View>;
}

function Podium({ entry, place, featured }: { entry: typeof MOCK_PASSPORT.leaderboard[number]; place: number; featured?: boolean }) { const colors = useThemeStore((state) => state.colors); const color = place === 1 ? '#F59E0B' : place === 2 ? '#94A3B8' : '#B45309'; return <View className={`items-center ${featured ? 'mx-4' : ''}`}><View className="rounded-full border-[3px] p-0.5" style={{ borderColor: color }}><Avatar uri={entry.avatarUrl} displayName={entry.name} size={featured ? 64 : 52} /></View><View className="-mt-2 h-6 min-w-6 items-center justify-center rounded-full px-1" style={{ backgroundColor: color }}><Text className="text-xs font-extrabold text-white">{place}</Text></View><Text className="mt-1 max-w-20 text-center text-xs font-bold" style={{ color: colors.text }} numberOfLines={1}>{entry.name}</Text></View>; }

function Rewards() {
  const colors = useThemeStore((state) => state.colors);
  return <View><View className="mb-5 rounded-2xl bg-[#FEE2E2] p-4"><Text className="text-base font-extrabold text-[#991B1B]">3 récompenses débloquées</Text><Text className="mt-1 text-xs leading-5 text-[#991B1B]">Continuez vos missions pour obtenir des cadres, thèmes et futurs avantages partenaires.</Text></View><View className="flex-row flex-wrap justify-between">{MOCK_PASSPORT.rewards.map((reward, index) => <AnimatedCard key={reward.id} index={index} className="mb-3 w-[48.5%] overflow-hidden p-4"><View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: reward.unlocked ? `${reward.color}18` : colors.elevated }}><Icon name={reward.unlocked ? reward.icon : 'lock-closed'} size={27} color={reward.unlocked ? reward.color : colors.textMuted} /></View><Text className="mt-4 text-sm font-extrabold" style={{ color: reward.unlocked ? colors.text : colors.textSecondary }}>{reward.name}</Text><Text className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>{reward.description}</Text><View className="mt-3 self-start rounded-full px-2 py-1" style={{ backgroundColor: reward.unlocked ? '#DCFCE7' : colors.elevated }}><Text className="text-[9px] font-extrabold" style={{ color: reward.unlocked ? '#15803D' : colors.textMuted }}>{reward.unlocked ? 'OBTENU' : 'VERROUILLÉ'}</Text></View></AnimatedCard>)}</View></View>;
}
