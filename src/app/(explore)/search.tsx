import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { FilterBottomSheet, FilterBottomSheetHandle } from '@/components/explore/FilterBottomSheet';
import { TrendingPlaceCard } from '@/components/explore/TrendingPlaceCard';
import { trendingPlaces } from '@/features/explore/mockData';
import type { SearchFilters } from '@/features/explore/types';
import { useThemeStore } from '@/features/theme/theme.store';

export default function SearchScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Rechercher',
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

      <View className="px-4 pt-3 pb-4 flex-row items-center gap-3">
        {/* Search Input */}
        <View className="flex-1">
          <Input
            placeholder="Rechercher un lieu, événement..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Icon library="ionicons" name="search" size={20} color={colors.textSecondary} />}
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
          <Text className="px-4 text-sm mb-3" style={{ color: colors.textSecondary }}>
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
          <Text className="text-lg font-semibold mt-4 text-center" style={{ color: colors.text }}>
            Recherchez un lieu
          </Text>
          <Text className="text-sm mt-2 text-center" style={{ color: colors.textSecondary }}>
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
