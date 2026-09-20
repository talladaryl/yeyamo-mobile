import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { partnerApi, type ArtisanAnalytics } from '@/features/partner-dashboard/partner.api';
import { useThemeStore } from '@/features/theme/theme.store';
import { useState } from 'react';

const periods = [7, 30, 90] as const;

export default function ArtisanStatistics() {
  const colors = useThemeStore((state) => state.colors);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const analytics = useQuery({ queryKey: ['artisan-analytics', period], queryFn: () => partnerApi.artisanAnalytics(period) });
  return <SafeScreen><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
    <View className="flex-row items-center"><Icon name="stats-chart-outline" size={28} color={colors.text} /><Text className="ml-2 text-2xl font-extrabold" style={{ color: colors.text }}>Statistiques artisan</Text></View>
    <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>Données calculées à partir des projections analytiques réelles.</Text>
    <View className="mt-5 flex-row gap-2">{periods.map((value) => <TouchableOpacity key={value} onPress={() => setPeriod(value)} className="rounded-full px-4 py-2" style={{ backgroundColor: value === period ? colors.primary : colors.elevated }}><Text className="font-semibold" style={{ color: value === period ? '#FFFFFF' : colors.text }}>{value} jours</Text></TouchableOpacity>)}</View>
    {analytics.isLoading ? <View className="mt-16 items-center"><ActivityIndicator color={colors.primary} /></View> : null}
    {analytics.isError ? <View className="mt-16 items-center"><Text className="text-center" style={{ color: colors.textSecondary }}>Les statistiques ne sont pas disponibles actuellement.</Text></View> : null}
    {analytics.data ? <AnalyticsContent analytics={analytics.data} /> : null}
  </ScrollView></SafeScreen>;
}

function AnalyticsContent({ analytics }: { analytics: ArtisanAnalytics }) {
  const colors = useThemeStore((state) => state.colors);
  const metric = (label: string, value: number | null, suffix = '') => <View key={label} className="w-[48%] rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="text-xs" style={{ color: colors.textSecondary }}>{label}</Text><Text className="mt-2 text-xl font-extrabold" style={{ color: colors.text }}>{value == null ? 'Non disponible' : `${value.toLocaleString('fr-FR')}${suffix}`}</Text></View>;
  if (!analytics.dataAvailable) return <View className="mt-14 items-center"><Text className="text-center text-base font-bold" style={{ color: colors.text }}>Aucune donnée analytique pour cette période</Text><Text className="mt-2 text-center" style={{ color: colors.textSecondary }}>Les valeurs restent indisponibles tant qu’aucune projection n’est reçue.</Text></View>;
  return <View className="mt-6"><View className="flex-row flex-wrap justify-between gap-y-3">{metric('Vues', analytics.totalViews)}{metric('Ventes', analytics.totalSales)}{metric('Nouveaux abonnés', analytics.newFollowers)}{metric('Revenus', analytics.revenue, '')}</View><Text className="mt-7 text-lg font-bold" style={{ color: colors.text }}>Évolution quotidienne</Text>{analytics.dailyKpis.map((row) => <View key={row.date} className="mt-3 flex-row justify-between rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}><Text style={{ color: colors.text }}>{new Date(`${row.date}T12:00:00`).toLocaleDateString('fr-FR')}</Text><Text style={{ color: colors.textSecondary }}>{row.totalViews == null ? 'Vues non disponibles' : `${row.totalViews.toLocaleString('fr-FR')} vues`}</Text></View>)}</View>;
}
