import { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { PlaceListItem } from '@/components/explore/PlaceListItem';
import { useTrendingPlaces } from '@/features/explore/useExplore';
import { useThemeStore } from '@/features/theme/theme.store';

type FilterTab = 'all' | 'popular' | 'new' | 'nearby';

export default function PlacesListScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const params = useLocalSearchParams();
  const { data: trendingPlaces = [] } = useTrendingPlaces();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const regionId = typeof params.regionId === 'string' ? Number(params.regionId) : null;
  const regionCode = typeof params.regionCode === 'string' ? params.regionCode : null;
  const regionName = typeof params.region === 'string' ? params.region : null;
  const category = typeof params.category === 'string' ? params.category : null;

  const filters: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'popular', label: 'Populaire' },
    { id: 'new', label: 'Nouveaux' },
    { id: 'nearby', label: 'Près de moi' },
  ];

  const filteredPlaces = useMemo(
    () =>
      trendingPlaces.filter((place) => {
        const matchesRegion = regionCode
          ? String(place.region_id) === regionCode || String(place.region_id) === String(regionId)
          : regionId ? String(place.region_id) === String(regionId) : true;
        const matchesCategory = category ? place.category === category : true;

        return matchesRegion && matchesCategory;
      }),
    [category, regionCode, regionId, trendingPlaces]
  );

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
              onPress={() => setActiveFilter(filter.id)}
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
      <FlatList
        data={filteredPlaces}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="px-4 pb-20"
        renderItem={({ item }) => (
          <PlaceListItem
            place={item}
            onPress={() => router.push(`/(places)/${item.id}`)}
            onBookmark={() => console.log('Bookmark', item.id)}
          />
        )}
        ListHeaderComponent={
          <Text className="text-sm mb-4" style={{ color: colors.textSecondary }}>
            {filteredPlaces.length} lieu{filteredPlaces.length > 1 ? 'x' : ''}
            {regionName ? ` dans ${regionName}` : ''}
          </Text>
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
