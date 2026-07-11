import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import { CTAButton } from '@/components/ui/CTAButton';
import { TrendingPlaceCard } from '@/components/explore/TrendingPlaceCard';
import { EventCard } from '@/components/explore/EventCard';
import { regions, trendingPlaces, upcomingEvents } from '@/features/explore/mockData';

export default function RegionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Find region (mock)
  const region = regions.find(r => r.id === Number(id)) || regions[0];

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTransparent: true,
          headerTintColor: '#FFFFFF',
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              className="ml-4 bg-black/50 w-10 h-10 rounded-full items-center justify-center"
            >
              <Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity className="mr-4 bg-black/50 w-10 h-10 rounded-full items-center justify-center">
              <Icon library="ionicons" name="ellipsis-vertical" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView>
        {/* Cover Image */}
        <Image
          source={{ uri: region.cover_image_url }}
          style={{ width: '100%', height: 250 }}
          contentFit="cover"
        />

        {/* Region Info */}
        <View className="px-4 pt-4">
          {/* Badge */}
          <View className="bg-[#EF4444] self-start px-3 py-1.5 rounded-full mb-3">
            <Text className="text-white text-xs font-semibold">
              Région de l'Ouest
            </Text>
          </View>

          {/* Title */}
          <Text className="text-white text-2xl font-bold mb-2">
            {region.name}
          </Text>

          {/* Description */}
          <Text className="text-[#A1A1AA] text-sm leading-6 mb-4">
            {region.description}
          </Text>

          {/* Stats */}
          <View className="flex-row items-center justify-around bg-[#161616] rounded-2xl py-4 mb-6">
            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                {region.places_count}
              </Text>
              <Text className="text-[#A1A1AA] text-xs mt-1">Lieux</Text>
            </View>

            <View className="w-px h-12 bg-[#27272A]" />

            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                {region.events_count}
              </Text>
              <Text className="text-[#A1A1AA] text-xs mt-1">Événements</Text>
            </View>

            <View className="w-px h-12 bg-[#27272A]" />

            <View className="items-center">
              <Text className="text-white text-2xl font-bold">
                {region.experiences_count}
              </Text>
              <Text className="text-[#A1A1AA] text-xs mt-1">Expériences</Text>
            </View>
          </View>
        </View>

        {/* À ne pas manquer */}
        <View className="mb-6">
          <View className="px-4 flex-row items-center justify-between mb-3">
            <Text className="text-white text-lg font-bold">
              À ne pas manquer
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(explore)/places')}
              activeOpacity={0.7}
            >
              <Text className="text-[#EF4444] text-sm font-semibold">Voir tout</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {trendingPlaces.slice(0, 3).map((place) => (
              <TrendingPlaceCard
                key={place.id}
                place={place}
                onPress={() => router.push(`/(places)/${place.id}`)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Prochains événements */}
        <View className="mb-6">
          <View className="px-4 flex-row items-center justify-between mb-3">
            <Text className="text-white text-lg font-bold">
              Prochains événements
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(explore)/events')}
              activeOpacity={0.7}
            >
              <Text className="text-[#EF4444] text-sm font-semibold">Voir tout</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {upcomingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/(events)/${event.id}`)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Spacing for CTA */}
        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <SafeAreaView className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] px-4 py-3">
        <CTAButton
          title="Explorer la région"
          variant="primary"
          onPress={() => router.push({
            pathname: '/(explore)/places',
            params: { region: region.id },
          })}
        />
      </SafeAreaView>
    </View>
  );
}
