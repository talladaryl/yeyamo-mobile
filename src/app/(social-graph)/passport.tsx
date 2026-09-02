import { Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { AnimatedProgressBar } from '@/components/social-graph/AnimatedProgressBar';
import { PassportSectionTitle } from '@/components/social-graph/PassportPage';
import { MOCK_PASSPORT } from '@/features/social-graph/passport.mockData';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeStore } from '@/features/theme/theme.store';
import { ScrollView } from 'react-native';
import { useAuthStore } from '@/features/auth/auth.store';
import { useUserBadges, useUserBadgeStats } from '@/features/social-graph/useBadges';

const MODULES = [
  { label: 'Badges', icon: 'trophy', color: '#F59E0B', route: '/(social-graph)/badges' },
  { label: 'Titres', icon: 'ribbon', color: '#8B5CF6', route: '/(social-graph)/passport/titles' },
  { label: 'Missions', icon: 'flag', color: '#EF4444', route: '/(social-graph)/passport/missions' },
  { label: 'Statistiques', icon: 'stats-chart', color: '#2563EB', route: '/(social-graph)/passport/statistics' },
  { label: 'Chronologie', icon: 'time', color: '#F97316', route: '/(social-graph)/passport/timeline' },
  { label: 'Collections', icon: 'albums', color: '#06B6D4', route: '/(social-graph)/passport/collections' },
  { label: 'Classements', icon: 'podium', color: '#16A34A', route: '/(social-graph)/passport/leaderboard' },
  { label: 'Récompenses', icon: 'gift', color: '#EC4899', route: '/(social-graph)/passport/rewards' },
] as const;

