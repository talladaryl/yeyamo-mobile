import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useAvailableTicketTypes } from '@/features/ticketing/useTicketing';
import { useThemeStore } from '@/features/theme/theme.store';
import type { PublicTicketType } from '@/features/ticketing/types';

export default function PublicEventTicketsScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const query = useAvailableTicketTypes(id);
  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 pb-3 pt-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity>
        <View className="flex-1"><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Billets disponibles</Text><Text numberOfLines={1} className="text-xs" style={{ color: colors.textSecondary }}>{query.data?.eventName ?? 'Événement'}</Text></View>
      </View>
      <FlatList
        data={query.data?.tickets ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PublicTicketCard ticket={item} currency={query.data?.currency ?? 'FCFA'} onPress={() => router.push(`/(events)/${id}/checkout?ticketId=${item.id}` as Href)} />}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        refreshing={query.isRefetching}
        onRefresh={query.refetch}
        ListEmptyComponent={<View className="items-center py-20"><Icon name="ticket-outline" size={38} color={colors.textMuted} /><Text className="mt-3 font-bold" style={{ color: colors.text }}>Aucun billet disponible</Text></View>}
      />
    </SafeScreen>
  );
}

function PublicTicketCard({ ticket, currency, onPress }: { ticket: PublicTicketType; currency: string; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mb-3 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><View className="flex-row items-start justify-between"><View className="flex-1"><Text className="text-base font-extrabold" style={{ color: colors.text }}>{ticket.name}</Text><Text className="mt-1 text-lg font-bold text-[#EF4444]">{ticket.price.toLocaleString('fr-FR')} {currency}</Text><Text className="mt-2 text-xs" style={{ color: colors.textSecondary }}>{ticket.remaining} place{ticket.remaining > 1 ? 's' : ''} restante{ticket.remaining > 1 ? 's' : ''}</Text></View><Icon name="ticket-outline" size={25} color="#EF4444" /></View><TouchableOpacity onPress={onPress} disabled={!ticket.available} className={`mt-4 items-center rounded-xl py-3 ${ticket.available ? 'bg-[#EF4444]' : 'opacity-50'}`} style={!ticket.available ? { backgroundColor: colors.elevated } : undefined}><Text className="font-bold" style={{ color: ticket.available ? '#FFFFFF' : colors.textMuted }}>{ticket.available ? 'Choisir ce billet' : 'Indisponible'}</Text></TouchableOpacity></View>;
}
