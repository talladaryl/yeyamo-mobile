import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { FilterBottomSheet, FilterBottomSheetHandle } from '@/components/explore/FilterBottomSheet';
import { TrendingPlaceCard } from '@/components/explore/TrendingPlaceCard';
import { trendingPlaces } from '@/features/explore/mockData';
import type { SearchFilters } from '@/features/explore/types';

export default function SearchScreen() {
  const router = useRouter();
  const filterSheetRef = useRef<FilterBottomSheetHandle>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    region: null,
    min_rating: 0,
    max_distance_km: 25,
    date: null,
    min_price: 0,
    max_price: 10000,
    sort_by: 'popular',
  });

  // Mock filtered results
  const filteredPlaces = trendingPlaces.filter(place => 
    place.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Rechercher',
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

      <View className="px-4 pt-3 pb-4 flex-row items-center gap-3">
        {/* Search Input */}
        <View className="flex-1">
          <Input
            placeholder="Rechercher un lieu, événement..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Icon library="ionicons" name="search" size={20} color="#A1A1AA" />}
          />
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          onPress={() => filterSheetRef.current?.open()}
          className="bg-[#EF4444] w-12 h-12 rounded-xl items-center justify-center"
          activeOpacity={0.8}
        >
          <Icon library="ionicons" name="options" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Results */}
      {searchQuery ? (
        <View className="flex-1">
          <Text className="px-4 text-[#A1A1AA] text-sm mb-3">
            {filteredPlaces.length} résultat{filteredPlaces.length > 1 ? 's' : ''}
          </Text>

          <FlatList
            data={filteredPlaces}
            keyExtractor={(item) => String(item.id)}
            contentContainerClassName="px-4 pb-6"
            renderItem={({ item }) => (
              <View className="mb-3">
                <TrendingPlaceCard
                  place={item}
                  onPress={() => router.push(`/(places)/${item.id}`)}
                />
              </View>
            )}
          />
        </View>
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Icon library="ionicons" name="search" size={64} color="#52525B" />
          <Text className="text-white text-lg font-semibold mt-4 text-center">
            Recherchez un lieu
          </Text>
          <Text className="text-[#A1A1AA] text-sm mt-2 text-center">
            Explorez des milliers de lieux et événements au Cameroun
          </Text>
        </View>
      )}

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        ref={filterSheetRef}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={() => {
          console.log('Apply filters:', filters);
          // Here you would filter the results
        }}
      />
    </SafeAreaView>
  );
}
