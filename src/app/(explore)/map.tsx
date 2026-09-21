import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { NativeMap, NativeMarker, PROVIDER_GOOGLE, type NativeMapRef } from '@/components/maps/NativeMap';
import { Icon } from '@/components/ui/Icon';
import type { MapPlace } from '@/features/explore/types';
import { useThemeStore } from '@/features/theme/theme.store';
import { usePlaces } from '@/features/places/usePlaces';
import { useLocation } from '@/hooks/useLocation';
import { useAuthStore } from '@/features/auth/auth.store';

const MAP_RADIUS_OPTIONS_KM = [10, 25, 50, 100] as const;
// A visual fallback only. It is never represented as the user's position and
// it never triggers a nearby-place query without an actual device location.
const FALLBACK_REGION = { latitude: 4.0511, longitude: 9.7679, latitudeDelta: 7.5, longitudeDelta: 7.5 };

export default function MapScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  const [radiusKm, setRadiusKm] = useState<(typeof MAP_RADIUS_OPTIONS_KM)[number]>(25);
  const [mapReady, setMapReady] = useState(false);
  const [mapLoadTimedOut, setMapLoadTimedOut] = useState(false);
  const mapRef = useRef<NativeMapRef>(null);
  const { location: currentLocation, error: locationError, isLoading: isLocationLoading, requestLocation } = useLocation();
  const searchLocation = currentLocation;
  const placesQuery = usePlaces({ lat: searchLocation?.latitude, lng: searchLocation?.longitude, radius_km: radiusKm });
  const mapPlaces = useMemo<MapPlace[]>(() =>
    (placesQuery.data?.pages.flatMap((page) => page.data) ?? [])
      .filter((place): place is typeof place & { lat: number; lng: number } => Number.isFinite(place.lat) && Number.isFinite(place.lng))
      .map((place) => ({
        id: place.id,
        name: place.name,
        coordinates: { latitude: place.lat, longitude: place.lng },
        rating: place.rating ?? 0,
        image_url: place.cover_image_url ?? '',
        category: place.category,
      })),
  [placesQuery.data]);

  useEffect(() => { void requestLocation(); }, [requestLocation]);
  useEffect(() => {
    if (!currentLocation) return;
    mapRef.current?.animateToRegion({ ...currentLocation, latitudeDelta: 0.04, longitudeDelta: 0.04 }, 500);
  }, [currentLocation]);
  useEffect(() => {
    if (mapReady) return undefined;
    const timeout = setTimeout(() => setMapLoadTimedOut(true), 8_000);
    return () => clearTimeout(timeout);
  }, [mapReady]);

  const recenter = async () => {
    const location = currentLocation ?? await requestLocation();
    if (location) mapRef.current?.animateToRegion({ ...location, latitudeDelta: 0.04, longitudeDelta: 0.04 }, 500);
  };
  const nextRadius = () => {
    const index = MAP_RADIUS_OPTIONS_KM.indexOf(radiusKm);
    setRadiusKm(MAP_RADIUS_OPTIONS_KM[(index + 1) % MAP_RADIUS_OPTIONS_KM.length]);
  };
  const selectedOrNoticeVisible = Boolean(selectedPlace || (!isDemo && !currentLocation));

  return <View className="flex-1" style={{ backgroundColor: colors.background }}>
    <Stack.Screen options={{ headerShown: false }} />
    <NativeMap
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      initialRegion={FALLBACK_REGION}
      showsUserLocation={Boolean(currentLocation)}
      showsMyLocationButton={false}
      onMapReady={() => { setMapReady(true); setMapLoadTimedOut(false); }}
      onPress={() => setSelectedPlace(null)}
    >
      {mapPlaces.map((place) => <NativeMarker key={String(place.id)} coordinate={place.coordinates} onPress={() => setSelectedPlace(place)}><View className="h-10 w-10 items-center justify-center rounded-full border-2" style={{ backgroundColor: colors.primary, borderColor: colors.card }}><Icon library="ionicons" name="location" size={20} color={colors.background} /></View></NativeMarker>)}
    </NativeMap>

    <SafeAreaView className="absolute left-0 right-0 top-0" pointerEvents="box-none">
      <View className="flex-row items-center justify-between px-4 pt-3">
        <MapControl onPress={() => router.back()} label="Retour"><Icon library="ionicons" name="arrow-back" size={24} color={colors.text} /></MapControl>
        <View className="flex-row gap-3"><MapControl onPress={() => router.push('/(explore)/search')} label="Rechercher"><Icon library="ionicons" name="search" size={24} color={colors.text} /></MapControl><MapControl onPress={nextRadius} label={`Changer le rayon, ${radiusKm} kilomètres`}><Text className="text-xs font-extrabold" style={{ color: colors.primary }}>{radiusKm}</Text></MapControl></View>
      </View>
    </SafeAreaView>

    {!mapReady ? <View className="absolute left-4 right-4 top-28 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="font-bold" style={{ color: colors.text }}>{mapLoadTimedOut ? 'Carte indisponible' : 'Chargement de la carte…'}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{mapLoadTimedOut ? 'La carte native ne s’est pas initialisée. Vérifiez la configuration Google Maps Android et utilisez une build native reconstruite après tout changement de clé.' : 'Initialisation du fond de carte.'}</Text></View> : null}

    {selectedPlace ? <PlacePreview place={selectedPlace} onClose={() => setSelectedPlace(null)} onOpen={() => router.push(`/(places)/${selectedPlace.id}`)} /> : null}
    {!selectedPlace && !isDemo && !currentLocation ? <LocationNotice loading={isLocationLoading} message={locationError} onRetry={() => void requestLocation()} /> : null}
    {!selectedPlace && Boolean(currentLocation) && placesQuery.isPending ? <MapNotice title="Recherche des lieux…" message="Les lieux autour de vous sont en cours de chargement." /> : null}
    {!selectedPlace && Boolean(currentLocation) && placesQuery.isError ? <MapNotice title="Lieux indisponibles" message="Les lieux n’ont pas pu être chargés. Réessayez dans quelques instants." actionLabel="Réessayer" onAction={() => void placesQuery.refetch()} /> : null}
    {!selectedPlace && Boolean(currentLocation) && !placesQuery.isPending && !placesQuery.isError && !mapPlaces.length ? <MapNotice title="Aucun lieu dans ce rayon" message="Aucun lieu avec des coordonnées n’est disponible pour ce rayon. Essayez un rayon plus large." /> : null}

    <TouchableOpacity onPress={() => void recenter()} className="absolute right-4 h-12 w-12 items-center justify-center rounded-full shadow-lg" style={{ bottom: selectedOrNoticeVisible ? 230 : 32, backgroundColor: colors.card }} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Recentrer sur ma position"><Icon library="ionicons" name="locate" size={24} color={colors.primary} /></TouchableOpacity>
  </View>;
}

