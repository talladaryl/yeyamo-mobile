import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { NativeMap, NativeMarker, NativePolyline, PROVIDER_GOOGLE } from '@/components/maps/NativeMap';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/features/theme/theme.store';
import { usePlaceDetail } from '@/features/places/usePlaces';
import { mapsApi, decodePolyline } from '@/features/maps/maps.api';
import { useLocation } from '@/hooks/useLocation';

type Coordinate = {
  latitude: number;
  longitude: number;
};

const DEFAULT_ORIGIN: Coordinate = {
  latitude: 3.848,
  longitude: 11.5021,
};

export default function PlaceRouteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { data: place, isLoading: isPlaceLoading } = usePlaceDetail(id);
  const currentLocation = useLocation();
  const destination = useMemo(
    () => ({
      latitude: place?.lat ?? DEFAULT_ORIGIN.latitude,
      longitude: place?.lng ?? DEFAULT_ORIGIN.longitude,
    }),
    [place?.lat, place?.lng]
  );

  const [origin, setOrigin] = useState<Coordinate>(DEFAULT_ORIGIN);
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadRoute = async () => {
      if (!place) return;
      setIsLoading(true);
      try {
        let nextOrigin = DEFAULT_ORIGIN;
        const location = await currentLocation.requestLocation();
        if (location) {
          nextOrigin = {
            latitude: location.latitude,
            longitude: location.longitude,
          };
        }
        const result = await mapsApi.getRoute(nextOrigin, destination, 'DRIVE');

        if (!isMounted) return;

        setOrigin(nextOrigin);

        if (result.encodedPolyline) {
          setRoute(decodePolyline(result.encodedPolyline));
          setDistanceKm(result.distanceMeters / 1000);
          setDurationMin(result.durationSeconds / 60);
          setUsedFallback(false);
        } else {
          setRoute([nextOrigin, destination]);
          setUsedFallback(true);
        }
      } catch {
        if (!isMounted) return;
        setRoute([origin, destination]);
        setUsedFallback(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadRoute();

    return () => {
      isMounted = false;
    };
  }, [destination.latitude, destination.longitude, place, currentLocation.requestLocation]);

  if (isPlaceLoading || !place) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <NativeMap
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2,
          latitudeDelta: Math.max(Math.abs(origin.latitude - destination.latitude) * 1.8, 0.08),
          longitudeDelta: Math.max(Math.abs(origin.longitude - destination.longitude) * 1.8, 0.08),
        }}
      >
        <NativeMarker coordinate={origin} title="Votre position" pinColor="#7C3AED" />
        <NativeMarker coordinate={destination} title={place.name} pinColor="#EF4444" />
        {route.length > 1 ? <NativePolyline coordinates={route} strokeColor="#EF4444" strokeWidth={5} /> : null}
      </NativeMap>

      <View className="absolute top-12 left-4 right-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-black/70 items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="bg-black/70 px-4 py-2 rounded-full">
            <Text className="text-white font-semibold">Itinéraire Yeyamo</Text>
          </View>
        </View>
      </View>

      <View className="absolute left-4 right-4 bottom-8 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>{place.name}</Text>
        <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>{place.address}</Text>

        <View className="flex-row gap-3 mt-4">
          <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: colors.elevated }}>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>Distance</Text>
            <Text className="font-bold mt-1" style={{ color: colors.text }}>
              {distanceKm ? `${distanceKm.toFixed(1)} km` : usedFallback ? 'Estimation' : '--'}
            </Text>
          </View>
          <View className="flex-1 rounded-xl p-3" style={{ backgroundColor: colors.elevated }}>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>Durée</Text>
            <Text className="font-bold mt-1" style={{ color: colors.text }}>
              {durationMin ? `${Math.round(durationMin)} min` : usedFallback ? 'Non calculée' : '--'}
            </Text>
          </View>
        </View>

        {usedFallback ? (
          <Text className="text-[#F59E0B] text-xs leading-5 mt-3">
            Route détaillée indisponible. Yeyamo affiche un tracé direct temporaire.
          </Text>
        ) : null}
      </View>

      {isLoading ? (
        <View className="absolute inset-0 bg-black/40 items-center justify-center">
          <ActivityIndicator color="#EF4444" />
          <Text className="text-white text-sm mt-3">Calcul de l'itinéraire...</Text>
        </View>
      ) : null}
    </View>
  );
}
