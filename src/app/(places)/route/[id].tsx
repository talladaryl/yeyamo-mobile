import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { NativeMap, NativeMarker, NativePolyline, PROVIDER_GOOGLE } from '@/components/maps/NativeMap';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/features/theme/theme.store';
import { usePlaceDetail } from '@/features/places/usePlaces';
import { mapsApi, type Coordinate } from '@/features/maps/maps.api';
import { useLocation } from '@/hooks/useLocation';

function apiErrorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : undefined;
}

export default function PlaceRouteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { data: place, isLoading: isPlaceLoading } = usePlaceDetail(id);
  const { requestLocation, isLoading: isLocationLoading, error: locationError } = useLocation();
  const destination = useMemo<Coordinate | null>(() => (
    Number.isFinite(place?.lat) && Number.isFinite(place?.lng)
      ? { latitude: place!.lat!, longitude: place!.lng! }
      : null
  ), [place?.lat, place?.lng]);
  const [origin, setOrigin] = useState<Coordinate | null>(null);
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);

  const loadRoute = useCallback(async () => {
    if (!destination) return;
    setRoutingError(null);
    setRoute([]);
    setDistanceKm(null);
    setDurationMin(null);
    const location = await requestLocation();
    if (!location) return;
    const nextOrigin = { latitude: location.latitude, longitude: location.longitude };
    setOrigin(nextOrigin);
    setIsRouteLoading(true);
    try {
      const result = await mapsApi.getDirections(nextOrigin, destination, 'driving-car');
      setRoute(result.geometry);
      setDistanceKm(result.distanceMeters / 1000);
      setDurationMin(result.durationSeconds / 60);
    } catch (error: unknown) {
      setRoutingError(apiErrorCode(error) === 'ROUTING_UNAVAILABLE'
        ? 'Itinéraire temporairement indisponible.'
        : 'Impossible de calculer l’itinéraire pour le moment.');
    } finally {
      setIsRouteLoading(false);
    }
  }, [destination, requestLocation]);

  useEffect(() => { if (destination) void loadRoute(); }, [destination, loadRoute]);

  if (isPlaceLoading) {
    return <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}><ActivityIndicator color={colors.primary} /></View>;
  }
  if (!place || !destination) {
    return <View className="flex-1 items-center justify-center px-7" style={{ backgroundColor: colors.background }}><Text className="text-center" style={{ color: colors.text }}>La position de ce lieu est indisponible.</Text><TouchableOpacity onPress={() => router.back()} className="mt-5 rounded-xl px-4 py-3" style={{ backgroundColor: colors.primary }}><Text className="font-bold text-white">Retour</Text></TouchableOpacity></View>;
  }

  const mapCenter = origin ?? destination;
  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <NativeMap
        key={`${mapCenter.latitude}-${mapCenter.longitude}`}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{ latitude: mapCenter.latitude, longitude: mapCenter.longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
      >
        {origin ? <NativeMarker coordinate={origin} title="Votre position" pinColor="#7C3AED" /> : null}
        <NativeMarker coordinate={destination} title={place.name} pinColor="#EF4444" />
        {route.length > 1 ? <NativePolyline coordinates={route} strokeColor="#EF4444" strokeWidth={5} /> : null}
      </NativeMap>

      <View className="absolute left-4 right-4 top-12 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-black/70" activeOpacity={0.8}><Ionicons name="arrow-back" size={24} color="#FFFFFF" /></TouchableOpacity>
        <View className="rounded-full bg-black/70 px-4 py-2"><Text className="font-semibold text-white">Itinéraire Yeyamo</Text></View>
      </View>

      <View className="absolute bottom-8 left-4 right-4 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>{place.name}</Text>
        <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{place.address}</Text>
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: colors.elevated }}><Text className="text-xs" style={{ color: colors.textSecondary }}>Distance</Text><Text className="mt-1 font-bold" style={{ color: colors.text }}>{distanceKm === null ? '--' : `${distanceKm.toFixed(1)} km`}</Text></View>
          <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: colors.elevated }}><Text className="text-xs" style={{ color: colors.textSecondary }}>Durée</Text><Text className="mt-1 font-bold" style={{ color: colors.text }}>{durationMin === null ? '--' : `${Math.round(durationMin)} min`}</Text></View>
        </View>
        {!origin ? <Text className="mt-3 text-xs leading-5" style={{ color: colors.textSecondary }}>{locationError ?? 'Activez la localisation pour calculer votre itinéraire.'}</Text> : null}
        {routingError ? <Text className="mt-3 text-xs leading-5 text-[#B45309]">{routingError}</Text> : null}
        {(locationError || routingError) ? <TouchableOpacity onPress={() => void loadRoute()} className="mt-3 self-start rounded-xl px-4 py-2" style={{ backgroundColor: colors.primary }}><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity> : null}
      </View>
      {(isLocationLoading || isRouteLoading) ? <View className="absolute inset-0 items-center justify-center bg-black/40"><ActivityIndicator color="#EF4444" /><Text className="mt-3 text-sm text-white">Calcul de l’itinéraire…</Text></View> : null}
    </View>
  );
}
