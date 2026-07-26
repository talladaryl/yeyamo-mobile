import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useEventTickets } from '@/features/ticketing/useTicketing';
import { useThemeStore } from '@/features/theme/theme.store';

export default function EventTicketCheckoutScreen() {
  const { id = '', ticketId = '' } = useLocalSearchParams<{ id: string; ticketId: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { data } = useEventTickets(id);
  const ticket = data?.tickets.find((item) => item.id === ticketId);
  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 pb-3 pt-2"><TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><View><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Finaliser l’achat</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>{data?.eventName ?? 'Événement'}</Text></View></View>
      <View className="flex-1 px-4 pt-3">
        <View className="rounded-2xl border p-5" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="text-xs uppercase" style={{ color: colors.textMuted }}>Billet sélectionné</Text>
          <Text className="mt-2 text-lg font-extrabold" style={{ color: colors.text }}>{ticket?.name ?? 'Billet indisponible'}</Text>
          <View className="mt-5 flex-row justify-between border-t pt-4" style={{ borderColor: colors.border }}><Text style={{ color: colors.textSecondary }}>Total</Text><Text className="font-extrabold" style={{ color: colors.text }}>{ticket?.price.toLocaleString('fr-FR') ?? '—'} {data?.currency ?? 'FCFA'}</Text></View>
        </View>
        <View className="mt-5"><Button label="Continuer vers le paiement" onPress={() => Alert.alert('Paiement', 'Le moyen de paiement sera sélectionné à l’étape suivante.')} disabled={!ticket?.available} /></View>
        <Text className="mt-3 text-center text-xs" style={{ color: colors.textMuted }}>La participation sociale à l’événement reste indépendante de cet achat.</Text>
      </View>
    </SafeScreen>
  );
}
