import { useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { StatCard } from '@/components/partner-dashboard/StatCard';
import { FilterChips } from '@/components/partner-dashboard/PartnerPage';
import { CampaignCard } from '@/components/partner-dashboard/campaigns/CampaignCard';
import { CampaignListSkeleton } from '@/components/partner-dashboard/campaigns/CampaignListSkeleton';
import { usePartnerCampaigns } from '@/features/campaigns/useCampaigns';
import { useThemeStore } from '@/features/theme/theme.store';
import type { CampaignFilter } from '@/features/campaigns/types';

const FILTERS = ['Toutes', 'Actives', 'En attente', 'Terminées'] as const;
const FILTER_VALUES: Record<(typeof FILTERS)[number], CampaignFilter> = {
  Toutes: 'ALL',
  Actives: 'ACTIVE',
  'En attente': 'PENDING',
  Terminées: 'COMPLETED',
};
const compact = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 });
const money = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 });

export default function CampaignsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [filterLabel, setFilterLabel] = useState<(typeof FILTERS)[number]>('Toutes');
  const query = usePartnerCampaigns(FILTER_VALUES[filterLabel]);
  const summary = query.data?.summary;
  const stats = [
    { label: 'Budget dépensé', value: `${money.format(summary?.amountSpent ?? 0)} F`, change: 'Total', isPositive: true },
    { label: 'Impressions', value: compact.format(summary?.impressions ?? 0), change: 'Total', isPositive: true },
    { label: 'Clics', value: compact.format(summary?.clicks ?? 0), change: 'Total', isPositive: true },
    { label: 'Conversions', value: compact.format(summary?.conversions ?? 0), change: 'Total', isPositive: true },
  ];

  const goBack = () => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile');

  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 pb-3 pt-2">
        <TouchableOpacity onPress={goBack} accessibilityLabel="Retour" className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
          <Icon name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-extrabold" style={{ color: colors.text }}>Publicité</Text>
          <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>Gérez et analysez vos campagnes</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(partner-dashboard)/campaign-create')} accessibilityLabel="Créer une campagne" className="h-11 w-11 items-center justify-center rounded-full bg-[#EF4444]">
          <Icon name="add" size={25} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {query.isLoading ? <CampaignListSkeleton /> : (
        <FlatList
          data={query.data?.campaigns ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CampaignCard campaign={item} onPress={() => router.push(`/(partner-dashboard)/campaign/${item.id}` as Href)} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor="#EF4444" colors={['#EF4444']} />}
          ListHeaderComponent={
            <>
              <View className="mt-2 flex-row flex-wrap gap-3">
                {stats.map((stat) => <View key={stat.label} className="w-[48%]"><StatCard stat={stat} /></View>)}
              </View>
              <FilterChips values={FILTERS} selected={filterLabel} onSelect={(value) => setFilterLabel(value as (typeof FILTERS)[number])} />
            </>
          }
          ListEmptyComponent={query.isError
            ? <State icon="cloud-offline-outline" title="Impossible de charger les campagnes" description="Vérifiez votre connexion puis réessayez." action="Réessayer" onPress={() => query.refetch()} />
            : <State icon="megaphone-outline" title="Aucune campagne" description="Créez une campagne pour développer votre visibilité." action="Créer une campagne" onPress={() => router.push('/(partner-dashboard)/campaign-create')} />}
        />
      )}
    </SafeScreen>
  );
}

function State({ icon, title, description, action, onPress }: { icon: string; title: string; description: string; action: string; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="items-center px-7 py-14">
      <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: colors.elevated }}><Icon name={icon} size={28} color="#EF4444" /></View>
      <Text className="mt-4 text-center text-base font-extrabold" style={{ color: colors.text }}>{title}</Text>
      <Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>{description}</Text>
      <TouchableOpacity onPress={onPress} className="mt-5 rounded-xl bg-[#EF4444] px-5 py-3"><Text className="font-bold text-white">{action}</Text></TouchableOpacity>
    </View>
  );
}
