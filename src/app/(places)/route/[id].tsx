import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/features/theme/theme.store';
import { usePlaceDetail } from '@/features/places/usePlaces';

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
        const permission = await Location.requestForegroundPermissionsAsync();
        let nextOrigin = DEFAULT_ORIGIN;

        if (permission.status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          nextOrigin = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
        }

        const osrmUrl =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${nextOrigin.longitude},${nextOrigin.latitude};${destination.longitude},${destination.latitude}` +
          `?overview=full&geometries=geojson`;

        const response = await fetch(osrmUrl);
        const json = await response.json();
        const osrmRoute = json?.routes?.[0];

        if (!isMounted) return;

        setOrigin(nextOrigin);

        if (osrmRoute?.geometry?.coordinates?.length) {
          setRoute(
            osrmRoute.geometry.coordinates.map(([longitude, latitude]: [number, number]) => ({
              latitude,
              longitude,
            }))
          );
          setDistanceKm(osrmRoute.distance / 1000);
          setDurationMin(osrmRoute.duration / 60);
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
  }, [destination.latitude, destination.longitude, place]);

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

      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2,
          latitudeDelta: Math.max(Math.abs(origin.latitude - destination.latitude) * 1.8, 0.08),
          longitudeDelta: Math.max(Math.abs(origin.longitude - destination.longitude) * 1.8, 0.08),
        }}
      >
        <Marker coordinate={origin} title="Votre position" pinColor="#7C3AED" />
        <Marker coordinate={destination} title={place.name} pinColor="#EF4444" />
        {route.length > 1 ? <Polyline coordinates={route} strokeColor="#EF4444" strokeWidth={5} /> : null}
      </MapView>

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
