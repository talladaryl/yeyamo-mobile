import { View, Text, ActivityIndicator, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { VerticalFeedList } from '@/components/feed/VerticalFeedList';
import { StoriesList } from '@/components/story/StoriesList';
import { Icon } from '@/components/ui/Icon';
import { useFeed } from '@/features/feed/useFeed';
import type { FeedPost } from '@/features/feed/types';
import { useThemeStore } from '@/features/theme/theme.store';
import { useRegions } from '@/features/explore/useExplore';
import { useStories } from '@/features/story/useStory';
import { useAuth } from '@/features/auth/useAuth';

export default function FeedScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { user } = useAuth();
  const { data: regions = [] } = useRegions();
  const { data: stories = [] } = useStories();
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>();
  const [isRegionPickerOpen, setRegionPickerOpen] = useState(false);
  const selectedRegion = regions.find((region) => region.id === selectedRegionId);
  const { data, isLoading, isError, fetchNextPage, hasNextPage } = useFeed(selectedRegionId);

  const posts = useMemo<FeedPost[]>(() => {
    const loadedPosts = data?.pages.flatMap((page) => page.data) ?? [];
    return loadedPosts;
  }, [data]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
        <Text className="text-[#EF4444] text-base text-center">
          Échec du chargement du feed
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Compact feed controls: region + search, without a brand header. */}
      <SafeAreaView edges={['top']} className="border-b" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
        <View className="flex-row items-center justify-between px-4 py-1.5">
          <TouchableOpacity
            onPress={() => setRegionPickerOpen(true)}
            className="h-8 flex-row items-center gap-1.5 rounded-full px-3"
            style={{ backgroundColor: colors.elevated }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Filtrer par région"
          >
            <Icon library="ionicons" name="location" size={15} color="#EF4444" />
            <Text className="max-w-40 text-xs font-semibold" style={{ color: colors.text }} numberOfLines={1}>
              {selectedRegion?.name ?? 'Toutes les régions'}
            </Text>
            <Icon library="ionicons" name="chevron-down" size={14} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(explore)/search')}
            activeOpacity={0.8}
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.elevated }}
            accessibilityRole="button"
            accessibilityLabel="Rechercher"
          >
            <Icon library="ionicons" name="search" size={19} color={colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Stories */}
      <StoriesList stories={stories} currentUserId={user?.id} />

      {/* Vertical Feed */}
      <VerticalFeedList
        posts={posts}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
      />

      <Modal visible={isRegionPickerOpen} transparent animationType="fade" onRequestClose={() => setRegionPickerOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/45" onPress={() => setRegionPickerOpen(false)}>
          <Pressable
            className="max-h-[70%] rounded-t-[28px] border-t px-4 pb-8 pt-3"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            onPress={(event) => event.stopPropagation()}
          >
            <View className="mb-4 h-1 w-10 self-center rounded-full" style={{ backgroundColor: colors.border }} />
            <Text className="mb-1 text-xl font-extrabold" style={{ color: colors.text }}>Filtrer par région</Text>
            <Text className="mb-4 text-sm" style={{ color: colors.textSecondary }}>Choisissez une région du Cameroun.</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[{ id: undefined, name: 'Toutes les régions' }, ...regions].map((region) => {
                const isSelected = region.id === selectedRegionId;
                return (
                  <TouchableOpacity
                    key={region.id ?? 'all'}
                    onPress={() => {
                      setSelectedRegionId(region.id);
                      setRegionPickerOpen(false);
                    }}
                    className="mb-2 flex-row items-center rounded-2xl border px-4 py-3.5"
                    style={{ backgroundColor: isSelected ? '#FEE2E2' : colors.elevated, borderColor: isSelected ? '#EF4444' : colors.border }}
                  >
                    <Icon name="location-outline" size={19} color={isSelected ? '#EF4444' : colors.textSecondary} />
                    <Text className="ml-3 flex-1 font-semibold" style={{ color: isSelected ? '#B91C1C' : colors.text }}>{region.name}</Text>
                    {isSelected ? <Icon name="checkmark-circle" size={21} color="#EF4444" /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
