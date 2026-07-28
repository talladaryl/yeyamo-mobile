import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { FilterChips } from '@/components/partner-dashboard/PartnerPage';
import { TicketCard } from '@/components/profile/TicketCard';
import { useMyTickets } from '@/features/ticketing/useTicketing';
import { useThemeStore } from '@/features/theme/theme.store';
import type { TicketStatus } from '@/features/ticketing/types';

const TABS = ['À venir', 'Utilisés', 'Passés'] as const;
const SERVER_FILTER: Record<(typeof TABS)[number], TicketStatus | undefined> = { 'À venir': 'VALID', Utilisés: 'USED', Passés: undefined };
const PAST: TicketStatus[] = ['EXPIRED', 'CANCELLED', 'REFUNDED', 'REVOKED'];

export default function MyTicketsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [tab, setTab] = useState<(typeof TABS)[number]>('À venir');
  const query = useMyTickets({ status: SERVER_FILTER[tab] });
  const tickets = tab === 'Passés' ? (query.data ?? []).filter((ticket) => PAST.includes(ticket.status)) : query.data ?? [];
  return <SafeScreen><View className="flex-row items-center px-4 pb-2 pt-2"><TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Mes billets</Text></View>{query.isLoading ? <ActivityIndicator className="mt-20" color="#EF4444" /> : <FlatList data={tickets} keyExtractor={(item) => item.ticketId} renderItem={({ item }) => <TicketCard ticket={item} onPress={() => router.push(`/(profile)/ticket/${item.ticketId}` as Href)} />} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30, flexGrow: 1 }} refreshing={query.isRefetching} onRefresh={query.refetch} ListHeaderComponent={<FilterChips values={TABS} selected={tab} onSelect={(value) => setTab(value as (typeof TABS)[number])} />} ListEmptyComponent={<View className="items-center py-20"><Icon name={query.isError ? 'alert-circle-outline' : 'ticket-outline'} size={38} color={colors.textMuted} /><Text className="mt-3 text-center font-bold" style={{ color: colors.text }}>{query.isError ? 'Impossible de charger les billets' : 'Aucun billet dans cette catégorie'}</Text>{query.isError ? <TouchableOpacity onPress={() => void query.refetch()} className="mt-4 rounded-xl bg-[#EF4444] px-4 py-3"><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity> : null}</View>} />}</SafeScreen>;
}
