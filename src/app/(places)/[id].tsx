import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native';
import { usePlaceDetail } from '@/features/places/usePlaces';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: place, isLoading, isError } = usePlaceDetail(Number(id));

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center">
        <ActivityIndicator color="#7C3AED" />
      </View>
    );
  }

  if (isError || !place) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center px-6">
        <Text className="text-[#EF4444] text-center">Place not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: place.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="pr-4">
              <Text className="text-white text-base">←</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerClassName="pb-10">
        {/* Cover */}
        {place.cover_image_url ? (
          <Image
            source={{ uri: place.cover_image_url }}
            style={{ width: '100%', height: 220 }}
            contentFit="cover"
          />
        ) : (
          <View className="w-full h-52 bg-[#161616] items-center justify-center">
            <Text style={{ fontSize: 48 }}>📍</Text>
          </View>
        )}

        <View className="px-4 pt-5 gap-3">
          {/* Name & category */}
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">{place.name}</Text>
              <Text className="text-[#7C3AED] text-sm font-medium mt-0.5 capitalize">
                {place.category}
              </Text>
            </View>
            {place.rating != null ? (
              <View className="flex-row items-center gap-1 bg-[#1F1F1F] px-3 py-1.5 rounded-full">
                <Text style={{ fontSize: 14 }}>⭐</Text>
                <Text className="text-white text-sm font-semibold">
                  {place.rating.toFixed(1)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Location */}
          <View className="flex-row items-center gap-1.5">
            <Text style={{ fontSize: 14 }}>📍</Text>
            <Text className="text-[#A1A1AA] text-sm">{place.address}, {place.city}</Text>
          </View>

          {/* Stats */}
          <View className="flex-row gap-4 mt-1">
            <View className="bg-[#161616] flex-1 rounded-xl p-3 items-center">
              <Text className="text-white font-bold text-lg">{place.events_count}</Text>
              <Text className="text-[#A1A1AA] text-xs mt-0.5">Events</Text>
            </View>
            <View className="bg-[#161616] flex-1 rounded-xl p-3 items-center">
              <Text className="text-white font-bold text-lg">{place.posts_count}</Text>
              <Text className="text-[#A1A1AA] text-xs mt-0.5">Posts</Text>
            </View>
          </View>

          {/* Description */}
          {place.description ? (
            <Text className="text-[#A1A1AA] text-sm leading-6 mt-1">
              {place.description}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
