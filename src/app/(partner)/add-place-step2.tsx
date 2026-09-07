import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { NativeMap, NativeMarker, PROVIDER_GOOGLE } from '@/components/maps/NativeMap';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { CTAButton } from '@/components/ui/CTAButton';
import { Input } from '@/components/ui/Input';
import { Stepper } from '@/components/ui/Stepper';
import { FormSelect } from '@/components/ui/FormSelect';
import { usePartnerStore } from '@/features/partner/partner.store';
import { useAuthStore } from '@/features/auth/auth.store';
import { placesApi } from '@/features/places/places.api';
import { useThemeStore } from '@/features/theme/theme.store';
import { formValidation } from '@/utils/formValidation';

const DEMO_REGION_CITIES: Record<string, string[]> = { Centre: ['Yaoundé', 'Mbalmayo', 'Obala'], Littoral: ['Douala', 'Edéa', 'Nkongsamba'], Ouest: ['Bafoussam', 'Foumban', 'Dschang'], Sud: ['Kribi', 'Ebolowa', 'Sangmélima'], 'Sud-Ouest': ['Buea', 'Limbe', 'Kumba'], 'Nord-Ouest': ['Bamenda', 'Kumbo'], Est: ['Bertoua', 'Batouri'], Adamaoua: ['Ngaoundéré'], Nord: ['Garoua'], 'Extrême-Nord': ['Maroua'] };
const DEMO_REGIONS = Object.keys(DEMO_REGION_CITIES).map((value) => ({ label: value, value }));
const MAP_CENTER = { latitude: 4.0511, longitude: 9.7679 };

export default function AddPlaceStep2Screen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const sessionMode = useAuthStore((state) => state.sessionMode);
  const isDemo = sessionMode?.startsWith('demo-') ?? false;
  const { placeForm, setPlaceForm, setPlaceStep } = usePartnerStore();
  const [useMyPosition, setUseMyPosition] = useState(placeForm.use_my_position ?? false);
  const [exactAddress, setExactAddress] = useState(placeForm.exact_address || '');
  const [regionValue, setRegionValue] = useState(placeForm.regionId ? String(placeForm.regionId) : placeForm.region || '');
  const [cityValue, setCityValue] = useState(placeForm.cityId || placeForm.city || '');
  const [landmarks, setLandmarks] = useState(placeForm.landmarks || '');
  const [coordinates, setCoordinates] = useState(placeForm.coordinates ?? MAP_CENTER);
  const [hasSelectedCoordinates, setHasSelectedCoordinates] = useState(Boolean(placeForm.coordinates));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const regions = useQuery({ queryKey: ['partner', 'place-form', isDemo ? 'demo' : 'backend', 'regions'], enabled: sessionMode === 'backend', queryFn: placesApi.regions, staleTime: 5 * 60_000 });
  const regionId = isDemo ? undefined : Number(regionValue);
  const hasRegionId = typeof regionId === 'number' && Number.isInteger(regionId) && regionId > 0;
  const cities = useQuery({ queryKey: ['partner', 'place-form', 'backend', 'cities', regionId], enabled: sessionMode === 'backend' && hasRegionId, queryFn: () => placesApi.cities(regionId ?? 0), staleTime: 5 * 60_000 });
  const regionOptions = isDemo ? DEMO_REGIONS : (regions.data ?? []).filter((region) => region.active).map((region) => ({ label: region.name, value: String(region.id) }));
  const cityOptions = isDemo
    ? (DEMO_REGION_CITIES[regionValue] ?? []).map((city) => ({ label: city, value: city }))
    : (cities.data ?? []).filter((city) => city.active).map((city) => ({ label: city.name, value: city.id }));

  const continueForm = () => {
    const selectedRegion = regionOptions.find((option) => option.value === regionValue);
    const selectedCity = cityOptions.find((option) => option.value === cityValue);
    const next = {
      address: formValidation.required(exactAddress, 'Adresse'),
      region: formValidation.required(regionValue, 'Région'),
      city: formValidation.required(cityValue, 'Ville'),
      coordinates: hasSelectedCoordinates ? undefined : 'Choisissez l’emplacement exact sur la carte.',
    };
    setErrors(next);
    const first = Object.values(next).find(Boolean);
    if (first) return Alert.alert('Localisation à vérifier', first);
    if (!isDemo && (!selectedRegion || !selectedCity)) return Alert.alert('Localisation indisponible', 'Sélectionnez une région et une ville actives fournies par le serveur.');
    setPlaceForm({
      use_my_position: useMyPosition,
      exact_address: exactAddress.trim(),
      region: selectedRegion?.label ?? regionValue,
      regionId: isDemo ? undefined : Number(regionValue),
      city: selectedCity?.label ?? cityValue,
      cityId: isDemo ? undefined : cityValue,
      landmarks: landmarks.trim(),
      coordinates,
    });
    setPlaceStep(3);
    router.push('/(partner)/add-place-step3');
  };

  const selectCoordinates = (value: { latitude: number; longitude: number }) => { setCoordinates(value); setHasSelectedCoordinates(true); };
  return <SafeScreen><Stack.Screen options={{ headerShown: false }} /><View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><View className="ml-3"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>Ajouter un lieu</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>Localisation précise</Text></View></View>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled"><Stepper currentStep={2} totalSteps={4} /><View className="mb-6 h-52 overflow-hidden rounded-2xl border" style={{ borderColor: colors.border }}><NativeMap provider={PROVIDER_GOOGLE} style={{ flex: 1 }} initialRegion={{ ...coordinates, latitudeDelta: 0.05, longitudeDelta: 0.05 }} onPress={(event) => selectCoordinates(event.nativeEvent.coordinate)}><NativeMarker coordinate={coordinates} pinColor="#EF4444" draggable onDragEnd={(event) => selectCoordinates(event.nativeEvent.coordinate)} /></NativeMap></View>
      <TouchableOpacity onPress={() => setUseMyPosition((value) => !value)} className="mb-5 flex-row items-center rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: useMyPosition ? colors.primary : colors.border }}><Icon name={useMyPosition ? 'checkbox' : 'square-outline'} size={22} color={useMyPosition ? colors.primary : colors.textMuted} /><Text className="ml-3 font-semibold" style={{ color: colors.text }}>Utiliser la position choisie sur la carte</Text></TouchableOpacity>
      <View className="gap-4"><Input label="Adresse exacte *" value={exactAddress} onChangeText={setExactAddress} error={errors.address} placeholder="Rue, quartier et numéro" multiline /><FormSelect label="Région" value={regionValue} options={regionOptions} onChange={(value) => { setRegionValue(value); setCityValue(''); }} error={errors.region} placeholder={regions.isLoading && !isDemo ? 'Chargement…' : 'Sélectionner une région'} required /><FormSelect label="Ville" value={cityValue} options={cityOptions} onChange={setCityValue} placeholder={cities.isLoading && !isDemo ? 'Chargement…' : regionValue ? 'Sélectionner une ville' : 'Choisissez d’abord une région'} error={errors.city} required />{errors.coordinates ? <Text className="text-xs" style={{ color: colors.primary }}>{errors.coordinates}</Text> : null}<Input label="Point de repère" value={landmarks} onChangeText={setLandmarks} placeholder="Ex. Près de la pharmacie du carrefour" multiline /></View>
    </ScrollView><View className="absolute bottom-0 left-0 right-0 border-t px-4 py-4" style={{ backgroundColor: colors.background, borderColor: colors.border }}><CTAButton title="Continuer" onPress={continueForm} disabled={!isDemo && (regions.isLoading || cities.isLoading)} /></View>
  </SafeScreen>;
}
