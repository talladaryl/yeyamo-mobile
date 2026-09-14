import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { Button } from '@/components/ui/Button';
import { useCreateStore } from '@/features/create/create.store';
import { eventsApi } from '@/features/events/events.api';
import type { Event } from '@/features/events/types';
import { postApi } from '@/features/post/post.api';
import { useThemeStore } from '@/features/theme/theme.store';
import { normalizeApiError } from '@/services/api/errors';

function formatDateTime(date?: string, time?: string) {
  if (!date || !time) return 'À définir';
  const value = new Date(`${date}T${time}:00`);
  return Number.isNaN(value.getTime()) ? `${date} · ${time}` : `${value.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · ${time}`;
}

export default function EventReviewScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const eventForm = useCreateStore((state) => state.eventForm);
  const eventSettings = useCreateStore((state) => state.eventSettings);
  const resetEventForm = useCreateStore((state) => state.resetEventForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdEvent, setCreatedEvent] = useState<Event | null>(null);

  const submit = async () => {
    const hasCustomLocation = eventForm.location_mode === 'CUSTOM_LOCATION';
    const latitude = Number(eventForm.latitude);
    const longitude = Number(eventForm.longitude);
    if (!eventForm.title || !eventForm.location || !eventForm.date || !eventForm.time || !eventForm.end_time || !eventForm.max_participants || (hasCustomLocation && (!Number.isFinite(latitude) || !Number.isFinite(longitude)))) {
      setError('Certaines informations de la sortie sont manquantes. Revenez à l’étape concernée pour les compléter.');
      return;
    }
    const startAt = new Date(`${eventForm.date}T${eventForm.time}:00`);
    const endAt = new Date(`${eventForm.date}T${eventForm.end_time}:00`);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) {
      setError('Les horaires de la sortie ne sont pas valides.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      let coverMediaId: string | undefined;
      if (eventForm.cover_image_url) {
        const cover = new FormData();
        cover.append('file', { uri: eventForm.cover_image_url, name: 'event-cover.jpg', type: eventForm.cover_image_mime_type ?? 'image/jpeg' } as unknown as Blob);
        coverMediaId = String((await postApi.uploadMedia(cover)).data.id);
      }
      const created = await eventsApi.createEvent({
        ...(hasCustomLocation
          ? { locationName: eventForm.location, locationAddress: eventForm.location_address || eventForm.location, locationLatitude: latitude, locationLongitude: longitude }
          : { placeId: eventForm.location }),
        title: eventForm.title,
        description: eventForm.description || undefined,
        coverMediaId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        capacity: eventForm.max_participants,
        visibility: eventSettings.visibility === 'public' ? 'PUBLIC' : 'PRIVATE',
        allowUninvitedParticipants: eventSettings.allow_strangers,
        commentsParticipantsOnly: eventSettings.allow_comments_participants_only,
        showParticipants: eventSettings.show_participants_list,
        sharingEnabled: eventSettings.allow_share_outside,
      });
      setCreatedEvent(created);
      resetEventForm();
    } catch (submissionError) {
      setError(normalizeApiError(submissionError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdEvent) {
    return <YeyamoFormScreen><View className="flex-1 items-center justify-center px-6">
      <View className="w-full rounded-3xl border p-6" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
        <Text className="text-center text-3xl">🎉</Text>
        <Text className="mt-4 text-center text-2xl font-extrabold" style={{ color: colors.text }}>Sortie créée</Text>
        <Text className="mt-3 text-center text-sm leading-6" style={{ color: colors.textSecondary }}>Votre sortie est maintenant disponible sur Yeyamo.</Text>
        <View className="mt-6 gap-3"><Button label="Voir la sortie" onPress={() => router.replace(`/(events)/${createdEvent.id}` as never)} /><Button label="Retour à Explorer" variant="secondary" onPress={() => router.replace('/(tabs)/explore')} /></View>
      </View>
    </View></YeyamoFormScreen>;
  }

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={() => void submit()} continueLabel="Créer la sortie" loading={isSubmitting} disabled={isSubmitting} />}>
    <YeyamoFormProgress currentStep={5} totalSteps={5} label="Créer une sortie" />
    <YeyamoFormStep title="Vérifiez votre sortie" description="Vous pouvez revenir sur chaque section pour la modifier avant de créer la sortie.">
      <View className="gap-4">
        {eventForm.cover_image_url ? <Image source={{ uri: eventForm.cover_image_url }} style={{ width: '100%', height: 180, borderRadius: 16 }} contentFit="cover" /> : null}
        {error ? <View className="rounded-xl border p-4" style={{ borderColor: colors.primary, backgroundColor: colors.accentSoft }}><Text className="text-sm" style={{ color: colors.text }}>{error}</Text></View> : null}
        <SummaryCard title="Activité" editLabel="Modifier l’activité" onPress={() => router.push('/(create)/event')}>
          <SummaryRow label="Titre" value={eventForm.title || '—'} /><SummaryRow label="Description" value={eventForm.description || 'Aucune description'} />
        </SummaryCard>
        <SummaryCard title="Lieu et horaire" editLabel="Modifier le lieu" onPress={() => router.push('/(create)/event-location')}>
          <SummaryRow label="Lieu" value={eventForm.location_label || eventForm.location || '—'} />
          <SummaryRow label="Adresse" value={eventForm.location_address || '—'} />
          <SummaryRow label="Début" value={formatDateTime(eventForm.date, eventForm.time)} />
          <SummaryRow label="Fin" value={formatDateTime(eventForm.date, eventForm.end_time)} />
        </SummaryCard>
        <SummaryCard title="Organisation" editLabel="Modifier l’organisation" onPress={() => router.push('/(create)/event-organization')}>
          <SummaryRow label="Participants" value={`${eventForm.max_participants ?? '—'} maximum`} />
          <SummaryRow label="Inscriptions" value={eventSettings.allow_strangers ? 'Ouvertes aux personnes non invitées' : 'Sur invitation'} />
        </SummaryCard>
        <SummaryCard title="Visibilité" editLabel="Modifier la visibilité" onPress={() => router.push('/(create)/event-settings')}>
          <SummaryRow label="Visibilité" value={eventSettings.visibility === 'public' ? 'Public' : 'Sur invitation'} />
          <SummaryRow label="Partage extérieur" value={eventSettings.allow_share_outside ? 'Autorisé' : 'Désactivé'} />
          {eventForm.share_to_feed ? <Text className="mt-3 text-xs leading-5" style={{ color: colors.textSecondary }}>La préférence de partage Feed est enregistrée dans le brouillon uniquement : aucune publication n’est créée par le contrat actuel.</Text> : null}
        </SummaryCard>
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}

function SummaryCard({ title, editLabel, onPress, children }: { title: string; editLabel: string; onPress: () => void; children: React.ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
    <View className="mb-3 flex-row items-center justify-between"><Text className="text-base font-bold" style={{ color: colors.text }}>{title}</Text><TouchableOpacity onPress={onPress} accessibilityRole="button" accessibilityLabel={editLabel}><Text className="text-sm font-semibold" style={{ color: colors.primary }}>Modifier</Text></TouchableOpacity></View>
    {children}
  </View>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mb-2"><Text className="text-xs" style={{ color: colors.textMuted }}>{label}</Text><Text className="text-sm" style={{ color: colors.text }}>{value}</Text></View>;
}
