import { useMemo, useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { NativeMap, NativeMarker, PROVIDER_GOOGLE } from '@/components/maps/NativeMap';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { SearchSelect, type SearchSelectItem } from '@/components/ui/SearchSelect';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateStore } from '@/features/create/create.store';
import { usePlaces } from '@/features/places/usePlaces';
import { useThemeStore } from '@/features/theme/theme.store';

type LocationMode = 'YEYAMO_PLACE' | 'CUSTOM_LOCATION';
type Coordinates = { latitude: number; longitude: number };
const neutralMapRegion = { latitude: 0, longitude: 0, latitudeDelta: 80, longitudeDelta: 80 };

function asCoordinates(latitude?: string, longitude?: string): Coordinates | null {
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);
  return Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude) ? { latitude: parsedLatitude, longitude: parsedLongitude } : null;
}

export default function EventLocationScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const initial = useRef(useCreateStore.getState().eventForm).current;
  const setEventForm = useCreateStore((state) => state.setEventForm);
  const [mode, setMode] = useState<LocationMode>(initial.location_mode ?? 'YEYAMO_PLACE');
  const [query, setQuery] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState(initial.location_mode === 'YEYAMO_PLACE' ? initial.location ?? '' : '');
  const [selectedPlaceLabel, setSelectedPlaceLabel] = useState(initial.location_mode === 'YEYAMO_PLACE' ? initial.location_label ?? '' : '');
  const [selectedPlaceAddress, setSelectedPlaceAddress] = useState(initial.location_mode === 'YEYAMO_PLACE' ? initial.location_address ?? '' : '');
  const [locationName, setLocationName] = useState(initial.location_mode === 'CUSTOM_LOCATION' ? initial.location ?? '' : '');
  const [locationAddress, setLocationAddress] = useState(initial.location_mode === 'CUSTOM_LOCATION' ? initial.location_address ?? '' : '');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(asCoordinates(initial.latitude, initial.longitude));
  const [date, setDate] = useState(initial.date ?? '');
  const [time, setTime] = useState(initial.time ?? '');
  const [endTime, setEndTime] = useState(initial.end_time ?? '');
  const places = usePlaces({ search: query.trim().length >= 2 ? query.trim() : undefined });
  const placeItems = useMemo<SearchSelectItem[]>(() => (places.data?.pages.flatMap((page) => page.data) ?? []).map((place) => ({
    id: String(place.id),
    label: place.name,
    description: [place.category, place.city, place.address].filter(Boolean).join(' · ') || undefined,
  })), [places.data]);

  const selectPlace = (item: SearchSelectItem) => {
    setSelectedPlaceId(item.id);
    setSelectedPlaceLabel(item.label);
    setSelectedPlaceAddress(item.description ?? '');
    setQuery('');
  };

  const continueToOrganisation = () => {
    if (mode === 'YEYAMO_PLACE' && !selectedPlaceId) {
      Alert.alert('Lieu requis', 'Recherchez puis choisissez un lieu Yeyamo, ou ajoutez un lieu personnalisé.');
      return;
    }
    if (mode === 'CUSTOM_LOCATION' && (!locationName.trim() || !locationAddress.trim() || !coordinates)) {
      Alert.alert('Localisation incomplète', 'Indiquez le nom, l’adresse puis positionnez le lieu sur la carte.');
      return;
    }
    if (!date || !time || !endTime) {
      Alert.alert('Horaire requis', 'Choisissez la date, l’heure de début et l’heure de fin.');
      return;
    }
    if (new Date(`${date}T${endTime}:00`) <= new Date(`${date}T${time}:00`)) {
      Alert.alert('Horaire invalide', 'L’heure de fin doit être postérieure à l’heure de début.');
      return;
    }

    setEventForm(mode === 'YEYAMO_PLACE'
      ? { location_mode: mode, location: selectedPlaceId, location_label: selectedPlaceLabel, location_address: selectedPlaceAddress, latitude: undefined, longitude: undefined, date, time, end_time: endTime }
      : { location_mode: mode, location: locationName.trim(), location_label: locationName.trim(), location_address: locationAddress.trim(), latitude: String(coordinates?.latitude), longitude: String(coordinates?.longitude), date, time, end_time: endTime });
    router.push('/(create)/event-organization');
  };

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={continueToOrganisation} />}>
    <YeyamoFormProgress currentStep={2} totalSteps={5} label="Créer une sortie" />
    <YeyamoFormStep title="Où et quand ?" description="Choisissez un lieu déjà présent sur Yeyamo ou ajoutez une localisation qui sera utilisée seulement pour cette sortie.">
      <View className="gap-5">
        <View className="flex-row gap-3">
          <LocationModeCard active={mode === 'YEYAMO_PLACE'} title="Lieu Yeyamo" description="Rechercher un lieu existant" onPress={() => setMode('YEYAMO_PLACE')} />
          <LocationModeCard active={mode === 'CUSTOM_LOCATION'} title="Lieu personnalisé" description="Pour cette sortie uniquement" onPress={() => setMode('CUSTOM_LOCATION')} />
        </View>

        {mode === 'YEYAMO_PLACE' ? <View className="gap-3">
          {selectedPlaceId ? <View className="rounded-2xl border p-4" style={{ borderColor: colors.primary, backgroundColor: colors.accentSoft }}>
            <Text className="text-sm font-bold" style={{ color: colors.text }}>{selectedPlaceLabel}</Text>
            {selectedPlaceAddress ? <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{selectedPlaceAddress}</Text> : null}
            <Button label="Changer de lieu" variant="ghost" size="sm" fullWidth={false} onPress={() => { setSelectedPlaceId(''); setSelectedPlaceLabel(''); setSelectedPlaceAddress(''); }} />
          </View> : <SearchSelect label="Rechercher un lieu" query={query} onQueryChange={setQuery} items={placeItems} onSelect={selectPlace} placeholder="Nom du parc, restaurant, musée…" helperText="Saisissez au moins deux caractères." isLoading={places.isFetching} error={places.isError ? 'La recherche de lieux est indisponible.' : undefined} emptyMessage="Aucun lieu trouvé. Vous pouvez ajouter un lieu personnalisé." />}
        </View> : <View className="gap-4">
          <Input label="Nom du lieu *" value={locationName} onChangeText={setLocationName} placeholder="Ex. Point de rendez-vous Bonanjo" autoCapitalize="words" returnKeyType="next" />
          <Input label="Adresse ou indication *" value={locationAddress} onChangeText={setLocationAddress} placeholder="Ex. Entrée principale, avenue…" autoCapitalize="sentences" returnKeyType="done" />
          <View className="h-60 overflow-hidden rounded-2xl border" style={{ borderColor: colors.border }}>
            <NativeMap provider={PROVIDER_GOOGLE} style={{ flex: 1 }} initialRegion={coordinates ? { latitude: coordinates.latitude, longitude: coordinates.longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 } : neutralMapRegion} onPress={(event: { nativeEvent: { coordinate: Coordinates } }) => setCoordinates(event.nativeEvent.coordinate)}>
              {coordinates ? <NativeMarker coordinate={coordinates} pinColor={colors.primary} draggable onDragEnd={(event: { nativeEvent: { coordinate: Coordinates } }) => setCoordinates(event.nativeEvent.coordinate)} /> : null}
            </NativeMap>
            <View className="absolute left-3 right-3 top-3 rounded-xl p-3" style={{ backgroundColor: colors.surfaceGlassStrong }}>
              <Text className="text-xs font-semibold" style={{ color: colors.text }}>{coordinates ? 'Position choisie' : 'Touchez la carte pour positionner le lieu. Aucune ville n’est présélectionnée.'}</Text>
            </View>
          </View>
          <Text className="text-xs leading-5" style={{ color: colors.textSecondary }}>Cette localisation ne crée pas un lieu public Yeyamo. Pour proposer un lieu à la communauté, utilisez « Suggérer un lieu ».</Text>
        </View>}

        <View className="border-t pt-5" style={{ borderColor: colors.border }}>
          <Text className="mb-4 text-base font-bold" style={{ color: colors.text }}>Horaire de la sortie</Text>
          <DateTimeField label="Date" value={date} onChange={setDate} mode="date" required minimumDate={new Date()} />
          <View className="flex-row gap-3"><View className="flex-1"><DateTimeField label="Début" value={time} onChange={setTime} mode="time" required /></View><View className="flex-1"><DateTimeField label="Fin" value={endTime} onChange={setEndTime} mode="time" required /></View></View>
        </View>
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}

function LocationModeCard({ active, title, description, onPress }: { active: boolean; title: string; description: string; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: active }} className="flex-1 rounded-2xl border p-4" style={{ borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.accentSoft : colors.surface }}>
    <Text className="text-sm font-bold" style={{ color: colors.text }}>{title}</Text><Text className="mt-1 text-xs leading-4" style={{ color: colors.textSecondary }}>{description}</Text>
  </TouchableOpacity>;
}
