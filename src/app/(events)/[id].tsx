import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { CTAButton } from '@/components/ui/CTAButton';
import { EventOrganizer } from '@/components/events/EventOrganizer';
import { EventParticipants } from '@/components/events/EventParticipants';

// Mock data - replace with real API
const mockEvent = {
  id: 1,
  title: 'Festival Eboa Lotin',
  description:
    'Le plus grand festival musical de la côte camerounaise. Trois jours de musique, de danse et de culture.',
  cover_image_url: null,
  start_date: '2025-05-24T00:00:00Z',
  end_date: '2025-05-26T00:00:00Z',
  location: 'Kribi',
  address: 'Plage de Kribi',
  city: 'Kribi',
  organizer: {
    id: 1,
    username: 'team_yeyamo',
    display_name: 'Team Yeyamo',
    avatar_url: null,
    is_verified: true,
  },
  participants_count: 1234,
  participants: [
    { id: 2, username: 'user1', display_name: 'User 1', avatar_url: null, is_verified: false },
    { id: 3, username: 'user2', display_name: 'User 2', avatar_url: null, is_verified: false },
    { id: 4, username: 'user3', display_name: 'User 3', avatar_url: null, is_verified: false },
    { id: 5, username: 'user4', display_name: 'User 4', avatar_url: null, is_verified: false },
  ],
  is_participating: false,
  is_saved: false,
  price: null,
  currency: 'XAF',
  created_at: new Date().toISOString(),
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const isLoading = false;
  const event = mockEvent;

  // Format dates
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const dateRange = `${startDate.getDate()} - ${endDate.getDate()} ${endDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center">
        <ActivityIndicator color="#EF4444" />
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
        {event.cover_image_url ? (
          <Image
            source={{ uri: event.cover_image_url }}
            style={{ width: '100%', height: 300 }}
            contentFit="cover"
          />
        ) : (
          <View className="w-full h-72 bg-[#161616] items-center justify-center">
            <Icon library="ionicons" name="calendar" size={64} color="#52525B" />
          </View>
        )}

        {/* Event Info */}
        <View className="px-4 pt-4">
          <Text className="text-white text-2xl font-bold mb-3">{event.title}</Text>

          {/* Date */}
          <View className="flex-row items-center gap-2 mb-2">
            <Icon library="ionicons" name="calendar-outline" size={20} color="#EF4444" />
            <Text className="text-white text-base">{dateRange}</Text>
          </View>

          {/* Location */}
          <View className="flex-row items-center gap-2 mb-4">
            <Icon library="ionicons" name="location-outline" size={20} color="#EF4444" />
            <Text className="text-white text-base">
              {event.address}, {event.city}
            </Text>
          </View>

          {/* Description */}
          {event.description && (
            <Text className="text-white text-sm leading-6">{event.description}</Text>
          )}
        </View>

        {/* Organizer */}
        <EventOrganizer
          organizer={event.organizer}
          onProfilePress={() => router.push(`/(profile)/${event.organizer.username}`)}
          onFollowPress={() => console.log('Follow organizer')}
          isFollowing={false}
        />

        {/* Participants */}
        <EventParticipants
          participants={event.participants}
          totalCount={event.participants_count}
          onSeeAllPress={() => console.log('See all participants')}
        />

        {/* Bottom spacing for CTA button */}
        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <SafeAreaView className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] px-4 py-3">
        <CTAButton
          title="Voir les détails"
          variant="primary"
          onPress={() => console.log('View details')}
        />
      </SafeAreaView>
    </View>
  );
}
