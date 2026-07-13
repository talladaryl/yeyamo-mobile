import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { CategoryCard } from '@/components/explore/CategoryCard';
import { TrendingPlaceCard } from '@/components/explore/TrendingPlaceCard';
import { categories, regions, trendingPlaces } from '@/features/explore/mockData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExploreHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedRegionId, setSelectedRegionId] = useState(1);
  const [isRegionPickerOpen, setIsRegionPickerOpen] = useState(false);

  const selectedRegion = regions.find((region) => region.id === selectedRegionId) ?? regions[0];
  const selectedLocationLabel = selectedRegion.name === 'Centre' ? 'Yaounde' : selectedRegion.name;
  const filteredTrendingPlaces = useMemo(
    () => trendingPlaces.filter((place) => place.region_id === selectedRegion.id),
    [selectedRegion.id]
  );

  const openPlacesForRegion = (category?: string) => {
    router.push({
      pathname: '/(explore)/places',
      params: {
        regionId: String(selectedRegion.id),
        region: selectedRegion.name,
        ...(category ? { category } : {}),
      },
    });
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <View style={{ paddingTop: insets.top, zIndex: 20 }} className="px-4 pt-3 pb-2 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => setIsRegionPickerOpen((value) => !value)}
          className="flex-row items-center gap-2 py-2 pr-3"
          activeOpacity={0.75}
        >
          <Icon library="ionicons" name="location" size={20} color="#EF4444" />
          <View>
            <Text className="text-white font-semibold text-base">{selectedLocationLabel}</Text>
            <Text className="text-[#A1A1AA] text-xs">{selectedRegion.name}</Text>
          </View>
          <Icon
            library="ionicons"
            name={isRegionPickerOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#A1A1AA"
          />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7}>
          <Icon library="ionicons" name="notifications-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isRegionPickerOpen && (
        <View
          className="absolute left-4 right-4 bg-[#161616] border border-[#27272A] rounded-xl overflow-hidden"
          style={{ top: insets.top + 58, zIndex: 30, maxHeight: 360 }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {regions.map((region) => {
              const isSelected = region.id === selectedRegion.id;

              return (
                <TouchableOpacity
                  key={region.id}
                  onPress={() => {
                    setSelectedRegionId(region.id);
                    setIsRegionPickerOpen(false);
                  }}
                  className={`px-4 py-3 flex-row items-center justify-between border-b border-[#27272A] ${
                    isSelected ? 'bg-[#231314]' : ''
                  }`}
                  activeOpacity={0.8}
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-white font-semibold">{region.name}</Text>
                    <Text className="text-[#A1A1AA] text-xs mt-1" numberOfLines={1}>
                      {region.places_count} lieux disponibles
                    </Text>
                  </View>
                  {isSelected && <Icon library="ionicons" name="checkmark" size={20} color="#EF4444" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-4">
          <Text className="text-white text-2xl font-bold">Bonjour,</Text>
          <Text className="text-white text-2xl font-bold mt-1">
            Que souhaitez-vous{`\n`}decouvrir aujourd'hui ?
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(explore)/search')}
          className="mx-4 mb-6 bg-[#161616] rounded-xl px-4 py-3.5 flex-row items-center gap-3"
          activeOpacity={0.8}
        >
          <Icon library="ionicons" name="search" size={20} color="#A1A1AA" />
          <Text className="text-[#A1A1AA] text-sm flex-1">Recherchez un lieu, evenement...</Text>
        </TouchableOpacity>

        <View className="px-4 mb-6">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(explore)/events', params: { region: selectedRegion.name } })}
              className="flex-1 bg-[#161616] rounded-xl p-4"
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="calendar" size={24} color="#EF4444" />
              <Text className="text-white font-semibold mt-2">Evenements</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(explore)/experiences', params: { region: selectedRegion.name } })}
              className="flex-1 bg-[#161616] rounded-xl p-4"
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="compass" size={24} color="#EF4444" />
              <Text className="text-white font-semibold mt-2">Experiences</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 mb-6">
          <Text className="text-white text-lg font-bold mb-4">Categories</Text>
          <View className="flex-row flex-wrap gap-y-4">
            {categories.map((category) => (
              <View key={category.id} style={{ width: '33.33%' }}>
                <CategoryCard
                  category={category}
                  onPress={() => {
                    if (category.id === 'events') {
                      router.push({ pathname: '/(explore)/events', params: { region: selectedRegion.name } });
                    } else if (category.id === 'experiences') {
                      router.push({ pathname: '/(explore)/experiences', params: { region: selectedRegion.name } });
                    } else {
                      openPlacesForRegion(category.id);
                    }
                  }}
                />
              </View>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <View className="px-4 flex-row items-center justify-between mb-3">
            <View className="flex-1 pr-3">
              <Text className="text-white text-lg font-bold">Tendances pres de vous</Text>
              <Text className="text-[#A1A1AA] text-xs mt-1">Suggestions pour {selectedRegion.name}</Text>
            </View>
            <TouchableOpacity onPress={() => openPlacesForRegion()} activeOpacity={0.7}>
              <Text className="text-[#EF4444] text-sm font-semibold">Voir tout</Text>
            </TouchableOpacity>
          </View>

          {filteredTrendingPlaces.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
            >
              {filteredTrendingPlaces.map((place) => (
                <TrendingPlaceCard
                  key={place.id}
                  place={place}
                  onPress={() => router.push(`/(places)/${place.id}`)}
                />
              ))}
            </ScrollView>
          ) : (
            <View className="mx-4 bg-[#161616] rounded-xl p-5 items-center">
              <Icon library="ionicons" name="map-outline" size={28} color="#A1A1AA" />
              <Text className="text-white font-semibold mt-3 text-center">Aucune suggestion pour cette region</Text>
              <Text className="text-[#A1A1AA] text-sm mt-1 text-center">
                Les donnees locales seront enrichies avant le branchement backend.
              </Text>
            </View>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
