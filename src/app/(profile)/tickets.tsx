import { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { FilterChips } from '@/components/partner-dashboard/PartnerPage';
import { TicketCard } from '@/components/profile/TicketCard';
import { useMyTickets } from '@/features/ticketing/useTicketing';
import { useThemeStore } from '@/features/theme/theme.store';
import type { OwnedTicketStatus } from '@/features/ticketing/types';

const TABS = ['À venir', 'Utilisés', 'Passés'] as const;
const VALUES: Record<(typeof TABS)[number], OwnedTicketStatus> = { 'À venir': 'UPCOMING', Utilisés: 'USED', Passés: 'PAST' };

export default function MyTicketsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [tab, setTab] = useState<(typeof TABS)[number]>('À venir');
  const query = useMyTickets(VALUES[tab]);
  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 pb-2 pt-2"><TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Mes billets</Text></View>
      <FlatList data={query.data ?? []} keyExtractor={(item) => item.id} renderItem={({ item }) => <TicketCard ticket={item} onPress={() => router.push(`/(profile)/ticket/${item.id}` as Href)} />} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30, flexGrow: 1 }} refreshing={query.isRefetching} onRefresh={query.refetch} ListHeaderComponent={<FilterChips values={TABS} selected={tab} onSelect={(value) => setTab(value as (typeof TABS)[number])} />} ListEmptyComponent={<View className="items-center py-20"><Icon name="ticket-outline" size={38} color={colors.textMuted} /><Text className="mt-3 text-center font-bold" style={{ color: colors.text }}>Aucun billet dans cette catégorie</Text></View>} />
    </SafeScreen>
  );
}
