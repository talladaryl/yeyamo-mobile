import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { ExploreAdvancedFiltersSheet, type ExploreAdvancedFilters, type ExploreAdvancedFiltersSheetHandle } from '@/components/explore/ExploreAdvancedFiltersSheet';
import { ExploreQuickFilters } from '@/components/explore/ExploreQuickFilters';
import { useThemeStore } from '@/features/theme/theme.store';
import { useDebounce } from '@/hooks/useDebounce';
import { useDiscoverySearch } from '@/features/discovery/discovery.hooks';
import type { DiscoveryType } from '@/features/discovery/discovery.types';
import { useRegions } from '@/features/explore/useExplore';
import { useCountryStore } from '@/features/country/country.store';
import { useCultureLanguages } from '@/features/culture/culture.hooks';
import { useLocation } from '@/hooks/useLocation';
import { discoveryHref } from '@/features/discovery/discovery.navigation';
import { i18n } from '@/i18n';

export default function SearchScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const defaultCountryCode = useCountryStore((state) => state.selectedCountryCode ?? undefined);
  const {
    location: currentLocation,
    isLoading: isLocationLoading,
    error: locationError,
    requestLocation,
  } = useLocation();
  const { data: regions = [] } = useRegions();
  const { data: languages = [] } = useCultureLanguages();
  const params = useLocalSearchParams<{ type?: DiscoveryType; nearby?: string; regionCode?: string; filters?: string }>();
  const advancedSheetRef = useRef<ExploreAdvancedFiltersSheetHandle>(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<DiscoveryType | undefined>(params.type);
  const [nearby, setNearby] = useState(params.nearby === '1');
  const [advancedFilters, setAdvancedFilters] = useState<ExploreAdvancedFilters>({ countryCode: defaultCountryCode, type: params.type, regionCode: params.regionCode });
  useEffect(() => { setAdvancedFilters((current) => current.countryCode ? current : { ...current, countryCode: defaultCountryCode }); }, [defaultCountryCode]);
  useEffect(() => {
    if (params.filters !== '1') return;
    const frame = requestAnimationFrame(() => advancedSheetRef.current?.open());
    return () => cancelAnimationFrame(frame);
  }, [params.filters]);
  useEffect(() => {
    if (nearby && !currentLocation && !isLocationLoading) void requestLocation();
  }, [
    nearby,
    isLocationLoading,
    currentLocation,
    requestLocation,
  ]);
  const debounced = useDebounce(query, 400);
  const selectedRegion = regions.find((region) => region.code === advancedFilters.regionCode || String(region.id) === advancedFilters.regionCode);
  const regionCode = nearby
    ? (advancedFilters.regionCode ?? selectedRegion?.code ?? (selectedRegion ? String(selectedRegion.id) : undefined))
    : advancedFilters.regionCode;
  const activeType = type ?? (advancedFilters.type as DiscoveryType | undefined);
  const filters = useMemo(() => ({
    countryCode: advancedFilters.countryCode || defaultCountryCode,
    regionCode,
    cityId: advancedFilters.cityId,
    categoryCode: advancedFilters.categoryCode,
    languageCode: advancedFilters.languageCode,
    cultureType: advancedFilters.cultureType,
    availability: advancedFilters.availability || advancedFilters.availableForSale ? true : undefined,
    verified: advancedFilters.verified,
    ...(nearby && currentLocation ? {
      lat: currentLocation.latitude,
      lng: currentLocation.longitude,
      radiusKm: Math.min(Math.max(advancedFilters.distanceKm ?? 25, 1), 200),
    } : {}),
  }), [advancedFilters, currentLocation, defaultCountryCode, nearby, regionCode]);
  const results = useDiscoverySearch(debounced, activeType, filters, !nearby || Boolean(currentLocation));
  const activeFilterCount = Number(nearby)
    + [advancedFilters.regionCode, advancedFilters.cityId, advancedFilters.distanceKm, advancedFilters.categoryCode, advancedFilters.languageCode, advancedFilters.cultureType, advancedFilters.availability, advancedFilters.verified, advancedFilters.availableForSale]
      .filter(Boolean).length;

  const open = (item: { type: DiscoveryType; sourceId: string }) => {
    const href = discoveryHref(item);
    if (href) {
      router.push(href);
      return;
    }
    Alert.alert(
      'Contenu indisponible',
      "La page de détail de ce type de contenu n'est pas encore disponible dans l'application.",
    );
  };

  const selectQuickFilter = ({ type: nextType, nearby: nextNearby }: { type?: DiscoveryType; nearby: boolean }) => {
    setType(nextType);
    setNearby(nextNearby);
    setAdvancedFilters((current) => ({ ...current, type: nextType }));
  };

  const resetFilters = () => {
    setType(undefined);
    setNearby(false);
    setAdvancedFilters({ countryCode: defaultCountryCode });
  };

  const hasSearchContext = Boolean(debounced.trim() || activeType || nearby || activeFilterCount);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-3">
        <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }} accessibilityRole="button" accessibilityLabel={i18n.t('common.back')}>
          <Icon name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-1">
          <Input
            autoFocus
            placeholder={i18n.t('explore.searchPlaceholderModern')}
            value={query}
            onChangeText={setQuery}
            leftIcon={<Icon name="search" size={20} color={colors.textSecondary} />}
            returnKeyType="search"
            accessibilityLabel={i18n.t('common.search')}
          />
        </View>
        {hasSearchContext ? <TouchableOpacity onPress={resetFilters} className="h-11 w-11 items-center justify-center" accessibilityRole="button" accessibilityLabel={i18n.t('explore.advanced.reset')}><Icon name="close-circle-outline" size={22} color={colors.textSecondary} /></TouchableOpacity> : null}
      </View>

      <ExploreQuickFilters selectedType={activeType} nearby={nearby} activeFilterCount={activeFilterCount} onSelect={selectQuickFilter} onOpenAdvanced={() => advancedSheetRef.current?.open()} />

      {!hasSearchContext ? (
        <View className="flex-1 items-center justify-center px-8">
          <Icon name="search" size={56} color={colors.textMuted} />
          <Text className="mt-4 text-center text-lg font-bold" style={{ color: colors.text }}>{i18n.t('explore.searchEmptyTitle')}</Text>
          <Text className="mt-2 text-center" style={{ color: colors.textSecondary }}>{i18n.t('explore.searchEmptyDescription')}</Text>
        </View>
      ) : nearby && !currentLocation ? (
        <View className="flex-1 items-center justify-center px-8"><Icon name="location-outline" size={48} color={colors.textMuted} /><Text className="mt-4 text-center" style={{ color: colors.textSecondary }}>{locationError ?? 'Autorisez la localisation pour rechercher près de vous.'}</Text><TouchableOpacity onPress={() => void requestLocation()} className="mt-4 h-11 justify-center"><Text className="font-bold" style={{ color: colors.primary }}>Réessayer</Text></TouchableOpacity></View>
      ) : results.isLoading ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View>
      ) : results.isError ? (
        <View className="flex-1 items-center justify-center px-8"><Text className="text-center" style={{ color: colors.textSecondary }}>{i18n.t('explore.searchUnavailable')}</Text><TouchableOpacity onPress={() => void results.refetch()} className="mt-4 h-11 justify-center"><Text className="font-bold" style={{ color: colors.primary }}>{i18n.t('explore.searchRetry')}</Text></TouchableOpacity></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text className="mb-3 mt-1 text-sm font-extrabold" style={{ color: colors.text }}>{i18n.t('explore.searchSuggestions')}</Text>
          {(results.data?.items ?? []).map((item) => (
            <TouchableOpacity key={item.id} onPress={() => open(item)} className="mb-3 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }} activeOpacity={0.82} accessibilityRole="button" accessibilityLabel={`${i18n.t('explore.openResult')} ${item.title}`}>
              <View className="flex-row items-center justify-between"><Text className="text-xs font-bold" style={{ color: colors.primary }}>{item.type}</Text>{item.verificationStatus ? <Text className="text-xs" style={{ color: colors.textMuted }}>{item.verificationStatus}</Text> : null}</View>
              <Text className="mt-2 text-base font-bold" style={{ color: colors.text }}>{item.title}</Text>
              {item.description ? <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }} numberOfLines={2}>{item.description}</Text> : null}
              <Text className="mt-2 text-xs" style={{ color: colors.textMuted }}>{[item.city, item.regionCode, item.countryCode].filter(Boolean).join(' · ')}</Text>
            </TouchableOpacity>
          ))}
          {(results.data?.items ?? []).length === 0 ? <View className="items-center py-16"><Text style={{ color: colors.textSecondary }}>{i18n.t('explore.noSearchResults')}</Text></View> : null}
        </ScrollView>
      )}

      <ExploreAdvancedFiltersSheet
        ref={advancedSheetRef}
        filters={advancedFilters}
        regions={regions}
        languages={languages}
        onChange={(next) => { setAdvancedFilters(next); setType(next.type as DiscoveryType | undefined); }}
        onReset={resetFilters}
        onApply={() => undefined}
      />
    </SafeAreaView>
  );
}
