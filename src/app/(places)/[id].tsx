import { ActivityIndicator, Alert, View, Text, ScrollView, TouchableOpacity, Dimensions, Share } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useThemeStore } from '@/features/theme/theme.store';
import { usePlaceDetail } from '@/features/places/usePlaces';

const { width } = Dimensions.get('window');

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [isSaved, setIsSaved] = useState(false);
  
  const { data: place, isLoading } = usePlaceDetail(id);

  if (isLoading || !place) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const openDirections = () => router.push(`/(places)/route/${place.id}`);
  const explainBookingBlock = () => Alert.alert(
    'Réservation indisponible',
    'BLOCKED_BY_BACKEND — le contrat disponible ne relie pas encore ce lieu à une activité réservable et ne publie pas le DTO nécessaire au formulaire de réservation.',
  );

  const sharePlace = async () => {
    await Share.share({
      message: `${place.name} - ${place.address || place.city}`,
    });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
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
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View className="flex-row gap-2 mr-4">
              <TouchableOpacity 
                onPress={() => setIsSaved(!isSaved)}
                className="bg-black/50 w-10 h-10 rounded-full items-center justify-center"
              >
                <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={sharePlace}
                className="bg-black/50 w-10 h-10 rounded-full items-center justify-center"
              >
                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image with Gallery Counter */}
        <View className="relative">
          <Image
            source={{ uri: place.cover_image_url || '' }}
            style={{ width, height: 300 }}
            contentFit="cover"
          />
          <View className="absolute bottom-3 right-3 bg-black/70 px-3 py-1.5 rounded-full">
            <Text className="text-xs font-medium text-white">1/{place.photos?.length || 1}</Text>
          </View>
        </View>

        <View className="px-4">
          {/* Title & Location */}
          <View className="flex-row items-start justify-between mt-4 mb-3">
            <View className="flex-1">
              <Text style={{ color: colors.text }} className=" text-2xl font-bold mb-1">{place.name}</Text>
              <Text style={{ color: colors.textSecondary }} className=" text-sm">{place.category} • {place.city}</Text>
            </View>
          </View>

          {/* Rating */}
          <View className="flex-row items-center gap-1 mb-4">
            <Ionicons name="star" size={18} color="#F59E0B" />
            <Text style={{ color: colors.text }} className=" text-base font-semibold">{place.rating?.toFixed(1)}</Text>
            <Text style={{ color: colors.textSecondary }} className=" text-sm">({place.reviews_count} avis)</Text>
          </View>

          {/* Address */}
          <View className="flex-row items-start gap-2 mb-4">
            <Ionicons name="location-outline" size={20} color="#A1A1AA" />
            <Text style={{ color: colors.text }} className=" text-sm flex-1">{place.address}</Text>
          </View>

          {/* Opening Hours */}
          <View className="flex-row items-center gap-2 mb-5">
            <Ionicons name="time-outline" size={20} color="#A1A1AA" />
            <Text style={{ color: colors.text }} className=" text-sm">Ouvert • {place.opening_hours}</Text>
          </View>

          {/* Price Range */}
          <View className="rounded-2xl border p-4 mb-5" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text style={{ color: colors.textSecondary }} className=" text-xs mb-1">Prix par nuit</Text>
            <Text style={{ color: colors.text }} className=" text-xl font-bold">
              {place.price_from?.toLocaleString()} - {place.price_to?.toLocaleString()} {place.currency}
              <Text className="text-sm font-normal text-[#52525B] dark:text-[#A1A1AA]"> / nuit</Text>
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity onPress={explainBookingBlock} className="flex-1 bg-[#EF4444] py-3.5 rounded-xl items-center">
              <Text className="text-base font-semibold text-white">Réserver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openDirections}
              className="border px-5 py-3.5 rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={sharePlace}
              className="border px-5 py-3.5 rounded-xl items-center justify-center"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Avis récents Section */}
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text style={{ color: colors.text }} className=" text-lg font-bold">Avis récents</Text>
              <TouchableOpacity onPress={() => router.push('/(profile)/reviews')}>
                <Text className="text-[#EF4444] text-sm font-semibold">Voir tout</Text>
              </TouchableOpacity>
            </View>

            {place.recent_reviews?.map((review) => (
              <View key={review.id} className="mb-4">
                <View className="flex-row items-start gap-3">
                  <Image
                    source={{ uri: review.user_avatar }}
                    style={{ width: 40, height: 40 }}
                    className="rounded-full"
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text style={{ color: colors.text }} className=" font-semibold">{review.user_name}</Text>
                      <Text style={{ color: colors.textSecondary }} className=" text-xs">{review.date}</Text>
                    </View>
                    <View className="flex-row items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < review.rating ? 'star' : 'star-outline'}
                          size={12}
                          color={i < review.rating ? '#F59E0B' : '#52525B'}
                        />
                      ))}
                    </View>
                    <Text style={{ color: colors.textSecondary }} className=" text-sm leading-5">{review.comment}</Text>
                    {review.photos && review.photos.length > 0 && (
                      <View className="flex-row gap-2 mt-2">
                        {review.photos.map((photo, idx) => (
                          <Image
                            key={idx}
                            source={{ uri: photo }}
                            style={{ width: 80, height: 80 }}
                            className="rounded-lg"
                          />
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Événements liés Section */}
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text style={{ color: colors.text }} className=" text-lg font-bold">Événements liés</Text>
              <TouchableOpacity onPress={() => router.push('/(explore)/events')}>
                <Text className="text-[#EF4444] text-sm font-semibold">Voir tout</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
              {place.related_events?.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => router.push(`/(events)/${event.id}`)}
                  className="mr-3"
                >
                  <Image
                    source={{ uri: event.image_url }}
                    style={{ width: 160, height: 120 }}
                    className="rounded-xl mb-2"
                  />
                  <Text style={{ color: colors.text }} className=" font-semibold text-sm" numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className=" text-xs mt-0.5">{event.date} • {event.time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Événements similaires Section */}
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text style={{ color: colors.text }} className=" text-lg font-bold">Événements similaires</Text>
              <TouchableOpacity onPress={() => router.push('/(explore)/events')}>
                <Text className="text-[#EF4444] text-sm font-semibold">Voir tout</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
              {place.similar_events?.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => router.push(`/(events)/${event.id}`)}
                  className="mr-3"
                >
                  <Image
                    source={{ uri: event.image_url }}
                    style={{ width: 160, height: 120 }}
                    className="rounded-xl mb-2"
                  />
                  <Text style={{ color: colors.text }} className=" font-semibold text-sm" numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className=" text-xs mt-0.5">{event.date}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
