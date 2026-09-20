import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { NativeMap, NativeMarker, PROVIDER_GOOGLE, type NativeMapRef } from '@/components/maps/NativeMap';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import { CAMEROON_CENTER } from '@/features/explore/mockData';
import type { MapPlace } from '@/features/explore/types';
import { useThemeStore } from '@/features/theme/theme.store';
import { usePlaces } from '@/features/places/usePlaces';
import { useLocation } from '@/hooks/useLocation';
import { useAuthStore } from '@/features/auth/auth.store';

const MAP_RADIUS_OPTIONS_KM = [10, 25, 50, 100] as const;

export default function MapScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  const [radiusKm, setRadiusKm] = useState<(typeof MAP_RADIUS_OPTIONS_KM)[number]>(25);
  const mapRef = useRef<NativeMapRef>(null);
  const {
    location: currentLocation,
    error: locationError,
    requestLocation,
  } = useLocation();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const searchLocation = isDemo ? CAMEROON_CENTER : currentLocation;
  const { data } = usePlaces({
    lat: searchLocation?.latitude,
    lng: searchLocation?.longitude,
    radius_km: radiusKm,
  });
  const mapPlaces = useMemo<MapPlace[]>(() =>
    (data?.pages.flatMap((page) => page.data) ?? [])
      .filter((place): place is typeof place & { lat: number; lng: number } => Number.isFinite(place.lat) && Number.isFinite(place.lng))
      .map((place) => ({
        id: place.id,
        name: place.name,
        coordinates: { latitude: place.lat, longitude: place.lng },
        rating: place.rating ?? 0,
        image_url: place.cover_image_url ?? '',
        category: place.category,
      })),
  [data]);

  useEffect(() => { void requestLocation(); }, [requestLocation]);

  if (!isDemo && !currentLocation) {
    return <View className="flex-1 items-center justify-center px-7" style={{ backgroundColor: colors.background }}><Icon name="location-outline" size={46} color={colors.textMuted}/><Text className="mt-4 text-center text-lg font-bold" style={{ color: colors.text }}>Localisation requise</Text><Text className="mt-2 text-center" style={{ color: colors.textSecondary }}>{locationError ?? 'Autorisez la localisation pour afficher les lieux réels autour de vous.'}</Text><TouchableOpacity onPress={() => void requestLocation()} className="mt-5 rounded-xl px-5 py-3" style={{ backgroundColor: colors.primary }}><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity></View>;
  }

  const recenter = async () => {
    const location = currentLocation ?? await requestLocation();
    if (location) mapRef.current?.animateToRegion({ ...location, latitudeDelta: 0.04, longitudeDelta: 0.04 }, 500);
  };
  const nextRadius = () => {
    const index = MAP_RADIUS_OPTIONS_KM.indexOf(radiusKm);
    setRadiusKm(MAP_RADIUS_OPTIONS_KM[(index + 1) % MAP_RADIUS_OPTIONS_KM.length]);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Map */}
      <NativeMap
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={CAMEROON_CENTER}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {mapPlaces.map((place) => (
          <NativeMarker
            key={place.id}
            coordinate={place.coordinates}
            onPress={() => setSelectedPlace(place)}
          >
            <View className="bg-[#EF4444] w-10 h-10 rounded-full items-center justify-center border-2 border-white">
              <Icon library="ionicons" name="location" size={20} color="#FFFFFF" />
            </View>
          </NativeMarker>
        ))}
      </NativeMap>

      {/* Top Controls */}
      <SafeAreaView className="absolute top-0 left-0 right-0">
        <View className="px-4 pt-3 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white w-10 h-10 rounded-full items-center justify-center"
            activeOpacity={0.8}
          >
            <Icon library="ionicons" name="arrow-back" size={24} color="#0A0A0A" />
          </TouchableOpacity>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(explore)/search')}
              className="bg-white w-10 h-10 rounded-full items-center justify-center"
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="search" size={24} color="#0A0A0A" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={nextRadius}
              className="bg-white w-10 h-10 rounded-full items-center justify-center"
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Changer le rayon de la carte. Rayon actuel ${radiusKm} kilomètres`}
            >
              <Text className="text-xs font-extrabold text-[#EF4444]">{radiusKm}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Region Labels - simplified */}
      <View className="absolute top-32 left-8">
        <Text className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
          Nord
        </Text>
      </View>
      <View className="absolute top-48 right-12">
        <Text className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
          Extrême-Nord
        </Text>
      </View>
      <View className="absolute bottom-64 left-12">
        <Text className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
          Sud-Ouest
        </Text>
      </View>
      <View className="absolute bottom-52 right-16">
        <Text className="text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded">
          Est
        </Text>
      </View>

      {/* Place Preview Card */}
      {selectedPlace && (
        <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <TouchableOpacity
            onPress={() => router.push(`/(places)/${selectedPlace.id}`)}
            activeOpacity={0.9}
            className="flex-row gap-3"
          >
            {selectedPlace.image_url ? <Image source={{ uri: selectedPlace.image_url }} style={{ width: 100, height: 100, borderRadius: 12 }} contentFit="cover" /> : <View className="h-[100px] w-[100px] items-center justify-center rounded-xl" style={{ backgroundColor: colors.elevated }}><Icon name="location-outline" size={26} color={colors.textMuted} /></View>}

            <View className="flex-1 justify-center">
              <Text className="font-bold text-lg mb-1" style={{ color: colors.text }}>
                {selectedPlace.name}
              </Text>

              {selectedPlace.rating != null ? <View className="flex-row items-center gap-1 mb-2"><Icon library="ionicons" name="star" size={16} color="#F59E0B" /><Text className="text-sm" style={{ color: colors.text }}>{selectedPlace.rating}</Text></View> : null}

              <TouchableOpacity
                onPress={() => setSelectedPlace(null)}
                className="absolute top-0 right-0"
              >
                <Icon library="ionicons" name="close" size={24} color="#A1A1AA" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {!isDemo && !currentLocation ? (
        <View className="absolute bottom-24 left-4 right-4 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Text className="font-bold" style={{ color: colors.text }}>Localisation requise</Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{locationError ?? 'Autorisez la localisation pour afficher les lieux réels autour de vous.'}</Text>
          <TouchableOpacity onPress={() => void requestLocation()} className="mt-3 self-start rounded-xl px-4 py-2" style={{ backgroundColor: colors.primary }}><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity>
        </View>
      ) : null}

      {/* My Location Button */}
      <TouchableOpacity
        onPress={recenter}
        className="absolute bottom-32 right-4 bg-white w-12 h-12 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Icon library="ionicons" name="locate" size={24} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
}
