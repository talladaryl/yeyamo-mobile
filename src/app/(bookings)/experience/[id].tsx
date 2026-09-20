import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MobileMoneyForm, type MobileMoneyPaymentValues } from '@/components/payment/MobileMoneyForm';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { experiencesApi } from '@/features/experiences/experiences.api';
import { useActivityAvailability, useActivityBookingStatus, useCreateActivityBooking } from '@/features/places/usePlaceActivities';
import type { BackendBooking } from '@/features/places/types';
import { useThemeStore } from '@/features/theme/theme.store';

const terminalStatuses = ['CONFIRMED', 'CANCELLED', 'EXPIRED', 'COMPLETED'];
const formatDate = (value: string) => new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

export default function ExperienceBooking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const experience = useQuery({ queryKey: ['experience', id], queryFn: () => experiencesApi.detail(id!), enabled: Boolean(id) });
  const availability = useActivityAvailability(id);
  const booking = useCreateActivityBooking();
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<BackendBooking | null>(null);
  const [shouldPoll, setShouldPoll] = useState(false);
  const [pollingTimedOut, setPollingTimedOut] = useState(false);
  const status = useActivityBookingStatus(bookingId ?? undefined, shouldPoll);
  const slots = (availability.data ?? []).filter((slot) => slot.activityType === 'EXPERIENCE');
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) ?? slots.find((slot) => slot.available > 0) ?? null;
  const current = status.data ?? createdBooking;
  const pending = current?.status === 'PENDING' || current?.paymentStatus === 'PENDING';
  const failed = current?.status === 'CANCELLED' || current?.paymentStatus === 'FAILED';
  const confirmed = current?.status === 'CONFIRMED' || current?.status === 'COMPLETED' || current?.paymentStatus === 'AUTHORIZED' || current?.paymentStatus === 'NOT_REQUIRED';

  useEffect(() => {
    if (!shouldPoll) return undefined;
    const timeout = setTimeout(() => { setShouldPoll(false); setPollingTimedOut(true); }, 2 * 60 * 1000);
    return () => clearTimeout(timeout);
  }, [shouldPoll]);
  useEffect(() => { if (current && terminalStatuses.includes(current.status)) setShouldPoll(false); }, [current]);
  useEffect(() => { if (selectedSlot && quantity > selectedSlot.available) setQuantity(Math.max(1, selectedSlot.available)); }, [quantity, selectedSlot]);

  const submit = async (payment?: MobileMoneyPaymentValues) => {
    if (!selectedSlot || selectedSlot.available < quantity || (selectedSlot.isPaid && !payment)) return;
    try {
      const result = await booking.mutateAsync({ slotId: selectedSlot.id, quantity, ...(payment ?? {}) });
      setCreatedBooking(result);
      if (result.status === 'PENDING' || result.paymentStatus === 'PENDING') {
        setBookingId(result.id); setPollingTimedOut(false); setShouldPoll(true); return;
      }
      Alert.alert('Réservation créée', `Votre référence est ${result.reference}.`, [{ text: 'Voir mes réservations', onPress: () => router.replace('/(profile)/reservations') }]);
    } catch (error) {
      Alert.alert('Réservation impossible', error instanceof Error ? error.message : 'Réessayez dans un instant.');
    }
  };
  const resetPayment = () => { setBookingId(null); setCreatedBooking(null); setShouldPoll(false); setPollingTimedOut(false); };

  if (experience.isLoading || availability.isLoading) return <SafeScreen><View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View></SafeScreen>;
  if (experience.isError || !experience.data) return <SafeScreen><View className="flex-1 items-center justify-center px-8"><Text className="text-center" style={{ color: colors.textSecondary }}>Cette expérience est indisponible pour le moment.</Text><Button label="Retour" onPress={() => router.back()} /></View></SafeScreen>;
  const media = experiencesApi.mediaUrls(experience.data.mediaIds)[0];
  return <SafeScreen><Stack.Screen options={{ title: 'Réserver une expérience' }} /><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
    <View className="flex-row items-center px-4 py-3"><TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="ml-2 text-xl font-extrabold" style={{ color: colors.text }}>Réserver</Text></View>
    {media ? <Image source={{ uri: media }} style={{ height: 210, width: '100%' }} contentFit="cover" /> : null}
    <View className="px-5 pt-5"><Text className="text-2xl font-extrabold" style={{ color: colors.text }}>{experience.data.name}</Text><Text className="mt-1" style={{ color: colors.textSecondary }}>{experience.data.address ?? experience.data.city ?? 'Lieu à confirmer'}</Text>
      {availability.isError ? <Text className="mt-8 text-center" style={{ color: colors.textSecondary }}>Les créneaux sont indisponibles pour le moment. Réessayez plus tard.</Text> : null}
      {!availability.isError && slots.length === 0 ? <Text className="mt-8 text-center" style={{ color: colors.textSecondary }}>Aucun créneau d’expérience réservable n’est disponible actuellement.</Text> : null}
      {slots.length ? <View className="mt-6 gap-3">{slots.map((slot) => { const select = selectedSlot?.id === slot.id; const possible = slot.available > 0; return <TouchableOpacity key={slot.id} disabled={!possible || Boolean(bookingId)} onPress={() => setSelectedSlotId(slot.id)} className="rounded-2xl border p-4" style={{ backgroundColor: select ? colors.elevated : colors.card, borderColor: select ? colors.primary : colors.border, opacity: possible ? 1 : .55 }}><Text className="font-bold" style={{ color: colors.text }}>{formatDate(slot.startsAt)}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>Jusqu’au {formatDate(slot.endsAt)}</Text><Text className="mt-2 text-sm font-semibold" style={{ color: colors.text }}>{slot.available} place(s) disponible(s) · {slot.isPaid ? `${slot.amount.toLocaleString('fr-FR')} ${slot.currency ?? ''}` : 'Gratuit'}</Text></TouchableOpacity>; })}</View> : null}
      {selectedSlot ? <View className="mt-7 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="font-bold" style={{ color: colors.text }}>Nombre de participants</Text><View className="mt-3 flex-row items-center gap-4"><TouchableOpacity disabled={Boolean(bookingId)} onPress={() => setQuantity((value) => Math.max(1, value - 1))} className="h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: colors.border }}><Text style={{ color: colors.text }}>−</Text></TouchableOpacity><Text className="text-lg font-bold" style={{ color: colors.text }}>{quantity}</Text><TouchableOpacity disabled={Boolean(bookingId) || quantity >= selectedSlot.available} onPress={() => setQuantity((value) => Math.min(selectedSlot.available, value + 1))} className="h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: colors.border }}><Text style={{ color: colors.text }}>+</Text></TouchableOpacity></View>
        {!bookingId && selectedSlot.isPaid ? <View className="mt-5"><MobileMoneyForm amount={selectedSlot.amount * quantity} currency={selectedSlot.currency ?? 'XAF'} submitLabel="Payer et réserver" isSubmitting={booking.isPending} onSubmit={submit} /></View> : null}
        {!bookingId && !selectedSlot.isPaid ? <View className="mt-5"><Button label="Confirmer la réservation" onPress={() => void submit()} isLoading={booking.isPending} /></View> : null}
        {pending && !pollingTimedOut ? <Status color="#F59E0B" title="Paiement en attente" detail="Confirmez le paiement sur votre téléphone ; le statut est vérifié auprès du backend." /> : null}
        {status.isError && !pollingTimedOut ? <Status color="#EF4444" title="Vérification interrompue" detail="Le statut du paiement ne peut pas être vérifié actuellement." /> : null}
        {failed ? <View><Status color="#EF4444" title="Paiement échoué" detail="Aucune réservation confirmée n’a été créée." /><View className="mt-3"><Button label="Réessayer" onPress={resetPayment} /></View></View> : null}
        {pollingTimedOut ? <View><Status color="#EF4444" title="Confirmation trop longue" detail="Vérifiez l’opération puis consultez vos réservations avant de réessayer." /><View className="mt-3"><Button label="Réessayer" onPress={resetPayment} /></View></View> : null}
        {confirmed && bookingId ? <View><Status color="#22C55E" title="Réservation confirmée" detail="La confirmation provient du backend." /><View className="mt-3"><Button label="Voir mes réservations" onPress={() => router.replace('/(profile)/reservations')} /></View></View> : null}
      </View> : null}
    </View>
  </ScrollView></SafeScreen>;
}

function Status({ color, title, detail }: { color: string; title: string; detail: string }) { return <View className="mt-5 rounded-xl border p-4" style={{ borderColor: color }}><Text className="font-bold" style={{ color }}>{title}</Text><Text className="mt-1 text-xs" style={{ color }}>{detail}</Text></View>; }
