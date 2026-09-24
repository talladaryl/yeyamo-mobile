import { Alert, View, Text, ScrollView, TouchableOpacity, Dimensions, Linking, Share } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter, Stack, type Href } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/features/theme/theme.store';
import { useEventDetail, useEventRegistration, useUpcomingEvents } from '@/features/events/useEvents';
import { useEventTickets } from '@/features/ticketing/useTicketing';
import { usePlaceDetail } from '@/features/places/usePlaces';
import { useInteractionStatus, useToggleInteraction } from '@/features/interactions/generic-interactions.hooks';
import { reviewsApi, usePublicReviews } from '@/features/reviews/reviews.api';
import { CreateVerifiedReviewSheet } from '@/components/reviews/CreateVerifiedReviewSheet';
import { ErrorState, LoadingState } from '@/components/ui/ViewStates';

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const eventQuery = useEventDetail(id);
  const event = eventQuery.data;
  const { data: eventPlace } = usePlaceDetail(event?.place_id ?? '');
  const isLoading = eventQuery.isLoading;
  const { data: upcomingEvents = [] } = useUpcomingEvents();
  const { data: ticketing } = useEventTickets(String(id));
  const favorite = useInteractionStatus('EVENT', id);
  const toggleFavorite = useToggleInteraction('EVENT', id);
  const verifiedReviews = usePublicReviews('EVENT', id);
  const registration = useEventRegistration(event?.id ?? id);
  const [reviewComposerOpen, setReviewComposerOpen] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Stack.Screen options={{ headerShown: false }} />
        <LoadingState label="Chargement de la sortie…" />
      </View>
    );
  }

  if (!event) {
    return <View className="flex-1" style={{ backgroundColor: colors.background }}><Stack.Screen options={{ headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, title: 'Sortie' }} /><ErrorState title="Sortie indisponible" message="Les informations de cette sortie n’ont pas pu être récupérées." retry={() => void eventQuery.refetch()} /></View>;
  }

  const shareEvent = () => Share.share({ message: `${event.title}\n${new Date(event.start_date).toLocaleString('fr-FR')}` });
  const canRegister = event.status === 'PUBLISHED';
  const locationLabel = eventPlace
    ? [eventPlace.name, eventPlace.address, eventPlace.city].filter(Boolean).join(' · ')
    : [event.location, event.address].filter(Boolean).join(' · ');
  const changeRegistration = () => {
    if (!canRegister) {
      Alert.alert('Sortie en attente', 'Cette sortie doit d’abord être publiée par la modération avant de pouvoir accepter des participants.');
      return;
    }
    registration.mutate(event.is_participating, {
      onError: (error) => Alert.alert('Participation impossible', error instanceof Error ? error.message : 'Réessayez plus tard.'),
    });
  };
  const addToCalendar = () => {
    const dates = `${event.start_date.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')}/${event.end_date.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')}`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${encodeURIComponent(dates)}&details=${encodeURIComponent(event.description ?? '')}`;
    void Linking.openURL(url).catch(() => Alert.alert('Calendrier indisponible', "L'événement ne peut pas être ouvert dans le calendrier."));
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
                onPress={() => toggleFavorite.mutate(Boolean(favorite.data))}
                disabled={toggleFavorite.isPending}
                className="bg-black/50 w-10 h-10 rounded-full items-center justify-center"
              >
                <Ionicons name={favorite.data ? 'heart' : 'heart-outline'} size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => void shareEvent()} className="bg-black/50 w-10 h-10 rounded-full items-center justify-center">
                <Ionicons name="share-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image with Date Badge */}
        <View className="relative">
          {event.cover_image_url ? <Image source={{ uri: event.cover_image_url }} style={{ width, height: 280 }} contentFit="cover" /> : <View style={{ width, height: 280, backgroundColor: colors.elevated }} className="items-center justify-center"><Ionicons name="calendar-outline" size={52} color={colors.textMuted} /></View>}
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
          {eventPlace ? <TouchableOpacity onPress={() => event.place_id && router.push(`/(places)/${event.place_id}`)} className="flex-row items-center gap-2 mb-3"><Ionicons name="location-outline" size={18} color="#A1A1AA" /><Text style={{ color: colors.textSecondary }} className=" text-sm">{[eventPlace.name, eventPlace.address, eventPlace.city].filter(Boolean).join(' · ')}</Text></TouchableOpacity> : null}
          {!eventPlace && locationLabel ? <View className="flex-row items-center gap-2 mb-3"><Ionicons name="location-outline" size={18} color="#A1A1AA" /><Text style={{ color: colors.textSecondary }} className=" text-sm">{locationLabel}</Text></View> : null}

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
              {event.participants_count} inscription(s) confirmée(s){event.remaining_capacity !== undefined ? ` · ${event.remaining_capacity} place(s) restante(s)` : ''}
            </Text>
          </View>

          {/* Description */}
          {event.description ? <View className="mb-5">
            <Text style={{ color: colors.text }} className=" text-base leading-6">{event.description}</Text>
          </View> : null}

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
                    onPress={() => router.push({ pathname: '/(events)/[id]/checkout' as never, params: { id: String(event.id), ticketId: ticket.id } } as never)}
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
                onPress={changeRegistration}
                disabled={registration.isPending}
                style={{ opacity: registration.isPending ? 0.6 : 1 }}
                className="flex-1 bg-[#EF4444] py-3.5 rounded-xl items-center"
              >
                <Text className="text-base font-semibold text-white">{event.is_participating ? 'Se désinscrire' : 'Participer'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => void shareEvent()} className="border px-5 py-3.5 rounded-xl items-center justify-center" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <Ionicons name="share-social-outline" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={addToCalendar} className="border px-5 py-3.5 rounded-xl items-center justify-center" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
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

          <View className="mb-5"><View className="mb-2 flex-row items-center justify-between"><Text className="text-lg font-bold" style={{ color: colors.text }}>Avis vérifiés</Text><TouchableOpacity onPress={() => setReviewComposerOpen(true)}><Text className="font-semibold" style={{ color: colors.primary }}>Laisser un avis</Text></TouchableOpacity></View><Text className="text-sm" style={{ color: colors.textSecondary }}>{verifiedReviews.aggregate.data?.averageRating?.toFixed(1) ?? '—'} · {verifiedReviews.aggregate.data?.count ?? 0} avis</Text>{verifiedReviews.reviews.data?.content.map((review) => <View key={review.id} className="mt-3 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.card }}><Text className="font-semibold" style={{ color: colors.text }}>Utilisateur vérifié · {review.rating}/5</Text>{review.comment ? <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{review.comment}</Text> : null}<TouchableOpacity onPress={() => void reviewsApi.report(review.id).then(() => Alert.alert('Signalement envoyé', 'Cet avis a été transmis à la modération.')).catch((error) => Alert.alert('Signalement impossible', error instanceof Error ? error.message : 'Réessayez plus tard.'))} className="mt-2 self-start"><Text className="text-xs font-semibold text-[#EF4444]">Signaler</Text></TouchableOpacity></View>)}</View>

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
                    {similarEvent.cover_image_url ? (
                      <Image
                        source={{ uri: similarEvent.cover_image_url }}
                        style={{ width: 160, height: 120 }}
                        className="rounded-xl mb-2"
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={{ width: 160, height: 120, backgroundColor: colors.elevated }}
                        className="mb-2 items-center justify-center rounded-xl"
                      >
                        <Ionicons name="calendar-outline" size={30} color={colors.textMuted} />
                      </View>
                    )}
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
      <CreateVerifiedReviewSheet visible={reviewComposerOpen} targetType="EVENT" targetId={String(event.id)} onClose={() => setReviewComposerOpen(false)} />
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