function MapControl({ onPress, label, children }: { onPress: () => void; label: string; children: ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.card }} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={label}>{children}</TouchableOpacity>;
}

function MapNotice({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="absolute bottom-6 left-4 right-4 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="font-bold" style={{ color: colors.text }}>{title}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{message}</Text>{actionLabel && onAction ? <TouchableOpacity onPress={onAction} className="mt-3 self-start" accessibilityRole="button"><Text className="font-bold" style={{ color: colors.primary }}>{actionLabel}</Text></TouchableOpacity> : null}</View>;
}

function LocationNotice({ loading, message, onRetry }: { loading: boolean; message: string | null; onRetry: () => void }) {
  return <MapNotice title={loading ? 'Recherche de votre position…' : 'Localisation non disponible'} message={message ?? 'Autorisez la localisation pour afficher les lieux réels autour de vous.'} actionLabel={loading ? undefined : 'Réessayer'} onAction={onRetry} />;
}

function PlacePreview({ place, onClose, onOpen }: { place: MapPlace; onClose: () => void; onOpen: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><TouchableOpacity onPress={onOpen} activeOpacity={0.9} className="flex-row gap-3" accessibilityRole="button" accessibilityLabel={`Ouvrir ${place.name}`}>{place.image_url ? <Image source={{ uri: place.image_url }} style={{ width: 100, height: 100, borderRadius: 12 }} contentFit="cover" /> : <View className="h-[100px] w-[100px] items-center justify-center rounded-xl" style={{ backgroundColor: colors.elevated }}><Icon name="location-outline" size={26} color={colors.textMuted} /></View>}<View className="flex-1 justify-center"><Text className="mb-1 text-lg font-bold" style={{ color: colors.text }}>{place.name}</Text>{place.rating != null ? <View className="mb-2 flex-row items-center gap-1"><Icon library="ionicons" name="star" size={16} color={colors.primary} /><Text className="text-sm" style={{ color: colors.text }}>{place.rating}</Text></View> : null}<TouchableOpacity onPress={onClose} className="absolute right-0 top-0" accessibilityRole="button" accessibilityLabel="Fermer"><Icon library="ionicons" name="close" size={24} color={colors.textMuted} /></TouchableOpacity></View></TouchableOpacity></View>;
}
