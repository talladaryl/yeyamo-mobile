import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { CategoryCard } from '@/components/explore/CategoryCard';
import { TrendingPlaceCard } from '@/components/explore/TrendingPlaceCard';
import { categories, regions, trendingPlaces } from '@/features/explore/mockData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '@/features/theme/theme.store';

export default function ExploreHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeStore((state) => state.colors);
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
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top, zIndex: 20 }} className="px-4 pt-3 pb-2 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => setIsRegionPickerOpen((value) => !value)}
          className="flex-row items-center gap-2 py-2 pr-3"
          activeOpacity={0.75}
        >
          <Icon library="ionicons" name="location" size={20} color="#EF4444" />
          <View>
            <Text className="text-base font-semibold" style={{ color: colors.text }}>{selectedLocationLabel}</Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>{selectedRegion.name}</Text>
          </View>
          <Icon
            library="ionicons"
            name={isRegionPickerOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7}>
          <Icon library="ionicons" name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {isRegionPickerOpen && (
        <View
          className="absolute left-4 right-4 overflow-hidden rounded-xl border"
          style={{ top: insets.top + 58, zIndex: 30, maxHeight: 360, backgroundColor: colors.card, borderColor: colors.border }}
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
                  className="flex-row items-center justify-between border-b px-4 py-3"
                  style={{ borderColor: colors.border, backgroundColor: isSelected ? `${colors.primary}12` : 'transparent' }}
                  activeOpacity={0.8}
                >
                  <View className="flex-1 pr-3">
                    <Text className="font-semibold" style={{ color: colors.text }}>{region.name}</Text>
                    <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }} numberOfLines={1}>
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
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>Bonjour,</Text>
          <Text className="mt-1 text-2xl font-bold" style={{ color: colors.text }}>
            Que souhaitez-vous{`\n`}decouvrir aujourd'hui ?
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(explore)/search')}
          className="mx-4 mb-6 flex-row items-center gap-3 rounded-xl border px-4 py-3.5"
          style={{ backgroundColor: colors.elevated, borderColor: colors.border }}
          activeOpacity={0.8}
        >
          <Icon library="ionicons" name="search" size={20} color={colors.textSecondary} />
          <Text className="flex-1 text-sm" style={{ color: colors.textSecondary }}>Recherchez un lieu, événement...</Text>
        </TouchableOpacity>

        <View className="px-4 mb-6">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(explore)/events', params: { region: selectedRegion.name } })}
              className="flex-1 rounded-xl border p-4"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="calendar" size={24} color="#EF4444" />
              <Text className="mt-2 font-semibold" style={{ color: colors.text }}>Événements</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(explore)/experiences', params: { region: selectedRegion.name } })}
              className="flex-1 rounded-xl border p-4"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="compass" size={24} color="#EF4444" />
              <Text className="mt-2 font-semibold" style={{ color: colors.text }}>Expériences</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 mb-6">
          <Text className="mb-4 text-lg font-bold" style={{ color: colors.text }}>Catégories</Text>
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
              <Text className="text-lg font-bold" style={{ color: colors.text }}>Tendances près de vous</Text>
              <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>Suggestions pour {selectedRegion.name}</Text>
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
            <View className="mx-4 items-center rounded-xl border p-5" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <Icon library="ionicons" name="map-outline" size={28} color={colors.textSecondary} />
              <Text className="mt-3 text-center font-semibold" style={{ color: colors.text }}>Aucune suggestion pour cette région</Text>
              <Text className="mt-1 text-center text-sm" style={{ color: colors.textSecondary }}>
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
