import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { FilterChips } from '@/components/partner-dashboard/PartnerPage';
import { PromotionCard } from '@/components/partner-dashboard/promotions/PromotionCard';
import { usePartnerProfile } from '@/features/partner-dashboard/usePartnerDashboard';
import { usePromotions } from '@/features/promotions/usePromotions';
import { useThemeStore } from '@/features/theme/theme.store';
import type { Promotion, PromotionApiStatus, PromotionResponse, PromotionStatus } from '@/features/promotions/types';

const FILTERS = ['Actives', 'Brouillons', 'Désactivées'] as const;
const VALUE: Record<(typeof FILTERS)[number], PromotionApiStatus> = { Actives: 'ACTIVE', Brouillons: 'DRAFT', Désactivées: 'INACTIVE' };
function viewModel(item: PromotionResponse): Promotion { const products = item.applicableProductTypes.split(','); const status: PromotionStatus = item.status === 'ACTIVE' ? 'ACTIVE' : 'COMPLETED'; return { id: item.id, name: item.name, code: item.code, description: item.description ?? '', discountType: item.discountType, value: item.discountValue, startsAt: item.startsAt, endsAt: item.endsAt, usageCount: item.usageCount, globalLimit: item.usageLimit ?? 0, status, applications: products.map((product) => product === 'TICKET_ORDER' ? 'TICKETS' : product === 'BOOKING_ORDER' ? 'RESERVATIONS' : 'EXPERIENCES') }; }

export default function PromotionsScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const profile = usePartnerProfile();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Actives');
  const query = usePromotions({ partnerId: profile.data?.id, status: VALUE[filter], page: 0, size: 50 });
  const data = query.data?.content.map(viewModel) ?? [];
  return <SafeScreen><View className="flex-row items-center px-4 pb-2 pt-2"><TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><Text className="flex-1 text-xl font-extrabold" style={{ color: colors.text }}>Promotions</Text><TouchableOpacity onPress={() => router.push('/(partner-dashboard)/promotion-create')} accessibilityLabel="Créer une promotion" className="h-11 w-11 items-center justify-center rounded-full bg-[#EF4444]"><Icon name="add" size={25} color="#FFFFFF" /></TouchableOpacity></View>{query.isLoading ? <ActivityIndicator className="mt-16" color="#EF4444" /> : <FlatList data={data} keyExtractor={(item) => item.id} renderItem={({ item }) => <PromotionCard promotion={item} />} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30, flexGrow: 1 }} refreshing={query.isRefetching} onRefresh={query.refetch} ListHeaderComponent={<FilterChips values={FILTERS} selected={filter} onSelect={(value) => setFilter(value as (typeof FILTERS)[number])} />} ListEmptyComponent={<View className="items-center py-20"><Icon name={query.isError ? 'alert-circle-outline' : 'pricetag-outline'} size={38} color={colors.textMuted} /><Text className="mt-3 font-bold" style={{ color: colors.text }}>{query.isError ? 'Chargement impossible' : 'Aucune promotion'}</Text>{query.isError ? <TouchableOpacity onPress={() => query.refetch()}><Text className="mt-2 text-[#EF4444]">Réessayer</Text></TouchableOpacity> : null}</View>} />}</SafeScreen>;
}