export default function PassportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colors = useThemeStore((state) => state.colors);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const { data: realStats } = useUserBadgeStats();
  const { data: realBadges = [] } = useUserBadges();
  const data = MOCK_PASSPORT;
  if (!user) return null;

  if (!isDemo) {
    return (
      <SafeScreen>
        <View className="flex-row items-center px-4 pb-3 pt-2">
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="chevron-back" size={22} color={colors.text} /></TouchableOpacity>
          <Text className="ml-4 text-lg font-extrabold" style={{ color: colors.text }}>Passeport YeYamo</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="rounded-3xl p-5" style={{ backgroundColor: colors.card }}>
            <Text className="text-3xl font-extrabold" style={{ color: colors.text }}>{realStats?.total_xp ?? 0} XP</Text>
            <Text className="mt-2" style={{ color: colors.textSecondary }}>Niveau {realStats?.level ?? 0} · {realBadges.length} badges obtenus</Text>
          </View>
          {realBadges.map((badge) => (
            <TouchableOpacity key={String(badge.id)} onPress={() => router.push(`/(social-graph)/badges/${badge.id}`)} className="mt-3 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <Text className="font-bold" style={{ color: colors.text }}>{badge.name}</Text>
              <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{badge.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeScreen>
    );
  }
  const levelProgress = (data.currentLevelXP / data.nextLevelXP) * 100;
  const joined = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(user.created_at));

  return (
    <SafeScreen>
      <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="chevron-back" size={22} color={colors.text} /></TouchableOpacity>
        <View className="items-center"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>Passeport YeYamo</Text><Text className="text-[10px] font-bold uppercase tracking-widest text-[#EF4444]">Cameroun</Text></View>
        <TouchableOpacity onPress={() => router.push('/(social-graph)/passport/rewards')} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="gift-outline" size={21} color={colors.text} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(550)} className="overflow-hidden rounded-[28px]">
          <LinearGradient colors={['#B91C1C', '#EF4444', '#F97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="p-5">
            <View className="absolute -right-8 -top-10 h-44 w-44 rounded-full bg-white/10" />
            <View className="absolute -bottom-14 -left-8 h-36 w-36 rounded-full bg-black/10" />
            <View className="flex-row items-center">
              <View className="rounded-full border-[3px] border-white/80 p-1"><Avatar uri={user.avatar_url} displayName={user.display_name} size={72} /></View>
              <View className="ml-4 flex-1"><Text className="text-xl font-extrabold text-white">{user.display_name}</Text><Text className="mt-1 text-sm font-semibold text-white/85">{data.currentTitle}</Text><View className="mt-2 self-start rounded-full bg-white/20 px-3 py-1"><Text className="text-xs font-extrabold text-white">NIVEAU {data.currentLevel}</Text></View></View>
              <Icon name="airplane" size={34} color="#FFFFFF" />
            </View>
            <View className="mt-6"><View className="mb-2 flex-row justify-between"><Text className="text-xs font-semibold text-white/80">{data.totalXP.toLocaleString('fr-FR')} XP au total</Text><Text className="text-xs font-bold text-white">{data.nextLevelXP - data.currentLevelXP} XP restants</Text></View><View className="rounded-full bg-white/25 p-1"><AnimatedProgressBar value={levelProgress} color="#FFFFFF" height={8} /></View></View>
            <View className="mt-5 flex-row border-t border-white/20 pt-4"><PassportMetric label="Membre depuis" value={joined} /><PassportMetric label="Rang Cameroun" value={`#${data.nationalRank}`} divided /><PassportMetric label="Rang Littoral" value={`#${data.regionalRank}`} divided /></View>
          </LinearGradient>
        </Animated.View>

        <PassportSectionTitle title="Votre aventure" />
        <View className="flex-row flex-wrap justify-between">
          {MODULES.map((item, index) => <ModuleCard key={item.label} {...item} index={index} onPress={() => router.push(item.route as Href)} />)}
        </View>

        <PassportSectionTitle title="Mon Cameroun" action="Explorer" onAction={() => router.push('/(social-graph)/passport/collections')} />
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(social-graph)/passport/collections')} className="overflow-hidden rounded-3xl border p-5" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="flex-row"><View className="flex-1"><Text className="text-3xl font-extrabold" style={{ color: colors.text }}>40%</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>du pays découvert</Text><View className="mt-5 gap-3"><MapMetric icon="map" value={`${data.exploration.regionsVisited}/${data.exploration.regionsTotal}`} label="régions" /><MapMetric icon="business" value={String(data.exploration.citiesVisited)} label="villes" /><MapMetric icon="location" value={String(data.exploration.placesDiscovered)} label="lieux" /></View></View><CameroonMap /></View>
        </TouchableOpacity>

        <PassportSectionTitle title="Derniers gains XP" action="Tout voir" onAction={() => router.push('/(social-graph)/passport/timeline')} />
        <View className="overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          {data.xpHistory.slice(0, 3).map((item, index) => <View key={item.id} className="flex-row items-center p-3.5" style={{ borderBottomWidth: index === 2 ? 0 : 1, borderColor: colors.border }}><View className="h-10 w-10 items-center justify-center rounded-full bg-[#FEE2E2]"><Icon name={item.icon} size={19} color="#EF4444" /></View><View className="ml-3 flex-1"><Text className="text-sm font-semibold" style={{ color: colors.text }}>{item.label}</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{item.date}</Text></View><Text className="font-extrabold text-[#16A34A]">+{item.xp} XP</Text></View>)}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function PassportMetric({ label, value, divided }: { label: string; value: string; divided?: boolean }) { return <View className={`flex-1 ${divided ? 'border-l border-white/20 pl-3' : ''}`}><Text className="text-[9px] uppercase text-white/65">{label}</Text><Text className="mt-1 text-xs font-extrabold capitalize text-white" numberOfLines={1}>{value}</Text></View>; }

function ModuleCard({ label, icon, color, index, onPress }: { label: string; icon: string; color: string; index: number; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors); const scale = useSharedValue(1); const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View entering={FadeInDown.delay(index * 45).duration(350)} className="mb-3 w-[48.5%]"><Animated.View style={animated}><TouchableOpacity onPressIn={() => { scale.value = withSpring(0.96); }} onPressOut={() => { scale.value = withSpring(1); }} onPress={onPress} className="flex-row items-center rounded-2xl border p-3.5" style={{ backgroundColor: colors.card, borderColor: colors.border }}><View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18` }}><Icon name={icon} size={22} color={color} /></View><Text className="ml-3 flex-1 text-xs font-bold" style={{ color: colors.text }}>{label}</Text></TouchableOpacity></Animated.View></Animated.View>;
}

function MapMetric({ icon, value, label }: { icon: string; value: string; label: string }) { const colors = useThemeStore((state) => state.colors); return <View className="flex-row items-center"><Icon name={icon} size={16} color="#EF4444" /><Text className="ml-2 text-sm font-extrabold" style={{ color: colors.text }}>{value}</Text><Text className="ml-1 text-xs" style={{ color: colors.textSecondary }}>{label}</Text></View>; }

function CameroonMap() { const regions = MOCK_PASSPORT.exploration.regions; return <View className="ml-3 h-52 w-[46%] items-center justify-center"><View className="w-28 rotate-[-5deg] gap-1"><View className="ml-10 h-7 w-8 rounded-lg" style={{ backgroundColor: regions[8].color }} /><View className="ml-7 flex-row gap-1"><View className="h-8 w-8 rounded-lg" style={{ backgroundColor: regions[7].color }} /><View className="h-8 w-9 rounded-lg" style={{ backgroundColor: regions[9].color }} /></View><View className="ml-4 flex-row gap-1"><View className="h-9 w-9 rounded-lg" style={{ backgroundColor: regions[3].color }} /><View className="h-9 w-11 rounded-lg" style={{ backgroundColor: regions[2].color }} /></View><View className="flex-row gap-1"><View className="h-10 w-10 rounded-lg" style={{ backgroundColor: regions[4].color }} /><View className="h-10 w-10 rounded-lg" style={{ backgroundColor: regions[0].color }} /><View className="h-10 w-8 rounded-lg" style={{ backgroundColor: regions[6].color }} /></View><View className="ml-5 flex-row gap-1"><View className="h-9 w-10 rounded-lg" style={{ backgroundColor: regions[5].color }} /><View className="h-9 w-10 rounded-lg" style={{ backgroundColor: regions[1].color }} /></View></View><View className="mt-3 flex-row items-center"><View className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" /><Text className="ml-1.5 text-[10px] text-[#71717A]">Région visitée</Text></View></View>; }
