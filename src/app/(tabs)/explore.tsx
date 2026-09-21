import { useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useYeyamoTabBarHeight } from '@/components/navigation/useYeyamoTabBarHeight';
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
import { discoveryHref } from '@/features/discovery/discovery.navigation';
import { recommendationAsDiscoveryItem } from '@/features/recommendations/recommendations.types';
import { useRecommendations } from '@/features/recommendations/recommendations.hooks';
import { useExplorerFeedback, useRemoveExplorerFeedback } from '@/features/interactions/generic-interactions.hooks';
import type { ExplorerFeedbackTarget, FeedbackType } from '@/features/interactions/generic-interactions.api';
import { useUpcomingEvents } from '@/features/events/useEvents';
import type { Event } from '@/features/events/types';
import { useExploreLocationStore } from '@/features/explore/explore-location.store';

const HERO_FALLBACK_COLORS = ['#7F1D1D', '#EF4444', '#F59E0B'] as const;

function recommendationFeedbackTarget(type: DiscoveryType): ExplorerFeedbackTarget | undefined {
  if (type === 'PLACE') return 'PLACE';
  if (type === 'EVENT') return 'EVENT';
  if (type === 'EXPERIENCE') return 'EXPERIENCE';
  if (type === 'CONTENT' || type === 'CULTURE') return 'CULTURE_CONTENT';
  return undefined;
}

