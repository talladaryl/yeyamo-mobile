import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { MobileMoneyForm, type MobileMoneyPaymentValues } from '@/components/payment/MobileMoneyForm';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { useCreateArtworkOrder, useArtworkOrders } from '@/features/artwork-orders/artwork-orders.hooks';
import { formatMoney } from '@/utils/format';

export default function ArtworkOrdersScreen() {
  const { offerId } = useLocalSearchParams<{ offerId?: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const orders = useArtworkOrders();
  const create = useCreateArtworkOrder();
  const createFromOffer = async (payment: MobileMoneyPaymentValues) => {
    if (!offerId || create.isPending) return;
    try {
      const order = await create.mutateAsync({ offerId, quantity: 1, deliveryType: 'LOCAL_DELIVERY', ...payment });
      router.replace(`/(profile)/artwork-orders/${order.id}`);
    } catch {
      // The error state below remains retryable; no local payment success is shown.
    }
  };

  return <SafeScreen><View className="flex-row items-center px-4 py-3"><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="ml-2 flex-1 text-2xl font-extrabold" style={{ color: colors.text }}>Commandes d’œuvres</Text></View>{offerId ? <View className="mx-4 mb-3 rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}><Text className="font-semibold" style={{ color: colors.text }}>Finaliser la commande</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>Le prix et la disponibilité sont confirmés par le serveur avant le cash-in.</Text><View className="mt-4"><MobileMoneyForm submitLabel="Créer la demande de paiement" isSubmitting={create.isPending} onSubmit={createFromOffer} /></View>{create.isError ? <Text className="mt-2 text-xs text-[#B91C1C]">La commande n’a pas été créée. Réessayez.</Text> : null}</View> : null}{orders.isLoading ? <View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View> : orders.isError ? <View className="flex-1 items-center justify-center"><Text style={{ color: colors.textSecondary }}>Vos commandes sont indisponibles.</Text></View> : <FlatList data={orders.data ?? []} keyExtractor={(item) => item.id} contentContainerStyle={{ padding: 16 }} renderItem={({ item }) => <TouchableOpacity onPress={() => router.push(`/(profile)/artwork-orders/${item.id}`)} className="mb-3 rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}><View className="flex-row justify-between"><Text className="font-bold" style={{ color: colors.text }}>{item.reference}</Text><Text className="text-xs font-bold text-[#EF4444]">{item.status.replace(/_/g, ' ')}</Text></View><Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>{formatMoney(item.grossAmount, item.currencyCode)}</Text></TouchableOpacity>} ListEmptyComponent={<Text className="p-8 text-center" style={{ color: colors.textSecondary }}>Aucune commande d’œuvre.</Text>} />}</SafeScreen>;
}
