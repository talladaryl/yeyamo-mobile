import { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { PlaceListItem } from '@/components/explore/PlaceListItem';
import { trendingPlaces } from '@/features/explore/mockData';

type FilterTab = 'all' | 'popular' | 'new' | 'nearby';

export default function PlacesListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const regionId = typeof params.regionId === 'string' ? Number(params.regionId) : null;
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
        const matchesRegion = regionId ? place.region_id === regionId : true;
        const matchesCategory = category ? place.category === category : true;

        return matchesRegion && matchesCategory;
      }),
    [category, regionId]
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: regionName ? `Lieux - ${regionName}` : 'Lieux',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="pl-4">
              <Icon library="ionicons" name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity className="pr-4">
              <Icon library="ionicons" name="ellipsis-vertical" size={24} color="#FFFFFF" />
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
                  : 'bg-[#161616]'
              }`}
              activeOpacity={0.8}
            >
              <Text
                className={`text-sm font-medium ${
                  activeFilter === filter.id
                    ? 'text-white'
                    : 'text-[#A1A1AA]'
                }`}
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
          <Text className="text-[#A1A1AA] text-sm mb-4">
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