export default function ExploreHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useYeyamoTabBarHeight();
  const colors = useThemeStore((state) => state.colors);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const countryCode = useCountryStore((state) => state.selectedCountryCode ?? undefined);
  const preferredLanguageCode = useCountryStore((state) => state.preferredLanguageCode);

  const categoriesQuery = useCategories();
  const regionsQuery = useRegions();
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const regions = useMemo(() => regionsQuery.data ?? [], [regionsQuery.data]);
  const selectedRegionId = useExploreLocationStore((state) => state.selectedRegionId);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [undoFeedback, setUndoFeedback] = useState<{ targetType: ExplorerFeedbackTarget; targetId: string } | null>(null);
  const feedbackMutation = useExplorerFeedback();
  const undoFeedbackMutation = useRemoveExplorerFeedback();

  const selectedRegion = useMemo(
    () => regions.find((region) => region.id === selectedRegionId),
    [regions, selectedRegionId],
  );
  const regionCode = selectedRegion?.code ?? (selectedRegion ? String(selectedRegion.id) : undefined);
  const trendingPlacesQuery = useTrendingPlaces({ regionCode });
  const trendingPlaces = useMemo(() => trendingPlacesQuery.data ?? [], [trendingPlacesQuery.data]);
  const selectedLocationLabel = selectedRegion?.name ?? 'Tout le pays';

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
    router.push({
      pathname: '/(explore)/places',
      params: {
        ...(selectedRegion ? { regionId: String(selectedRegion.id), regionCode, region: selectedRegion.name } : {}),
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
    const href = discoveryHref(item);
    if (href) return router.push(href);
    Alert.alert('Contenu indisponible', 'Ce type de découverte ne possède pas encore d’écran de détail dans l’application.');
  };
  const applyRecommendationFeedback = (item: DiscoveryItem, feedbackType: FeedbackType) => {
    const targetType = recommendationFeedbackTarget(item.type);
    if (!targetType || feedbackMutation.isPending) return;
    feedbackMutation.mutate({ targetType, targetId: item.sourceId.split(':').slice(1).join(':') || item.id, feedbackType }, {
      onSuccess: () => {
        if (feedbackType === 'NOT_INTERESTED') setUndoFeedback({ targetType, targetId: item.sourceId.split(':').slice(1).join(':') || item.id });
      },
    });
  };

  const openQuickFilter = ({ type, nearby }: { type?: DiscoveryType; nearby: boolean }) => {
    router.push({
      pathname: '/(explore)/search',
      params: nearby ? { nearby: '1', regionCode } : type ? { type } : {},
    });
  };

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
              onPress={() => router.push('/(explore)/preferences')}
              className="mt-1 flex-row items-center"
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Changer de zone de découverte. Zone actuelle : ${selectedLocationLabel}`}
            >
              <Icon name="location" size={15} color={colors.primary} />
              <Text className="ml-1 text-xs font-bold" style={{ color: colors.textSecondary }}>{selectedLocationLabel}</Text>
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

        {selectedRegion ? <FeaturedRegionCard region={selectedRegion} onPress={() => openPlacesForRegion()} /> : null}

        <SectionHeading title="Catégories" action="Tout voir" onPress={() => router.push('/(explore)/search')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}>
          {categoriesQuery.isLoading ? <View className="h-20 w-20 items-center justify-center"><ActivityIndicator color={colors.primary} /></View> : null}
          {categoriesQuery.isError ? <RetryRailItem label="Catégories indisponibles" onPress={() => void categoriesQuery.refetch()} /> : null}
          {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length === 0 ? <EmptyRailItem label="Aucune catégorie disponible" /> : null}
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
            isLoading={recommendations.isLoading}
            isError={recommendations.isError}
            onRetry={() => void recommendations.refetch()}
            onViewAll={() => router.push('/(explore)/search')}
            onPress={openDiscovery}
            onFeedback={applyRecommendationFeedback}
            feedbackDisabled={feedbackMutation.isPending}
          />

          <TrendRail
            title="Près de vous"
            subtitle={selectedRegion ? `Les lieux à découvrir dans ${selectedRegion.name}` : 'Les lieux à découvrir dans votre pays'}
            items={trendNearby.data?.items}
            isDemo={isDemo}
            isLoading={trendNearby.isLoading || trendingPlacesQuery.isLoading}
            isError={trendNearby.isError && trendingPlacesQuery.isError}
            onRetry={() => { void trendNearby.refetch(); void trendingPlacesQuery.refetch(); }}
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
            onViewAll={() => router.push({ pathname: '/(explore)/events', params: selectedRegion ? { region: selectedRegion.name, regionCode } : {} })}
            onOpenDiscovery={openDiscovery}
            onOpenEvent={(event) => router.push(`/(events)/${event.id}`)}
          />

          <TrendRail
            title="Culture et créateurs"
            subtitle="Histoires, œuvres et savoir-faire à transmettre"
            items={cultureAndCreatorItems}
            isDemo={isDemo}
            isLoading={trendCulture.isLoading || trendArtworks.isLoading || trendArtisans.isLoading}
            isError={trendCulture.isError && trendArtworks.isError && trendArtisans.isError}
            onRetry={() => { void trendCulture.refetch(); void trendArtworks.refetch(); void trendArtisans.refetch(); }}
            onViewAll={() => router.push('/(explore)/culture')}
            onPress={openDiscovery}
          >
            {demoCreatorCards}
          </TrendRail>
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => setIsCreateMenuOpen(true)}
        activeOpacity={0.85}
        className="absolute right-5 h-14 w-14 items-center justify-center rounded-full"
        style={{ bottom: tabBarHeight + 12, backgroundColor: '#DC2626', shadowColor: '#DC2626', shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 }}
        accessibilityRole="button"
        accessibilityLabel="Créer dans Explorer"
      >
        <Icon name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      <ExploreCreateMenu
        visible={isCreateMenuOpen}
        bottomInset={insets.bottom}
        onClose={() => setIsCreateMenuOpen(false)}
        onCreateAdventure={() => {
          setIsCreateMenuOpen(false);
          router.push('/(explore)/adventure');
        }}
        onSuggestPlace={() => {
          setIsCreateMenuOpen(false);
          router.push('/(create)/suggest-place-step1');
        }}
      />
      {undoFeedback ? <View className="absolute bottom-5 left-4 right-20 flex-row items-center rounded-2xl border p-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="flex-1 text-xs" style={{ color: colors.text }}>Suggestion masquée</Text><TouchableOpacity disabled={undoFeedbackMutation.isPending} onPress={() => void undoFeedbackMutation.mutateAsync(undoFeedback).then(() => setUndoFeedback(null)).catch(() => Alert.alert('Annulation impossible', 'Le feedback n’a pas pu être annulé.'))} accessibilityRole="button" accessibilityLabel="Annuler le masquage"><Text className="text-xs font-extrabold" style={{ color: undoFeedbackMutation.isPending ? colors.textMuted : colors.primary }}>Annuler</Text></TouchableOpacity></View> : null}

    </View>
  );
}

function ExploreCreateMenu({
  visible,
  bottomInset,
  onClose,
  onCreateAdventure,
  onSuggestPlace,
}: {
  visible: boolean;
  bottomInset: number;
  onClose: () => void;
  onCreateAdventure: () => void;
  onSuggestPlace: () => void;
}) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0" style={{ backgroundColor: colors.overlay }} onPress={onClose} accessibilityLabel="Fermer les actions Explorer" />
        <View className="rounded-t-[30px] border-t px-4 pt-3" style={{ backgroundColor: colors.card, borderColor: colors.border, paddingBottom: bottomInset + 20 }}>
          <View className="mb-4 h-1 w-10 self-center rounded-full" style={{ backgroundColor: colors.textMuted }} />
          <Text className="text-xl font-extrabold" style={{ color: colors.text }}>Créer dans Explorer</Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>Préparez une aventure ou contribuez avec un nouveau lieu.</Text>
          <CreateMenuAction icon="compass-outline" title="Créer une nouvelle aventure" description="Choisissez vos dates, votre budget et vos centres d’intérêt." onPress={onCreateAdventure} />
          <CreateMenuAction icon="location-outline" title="Créer un lieu" description="Suggérez un lieu pour enrichir Yeyamo." onPress={onSuggestPlace} />
        </View>
      </View>
    </Modal>
  );
}

function CreateMenuAction({ icon, title, description, onPress }: { icon: string; title: string; description: string; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.78} className="mt-4 min-h-20 flex-row items-center rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }} accessibilityRole="button">
      <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: '#DC262618' }}><Icon name={icon as never} size={22} color="#DC2626" /></View>
      <View className="ml-3 flex-1"><Text className="font-bold" style={{ color: colors.text }}>{title}</Text><Text className="mt-1 text-xs leading-4" style={{ color: colors.textSecondary }}>{description}</Text></View>
      <Icon name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
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
  isLoading = false,
  isError = false,
  onRetry,
  children,
  onViewAll,
  onPress,
  onFeedback,
  feedbackDisabled = false,
  actionLabel = 'Voir tout',
}: {
  title: string;
  subtitle: string;
  items?: DiscoveryItem[];
  isDemo: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  children?: ReactNode;
  onViewAll: () => void;
  onPress: (item: DiscoveryItem) => void;
  onFeedback?: (item: DiscoveryItem, feedbackType: FeedbackType) => void;
  feedbackDisabled?: boolean;
  actionLabel?: string;
}) {
  const colors = useThemeStore((state) => state.colors);
  const showDiscovery = !isDemo && Boolean(items?.length);
  const showChildren = isDemo && Boolean(children) && (!Array.isArray(children) || children.length > 0);
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
      {isLoading && !showDiscovery && !showChildren ? <View className="h-24 items-center justify-center"><ActivityIndicator color={colors.primary} /></View> : null}
      {isError && !showDiscovery && !showChildren ? <RailFeedback label="Impossible de charger cette sélection" action="Réessayer" onPress={onRetry} /> : null}
      {!isLoading && !isError && !showDiscovery && !showChildren ? <RailFeedback label="Aucun contenu disponible pour le moment" /> : null}
      {showDiscovery || showChildren ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {showDiscovery ? items!.map((item) => {
          const canGiveFeedback = Boolean(onFeedback && recommendationFeedbackTarget(item.type));
          return <DiscoveryTrendCard key={item.id} item={item} onPress={() => onPress(item)} onInterested={canGiveFeedback ? () => onFeedback?.(item, 'INTERESTED') : undefined} onNotInterested={canGiveFeedback ? () => onFeedback?.(item, 'NOT_INTERESTED') : undefined} feedbackDisabled={feedbackDisabled} />;
        }) : children}
      </ScrollView>
      : null}
    </View>
  );
}

function RailFeedback({ label, action, onPress }: { label: string; action?: string; onPress?: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="px-4 py-4"><Text className="text-sm" style={{ color: colors.textSecondary }}>{label}</Text>{action && onPress ? <TouchableOpacity onPress={onPress} className="mt-2 self-start"><Text className="text-sm font-bold" style={{ color: colors.primary }}>{action}</Text></TouchableOpacity> : null}</View>;
}

function RetryRailItem({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="mr-3 w-40 rounded-2xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.card }}><Icon name="reload-outline" size={20} color={colors.primary} /><Text className="mt-2 text-xs font-bold" style={{ color: colors.text }}>{label}</Text><Text className="mt-1 text-xs font-bold" style={{ color: colors.primary }}>Réessayer</Text></TouchableOpacity>;
}

function EmptyRailItem({ label }: { label: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="w-44 justify-center rounded-2xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.card }}><Text className="text-xs" style={{ color: colors.textSecondary }}>{label}</Text></View>;
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

export function RegionPicker({
  visible,
  regions,
  selectedRegion,
  isLoading,
  isError,
  bottomInset,
  onClose,
  onSelect,
  onSelectCountry,
  onRetry,
}: {
  visible: boolean;
  regions: Region[];
  selectedRegion?: Region;
  isLoading: boolean;
  isError: boolean;
  bottomInset: number;
  onClose: () => void;
  onSelect: (region: Region) => void;
  onSelectCountry: () => void;
  onRetry: () => void;
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
            <TouchableOpacity
              onPress={onSelectCountry}
              className="mb-2 min-h-14 flex-row items-center rounded-2xl border px-4 py-3"
              style={{ backgroundColor: !selectedRegion ? `${colors.primary}12` : colors.background, borderColor: !selectedRegion ? colors.primary : colors.border }}
              activeOpacity={0.78}
              accessibilityRole="radio"
              accessibilityState={{ selected: !selectedRegion }}
            >
              <View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: !selectedRegion ? `${colors.primary}1F` : colors.elevated }}>
                <Icon name="earth-outline" size={19} color={!selectedRegion ? colors.primary : colors.textSecondary} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-bold" style={{ color: colors.text }}>Tout le pays</Text>
                <Text className="mt-0.5 text-xs" style={{ color: colors.textMuted }}>Ne pas limiter Explorer à une région</Text>
              </View>
              {!selectedRegion ? <Icon name="checkmark-circle" size={22} color={colors.primary} /> : null}
            </TouchableOpacity>
            {isLoading ? <View className="items-center py-6"><ActivityIndicator color={colors.primary} /></View> : null}
            {isError ? <View className="items-center px-4 py-6"><Text className="text-center text-sm" style={{ color: colors.textSecondary }}>Les régions sont indisponibles. Explorer reste disponible pour tout le pays.</Text><TouchableOpacity onPress={onRetry} className="mt-3 rounded-xl px-4 py-2" style={{ backgroundColor: colors.elevated }}><Text className="text-sm font-bold" style={{ color: colors.primary }}>Réessayer</Text></TouchableOpacity></View> : null}
            {!isLoading && !isError && regions.length === 0 ? <Text className="px-4 py-6 text-center text-sm" style={{ color: colors.textSecondary }}>Aucune région disponible pour le moment.</Text> : null}
            {regions.map((region) => {
              const active = region.id === selectedRegion?.id;
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
