import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { PlaceListItem, type PlaceListItemModel } from '@/components/explore/PlaceListItem';
import { useTrendingPlaces } from '@/features/explore/useExplore';
import { usePlaces } from '@/features/places/usePlaces';
import { useLocation } from '@/hooks/useLocation';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';

type FilterTab = 'all' | 'popular' | 'nearby';

export default function PlacesListScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const params = useLocalSearchParams();
  const { data: trendingPlaces = [] } = useTrendingPlaces();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const currentLocation = useLocation();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const regionId = typeof params.regionId === 'string' ? Number(params.regionId) : null;
  const regionCode = typeof params.regionCode === 'string' ? params.regionCode : null;
  const regionName = typeof params.region === 'string' ? params.region : null;
  const category = typeof params.category === 'string' ? params.category : null;

  const filters: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'popular', label: 'Populaire' },
    { id: 'nearby', label: 'Près de moi' },
  ];

  const allPlacesQuery = usePlaces({ city: regionCode ?? undefined, categoryCode: category ?? undefined });
  const nearbyPlacesQuery = usePlaces({ lat: currentLocation.location?.latitude, lng: currentLocation.location?.longitude, radius_km: 25 });
  const remoteAllPlaces = allPlacesQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const nearbyPlaces = nearbyPlacesQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const popularPlaces = trendingPlaces.filter((place) => !regionCode || String(place.region_id) === String(regionCode));

  const filteredPlaces: PlaceListItemModel[] = isDemo ? trendingPlaces.filter((place) => (!regionCode || String(place.region_id) === String(regionCode) || String(place.region_id) === String(regionId)) && (!category || place.category === category)) : activeFilter === 'nearby' ? nearbyPlaces : activeFilter === 'popular' ? popularPlaces : remoteAllPlaces;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: regionName ? `Lieux - ${regionName}` : 'Lieux',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="pl-4">
              <Icon library="ionicons" name="arrow-back" size={28} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity className="pr-4">
              <Icon library="ionicons" name="ellipsis-vertical" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Filter Tabs */}
      <View className="px-4 pt-3 pb-4">
        <View className="flex-row gap-2">
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => { setActiveFilter(filter.id); if (filter.id === 'nearby' && !currentLocation.location) void currentLocation.requestLocation(); }}
              className={`px-4 py-2 rounded-full ${
                activeFilter === filter.id
                  ? 'bg-[#EF4444]'
                  : ''
              }`}
              style={activeFilter === filter.id ? undefined : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
              activeOpacity={0.8}
            >
              <Text
                className={`text-sm font-medium ${
                  activeFilter === filter.id
                    ? 'text-white'
                    : ''
                }`}
                style={activeFilter === filter.id ? undefined : { color: colors.textSecondary }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Places List */}
      <FlatList<PlaceListItemModel>
        data={filteredPlaces}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="px-4 pb-20"
        renderItem={({ item }) => (
              <PlaceListItem
                place={item}
                onPress={() => router.push(`/(places)/${item.id}`)}
              />
        )}
        ListHeaderComponent={
          <View><Text className="text-sm mb-4" style={{ color: colors.textSecondary }}>
            {filteredPlaces.length} lieu{filteredPlaces.length > 1 ? 'x' : ''}
            {regionName ? ` dans ${regionName}` : ''}
          </Text>{activeFilter === 'nearby' && !isDemo && !currentLocation.location ? <Text className="mb-4 text-sm" style={{ color: colors.textSecondary }}>{currentLocation.error ?? 'Autorisez la localisation pour afficher les lieux proches.'}</Text> : null}</View>
        }
      />

      {/* FAB Button */}
      <TouchableOpacity
        onPress={() => router.push('/(explore)/map')}
        className="absolute bottom-20 right-4 bg-[#EF4444] w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Icon library="ionicons" name="map" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
