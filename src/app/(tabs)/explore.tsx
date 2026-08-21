import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { CategoryCard } from '@/components/explore/CategoryCard';
import { TrendingPlaceCard } from '@/components/explore/TrendingPlaceCard';
import { DiscoveryTrendCard } from '@/components/explore/DiscoveryTrendCard';
import { ExploreQuickFilters } from '@/components/explore/ExploreQuickFilters';
import { useCategories, useRegions, useTrendingPlaces } from '@/features/explore/useExplore';
import type { Region } from '@/features/explore/types';
import { useThemeStore } from '@/features/theme/theme.store';
import { useCountryStore } from '@/features/country/country.store';
import { useAuthStore } from '@/features/auth/auth.store';
import { useCultureContents } from '@/features/culture/culture.hooks';
import { CultureContentCard } from '@/features/culture/components/CultureContentCard';
import { useArtworks } from '@/features/artworks/artworks.hooks';
import { ArtworkCard } from '@/features/artworks/components/ArtworkCard';
import { useArtisans } from '@/features/artisans/artisans.hooks';
import { ArtisanCard } from '@/features/artisans/components/ArtisanCard';
import { useDiscoveryTrending } from '@/features/discovery/discovery.hooks';
import type { DiscoveryItem, DiscoveryType } from '@/features/discovery/discovery.types';
import { recommendationAsDiscoveryItem } from '@/features/recommendations/recommendations.types';
import { useRecommendations } from '@/features/recommendations/recommendations.hooks';
import { useUpcomingEvents } from '@/features/events/useEvents';
import type { Event } from '@/features/events/types';

const HERO_FALLBACK_COLORS = ['#7F1D1D', '#EF4444', '#F59E0B'] as const;

