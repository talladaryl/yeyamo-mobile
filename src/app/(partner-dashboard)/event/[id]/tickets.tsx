import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { TicketTypeCard } from '@/components/partner-dashboard/ticketing/TicketTypeCard';
import { useEventTicketTypes, useTicketAnalytics } from '@/features/ticketing/useTicketing';
import { useThemeStore } from '@/features/theme/theme.store';

const money = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 });

export default function TicketsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] ?? '' : params.id?.trim() ?? '';
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const typesQuery = useEventTicketTypes(id);
  const analyticsQuery = useTicketAnalytics(id);
  const analytics = analyticsQuery.data;
  const route = (suffix: string) => router.push(`/(partner-dashboard)/event/${id}/${suffix}` as Href);
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/(partner-dashboard)/events');
  const refresh = () => {
    void typesQuery.refetch();
    void analyticsQuery.refetch();
  };

  if (!id) {
    return <SafeScreen><Header onBack={goBack} /><State title="Événement invalide" description="Aucun identifiant d’événement n’a été fourni." /></SafeScreen>;
  }

  if (typesQuery.isLoading && !typesQuery.data) {
    return <SafeScreen><Header onBack={goBack} /><View className="flex-1 items-center justify-center"><ActivityIndicator color="#EF4444" /><Text className="mt-3" style={{ color: colors.textSecondary }}>Chargement de la billetterie…</Text></View></SafeScreen>;
  }

  return (
    <SafeScreen>
      <Header onBack={goBack} eventId={id} />
      <FlatList
        data={typesQuery.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TicketTypeCard ticket={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, flexGrow: 1 }}
        refreshing={typesQuery.isRefetching || analyticsQuery.isRefetching}
        onRefresh={refresh}
        ListHeaderComponent={
          <>
            <View className="mt-2 flex-row flex-wrap gap-3">
              <Stat label="Billets vendus" value={analytics ? String(analytics.ticketsSold) : '—'} />
              <Stat label="Chiffre d’affaires" value={analytics ? `${money.format(analytics.grossRevenue)} F` : '—'} />
              <Stat label="Participants entrés" value={analytics ? String(analytics.checkedIn) : '—'} />
              <Stat label="Taux d’entrée" value={analytics ? `${analytics.attendanceRate} %` : '—'} />
            </View>
            {analyticsQuery.isError ? <Text className="mt-2 text-xs text-[#EF4444]">Les statistiques sont temporairement indisponibles.</Text> : null}
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
        ListEmptyComponent={typesQuery.isError
          ? <State title="Types de billets indisponibles" description={typesQuery.error instanceof Error ? typesQuery.error.message : 'Impossible de charger les billets.'} action="Réessayer" onPress={() => void typesQuery.refetch()} />
          : <State title="Aucun billet créé" description="Créez le premier type de billet pour cet événement." action="Créer un billet" onPress={() => route('ticket-create')} />}
      />
    </SafeScreen>
  );
}

function Header({ onBack, eventId }: { onBack: () => void; eventId?: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="flex-row items-center px-4 pb-3 pt-2"><TouchableOpacity onPress={onBack} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><View className="flex-1"><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Billetterie</Text><Text className="text-xs" numberOfLines={1} style={{ color: colors.textSecondary }}>{eventId ? `Événement ${eventId}` : 'Événement'}</Text></View></View>;
}

function State({ title, description, action, onPress }: { title: string; description: string; action?: string; onPress?: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="items-center px-6 py-12"><Icon name="ticket-outline" size={36} color="#EF4444" /><Text className="mt-3 text-center font-bold" style={{ color: colors.text }}>{title}</Text><Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>{description}</Text>{action && onPress ? <TouchableOpacity onPress={onPress} className="mt-4 rounded-xl bg-[#EF4444] px-4 py-3"><Text className="font-bold text-white">{action}</Text></TouchableOpacity> : null}</View>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <View className="w-[48%] rounded-xl bg-[#EF4444] p-4"><Text className="text-xs text-white/80">{label}</Text><Text className="mt-1 text-xl font-extrabold text-white">{value}</Text></View>;
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="w-[48%] flex-row items-center rounded-xl border p-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}><View className="h-9 w-9 items-center justify-center rounded-lg bg-[#FEE2E2]"><Icon name={icon} size={19} color="#EF4444" /></View><Text className="ml-2 flex-1 text-xs font-bold" style={{ color: colors.text }}>{label}</Text></TouchableOpacity>;
}
