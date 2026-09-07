import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { MobileMoneyForm, type MobileMoneyPaymentValues } from '@/components/payment/MobileMoneyForm';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import {
  useActivityAvailability,
  useActivityBookingStatus,
  useCreateActivityBooking,
} from '@/features/places/usePlaceActivities';
import type { BackendBooking } from '@/features/places/types';
import { useThemeStore } from '@/features/theme/theme.store';

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

const terminalBookingStatuses = ['CONFIRMED', 'CANCELLED', 'EXPIRED', 'COMPLETED'];

export default function ActivityBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const availability = useActivityAvailability(id);
  const booking = useCreateActivityBooking();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<BackendBooking | null>(null);
  const [shouldPoll, setShouldPoll] = useState(false);
  const [pollingTimedOut, setPollingTimedOut] = useState(false);
  const bookingStatus = useActivityBookingStatus(bookingId ?? undefined, shouldPoll);
  const slots = availability.data ?? [];
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId)
    ?? slots.find((slot) => slot.available > 0)
    ?? null;
  const currentBooking = bookingStatus.data ?? createdBooking;
  const paymentPending = currentBooking?.status === 'PENDING' || currentBooking?.paymentStatus === 'PENDING';
  const paymentFailed = currentBooking?.status === 'CANCELLED' || currentBooking?.paymentStatus === 'FAILED';
  const bookingConfirmed = currentBooking?.status === 'CONFIRMED'
    || currentBooking?.status === 'COMPLETED'
    || currentBooking?.paymentStatus === 'AUTHORIZED'
    || currentBooking?.paymentStatus === 'NOT_REQUIRED';

  useEffect(() => {
    if (!shouldPoll) return undefined;
    const timer = setTimeout(() => {
      setShouldPoll(false);
      setPollingTimedOut(true);
    }, 2 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [shouldPoll]);

  useEffect(() => {
    if (currentBooking && terminalBookingStatuses.includes(currentBooking.status)) {
      setShouldPoll(false);
    }
  }, [currentBooking]);

  const submit = async (payment?: MobileMoneyPaymentValues) => {
    if (!selectedSlot || selectedSlot.available < quantity) return;
    if (selectedSlot.isPaid && !payment) return;

    try {
      const result = await booking.mutateAsync({
        slotId: selectedSlot.id,
        quantity,
        ...(payment ?? {}),
      });
      setCreatedBooking(result);
      if (result.status === 'PENDING' || result.paymentStatus === 'PENDING') {
        setBookingId(result.id);
        setPollingTimedOut(false);
        setShouldPoll(true);
        return;
      }
      Alert.alert('Réservation créée', `Votre demande porte la référence ${result.reference}.`, [
        { text: 'Voir mes réservations', onPress: () => router.replace('/(profile)/reservations') },
      ]);
    } catch {
      Alert.alert('Réservation impossible', 'La réservation n’a pas pu être créée. Réessayez dans un instant.');
    }
  };

  const resetPayment = () => {
    setBookingId(null);
    setCreatedBooking(null);
    setShouldPoll(false);
    setPollingTimedOut(false);
  };

  return (
    <SafeScreen>
      <Stack.Screen options={{ title: 'Réserver une activité' }} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-5 flex-row items-center">
          <Icon name="chevron-back" size={22} color={colors.text} />
          <Text className="ml-1 font-semibold" style={{ color: colors.text }}>Retour</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold" style={{ color: colors.text }}>Choisir un créneau</Text>
        <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
          Sélectionnez un créneau réellement disponible avant de confirmer votre réservation.
        </Text>

        {availability.isLoading ? <View className="mt-10 items-center"><ActivityIndicator color={colors.primary} /></View> : null}
        {availability.isError ? <Text className="mt-8 text-center" style={{ color: colors.textSecondary }}>Les créneaux sont indisponibles pour le moment. Réessayez plus tard.</Text> : null}
        {!availability.isLoading && !availability.isError && slots.length === 0 ? <Text className="mt-8 text-center" style={{ color: colors.textSecondary }}>Aucun créneau réservable n’est disponible actuellement.</Text> : null}
        {slots.length > 0 ? <View className="mt-6 gap-3">
          {slots.map((slot) => {
            const selectable = slot.available > 0;
            const selected = selectedSlot?.id === slot.id;
            return <TouchableOpacity key={slot.id} disabled={!selectable || Boolean(bookingId)} onPress={() => setSelectedSlotId(slot.id)} className="rounded-2xl border p-4" style={{ backgroundColor: selected ? colors.elevated : colors.card, borderColor: selected ? colors.primary : colors.border, opacity: selectable ? 1 : 0.55 }}>
              <Text className="font-bold" style={{ color: colors.text }}>{formatDate(slot.startsAt)}</Text>
              <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>Jusqu’au {formatDate(slot.endsAt)}</Text>
              <Text className="mt-2 text-sm font-semibold" style={{ color: colors.text }}>{slot.available} place(s) disponible(s) · {slot.isPaid ? `${slot.amount.toLocaleString()} ${slot.currency ?? ''}` : 'Gratuit'}</Text>
            </TouchableOpacity>;
          })}
        </View> : null}

        {selectedSlot ? <View className="mt-7 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="font-bold" style={{ color: colors.text }}>Nombre de participants</Text>
          <View className="mt-3 flex-row items-center gap-4">
            <TouchableOpacity disabled={Boolean(bookingId)} onPress={() => setQuantity((current) => Math.max(1, current - 1))} className="h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: colors.border }}><Text style={{ color: colors.text }}>−</Text></TouchableOpacity>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>{quantity}</Text>
            <TouchableOpacity disabled={Boolean(bookingId) || quantity >= selectedSlot.available} onPress={() => setQuantity((current) => Math.min(selectedSlot.available, current + 1))} className="h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: colors.border, opacity: quantity >= selectedSlot.available ? 0.5 : 1 }}><Text style={{ color: colors.text }}>+</Text></TouchableOpacity>
          </View>

          {!bookingId && selectedSlot.isPaid ? <View className="mt-5"><MobileMoneyForm amount={selectedSlot.amount * quantity} currency={selectedSlot.currency ?? 'XAF'} submitLabel="Payer et réserver" isSubmitting={booking.isPending} onSubmit={submit} /></View> : null}
          {!bookingId && !selectedSlot.isPaid ? <View className="mt-5"><Button label="Confirmer la réservation" onPress={() => void submit()} isLoading={booking.isPending} /></View> : null}
          {paymentPending && !pollingTimedOut ? <BookingStatus color="#F59E0B" title="Paiement en attente" detail="Confirmez le paiement sur votre téléphone. Nous vérifions son statut toutes les 5 secondes." /> : null}
          {bookingStatus.isError && !pollingTimedOut ? <BookingStatus color="#EF4444" title="Vérification interrompue" detail="Le statut du paiement n’a pas pu être vérifié. Réessayez dans un instant." /> : null}
          {paymentFailed ? <View><BookingStatus color="#EF4444" title="Paiement échoué" detail="Aucune réservation confirmée n’a été créée." /><View className="mt-3"><Button label="Réessayer" onPress={resetPayment} /></View></View> : null}
          {pollingTimedOut ? <View><BookingStatus color="#EF4444" title="Confirmation trop longue" detail="Le paiement n’est pas encore confirmé. Vérifiez votre opération puis réessayez plus tard." /><View className="mt-3"><Button label="Réessayer" onPress={resetPayment} /></View></View> : null}
          {bookingConfirmed && bookingId ? <View><BookingStatus color="#22C55E" title="Réservation confirmée" detail="La confirmation provient du backend." /><View className="mt-3"><Button label="Voir mes réservations" onPress={() => router.replace('/(profile)/reservations')} /></View></View> : null}
        </View> : null}
      </ScrollView>
    </SafeScreen>
  );
}

function BookingStatus({ color, title, detail }: { color: string; title: string; detail: string }) {
  return <View className="mt-5 rounded-xl border p-4" style={{ borderColor: color }}><Text className="font-bold" style={{ color }}>{title}</Text><Text className="mt-1 text-xs" style={{ color }}>{detail}</Text></View>;
}
