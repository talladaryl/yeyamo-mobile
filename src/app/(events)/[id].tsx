import { ActivityIndicator, Alert, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack, type Href } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useThemeStore } from '@/features/theme/theme.store';
import { useEventDetail, useEventRegistration, useUpcomingEvents } from '@/features/events/useEvents';
import { useEventTickets } from '@/features/ticketing/useTicketing';

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [isSaved, setIsSaved] = useState(false);
  
  const { data: event, isLoading } = useEventDetail(id);
  const { data: upcomingEvents = [] } = useUpcomingEvents();
  const registration = useEventRegistration(id);
  const { data: ticketing } = useEventTickets(String(id));

  if (isLoading || !event) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

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
              <TouchableOpacity className="bg-black/50 w-10 h-10 rounded-full items-center justify-center">
                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image with Date Badge */}
        <View className="relative">
          <Image
            source={{ uri: event.cover_image_url || '' }}
            style={{ width, height: 280 }}
            contentFit="cover"
          />
          {/* Date Badge */}
          <View className="absolute top-4 left-4 bg-[#EF4444] rounded-2xl items-center justify-center px-3 py-2">
            <Text className="text-2xl font-bold text-white">
              {new Date(event.start_date).getDate()}
            </Text>
            <Text className="text-xs font-semibold uppercase text-white">
              {new Date(event.start_date).toLocaleDateString('fr-FR', { month: 'short' })}
            </Text>
          </View>
        </View>

        <View className="px-4">
          {/* Title */}
          <Text style={{ color: colors.text }} className=" text-2xl font-bold mt-4 mb-2">{event.title}</Text>
          
          {/* Location */}
          <TouchableOpacity 
            onPress={() => event.place_id && router.push(`/(places)/${event.place_id}`)}
            className="flex-row items-center gap-2 mb-3"
          >
            <Ionicons name="location-outline" size={18} color="#A1A1AA" />
            <Text style={{ color: colors.textSecondary }} className=" text-sm">{event.location}</Text>
          </TouchableOpacity>

          {/* Date & Time */}
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="time-outline" size={18} color="#A1A1AA" />
            <Text style={{ color: colors.text }} className=" text-sm">
              {new Date(event.start_date).toLocaleDateString('fr-FR', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })} • {event.start_time}
            </Text>
          </View>

          {/* Participants */}
          <View className="flex-row items-center gap-2 mb-5">
            <Ionicons name="people-outline" size={18} color="#A1A1AA" />
            <Text style={{ color: colors.text }} className=" text-sm">
              {event.participants_count} participants intéressés
            </Text>
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text style={{ color: colors.text }} className=" text-base leading-6">{event.description}</Text>
          </View>

          {/* Ticket Types */}
          {event.ticket_types && event.ticket_types.length > 0 && (
            <View className="mb-5">
              {event.ticket_types.map((ticket) => (
                <View 
                  key={ticket.id}
                  className="rounded-2xl border p-4 mb-3 flex-row items-center justify-between"
                  style={{ backgroundColor: colors.card, borderColor: colors.border }}
                >
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className=" font-semibold text-base mb-1">{ticket.label}</Text>
                    <Text style={{ color: colors.textSecondary }} className=" text-sm">
                      {ticket.price.toLocaleString()} {event.currency}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => registration.mutate(event.is_participating)}
                    disabled={registration.isPending}
                    className="bg-[#EF4444] px-6 py-2.5 rounded-xl"
                  >
                    <Text className="font-semibold text-white">Participer</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons (if no tickets) */}
          {(!event.ticket_types || event.ticket_types.length === 0) && (
            <View className="flex-row gap-3 mb-5">
              <TouchableOpacity
                onPress={() => registration.mutate(event.is_participating)}
                disabled={registration.isPending}
                className="flex-1 bg-[#EF4444] py-3.5 rounded-xl items-center"
              >
                <Text className="text-base font-semibold text-white">Participer</Text>
              </TouchableOpacity>
              <TouchableOpacity className="border px-5 py-3.5 rounded-xl items-center justify-center" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <Ionicons name="share-social-outline" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity className="border px-5 py-3.5 rounded-xl items-center justify-center" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <Ionicons name="add-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}

          {ticketing && ticketing.tickets.some((ticket) => ticket.available) ? (
            <View className="mb-5 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <View className="flex-row items-center gap-2">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#FEE2E2]">
                  <Ionicons name="ticket-outline" size={21} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold" style={{ color: colors.text }}>Billets disponibles</Text>
                  <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>Achat distinct de votre participation sociale</Text>
                </View>
              </View>
              <View className="my-4 flex-row justify-between">
                <TicketingMetric label="À partir de" value={`${Math.min(...ticketing.tickets.filter((ticket) => ticket.available).map((ticket) => ticket.price)).toLocaleString('fr-FR')} ${ticketing.currency}`} />
                <TicketingMetric label="Types" value={String(ticketing.tickets.filter((ticket) => ticket.available).length)} />
                <TicketingMetric label="Places restantes" value={ticketing.tickets.reduce((total, ticket) => total + (ticket.available ? ticket.remaining : 0), 0).toLocaleString('fr-FR')} />
              </View>
              <TouchableOpacity onPress={() => router.push(`/(events)/${id}/tickets` as Href)} className="items-center rounded-xl bg-[#EF4444] py-3.5">
                <Text className="text-base font-bold text-white">Acheter un billet</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Participants Section */}
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text style={{ color: colors.text }} className=" text-lg font-bold">
                Participants ({event.participants_count})
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Participants',
                    'Liste complète disponible en mode démo lors du branchement backend.'
                  )
                }
              >
                <Text className="text-[#EF4444] text-sm font-semibold">Voir tout</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center">
              {/* Participant Avatars */}
              <View className="flex-row -space-x-3 mr-3">
                {event.participants.slice(0, 4).map((participant, index) => (
                  <Image
                    key={participant.id}
                    source={{ uri: participant.avatar_url || '' }}
                    style={{ 
                      width: 36, 
                      height: 36,
                      borderWidth: 2,
                      borderColor: colors.background,
                    }}
                    className="rounded-full"
                  />
                ))}
              </View>
              {event.participants_count > 4 && (
                <Text style={{ color: colors.textSecondary }} className=" text-sm">
                  +{event.participants_count - 4} autres
                </Text>
              )}
            </View>
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
              {upcomingEvents
                .filter(e => String(e.id) !== String(event.id))
                .slice(0, 3)
                .map((similarEvent) => (
                  <TouchableOpacity
                    key={similarEvent.id}
                    onPress={() => router.push(`/(events)/${similarEvent.id}`)}
                    className="mr-3"
                  >
                    <Image
                      source={{ uri: similarEvent.cover_image_url || '' }}
                      style={{ width: 160, height: 120 }}
                      className="rounded-xl mb-2"
                    />
                    <Text style={{ color: colors.text }} className=" font-semibold text-sm w-[160px]" numberOfLines={1}>
                      {similarEvent.title}
                    </Text>
                    <Text style={{ color: colors.textSecondary }} className=" text-xs mt-0.5">
                      {new Date(similarEvent.start_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </Text>
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

function TicketingMetric({ label, value }: { label: string; value: string }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="max-w-[38%]">
      <Text className="text-[10px]" style={{ color: colors.textMuted }}>{label}</Text>
      <Text className="mt-1 text-xs font-bold" style={{ color: colors.text }}>{value}</Text>
    </View>
  );
}
