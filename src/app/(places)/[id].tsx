import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { CTAButton } from '@/components/ui/CTAButton';
import { PlaceActions } from '@/components/places/PlaceActions';
import { PlaceAmenities } from '@/components/places/PlaceAmenities';
import { PlacePhotoGrid } from '@/components/places/PlacePhotoGrid';
import { usePlaceDetail } from '@/features/places/usePlaces';

// Mock photos - replace with real data from API
const mockPhotos = Array.from({ length: 6 }, (_, i) => 
  `https://via.placeholder.com/400?text=Photo+${i + 1}`
);

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: place, isLoading, isError } = usePlaceDetail(Number(id));

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center">
        <ActivityIndicator color="#EF4444" />
      </View>
    );
  }

  if (isError || !place) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center px-6">
        <Text className="text-[#EF4444] text-center">Lieu introuvable.</Text>
      </View>
    );
  }

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
            <View className="flex-row gap-3 mr-4">
              <TouchableOpacity className="bg-black/50 w-10 h-10 rounded-full items-center justify-center">
                <Icon library="ionicons" name="heart-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-black/50 w-10 h-10 rounded-full items-center justify-center">
                <Icon library="ionicons" name="share-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView>
        {/* Cover Image */}
        {place.cover_image_url ? (
          <Image
            source={{ uri: place.cover_image_url }}
            style={{ width: '100%', height: 300 }}
            contentFit="cover"
          />
        ) : (
          <View className="w-full h-72 bg-[#161616] items-center justify-center">
            <Icon library="ionicons" name="location" size={64} color="#52525B" />
          </View>
        )}

        {/* Place Info */}
        <View className="px-4 pt-4">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-white text-2xl font-bold">{place.name}</Text>
                <VerifiedBadge size={20} />
              </View>
              <Text className="text-[#A1A1AA] text-sm">
                {place.category} - {place.city}, Cameroun
              </Text>
            </View>

            {place.rating && (
              <View className="bg-[#161616] px-3 py-2 rounded-full flex-row items-center gap-1">
                <Icon library="ionicons" name="star" size={16} color="#F59E0B" />
                <Text className="text-white text-sm font-semibold">
                  {place.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {place.description && (
            <Text className="text-white text-sm leading-6 mb-4">
              {place.description}
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <PlaceActions
          onCall={() => console.log('Call')}
          onDirections={() => console.log('Directions')}
          onWebsite={() => console.log('Website')}
          onShare={() => console.log('Share')}
        />

        {/* Amenities */}
        <PlaceAmenities />

        {/* Photo Grid */}
        <View className="border-t border-[#27272A] mt-2">
          <PlacePhotoGrid
            photos={mockPhotos}
            onPhotoPress={(index) => console.log('Photo', index)}
          />
        </View>

        {/* Bottom spacing for CTA button */}
        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <SafeAreaView className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] px-4 py-3">
        <CTAButton
          title="Voir les disponibilités"
          variant="primary"
          onPress={() => console.log('Check availability')}
        />
      </SafeAreaView>
    </View>
  );
}
