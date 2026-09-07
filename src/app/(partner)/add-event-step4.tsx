import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Stepper } from '@/components/ui/Stepper';
import { CTAButton } from '@/components/ui/CTAButton';
import { usePartnerStore } from '@/features/partner/partner.store';
import { useAuthStore } from '@/features/auth/auth.store';
import { eventsApi } from '@/features/events/events.api';
import { useThemeStore } from '@/features/theme/theme.store';

function messageFor(error: unknown) {
  return typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
    ? error.message
    : 'Impossible de créer cet événement pour le moment. Réessayez plus tard.';
}

function toIso(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export default function AddEventStep4Screen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const sessionMode = useAuthStore((state) => state.sessionMode);
  const isDemo = sessionMode?.startsWith('demo-') ?? false;
  const { eventForm, resetEventForm } = usePartnerStore();
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (isDemo) {
      resetEventForm();
      router.push('/(tabs)/explore');
      return;
    }
    if (!eventForm.placeId || !eventForm.name || !eventForm.start_date || !eventForm.start_time || !eventForm.end_date || !eventForm.end_time || !eventForm.max_seats) {
      Alert.alert('Informations incomplètes', 'Renseignez le lieu, les dates, les heures et la capacité avant de créer l’événement.');
      return;
    }
    const startAt = toIso(eventForm.start_date, eventForm.start_time);
    const endAt = toIso(eventForm.end_date, eventForm.end_time);
    if (Number.isNaN(Date.parse(startAt)) || Number.isNaN(Date.parse(endAt)) || Date.parse(endAt) <= Date.parse(startAt)) {
      Alert.alert('Période invalide', 'La fin de l’événement doit être postérieure à son début.');
      return;
    }
    setIsPublishing(true);
    try {
      await eventsApi.createEvent({
        placeId: eventForm.placeId,
        title: eventForm.name,
        description: eventForm.description || undefined,
        startAt,
        endAt,
        capacity: eventForm.max_seats,
        status: 'PENDING',
      });
      resetEventForm();
      Alert.alert('Événement envoyé', 'Votre événement a été envoyé pour validation.', [
        { text: 'Continuer', onPress: () => router.replace('/(tabs)/explore') },
      ]);
    } catch (error) {
      Alert.alert('Création impossible', messageFor(error));
    } finally {
      setIsPublishing(false);
    }
  };

  return <View className="flex-1" style={{ backgroundColor: colors.background }}><Stack.Screen options={{ headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerTitle: 'Ajouter un événement', headerTitleStyle: { fontSize: 18, fontWeight: '600' }, headerLeft: () => <TouchableOpacity onPress={() => router.back()} className="ml-4"><Icon library="ionicons" name="arrow-back" size={24} color={colors.text} /></TouchableOpacity> }} />
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}><View className="px-4 py-6"><Stepper currentStep={4} totalSteps={4} /><View className="mb-6 mt-4 items-center"><View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-[#EF4444]/20"><Icon library="ionicons" name="checkmark-circle" size={48} color="#EF4444" /></View><Text className="mb-2 text-lg font-bold" style={{ color: colors.text }}>Aperçu</Text><Text className="text-center text-sm" style={{ color: colors.textSecondary }}>Vérifiez les informations avant envoi</Text></View>
      <View className="mb-6 overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>{eventForm.cover_image_url ? <Image source={{ uri: eventForm.cover_image_url }} style={{ width: '100%', height: 192 }} contentFit="cover" /> : null}<View className="p-4"><Text className="mb-2 text-lg font-bold" style={{ color: colors.text }}>{eventForm.name || 'Événement non renseigné'}</Text><Detail label="Lieu" value={eventForm.place} /><Detail label="Début" value={eventForm.start_date && eventForm.start_time ? `${eventForm.start_date} · ${eventForm.start_time}` : undefined} /><Detail label="Fin" value={eventForm.end_date && eventForm.end_time ? `${eventForm.end_date} · ${eventForm.end_time}` : undefined} /><Detail label="Description" value={eventForm.description} />{showFullPreview ? <><Detail label="Capacité" value={eventForm.max_seats ? `${eventForm.max_seats} personnes` : undefined} /><Detail label="Statut" value="En attente de validation" /></> : null}<TouchableOpacity className="mt-4" onPress={() => setShowFullPreview((value) => !value)}><Text className="text-sm font-medium" style={{ color: colors.primary }}>{showFullPreview ? 'Voir moins' : 'Voir plus'}</Text></TouchableOpacity></View></View>
      <View className="flex-row rounded-xl border p-4" style={{ backgroundColor: colors.accentSoft, borderColor: colors.border }}><Icon library="ionicons" name="information-circle" size={20} color={colors.primary} /><Text className="ml-3 flex-1 text-xs leading-5" style={{ color: colors.textSecondary }}>L’image et les données de billetterie restent visibles dans le brouillon local : le contrat Event actuel ne les accepte pas encore.</Text></View>
    </View><View className="h-24" /></ScrollView>
    <View className="absolute bottom-0 left-0 right-0 border-t px-4 py-4" style={{ backgroundColor: colors.background, borderColor: colors.border }}><View className="flex-row gap-3"><View className="flex-1"><CTAButton title="Retour" variant="secondary" onPress={() => router.back()} disabled={isPublishing} /></View><View className="flex-1"><CTAButton title={isDemo ? 'Publier l’événement' : 'Envoyer'} onPress={handlePublish} loading={isPublishing} /></View></View></View>
  </View>;
}

function Detail({ label, value }: { label: string; value?: string }) {
  const colors = useThemeStore((state) => state.colors);
  return value ? <View className="mt-3"><Text className="mb-1 text-xs font-medium" style={{ color: colors.textSecondary }}>{label}</Text><Text className="text-sm" style={{ color: colors.text }}>{value}</Text></View> : null;
}
