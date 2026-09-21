import { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { NativeMap, NativeMarker, PROVIDER_GOOGLE } from '@/components/maps/NativeMap';
import { FormSelect } from '@/components/ui/FormSelect';
import { Input } from '@/components/ui/Input';
import { useCountryStore } from '@/features/country/country.store';
import { useCreateStore } from '@/features/create/create.store';
import { usePlaceCities, usePlaceRegions } from '@/features/places/placeReferences.hooks';
import { useThemeStore } from '@/features/theme/theme.store';

type Coordinates = { latitude: number; longitude: number };

export default function SuggestPlaceStep2Screen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const initial = useRef(useCreateStore.getState().placeForm).current;
  const setPlaceForm = useCreateStore((state) => state.setPlaceForm);
  const setPlaceStep = useCreateStore((state) => state.setPlaceStep);
  const countryCode = useCountryStore((state) => state.selectedCountryCode);
  const regions = usePlaceRegions();
  const [regionId, setRegionId] = useState<number | undefined>(initial.region_id);
  const cities = usePlaceCities(regionId);
  const [region, setRegion] = useState(initial.region ?? '');
  const [city, setCity] = useState(initial.city ?? '');
  const [cityId, setCityId] = useState<string | undefined>(initial.city_id);
  const [address, setAddress] = useState(initial.address ?? '');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(initial.coordinates ?? null);

  const changeRegion = (value: string) => {
    const selected = (regions.data ?? []).find((item) => String(item.id) === value);
    setRegionId(selected?.id);
    setRegion(selected?.name ?? '');
    setCity('');
  };

  const changeCity = (value: string) => {
    const selected = (cities.data ?? []).find((item) => item.id === value);
    setCityId(selected?.id);
    setCity(selected?.name ?? '');
  };

  const continueToDetails = () => {
    if (!address.trim() || !coordinates) {
      Alert.alert('Localisation incomplète', 'Renseignez l’adresse puis touchez la carte pour positionner le lieu.');
      return;
    }
    setPlaceForm({ address: address.trim(), region, region_id: regionId, city, city_id: cityId, coordinates, manual_address: true });
    setPlaceStep(3);
    router.push('/(create)/suggest-place-details');
  };

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={continueToDetails} />}>
    <YeyamoFormProgress currentStep={2} totalSteps={4} label="Suggérer un lieu" />
    <YeyamoFormStep title="Où se situe ce lieu ?" description="Les coordonnées nécessaires à la suggestion sont choisies sur la carte, jamais saisies manuellement.">
      <View className="gap-4">
        <Input label="Pays" value={countryCode ?? ''} placeholder="Pays défini dans votre profil" editable={false} helperText="Le contrat de suggestion actuel ne transmet pas encore le pays séparément." />
        <FormSelect label="Région" value={regionId ? String(regionId) : undefined} options={(regions.data ?? []).filter((item) => item.active).map((item) => ({ label: item.name, value: String(item.id) }))} placeholder={regions.isLoading ? 'Chargement des régions…' : 'Choisir une région'} onChange={changeRegion} />
        {regions.isError ? <Text className="-mt-3 text-xs" style={{ color: colors.textSecondary }}>Les régions sont indisponibles. Vous pouvez toutefois préciser l’adresse.</Text> : null}
        <FormSelect label="Ville (facultatif)" value={(cities.data ?? []).find((item) => item.name === city)?.id} options={(cities.data ?? []).filter((item) => item.active).map((item) => ({ label: item.name, value: item.id }))} placeholder={!regionId ? 'Choisissez d’abord une région' : cities.isLoading ? 'Chargement des villes…' : 'Choisir une ville'} onChange={changeCity} />
        <Input label="Adresse ou indication *" value={address} onChangeText={setAddress} placeholder="Ex. Avenue de la Liberté, entrée principale" multiline maxLength={250} returnKeyType="done" blurOnSubmit={false} />
        <View className="h-60 overflow-hidden rounded-2xl border" style={{ borderColor: colors.border }}>
          <NativeMap provider={PROVIDER_GOOGLE} style={{ flex: 1 }} initialRegion={{ latitude: coordinates?.latitude ?? 4.0511, longitude: coordinates?.longitude ?? 9.7679, latitudeDelta: 0.08, longitudeDelta: 0.08 }} onPress={(event: { nativeEvent: { coordinate: Coordinates } }) => setCoordinates(event.nativeEvent.coordinate)}>
            {coordinates ? <NativeMarker coordinate={coordinates} pinColor={colors.primary} draggable onDragEnd={(event: { nativeEvent: { coordinate: Coordinates } }) => setCoordinates(event.nativeEvent.coordinate)} /> : null}
          </NativeMap>
          <View className="absolute left-3 right-3 top-3 rounded-xl p-3" style={{ backgroundColor: colors.surfaceGlassStrong }}><Text className="text-xs font-semibold" style={{ color: colors.text }}>{coordinates ? 'Position choisie' : 'Touchez la carte pour placer le repère'}</Text></View>
        </View>
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}
