import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { Button } from '@/components/ui/Button';
import { useCountryStore } from '@/features/country/country.store';
import { useCreateStore } from '@/features/create/create.store';
import { placesApi } from '@/features/places/places.api';
import { useThemeStore } from '@/features/theme/theme.store';
import { normalizeApiError } from '@/services/api/errors';

export default function SuggestPlaceReviewScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const countryCode = useCountryStore((state) => state.selectedCountryCode);
  const placeForm = useCreateStore((state) => state.placeForm);
  const resetPlaceForm = useCreateStore((state) => state.resetPlaceForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const submit = async () => {
    const coordinates = placeForm.coordinates;
    if (!placeForm.name?.trim() || !placeForm.address?.trim() || !coordinates) {
      setError('Le nom, l’adresse et la position du lieu sont requis.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await placesApi.suggestPlace({
        name: placeForm.name.trim(),
        address: [placeForm.city?.trim(), placeForm.address.trim()].filter(Boolean).join(' — '),
        description: placeForm.description?.trim() || undefined,
        category: placeForm.category?.trim() || undefined,
        placeType: placeForm.type?.trim() || undefined,
        region: placeForm.region?.trim() || undefined,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });
      setIsComplete(true);
      resetPlaceForm();
    } catch (submissionError) {
      setError(normalizeApiError(submissionError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) return <YeyamoFormScreen><View className="flex-1 items-center justify-center px-6">
    <View className="w-full rounded-3xl border p-6" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
      <Text className="text-center text-3xl">📍</Text><Text className="mt-4 text-center text-2xl font-extrabold" style={{ color: colors.text }}>Suggestion envoyée</Text>
      <Text className="mt-3 text-center text-sm leading-6" style={{ color: colors.textSecondary }}>Notre équipe pourra vérifier ce lieu avant sa publication sur Yeyamo.</Text>
      <View className="mt-6"><Button label="Retour à Explorer" onPress={() => router.replace('/(tabs)/explore')} /></View>
    </View>
  </View></YeyamoFormScreen>;

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={() => void submit()} continueLabel="Envoyer la suggestion" loading={isSubmitting} disabled={isSubmitting} />}>
    <YeyamoFormProgress currentStep={4} totalSteps={4} label="Suggérer un lieu" />
    <YeyamoFormStep title="Vérifiez votre suggestion" description="Elle sera soumise à la modération : le lieu n’est pas encore publié.">
      <View className="gap-4">
        {error ? <View className="rounded-xl border p-4" style={{ borderColor: colors.primary, backgroundColor: colors.accentSoft }}><Text className="text-sm" style={{ color: colors.text }}>{error}</Text></View> : null}
        <ReviewCard title="Le lieu" onEdit={() => router.push('/(create)/suggest-place-step1')}><ReviewRow label="Nom" value={placeForm.name || '—'} /><ReviewRow label="Catégorie" value={placeForm.category || 'Non précisée'} /><ReviewRow label="Type" value={placeForm.type || 'Non précisé'} /></ReviewCard>
        <ReviewCard title="Localisation" onEdit={() => router.push('/(create)/suggest-place-step2')}><ReviewRow label="Pays" value={countryCode ?? 'Non défini'} /><ReviewRow label="Région" value={placeForm.region || 'Non précisée'} /><ReviewRow label="Ville" value={placeForm.city || 'Non précisée'} /><ReviewRow label="Adresse" value={placeForm.address || '—'} /></ReviewCard>
        <ReviewCard title="Détails" onEdit={() => router.push('/(create)/suggest-place-details')}><ReviewRow label="Description" value={placeForm.description || 'Aucune description'} /><Text className="mt-3 text-xs leading-5" style={{ color: colors.textSecondary }}>Aucune photo n’est envoyée, car le contrat de suggestion actuel ne prévoit pas de média.</Text></ReviewCard>
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
