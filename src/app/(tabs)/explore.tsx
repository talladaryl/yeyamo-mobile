import { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Image } from 'expo-image';
import { usePlaces } from '@/features/places/usePlaces';
import { useDebounce } from '@/hooks/useDebounce';
import type { Place } from '@/features/places/types';

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePlaces(
    debouncedSearch ? { search: debouncedSearch } : {},
  );

  const places = useMemo<Place[]>(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  return (
    <SafeScreen>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold mb-3">Explore</Text>
        <Input
          placeholder="Search places, cities..."
          value={search}
          onChangeText={setSearch}
          containerClassName="mb-1"
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={places}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="px-4 pb-6 gap-3"
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(places)/${item.id}`)}
              className="bg-[#161616] rounded-2xl overflow-hidden"
              activeOpacity={0.8}
            >
              {item.cover_image_url ? (
                <Image
                  source={{ uri: item.cover_image_url }}
                  style={{ width: '100%', height: 160 }}
                  contentFit="cover"
                />
              ) : (
                <View className="w-full h-40 bg-[#1F1F1F] items-center justify-center">
                  <Text style={{ fontSize: 36 }}>📍</Text>
                </View>
              )}
              <View className="p-3">
                <Text className="text-white font-semibold text-base">{item.name}</Text>
                <Text className="text-[#A1A1AA] text-sm mt-0.5">{item.city}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color="#7C3AED" className="py-4" />
            ) : null
          }
        />
      )}
    </SafeScreen>
  );
}
