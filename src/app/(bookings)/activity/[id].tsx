import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useActivityAvailability, useCreateActivityBooking } from '@/features/places/usePlaceActivities';
import { useThemeStore } from '@/features/theme/theme.store';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function ActivityBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const availability = useActivityAvailability(id);
  const booking = useCreateActivityBooking();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const slots = availability.data ?? [];
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) ?? slots.find((slot) => slot.available > 0) ?? null;

  const submit = async () => {
    if (!selectedSlot || selectedSlot.available < quantity) return;
    try {
      const result = await booking.mutateAsync({ slotId: selectedSlot.id, quantity });
      if (result.status === 'PENDING') {
        Alert.alert('En attente de paiement', 'Le paiement sera bientôt disponible. Votre créneau est réservé en attendant son règlement.');
      } else {
        Alert.alert('Réservation créée', `Votre demande porte la référence ${result.reference}.`, [
          { text: 'Voir mes réservations', onPress: () => router.replace('/(profile)/reservations') },
        ]);
      }
    } catch {
      Alert.alert('Réservation impossible', 'La réservation n’a pas pu être créée. Réessayez dans un instant.');
    }
  };

  return <SafeScreen><Stack.Screen options={{ title: 'Réserver une activité' }}/><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
    <TouchableOpacity onPress={() => router.back()} className="mb-5 flex-row items-center"><Icon name="chevron-back" size={22} color={colors.text}/><Text className="ml-1 font-semibold" style={{ color: colors.text }}>Retour</Text></TouchableOpacity>
    <Text className="text-2xl font-extrabold" style={{ color: colors.text }}>Choisir un créneau</Text>
    <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>Sélectionnez un créneau réellement disponible avant de confirmer votre réservation.</Text>
    {availability.isLoading ? <View className="mt-10 items-center"><ActivityIndicator color={colors.primary}/></View> : availability.isError ? <Text className="mt-8 text-center" style={{ color: colors.textSecondary }}>Les créneaux sont indisponibles pour le moment. Réessayez plus tard.</Text> : slots.length === 0 ? <Text className="mt-8 text-center" style={{ color: colors.textSecondary }}>Aucun créneau réservable n’est disponible actuellement.</Text> : <View className="mt-6 gap-3">{slots.map((slot) => { const selectable = slot.available > 0; const selected = selectedSlot?.id === slot.id; return <TouchableOpacity key={slot.id} disabled={!selectable} onPress={() => setSelectedSlotId(slot.id)} className="rounded-2xl border p-4" style={{ backgroundColor: selected ? colors.elevated : colors.card, borderColor: selected ? colors.primary : colors.border, opacity: selectable ? 1 : 0.55 }}><Text className="font-bold" style={{ color: colors.text }}>{formatDate(slot.startsAt)}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>Jusqu’au {formatDate(slot.endsAt)}</Text><Text className="mt-2 text-sm font-semibold" style={{ color: colors.text }}>{slot.available} place(s) disponible(s) · {slot.isPaid ? `${slot.amount.toLocaleString()} ${slot.currency ?? ''}` : 'Gratuit'}</Text></TouchableOpacity>; })}</View>}
    {selectedSlot ? <View className="mt-7 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="font-bold" style={{ color: colors.text }}>Nombre de participants</Text><View className="mt-3 flex-row items-center gap-4"><TouchableOpacity onPress={() => setQuantity((current) => Math.max(1, current - 1))} className="h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: colors.border }}><Text style={{ color: colors.text }}>−</Text></TouchableOpacity><Text className="text-lg font-bold" style={{ color: colors.text }}>{quantity}</Text><TouchableOpacity disabled={quantity >= selectedSlot.available} onPress={() => setQuantity((current) => Math.min(selectedSlot.available, current + 1))} className="h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: colors.border, opacity: quantity >= selectedSlot.available ? 0.5 : 1 }}><Text style={{ color: colors.text }}>+</Text></TouchableOpacity></View><TouchableOpacity disabled={booking.isPending} onPress={() => void submit()} className="mt-5 items-center rounded-xl bg-[#EF4444] py-4" style={{ opacity: booking.isPending ? 0.65 : 1 }}>{booking.isPending ? <ActivityIndicator color="#FFFFFF"/> : <Text className="font-bold text-white">Confirmer la réservation</Text>}</TouchableOpacity></View> : null}
  </ScrollView></SafeScreen>;
}
