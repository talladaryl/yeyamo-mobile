import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { Button } from '@/components/ui/Button';
import { useCountryStore } from '@/features/country/country.store';
import { useCreateStore } from '@/features/create/create.store';
import { toMediaFormData } from '@/features/media/media.utils';
import { placeSuggestionKeys } from '@/features/places/placeSuggestions.hooks';
import { placesApi, type PlaceSuggestion, type PlaceSuggestionDuplicateCandidate } from '@/features/places/places.api';
import { postApi } from '@/features/post/post.api';
import { useThemeStore } from '@/features/theme/theme.store';
import { normalizeApiError } from '@/services/api/errors';

function statusDescription(suggestion: PlaceSuggestion) {
  if (suggestion.status === 'APPROVED') return 'Votre suggestion a été approuvée par le serveur.';
  if (suggestion.status === 'REJECTED') return suggestion.moderationReason || 'Votre suggestion a été refusée par le serveur.';
  return 'Votre suggestion est en attente de modération. Elle n’est pas encore un lieu publié.';
}

export default function SuggestPlaceReviewScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = useThemeStore((state) => state.colors);
  const countryCode = useCountryStore((state) => state.selectedCountryCode);
  const placeForm = useCreateStore((state) => state.placeForm);
  const resetPlaceForm = useCreateStore((state) => state.resetPlaceForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<PlaceSuggestionDuplicateCandidate[]>([]);
  const [createdSuggestion, setCreatedSuggestion] = useState<PlaceSuggestion | null>(null);

  const submit = async () => {
    const coordinates = placeForm.coordinates;
    if (!placeForm.name?.trim() || !placeForm.address?.trim() || !coordinates || !countryCode) {
      setError('Le nom, le pays, l’adresse et la position du lieu sont requis.');
      return;
    }
    setError(null);
    setDuplicates([]);
    setIsSubmitting(true);
    const uploadedMediaIds: string[] = [];
    try {
      const duplicateCheck = await placesApi.checkPlaceSuggestionDuplicates({
        name: placeForm.name.trim(),
        address: placeForm.address.trim(),
        countryCode,
        cityId: placeForm.city_id,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
      const candidates = duplicateCheck.possibleDuplicates ?? [];
      const certain = candidates.filter((candidate) => candidate.certain);
      if (certain.length) {
        setDuplicates(candidates);
        setError('Un lieu identique existe déjà ou une suggestion identique est déjà en attente. La suggestion n’a pas été envoyée.');
        return;
      }
      setDuplicates(candidates);

      for (const [index, media] of (placeForm.media_assets ?? []).entries()) {
        const uploaded = await postApi.uploadMedia(toMediaFormData({ ...media, width: 0, height: 0 }, 'place-suggestion', index));
        uploadedMediaIds.push(String(uploaded.data.id));
      }

      const created = await placesApi.suggestPlace({
        name: placeForm.name.trim(),
        address: placeForm.address.trim(),
        description: placeForm.description?.trim() || undefined,
        category: placeForm.category?.trim() || undefined,
        placeType: placeForm.type?.trim() || undefined,
        region: placeForm.region?.trim() || undefined,
        countryCode,
        administrativeAreaId: placeForm.administrative_area_id,
        cityId: placeForm.city_id,
        localityId: placeForm.locality_id,
        mediaIds: uploadedMediaIds.length ? uploadedMediaIds : undefined,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
      setCreatedSuggestion(created);
      resetPlaceForm();
      void queryClient.invalidateQueries({ queryKey: placeSuggestionKeys.mine() });
    } catch (submissionError) {
      // Media is only an attachment candidate until place-service accepts the
      // suggestion. Remove uploads made by this failed attempt when possible.
      await Promise.allSettled(uploadedMediaIds.map((mediaId) => placesApi.deleteOwnedMedia(mediaId)));
      setError(normalizeApiError(submissionError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdSuggestion) return <YeyamoFormScreen><View className="flex-1 items-center justify-center px-6">
    <View className="w-full rounded-3xl border p-6" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
      <Text className="text-center text-3xl">📍</Text><Text className="mt-4 text-center text-2xl font-extrabold" style={{ color: colors.text }}>Suggestion envoyée</Text>
      <Text className="mt-3 text-center text-sm leading-6" style={{ color: colors.textSecondary }}>{statusDescription(createdSuggestion)}</Text>
      <Text className="mt-2 text-center text-xs" style={{ color: colors.textMuted }}>Statut serveur : {createdSuggestion.status}{createdSuggestion.media.length ? ` · ${createdSuggestion.media.length} média(s) joint(s)` : ''}</Text>
      <View className="mt-6 gap-3"><Button label="Voir mes suggestions" onPress={() => router.replace('/(profile)/place-suggestions')} /><Button label="Retour à Explorer" variant="secondary" onPress={() => router.replace('/(tabs)/explore')} /></View>
    </View>
  </View></YeyamoFormScreen>;

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={() => void submit()} continueLabel="Envoyer la suggestion" loading={isSubmitting} disabled={isSubmitting} />}>
    <YeyamoFormProgress currentStep={4} totalSteps={4} label="Suggérer un lieu" />
    <YeyamoFormStep title="Vérifiez votre suggestion" description="Le serveur vérifie d’abord les doublons et soumet ensuite le lieu à la modération.">
      <View className="gap-4">
        {error ? <View className="rounded-xl border p-4" style={{ borderColor: colors.primary, backgroundColor: colors.accentSoft }}><Text className="text-sm" style={{ color: colors.text }}>{error}</Text></View> : null}
        {duplicates.length ? <View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.surface }}><Text className="text-sm font-bold" style={{ color: colors.text }}>Doublons potentiels détectés</Text>{duplicates.map((candidate) => <View key={`${candidate.kind}-${candidate.id}`} className="mt-2"><Text className="text-sm" style={{ color: colors.text }}>{candidate.name}{candidate.certain ? ' · identique' : ' · à vérifier'}</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>{candidate.address} · {Math.round(candidate.distanceMeters)} m</Text></View>)}</View> : null}
        <ReviewCard title="Le lieu" onEdit={() => router.push('/(create)/suggest-place-step1')}><ReviewRow label="Nom" value={placeForm.name || '—'} /><ReviewRow label="Catégorie" value={placeForm.category || 'Non précisée'} /><ReviewRow label="Type" value={placeForm.type || 'Non précisé'} /></ReviewCard>
        <ReviewCard title="Localisation" onEdit={() => router.push('/(create)/suggest-place-step2')}><ReviewRow label="Pays" value={countryCode ?? 'Non défini'} /><ReviewRow label="Zone administrative" value={placeForm.region || 'Non précisée'} /><ReviewRow label="Ville" value={placeForm.city || 'Non précisée'} /><ReviewRow label="Localité" value={placeForm.locality || 'Non précisée'} /><ReviewRow label="Adresse" value={placeForm.address || '—'} /></ReviewCard>
        <ReviewCard title="Détails" onEdit={() => router.push('/(create)/suggest-place-details')}><ReviewRow label="Description" value={placeForm.description || 'Aucune description'} /><ReviewRow label="Médias" value={`${placeForm.media_assets?.length ?? 0} sélectionné(s) — uploadés seulement au moment de l’envoi`} /></ReviewCard>
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}

function ReviewCard({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.surface }}><View className="mb-3 flex-row items-center justify-between"><Text className="text-base font-bold" style={{ color: colors.text }}>{title}</Text><TouchableOpacity onPress={onEdit} accessibilityRole="button" accessibilityLabel={`Modifier ${title}`}><Text className="text-sm font-semibold" style={{ color: colors.primary }}>Modifier</Text></TouchableOpacity></View>{children}</View>;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mb-2"><Text className="text-xs" style={{ color: colors.textMuted }}>{label}</Text><Text className="text-sm" style={{ color: colors.text }}>{value}</Text></View>;
}