export default function ExploreHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useThemeStore((state) => state.colors);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const countryCode = useCountryStore((state) => state.selectedCountryCode ?? undefined);
  const preferredLanguageCode = useCountryStore((state) => state.preferredLanguageCode);

  const categoriesQuery = useCategories();
  const regionsQuery = useRegions();
  const trendingPlacesQuery = useTrendingPlaces();
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const regions = useMemo(() => regionsQuery.data ?? [], [regionsQuery.data]);
  const trendingPlaces = useMemo(() => trendingPlacesQuery.data ?? [], [trendingPlacesQuery.data]);
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

  const { data: culturePage } = useCultureContents({ countryCode, verified: true, size: 6 });
  const { data: artworksPage } = useArtworks({ countryCode, size: 6 });
  const { data: artisansPage } = useArtisans({ countryCode, verified: true, size: 6 });
  const { data: upcomingEvents = [] } = useUpcomingEvents();
  const trendCulture = useDiscoveryTrending({ type: 'CULTURE', countryCode, size: 6 });
  const trendArtworks = useDiscoveryTrending({ type: 'ARTWORK', countryCode, size: 6 });
  const trendArtisans = useDiscoveryTrending({ type: 'ARTISAN', countryCode, regionCode, size: 6 });
  const trendNearby = useDiscoveryTrending({ type: 'PLACE', countryCode, regionCode, size: 6 });
  const trendEvents = useDiscoveryTrending({ type: 'EVENT', countryCode, regionCode, size: 6 });
  const recommendations = useRecommendations({ languageCodes: preferredLanguageCode ? [preferredLanguageCode] : [], size: 6 });

  const recommendationItems = useMemo(
    () => (recommendations.data?.items ?? []).map(recommendationAsDiscoveryItem),
    [recommendations.data?.items],
  );
  const cultureAndCreatorItems = useMemo(
    () => [
      ...(trendCulture.data?.items ?? []),
      ...(trendArtworks.data?.items ?? []),
      ...(trendArtisans.data?.items ?? []),
    ].slice(0, 8),
    [trendArtisans.data?.items, trendArtworks.data?.items, trendCulture.data?.items],
  );
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

  const openQuickFilter = ({ type, nearby }: { type?: DiscoveryType; nearby: boolean }) => {
    router.push({
      pathname: '/(explore)/search',
      params: nearby ? { nearby: '1', regionCode } : type ? { type } : {},
    });
  };

  if (!selectedRegion) {
    const failed = regionsQuery.isError;
    return (
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: colors.background }}>
        {failed ? (
          <>
            <View className="h-16 w-16 items-center justify-center rounded-3xl" style={{ backgroundColor: colors.elevated }}>
              <Icon name="cloud-offline-outline" size={30} color={colors.textSecondary} />
            </View>
            <Text className="mt-5 text-center text-lg font-extrabold" style={{ color: colors.text }}>Explorer est momentanément indisponible</Text>
            <Text className="mt-2 text-center text-sm leading-5" style={{ color: colors.textSecondary }}>Vérifiez votre connexion puis réessayez.</Text>
            <TouchableOpacity onPress={() => void regionsQuery.refetch()} className="mt-5 h-11 justify-center rounded-xl px-5" style={{ backgroundColor: colors.primary }}>
              <Text className="font-bold text-white">Réessayer</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text className="mt-4 text-sm font-semibold" style={{ color: colors.textSecondary }}>Préparation de vos découvertes…</Text>
          </>
        )}
      </View>
    );
  }

  const demoCreatorCards: ReactNode[] = isDemo ? [
    ...(culturePage?.content ?? []).slice(0, 3).map((content) => (
      <CultureContentCard key={`culture-${content.id}`} content={content} onPress={() => router.push(`/(explore)/culture/${content.id}`)} />
    )),
    ...(artworksPage?.content ?? []).slice(0, 2).map((artwork) => (
      <ArtworkCard key={`artwork-${artwork.assetId}`} artwork={artwork} onPress={() => router.push(`/(explore)/artworks/${artwork.assetId}`)} />
    )),
    ...(artisansPage?.content ?? []).slice(0, 2).map((artisan) => (
      <ArtisanCard key={`artisan-${artisan.partnerId}`} artisan={artisan} onPress={() => router.push(`/(explore)/artisans/${artisan.partnerId}`)} />
    )),
  ] : [];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top }} className="border-b px-4 pb-3 pt-2" >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-black" style={{ color: colors.text }}>Explorer</Text>
            <TouchableOpacity
              onPress={() => setIsRegionPickerOpen(true)}
              className="mt-1 flex-row items-center"
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Changer de région. Région actuelle : ${selectedRegion.name}`}
            >
              <Icon name="location" size={15} color={colors.primary} />
              <Text className="ml-1 text-xs font-bold" style={{ color: colors.textSecondary }}>{selectedLocationLabel}</Text>
              <Text className="mx-1 text-xs" style={{ color: colors.textMuted }}>·</Text>
              <Text className="text-xs" style={{ color: colors.textMuted }}>{selectedRegion.name}</Text>
              <Icon name="chevron-down" size={13} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(explore)/map')}
            className="h-11 w-11 items-center justify-center rounded-full border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel="Explorer sur la carte"
          >
            <Icon name="map-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 28 }}>
        <View className="mt-4 flex-row px-4">
          <TouchableOpacity
            onPress={() => router.push('/(explore)/search')}
            className="h-12 flex-1 flex-row items-center rounded-2xl border px-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            activeOpacity={0.78}
            accessibilityRole="search"
            accessibilityLabel="Rechercher dans Explorer"
          >
            <Icon name="search" size={20} color={colors.textSecondary} />
            <Text className="ml-3 flex-1 text-sm" style={{ color: colors.textSecondary }} numberOfLines={1}>Lieux, culture, événements…</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(explore)/search', params: { filters: '1' } })}
            className="ml-2 h-12 w-12 items-center justify-center rounded-2xl border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir les filtres"
          >
            <Icon name="options-outline" size={21} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View className="mt-3">
          <ExploreQuickFilters
            nearby={false}
            activeFilterCount={0}
            onSelect={openQuickFilter}
            onOpenAdvanced={() => router.push({ pathname: '/(explore)/search', params: { filters: '1' } })}
          />
        </View>

        <FeaturedRegionCard region={selectedRegion} onPress={() => openPlacesForRegion()} />

        <SectionHeading title="Catégories" action="Tout voir" onPress={() => router.push('/(explore)/search')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}>
          {categories.slice(0, 7).map((category) => (
            <View key={category.id} className="mr-2 w-20">
              <CategoryCard category={category} onPress={() => openCategory(category.id)} />
            </View>
          ))}
        </ScrollView>

        <View className="mt-7">
          <TrendRail
            title="Pour vous"
            subtitle="Selon vos préférences et vos découvertes"
            items={recommendationItems}
            isDemo={isDemo}
            onViewAll={() => router.push('/(explore)/search')}
            onPress={openDiscovery}
          />

          <TrendRail
            title="Près de vous"
            subtitle={`Les lieux à découvrir dans ${selectedRegion.name}`}
            items={trendNearby.data?.items}
            isDemo={isDemo}
            onViewAll={() => openPlacesForRegion()}
            onPress={openDiscovery}
            actionLabel="Voir sur la carte"
          >
            {filteredTrendingPlaces.slice(0, 8).map((place) => (
              <TrendingPlaceCard key={place.id} place={place} onPress={() => router.push(`/(places)/${place.id}`)} />
            ))}
          </TrendRail>

          <EventRail
            events={upcomingEvents.slice(0, 8)}
            fallbackItems={trendEvents.data?.items ?? []}
            isDemo={isDemo}
            onViewAll={() => router.push({ pathname: '/(explore)/events', params: { region: selectedRegion.name, regionCode } })}
            onOpenDiscovery={openDiscovery}
            onOpenEvent={(event) => router.push(`/(events)/${event.id}`)}
          />

          <TrendRail
            title="Culture et créateurs"
            subtitle="Histoires, œuvres et savoir-faire à transmettre"
            items={cultureAndCreatorItems}
            isDemo={isDemo}
            onViewAll={() => router.push('/(explore)/culture')}
            onPress={openDiscovery}
          >
            {demoCreatorCards}
          </TrendRail>
        </View>
      </ScrollView>

      <RegionPicker
        visible={isRegionPickerOpen}
        regions={regions}
        selectedRegion={selectedRegion}
        bottomInset={insets.bottom}
        onClose={() => setIsRegionPickerOpen(false)}
        onSelect={(region) => {
          setSelectedRegionId(region.id);
          setIsRegionPickerOpen(false);
        }}
      />
    </View>
  );
}

function FeaturedRegionCard({ region, onPress }: { region: Region; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  const hasImage = Boolean(region.cover_image_url);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="mx-4 mb-7 mt-1 h-56 overflow-hidden rounded-3xl"
      style={{ backgroundColor: colors.elevated }}
      accessibilityRole="button"
      accessibilityLabel={`Découvrir la région ${region.name}`}
    >
      {hasImage ? (
        <Image source={{ uri: region.cover_image_url }} style={{ position: 'absolute', inset: 0 }} contentFit="cover" transition={180} />
      ) : (
        <LinearGradient colors={HERO_FALLBACK_COLORS} style={{ position: 'absolute', inset: 0 }} />
      )}
      <LinearGradient colors={['rgba(6, 12, 24, 0.05)', 'rgba(6, 12, 24, 0.88)']} style={{ position: 'absolute', inset: 0 }} />
      <View className="flex-1 justify-between p-5">
        <View className="self-start rounded-full bg-black/35 px-3 py-1.5">
          <Text className="text-[11px] font-extrabold uppercase tracking-wider text-white">À la une</Text>
        </View>
        <View>
          <Text className="text-2xl font-black text-white">Explorez {region.name}</Text>
          <Text className="mt-1 text-sm leading-5 text-white/85" numberOfLines={2}>
            {region.description || 'Découvrez ses lieux, ses événements et les histoires de sa communauté.'}
          </Text>
          <View className="mt-4 flex-row items-center self-start rounded-full bg-white px-4 py-2.5">
            <Text className="text-xs font-extrabold text-[#162033]">Découvrir</Text>
            <Icon name="arrow-forward" size={15} color="#162033" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SectionHeading({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="mb-4 flex-row items-center justify-between px-4">
      <Text className="text-xl font-black" style={{ color: colors.text }}>{title}</Text>
      <TouchableOpacity onPress={onPress} className="min-h-11 justify-center" accessibilityRole="button">
        <Text className="text-sm font-bold" style={{ color: colors.primary }}>{action}</Text>
      </TouchableOpacity>
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
  actionLabel = 'Voir tout',
}: {
  title: string;
  subtitle: string;
  items?: DiscoveryItem[];
  isDemo: boolean;
  children?: ReactNode;
  onViewAll: () => void;
  onPress: (item: DiscoveryItem) => void;
  actionLabel?: string;
}) {
  const colors = useThemeStore((state) => state.colors);
  const showDiscovery = !isDemo && Boolean(items?.length);
  const showChildren = isDemo && Boolean(children) && (!Array.isArray(children) || children.length > 0);
  if (!showDiscovery && !showChildren) return null;

  return (
    <View className="mb-8">
      <View className="mb-3 flex-row items-end justify-between px-4">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-black" style={{ color: colors.text }}>{title}</Text>
          <Text className="mt-1 text-xs leading-4" style={{ color: colors.textSecondary }}>{subtitle}</Text>
        </View>
        <TouchableOpacity onPress={onViewAll} className="min-h-11 justify-center" activeOpacity={0.7} accessibilityRole="button">
          <Text className="text-xs font-extrabold" style={{ color: colors.primary }}>{actionLabel}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {showDiscovery ? items!.map((item) => <DiscoveryTrendCard key={item.id} item={item} onPress={() => onPress(item)} />) : children}
      </ScrollView>
    </View>
  );
}

function EventRail({
  events,
  fallbackItems,
  isDemo,
  onViewAll,
  onOpenEvent,
  onOpenDiscovery,
}: {
  events: Event[];
  fallbackItems: DiscoveryItem[];
  isDemo: boolean;
  onViewAll: () => void;
  onOpenEvent: (event: Event) => void;
  onOpenDiscovery: (item: DiscoveryItem) => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  const useEvents = events.length > 0;
  if (!useEvents && fallbackItems.length === 0) return null;

  return (
    <View className="mb-8">
      <View className="mb-3 flex-row items-end justify-between px-4">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-black" style={{ color: colors.text }}>Événements à venir</Text>
          <Text className="mt-1 text-xs leading-4" style={{ color: colors.textSecondary }}>Les prochains rendez-vous à ne pas manquer</Text>
        </View>
        <TouchableOpacity onPress={onViewAll} className="min-h-11 justify-center" accessibilityRole="button">
          <Text className="text-xs font-extrabold" style={{ color: colors.primary }}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {useEvents
          ? events.map((event) => <EventPreviewCard key={event.id} event={event} onPress={() => onOpenEvent(event)} />)
          : !isDemo
            ? fallbackItems.map((item) => <DiscoveryTrendCard key={item.id} item={item} onPress={() => onOpenDiscovery(item)} />)
            : null}
      </ScrollView>
    </View>
  );
}

function EventPreviewCard({ event, onPress }: { event: Event; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  const date = new Date(event.start_date);
  const validDate = !Number.isNaN(date.getTime());
  const day = validDate ? date.toLocaleDateString('fr-FR', { day: '2-digit' }) : '--';
  const month = validDate ? date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '') : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.86}
      className="mr-3 w-72 overflow-hidden rounded-3xl border"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      accessibilityRole="button"
      accessibilityLabel={`Voir l’événement ${event.title}`}
    >
      <View className="h-36 overflow-hidden" style={{ backgroundColor: colors.elevated }}>
        {event.cover_image_url ? (
          <Image source={{ uri: event.cover_image_url }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={180} />
        ) : (
          <View className="flex-1 items-center justify-center"><Icon name="calendar-outline" size={36} color={colors.primary} /></View>
        )}
        <View className="absolute left-3 top-3 items-center rounded-2xl bg-white px-2.5 py-1.5">
          <Text className="text-base font-black text-[#162033]">{day}</Text>
          <Text className="text-[10px] font-extrabold uppercase text-[#EF4444]">{month}</Text>
        </View>
      </View>
      <View className="p-4">
        <Text className="text-base font-extrabold" style={{ color: colors.text }} numberOfLines={1}>{event.title}</Text>
        <View className="mt-2 flex-row items-center">
          <Icon name="location-outline" size={14} color={colors.textMuted} />
          <Text className="ml-1 flex-1 text-xs" style={{ color: colors.textSecondary }} numberOfLines={1}>{event.location || event.city}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RegionPicker({
  visible,
  regions,
  selectedRegion,
  bottomInset,
  onClose,
  onSelect,
}: {
  visible: boolean;
  regions: Region[];
  selectedRegion: Region;
  bottomInset: number;
  onClose: () => void;
  onSelect: (region: Region) => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0" style={{ backgroundColor: colors.overlay }} onPress={onClose} accessibilityLabel="Fermer le choix de région" />
        <View className="max-h-[78%] rounded-t-[30px] border-t px-4 pt-3" style={{ backgroundColor: colors.card, borderColor: colors.border, paddingBottom: bottomInset + 16 }}>
          <View className="mb-4 h-1 w-10 self-center rounded-full" style={{ backgroundColor: colors.textMuted }} />
          <View className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-black" style={{ color: colors.text }}>Choisir une région</Text>
              <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>Personnalisez les découvertes près de vous</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }} accessibilityRole="button" accessibilityLabel="Fermer">
              <Icon name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {regions.map((region) => {
              const active = region.id === selectedRegion.id;
              return (
                <TouchableOpacity
                  key={region.id}
                  onPress={() => onSelect(region)}
                  className="mb-2 min-h-14 flex-row items-center rounded-2xl border px-4 py-3"
                  style={{ backgroundColor: active ? `${colors.primary}12` : colors.background, borderColor: active ? colors.primary : colors.border }}
                  activeOpacity={0.78}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: active ? `${colors.primary}1F` : colors.elevated }}>
                    <Icon name="location-outline" size={19} color={active ? colors.primary : colors.textSecondary} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="font-bold" style={{ color: colors.text }}>{region.name}</Text>
                    <Text className="mt-0.5 text-xs" style={{ color: colors.textMuted }}>{region.places_count ? `${region.places_count} lieux disponibles` : 'Découvrir cette région'}</Text>
                  </View>
                  {active ? <Icon name="checkmark-circle" size={22} color={colors.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
