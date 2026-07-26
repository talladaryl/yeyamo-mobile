import { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { FilterChips } from '@/components/partner-dashboard/PartnerPage';
import { PromotionCard } from '@/components/partner-dashboard/promotions/PromotionCard';
import { usePartnerPromotions } from '@/features/promotions/usePromotions';
import { useThemeStore } from '@/features/theme/theme.store';
import type { PromotionStatus } from '@/features/promotions/types';

const FILTERS = ['Actives', 'Programmées', 'Terminées'] as const;
const VALUE: Record<(typeof FILTERS)[number], PromotionStatus> = { Actives: 'ACTIVE', Programmées: 'SCHEDULED', Terminées: 'COMPLETED' };
export default function PromotionsScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Actives'); const query = usePartnerPromotions(VALUE[filter]);
  return <SafeScreen><View className="flex-row items-center px-4 pb-2 pt-2"><TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><Text className="flex-1 text-xl font-extrabold" style={{ color: colors.text }}>Promotions</Text><TouchableOpacity onPress={() => router.push('/(partner-dashboard)/promotion-create')} className="flex-row items-center gap-1 rounded-xl bg-[#EF4444] px-3 py-2.5"><Icon name="add" size={18} color="#FFFFFF" /><Text className="font-bold text-white">Créer</Text></TouchableOpacity></View><FlatList data={query.data ?? []} keyExtractor={(item) => item.id} renderItem={({ item }) => <PromotionCard promotion={item} />} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30, flexGrow: 1 }} refreshing={query.isRefetching} onRefresh={query.refetch} ListHeaderComponent={<FilterChips values={FILTERS} selected={filter} onSelect={(value) => setFilter(value as (typeof FILTERS)[number])} />} ListEmptyComponent={<View className="items-center py-20"><Icon name="pricetag-outline" size={38} color={colors.textMuted} /><Text className="mt-3 font-bold" style={{ color: colors.text }}>Aucune promotion</Text></View>} /></SafeScreen>;
}
