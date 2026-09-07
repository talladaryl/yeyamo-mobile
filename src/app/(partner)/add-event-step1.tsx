import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { CTAButton } from '@/components/ui/CTAButton';
import { Input } from '@/components/ui/Input';
import { Stepper } from '@/components/ui/Stepper';
import { FormSelect } from '@/components/ui/FormSelect';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { usePartnerStore } from '@/features/partner/partner.store';
import { useMyPartnerPlaces } from '@/features/partner/partner-places.hooks';
import { useThemeStore } from '@/features/theme/theme.store';
import { formValidation } from '@/utils/formValidation';

const CATEGORIES = ['Musique', 'Culture', 'Gastronomie', 'Sport', 'Business', 'Communauté'].map((value) => ({ label: value, value }));
const TYPES = ['Concert', 'Festival', 'Atelier', 'Conférence', 'Exposition', 'Rencontre'].map((value) => ({ label: value, value }));

export default function AddEventStep1Screen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { eventForm, setEventForm, setEventStep } = usePartnerStore();
  const myPlaces = useMyPartnerPlaces();
  const [name, setName] = useState(eventForm.name || '');
  const [category, setCategory] = useState(eventForm.category || '');
  const [placeId, setPlaceId] = useState(eventForm.placeId || '');
  const [type, setType] = useState(eventForm.type || '');
  const [startDate, setStartDate] = useState(eventForm.start_date || '');
  const [startTime, setStartTime] = useState(eventForm.start_time || '');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const placeOptions = (myPlaces.data ?? []).map((place) => ({
    label: place.name,
    value: place.id,
    description: place.status,
  }));
  const hasNoPlaces = !myPlaces.isLoading && !myPlaces.isError && placeOptions.length === 0;

  const continueForm = () => {
    const selectedPlace = myPlaces.data?.find((place) => place.id === placeId);
    const next = {
      name: formValidation.required(name, 'Nom'),
      place: formValidation.required(placeId, 'Lieu associé'),
      category: formValidation.required(category, 'Catégorie'),
      type: formValidation.required(type, 'Type'),
      startDate: formValidation.date(startDate, 'Date de début', true),
      startTime: formValidation.required(startTime, 'Heure de début'),
    };
    setErrors(next);
    const first = Object.values(next).find(Boolean);
    if (first) return Alert.alert('Événement à vérifier', first);
    if (!selectedPlace) return Alert.alert('Lieu indisponible', 'Sélectionnez un lieu publié appartenant à votre compte.');

    setEventForm({
      name: name.trim(),
      location: selectedPlace.name,
      category,
      place: selectedPlace.name,
      placeId,
      type,
      start_date: startDate,
      start_time: startTime,
    });
    setEventStep(2);
    router.push('/(partner)/add-event-step2');
  };

  return <SafeScreen><Stack.Screen options={{ headerShown: false }} />
    <View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}>
      <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity>
      <View className="ml-3"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>Ajouter un événement</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>Informations principales</Text></View>
    </View>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
      <Stepper currentStep={1} totalSteps={4} />
      <View className="gap-4">
        <Input label="Nom de l’événement *" value={name} onChangeText={setName} error={errors.name} placeholder="Ex. Festival des cultures" autoCapitalize="sentences" />
        <FormSelect label="Lieu associé" value={placeId} options={placeOptions} onChange={setPlaceId} error={errors.place} placeholder={myPlaces.isLoading ? 'Chargement des lieux…' : 'Sélectionner un lieu publié'} required />
        {myPlaces.isError ? <Text className="text-xs" style={{ color: colors.primary }}>Impossible de charger vos lieux. Réessayez plus tard.</Text> : null}
        {hasNoPlaces ? <View className="rounded-xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="text-sm font-semibold" style={{ color: colors.text }}>Aucun lieu publié</Text>
          <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>Créez puis faites publier un lieu avant de créer un événement.</Text>
          <TouchableOpacity className="mt-3 self-start" onPress={() => router.push('/(partner)/add-place-step1')} accessibilityRole="link"><Text className="text-sm font-bold" style={{ color: colors.primary }}>Créer un lieu</Text></TouchableOpacity>
        </View> : null}
        <FormSelect label="Catégorie" value={category} options={CATEGORIES} onChange={setCategory} error={errors.category} required />
        <FormSelect label="Type d’événement" value={type} options={TYPES} onChange={setType} error={errors.type} required />
        <DateTimeField label="Date de début" value={startDate} onChange={setStartDate} minimumDate={new Date()} error={errors.startDate} required />
        <DateTimeField label="Heure de début" value={startTime} onChange={setStartTime} mode="time" error={errors.startTime} required />
      </View>
    </ScrollView>
    <View className="absolute bottom-0 left-0 right-0 border-t px-4 py-4" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
      <CTAButton title="Continuer" onPress={continueForm} disabled={myPlaces.isLoading || hasNoPlaces} />
    </View>
  </SafeScreen>;
}
