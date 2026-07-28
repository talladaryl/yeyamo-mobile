import { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useAvailableTicketTypes, useCreateTicketOrder, useTicketOrderStatus } from '@/features/ticketing/useTicketing';
import { useThemeStore } from '@/features/theme/theme.store';
import { normalizeApiError } from '@/services/api/errors';

export default function EventTicketCheckoutScreen() {
  const { id = '', ticketId = '' } = useLocalSearchParams<{ id: string; ticketId: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const available = useAvailableTicketTypes(id);
  const createOrder = useCreateTicketOrder(id);
  const [quantity, setQuantity] = useState(1);
  const [orderId, setOrderId] = useState('');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const orderQuery = useTicketOrderStatus(orderId);
  const order = orderQuery.data;
  const ticket = available.data?.tickets.find((item) => item.id === ticketId);

  useEffect(() => {
    if (!order?.expiresAt || ['PAID', 'ISSUED'].includes(order.status)) return;
    const update = () => setSecondsLeft(Math.max(0, Math.floor((new Date(order.expiresAt).getTime() - Date.now()) / 1000)));
    update();
    const timer = setInterval(update, 1_000);
    return () => clearInterval(timer);
  }, [order?.expiresAt, order?.status]);

  useEffect(() => {
    if (order?.status === 'PAID' || order?.status === 'ISSUED') {
      Alert.alert('Paiement confirmé', 'Votre commande a été confirmée par le serveur.');
    }
  }, [order?.status]);

  const submit = async () => {
    if (!ticket) return;
    try {
      const created = await createOrder.mutateAsync({ ticketTypeId: ticket.id, quantity });
      setOrderId(created.orderId);
    } catch (error) {
      const apiError = normalizeApiError(error);
      if (apiError.status === 409) {
        Alert.alert('Stock indisponible', 'Le stock a changé. Les disponibilités vont être actualisées.');
        void available.refetch();
        return;
      }
      Alert.alert('Commande impossible', apiError.message);
    }
  };

  const pending = order?.status === 'AWAITING_PAYMENT' || order?.paymentStatus === 'PENDING';
  const failed = order?.paymentStatus === 'FAILED' || order?.status === 'CANCELLED';
  const expired = order?.status === 'EXPIRED' || secondsLeft === 0;

  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 pb-3 pt-2"><TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><View><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Finaliser l’achat</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>{available.data?.eventName ?? 'Événement'}</Text></View></View>
      <View className="flex-1 px-4 pt-3">
        <View className="rounded-2xl border p-5" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="text-xs uppercase" style={{ color: colors.textMuted }}>Billet sélectionné</Text>
          <Text className="mt-2 text-lg font-extrabold" style={{ color: colors.text }}>{ticket?.name ?? 'Billet indisponible'}</Text>
          <View className="mt-4 flex-row items-center justify-between"><Text style={{ color: colors.textSecondary }}>Quantité</Text><View className="flex-row items-center gap-4"><TouchableOpacity disabled={quantity <= 1 || Boolean(orderId)} onPress={() => setQuantity((value) => Math.max(1, value - 1))}><Icon name="remove-circle-outline" size={26} color={colors.text} /></TouchableOpacity><Text className="font-bold" style={{ color: colors.text }}>{quantity}</Text><TouchableOpacity disabled={quantity >= (ticket?.remaining ?? 1) || Boolean(orderId)} onPress={() => setQuantity((value) => value + 1)}><Icon name="add-circle-outline" size={26} color={colors.text} /></TouchableOpacity></View></View>
          <View className="mt-5 flex-row justify-between border-t pt-4" style={{ borderColor: colors.border }}><Text style={{ color: colors.textSecondary }}>Prix unitaire indicatif</Text><Text className="font-extrabold" style={{ color: colors.text }}>{ticket?.price.toLocaleString('fr-FR') ?? '—'} {available.data?.currency ?? 'XAF'}</Text></View>
          {order ? <View className="mt-3 border-t pt-3" style={{ borderColor: colors.border }}><Text className="text-xs" style={{ color: colors.textMuted }}>Total confirmé par le backend</Text><Text className="mt-1 text-lg font-extrabold" style={{ color: colors.text }}>{order.totalAmount.toLocaleString('fr-FR')} {order.currency}</Text></View> : null}
        </View>

        {!orderId ? <View className="mt-5"><Button label="Créer la commande" onPress={submit} isLoading={createOrder.isPending} disabled={!ticket?.available} /></View> : null}
        {pending && !expired ? <Status color="#F59E0B" title="Paiement en attente" detail={secondsLeft === null ? 'Confirmation du fournisseur en attente.' : `Réservation valable encore ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}.`} /> : null}
        {(order?.status === 'PAID' || order?.status === 'ISSUED') ? <Status color="#22C55E" title="Commande confirmée" detail="La confirmation provient du backend." /> : null}
        {failed ? <Status color="#EF4444" title="Paiement échoué" detail="Aucun billet valide ne sera émis." /> : null}
        {expired ? <Status color="#EF4444" title="Commande expirée" detail="La réservation serveur a expiré. Rechargez les disponibilités." /> : null}
        <Text className="mt-3 text-center text-xs" style={{ color: colors.textMuted }}>Le montant de la commande et son statut sont toujours déterminés par le serveur.</Text>
      </View>
    </SafeScreen>
  );
}

function Status({ color, title, detail }: { color: string; title: string; detail: string }) {
  return <View className="mt-5 rounded-xl border p-4" style={{ borderColor: color }}><Text className="font-bold" style={{ color }}>{title}</Text><Text className="mt-1 text-xs" style={{ color }}>{detail}</Text></View>;
}
