import { useMemo, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { NativeMap, NativeMarker, PROVIDER_GOOGLE } from '@/components/maps/NativeMap';
import { FormSelect } from '@/components/ui/FormSelect';
import { Input } from '@/components/ui/Input';
import {
  useCountryAdministrativeAreas,
  useCountryCities,
  useCountryLocalities,
} from '@/features/country/country.hooks';
import { useCountryStore } from '@/features/country/country.store';
import { useCreateStore } from '@/features/create/create.store';
import { useThemeStore } from '@/features/theme/theme.store';

type Coordinates = { latitude: number; longitude: number };
const neutralMapRegion = { latitude: 0, longitude: 0, latitudeDelta: 80, longitudeDelta: 80 };

export default function SuggestPlaceStep2Screen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const initial = useRef(useCreateStore.getState().placeForm).current;
  const setPlaceForm = useCreateStore((state) => state.setPlaceForm);
  const setPlaceStep = useCreateStore((state) => state.setPlaceStep);
  const countryCode = useCountryStore((state) => state.selectedCountryCode);
  const administrativeAreas = useCountryAdministrativeAreas(countryCode);
  const cities = useCountryCities(countryCode);
  const [administrativeAreaId, setAdministrativeAreaId] = useState(initial.administrative_area_id);
  const [region, setRegion] = useState(initial.region ?? '');
  const [city, setCity] = useState(initial.city ?? '');
  const [cityId, setCityId] = useState<string | undefined>(initial.city_id);
  const localities = useCountryLocalities(cityId ?? null);
  const [locality, setLocality] = useState(initial.locality ?? '');
  const [localityId, setLocalityId] = useState<string | undefined>(initial.locality_id);
  const [address, setAddress] = useState(initial.address ?? '');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(initial.coordinates ?? null);

  const availableCities = useMemo(
    () => (cities.data ?? []).filter((item) => item.active
      && (!administrativeAreaId || item.administrativeAreaId === administrativeAreaId)),
    [administrativeAreaId, cities.data],
  );

  const changeAdministrativeArea = (value: string) => {
    const selected = (administrativeAreas.data ?? []).find((item) => item.id === value);
    setAdministrativeAreaId(selected?.id);
    setRegion(selected?.name ?? '');
    setCity('');
    setCityId(undefined);
    setLocality('');
    setLocalityId(undefined);
  };

  const changeCity = (value: string) => {
    const selected = (cities.data ?? []).find((item) => item.id === value);
    if (!selected) return;
    setCityId(selected.id);
    setCity(selected.name);
    if (selected.administrativeAreaId) {
      const parent = (administrativeAreas.data ?? []).find((item) => item.id === selected.administrativeAreaId);
      setAdministrativeAreaId(selected.administrativeAreaId);
      setRegion(parent?.name ?? region);
    }
    setLocality('');
    setLocalityId(undefined);
  };

  const changeLocality = (value: string) => {
    const selected = (localities.data ?? []).find((item) => item.id === value);
    setLocalityId(selected?.id);
    setLocality(selected?.name ?? '');
  };

  const continueToDetails = () => {
    if (!countryCode || !address.trim() || !coordinates) {
      Alert.alert('Localisation incomplète', 'Choisissez un pays, renseignez l’adresse puis touchez la carte pour positionner le lieu.');
      return;
    }
    setPlaceForm({
      address: address.trim(),
      region,
      administrative_area_id: administrativeAreaId,
      city,
      city_id: cityId,
      locality,
      locality_id: localityId,
      coordinates,
      manual_address: true,
    });
    setPlaceStep(3);
    router.push('/(create)/suggest-place-details');
  };

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={continueToDetails} />}>
    <YeyamoFormProgress currentStep={2} totalSteps={4} label="Suggérer un lieu" />
    <YeyamoFormStep title="Où se situe ce lieu ?" description="Les identifiants de géographie proviennent du service Pays Yeyamo ; les coordonnées sont choisies sur la carte.">
      <View className="gap-4">
        <Input label="Pays" value={countryCode ?? ''} placeholder="Choisissez un pays dans vos préférences" editable={false} helperText="Le code pays sélectionné sera envoyé au backend avec la suggestion." />
        <FormSelect label="Zone administrative (facultatif)" value={administrativeAreaId} options={(administrativeAreas.data ?? []).filter((item) => item.active).map((item) => ({ label: item.name, value: item.id }))} placeholder={administrativeAreas.isLoading ? 'Chargement…' : 'Choisir une zone'} onChange={changeAdministrativeArea} />
        {administrativeAreas.isError ? <Text className="-mt-3 text-xs" style={{ color: colors.textSecondary }}>Les zones administratives sont momentanément indisponibles. Elles restent facultatives.</Text> : null}
        <FormSelect label="Ville (facultatif)" value={cityId} options={availableCities.map((item) => ({ label: item.name, value: item.id }))} placeholder={cities.isLoading ? 'Chargement des villes…' : 'Choisir une ville'} onChange={changeCity} />
        {cities.isError ? <Text className="-mt-3 text-xs" style={{ color: colors.textSecondary }}>Les villes sont momentanément indisponibles. Elles restent facultatives.</Text> : null}
        <FormSelect label="Quartier / localité (facultatif)" value={localityId} options={(localities.data ?? []).filter((item) => item.active).map((item) => ({ label: item.name, value: item.id }))} placeholder={!cityId ? 'Choisissez d’abord une ville' : localities.isLoading ? 'Chargement des localités…' : 'Choisir une localité'} onChange={changeLocality} />
        <Input label="Adresse ou indication *" value={address} onChangeText={setAddress} placeholder="Ex. Avenue de la Liberté, entrée principale" multiline maxLength={250} returnKeyType="done" blurOnSubmit={false} />
        <View className="h-60 overflow-hidden rounded-2xl border" style={{ borderColor: colors.border }}>
          <NativeMap provider={PROVIDER_GOOGLE} style={{ flex: 1 }} initialRegion={coordinates ? { ...coordinates, latitudeDelta: 0.08, longitudeDelta: 0.08 } : neutralMapRegion} onPress={(event: { nativeEvent: { coordinate: Coordinates } }) => setCoordinates(event.nativeEvent.coordinate)}>
            {coordinates ? <NativeMarker coordinate={coordinates} pinColor={colors.primary} draggable onDragEnd={(event: { nativeEvent: { coordinate: Coordinates } }) => setCoordinates(event.nativeEvent.coordinate)} /> : null}
          </NativeMap>
          <View className="absolute left-3 right-3 top-3 rounded-xl p-3" style={{ backgroundColor: colors.surfaceGlassStrong }}><Text className="text-xs font-semibold" style={{ color: colors.text }}>{coordinates ? 'Position choisie' : 'Position initiale neutre : touchez la carte pour placer le repère'}</Text></View>
        </View>
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}
