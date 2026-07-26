import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { TicketTypeCard } from '@/components/partner-dashboard/ticketing/TicketTypeCard';
import { useEventTicketing } from '@/features/ticketing/useTicketing';
import { useThemeStore } from '@/features/theme/theme.store';

const money = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 });

export default function TicketsScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const query = useEventTicketing(id);
  const dashboard = query.data;
  const route = (suffix: string) => router.push(`/(partner-dashboard)/event/${id}/${suffix}` as Href);
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/(partner-dashboard)/events');

  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 pb-3 pt-2">
        <TouchableOpacity onPress={goBack} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity>
        <View className="flex-1"><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Billetterie</Text><Text className="text-xs" numberOfLines={1} style={{ color: colors.textSecondary }}>{dashboard?.eventName ?? 'Événement'}</Text></View>
      </View>
      <FlatList
        data={dashboard?.ticketTypes ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TicketTypeCard ticket={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, flexGrow: 1 }}
        refreshing={query.isRefetching}
        onRefresh={query.refetch}
        ListHeaderComponent={
          <>
            <View className="mt-2 flex-row flex-wrap gap-3">
              <Stat label="Billets vendus" value={String(dashboard?.sold ?? 0)} />
              <Stat label="Chiffre d’affaires" value={`${money.format(dashboard?.revenue ?? 0)} F`} />
              <Stat label="Participants entrés" value={String(dashboard?.checkedIn ?? 0)} />
              <Stat label="Taux d’entrée" value={`${dashboard?.entryRate ?? 0} %`} />
            </View>
            <Text className="mb-3 mt-6 text-base font-extrabold" style={{ color: colors.text }}>Actions rapides</Text>
            <View className="mb-2 flex-row flex-wrap gap-3">
              <QuickAction icon="add-circle-outline" label="Créer un billet" onPress={() => route('ticket-create')} />
              <QuickAction icon="receipt-outline" label="Commandes" onPress={() => route('ticket-orders')} />
              <QuickAction icon="scan-outline" label="Scanner" onPress={() => route('ticket-scans')} />
              <QuickAction icon="people-outline" label="Équipe" onPress={() => route('staff')} />
              <QuickAction icon="stats-chart-outline" label="Analytics" onPress={() => route('analytics')} />
            </View>
            <Text className="mb-3 mt-4 text-base font-extrabold" style={{ color: colors.text }}>Types de billets</Text>
          </>
        }
        ListEmptyComponent={<View className="items-center py-12"><Icon name={query.isError ? 'alert-circle-outline' : 'ticket-outline'} size={36} color="#EF4444" /><Text className="mt-3 font-bold" style={{ color: colors.text }}>{query.isError ? 'Billetterie indisponible' : 'Aucun billet créé'}</Text></View>}
      />
    </SafeScreen>
  );
}

function Stat({ label, value }: { label: string; value: string }) { const colors = useThemeStore((state) => state.colors); return <View className="w-[48%] rounded-xl bg-[#EF4444] p-4"><Text className="text-xs text-white/80">{label}</Text><Text className="mt-1 text-xl font-extrabold text-white">{value}</Text></View>; }
function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) { const colors = useThemeStore((state) => state.colors); return <TouchableOpacity onPress={onPress} className="w-[48%] flex-row items-center rounded-xl border p-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}><View className="h-9 w-9 items-center justify-center rounded-lg bg-[#FEE2E2]"><Icon name={icon} size={19} color="#EF4444" /></View><Text className="ml-2 flex-1 text-xs font-bold" style={{ color: colors.text }}>{label}</Text></TouchableOpacity>; }
