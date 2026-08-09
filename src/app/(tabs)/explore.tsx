import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { CategoryCard } from '@/components/explore/CategoryCard';
import { TrendingPlaceCard } from '@/components/explore/TrendingPlaceCard';
import { DiscoveryTrendCard } from '@/components/explore/DiscoveryTrendCard';
import { useCategories, useRegions, useTrendingPlaces } from '@/features/explore/useExplore';
import { useThemeStore } from '@/features/theme/theme.store';
import { useCountryStore } from '@/features/country/country.store';
import { useAuthStore } from '@/features/auth/auth.store';
import { useUnreadCount } from '@/features/notifications/useNotifications';
import { useCultureContents, useCultureLanguages, useChallenges } from '@/features/culture/culture.hooks';
import { CultureContentCard } from '@/features/culture/components/CultureContentCard';
import { CultureChallengeCard } from '@/features/culture/components/CultureChallengeCard';
import { LanguageCard } from '@/features/culture/components/LanguageCard';
import { useArtworks } from '@/features/artworks/artworks.hooks';
import { ArtworkCard } from '@/features/artworks/components/ArtworkCard';
import { useArtisans } from '@/features/artisans/artisans.hooks';
import { ArtisanCard } from '@/features/artisans/components/ArtisanCard';
import { useDiscoveryTrending } from '@/features/discovery/discovery.hooks';
import type { DiscoveryItem } from '@/features/discovery/discovery.types';
import { useFloatingNavigationScroll } from '@/hooks/useFloatingNavigation';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export default function ExploreHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeStore((state) => state.colors);
  const floatingScroll = useFloatingNavigationScroll();
  const tabBarHeight = useBottomTabBarHeight();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const countryCode = useCountryStore((state) => state.selectedCountryCode ?? 'CM');
  const { data: categories = [] } = useCategories();
  const { data: regions = [] } = useRegions();
  const { data: trendingPlaces = [] } = useTrendingPlaces();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [selectedRegionId, setSelectedRegionId] = useState<number>();
  const [isRegionPickerOpen, setIsRegionPickerOpen] = useState(false);

  const selectedRegion = useMemo(
    () => regions.find((region) => region.id === selectedRegionId) ?? regions[0],
    [regions, selectedRegionId],
  );
  const regionCode = selectedRegion?.code ?? (selectedRegion ? String(selectedRegion.id) : undefined);
  const selectedLocationLabel = selectedRegion?.name === 'Centre' ? 'Yaoundé' : selectedRegion?.name ?? 'Cameroun';

  useEffect(() => {
    if (selectedRegionId === undefined && regions[0]) setSelectedRegionId(regions[0].id);
  }, [regions, selectedRegionId]);

  // Les comptes démo utilisent les jeux de démonstration existants. Les autres
  // sessions consomment le flux Discovery tendance du backend.
  const { data: culturePage } = useCultureContents({ countryCode, verified: true, size: 8 });
  const { data: cultureLanguages = [] } = useCultureLanguages();
  const { data: cultureChallenges } = useChallenges();
  const { data: artworksPage } = useArtworks({ countryCode, size: 8 });
  const { data: artisansPage } = useArtisans({ countryCode, verified: true, size: 8 });

  const trendCulture = useDiscoveryTrending({ type: 'CULTURE', countryCode, size: 8 });
  const trendLanguages = useDiscoveryTrending({ type: 'LANGUAGE', countryCode, size: 8 });
  const trendArtworks = useDiscoveryTrending({ type: 'ARTWORK', countryCode, size: 8 });
  const trendArtisans = useDiscoveryTrending({ type: 'ARTISAN', countryCode, regionCode, size: 8 });
  const trendNearby = useDiscoveryTrending({ type: 'PLACE', countryCode, regionCode, size: 8 });
  const trendEvents = useDiscoveryTrending({ type: 'EVENT', countryCode, regionCode, size: 8 });

  const filteredTrendingPlaces = useMemo(
    () => trendingPlaces.filter((place) => (regionCode ? String(place.region_id) === String(regionCode) : true)),
    [regionCode, trendingPlaces],
  );

  const openPlacesForRegion = (category?: string) => {
    if (!selectedRegion) return;
    router.push({
      pathname: '/(explore)/places',
      params: {
        regionId: String(selectedRegion.id),
        regionCode,
        region: selectedRegion.name,
        ...(category ? { category } : {}),
      },
    });
  };

  const openCategory = (id: string) => {
    if (id === 'events') return router.push({ pathname: '/(explore)/events', params: { region: selectedRegion?.name, regionCode } });
    if (id === 'experiences') return router.push({ pathname: '/(explore)/experiences', params: { region: selectedRegion?.name, regionCode } });
    if (id === 'culture') return router.push('/(explore)/culture');
    if (id === 'languages') return router.push('/(explore)/languages');
    if (id === 'artworks') return router.push('/(explore)/artworks');
    if (id === 'artisans') return router.push('/(explore)/artisans');
    if (id === 'challenges') return router.push('/(explore)/challenges');
    return openPlacesForRegion(id);
  };

  const openDiscovery = (item: DiscoveryItem) => {
    const id = item.sourceId.replace(/^[^:]+:/, '');
    if (item.type === 'ARTWORK') return router.push(`/(explore)/artworks/${id}`);
    if (item.type === 'ARTISAN') return router.push(`/(explore)/artisans/${id}`);
    if (item.type === 'CULTURE' || item.type === 'LANGUAGE' || item.type === 'TRADITION') return router.push(`/(explore)/culture/${id}`);
    if (item.type === 'EVENT') return router.push(`/(events)/${id}`);
    return router.push(`/(places)/${id}`);
  };

  if (!selectedRegion) return <View className="flex-1" style={{ backgroundColor: colors.background }} />;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top, zIndex: 20 }} className="flex-row items-center justify-between px-4 pb-2 pt-3">
        <TouchableOpacity
          onPress={() => setIsRegionPickerOpen((value) => !value)}
          className="flex-row items-center gap-2 py-2 pr-3"
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Choisir une région"
        >
          <Icon library="ionicons" name="location" size={20} color="#EF4444" />
          <View>
            <Text className="text-base font-semibold" style={{ color: colors.text }}>{selectedLocationLabel}</Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>{selectedRegion.name}</Text>
          </View>
          <Icon library="ionicons" name={isRegionPickerOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(profile)/notifications')}
          className="relative h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.elevated }}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir les notifications"
        >
          <Icon library="ionicons" name="notifications-outline" size={23} color={colors.text} />
          {unreadCount > 0 ? <View className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 bg-[#EF4444]" style={{ borderColor: colors.elevated }} /> : null}
        </TouchableOpacity>
      </View>

      {isRegionPickerOpen ? (
        <View className="absolute left-4 right-4 overflow-hidden rounded-2xl border" style={{ top: insets.top + 58, zIndex: 40, maxHeight: 360, backgroundColor: colors.card, borderColor: colors.border }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {regions.map((region) => {
              const active = region.id === selectedRegion.id;
              return (
                <TouchableOpacity
                  key={region.id}
                  onPress={() => { setSelectedRegionId(region.id); setIsRegionPickerOpen(false); }}
                  className="flex-row items-center justify-between border-b px-4 py-3.5"
                  style={{ borderColor: colors.border, backgroundColor: active ? `${colors.primary}12` : 'transparent' }}
                  activeOpacity={0.8}
                >
                  <View className="flex-1 pr-3">
                    <Text className="font-semibold" style={{ color: colors.text }}>{region.name}</Text>
                    <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{region.places_count || '—'} lieux disponibles</Text>
                  </View>
                  {active ? <Icon library="ionicons" name="checkmark-circle" size={20} color={colors.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView {...floatingScroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 30 }}>
        <View className="px-4 pb-4 pt-4">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>Bonjour,</Text>
          <Text className="mt-1 text-2xl font-bold" style={{ color: colors.text }}>Que souhaitez-vous{`\n`}découvrir aujourd’hui ?</Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/(explore)/search')} className="mx-4 mb-6 flex-row items-center gap-3 rounded-xl border px-4 py-3.5" style={{ backgroundColor: colors.elevated, borderColor: colors.border }} activeOpacity={0.8}>
          <Icon library="ionicons" name="search" size={20} color={colors.textSecondary} />
          <Text className="flex-1 text-sm" style={{ color: colors.textSecondary }}>Rechercher culture, langue, œuvre, artisan…</Text>
          <Icon library="ionicons" name="options-outline" size={19} color={colors.textSecondary} />
        </TouchableOpacity>

        <View className="mb-7 px-4">
          <Text className="mb-3 text-lg font-extrabold" style={{ color: colors.text }}>Catégories</Text>
          <View className="flex-row flex-wrap">
            {categories.map((category) => (
              <View key={category.id} style={{ width: '20%', marginBottom: 18 }}>
                <CategoryCard category={category} onPress={() => openCategory(category.id)} />
              </View>
            ))}
          </View>
        </View>

        <View className="mb-3 px-4">
          <Text className="text-xl font-extrabold" style={{ color: colors.text }}>Tendances</Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>Ce que la communauté découvre et partage le plus.</Text>
        </View>

        <TrendRail title="Près de vous" subtitle={`Les lieux populaires dans ${selectedRegion.name}`} items={trendNearby.data?.items} isDemo={isDemo} onViewAll={() => openPlacesForRegion()} onPress={openDiscovery}>
          {filteredTrendingPlaces.map((place) => <TrendingPlaceCard key={place.id} place={place} onPress={() => router.push(`/(places)/${place.id}`)} />)}
        </TrendRail>
        <TrendRail title="Culture tendance" subtitle="Récits et savoirs consultés par la communauté" items={trendCulture.data?.items} isDemo={isDemo} onViewAll={() => router.push('/(explore)/culture')} onPress={openDiscovery}>
          {culturePage?.content.map((content) => <CultureContentCard key={content.id} content={content} onPress={() => router.push(`/(explore)/culture/${content.id}`)} />)}
        </TrendRail>
        <TrendRail title="Langues tendance" subtitle="Les langues que les explorateurs apprennent" items={trendLanguages.data?.items} isDemo={isDemo} onViewAll={() => router.push('/(explore)/languages')} onPress={openDiscovery}>
          {cultureLanguages.map((language) => <LanguageCard key={language.code} language={language} onPress={() => router.push(`/(explore)/languages/${language.code}`)} />)}
        </TrendRail>
        <TrendRail title="Œuvres à découvrir" subtitle="Les créations qui attirent l’attention" items={trendArtworks.data?.items} isDemo={isDemo} onViewAll={() => router.push('/(explore)/artworks')} onPress={openDiscovery}>
          {artworksPage?.content.map((artwork) => <ArtworkCard key={artwork.assetId} artwork={artwork} onPress={() => router.push(`/(explore)/artworks/${artwork.assetId}`)} />)}
        </TrendRail>
        <TrendRail title="Artisans près de vous" subtitle="Les savoir-faire les plus recherchés" items={trendArtisans.data?.items} isDemo={isDemo} onViewAll={() => router.push('/(explore)/artisans')} onPress={openDiscovery}>
          {artisansPage?.content.map((artisan) => <ArtisanCard key={artisan.partnerId} artisan={artisan} onPress={() => router.push(`/(explore)/artisans/${artisan.partnerId}`)} />)}
        </TrendRail>
        <TrendRail title="Défis tendance" subtitle="Les défis culturels actifs de la communauté" items={undefined} isDemo={isDemo} onViewAll={() => router.push('/(explore)/challenges')} onPress={openDiscovery}>
          {cultureChallenges?.content.map((challenge) => <CultureChallengeCard key={challenge.id} challenge={challenge} onPress={() => router.push(`/(explore)/challenges/${challenge.id}`)} />)}
        </TrendRail>
        <TrendRail title="Événements tendance" subtitle="Les rendez-vous à ne pas manquer" items={trendEvents.data?.items} isDemo={isDemo} onViewAll={() => router.push({ pathname: '/(explore)/events', params: { region: selectedRegion.name, regionCode } })} onPress={openDiscovery} />
      </ScrollView>
    </View>
  );
}

function TrendRail({
  title,
  subtitle,
  items,
  isDemo,
  children,
  onViewAll,
  onPress,
}: {
  title: string;
  subtitle: string;
  items?: DiscoveryItem[];
  isDemo: boolean;
  children?: ReactNode;
  onViewAll: () => void;
  onPress: (item: DiscoveryItem) => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  const showDiscovery = !isDemo && items && items.length > 0;
  const showChildren = Boolean(children);
  if (!showDiscovery && !showChildren) return null;
  return (
    <View className="mb-7">
      <View className="mb-3 flex-row items-end justify-between px-4">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-extrabold" style={{ color: colors.text }}>{title}</Text>
          <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{subtitle}</Text>
        </View>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}><Text className="text-sm font-bold text-[#EF4444]">Voir tout</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {showDiscovery ? items!.map((item) => <DiscoveryTrendCard key={item.id} item={item} onPress={() => onPress(item)} />) : children}
      </ScrollView>
    </View>
  );
}
