import { Text, TouchableOpacity, View } from 'react-native';
import { PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { StatCard } from '@/components/partner-dashboard/StatCard';
import { trafficSources } from '@/features/partner-dashboard/mockData';
import { useThemeStore } from '@/features/theme/theme.store';
import { useAuthStore } from '@/features/auth/auth.store';
import { usePartnerStatistics } from '@/features/partner-dashboard/usePartnerDashboard';

export default function StatisticsScreen() {
  const colors = useThemeStore((state) => state.colors);
  const isDemo = useAuthStore((state) => state.sessionMode === 'demo-partner');
  const { data } = usePartnerStatistics();
  const cards = data?.cards ?? [];
  const bars = data?.bars ?? [];
  return (
    <PartnerPage title="Statistiques" subtitle="Analysez vos performances et votre audience">
      <View className="mb-4 mt-2 flex-row gap-3">{cards.map((stat) => <StatCard key={stat.label} stat={stat} />)}</View>
      <View className="mb-4 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <View className="flex-row items-center justify-between">
          <Text className="font-bold" style={{ color: colors.text }}>Évolution des vues</Text>
          <Text className="text-xs" style={{ color: colors.textSecondary }}>7 derniers jours⌄</Text>
        </View>
        <View className="mt-6 h-36 flex-row items-end justify-between border-b" style={{ borderColor: colors.border }}>
          {bars.map((height, index) => <View key={index} className="w-[8%] rounded-t-md bg-[#EF4444]" style={{ height: `${height}%`, opacity: 0.45 + index * 0.06 }} />)}
        </View>
        <View className="mt-2 flex-row justify-between"><Text className="text-[10px]" style={{ color: colors.textMuted }}>Lun</Text><Text className="text-[10px]" style={{ color: colors.textMuted }}>Aujourd’hui</Text></View>
      </View>
      {isDemo ? <View className="mb-4 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <Text className="mb-4 font-bold" style={{ color: colors.text }}>Sources de trafic</Text>
        {trafficSources.map((source) => (
          <View key={source.name} className="mb-3">
            <View className="mb-1.5 flex-row justify-between"><Text className="text-sm" style={{ color: colors.textSecondary }}>{source.name}</Text><Text className="text-sm font-bold" style={{ color: colors.text }}>{source.percentage}%</Text></View>
            <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: colors.elevated }}><View className="h-full rounded-full" style={{ width: `${source.percentage}%`, backgroundColor: source.color }} /></View>
          </View>
        ))}
      </View> : null}
      <TouchableOpacity className="items-center rounded-xl border p-4" style={{ borderColor: '#EF4444' }}><Text className="font-bold text-[#E60012]">Voir le rapport complet</Text></TouchableOpacity>
    </PartnerPage>
  );
}
