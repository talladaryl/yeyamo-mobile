import { useMemo, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { EventCard } from '@/components/partner-dashboard/EventCard';
import { FilterChips, PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { useAuthStore } from '@/features/auth/auth.store';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import { useMyOrganizedEvents } from '@/features/events/useEvents';
import { useThemeStore } from '@/features/theme/theme.store';
import type { PartnerEvent } from '@/features/partner-dashboard/types';

const FILTERS = ['Tous', 'À venir', 'Brouillons', 'Passés'] as const;

export default function EventsScreen() {
  const router = useRouter();
  const isDemo = useAuthStore((state) => state.sessionMode === 'demo-partner');
  const isPartner = useAuthStore((state) => state.user?.user_type === 'partner');
  const colors = useThemeStore((state) => state.colors);
  const eventsQuery = useMyOrganizedEvents();
  const [filter, setFilter] = useState<string>('Tous');
  const data = useMemo(() => {
    const events: PartnerEvent[] = (eventsQuery.data ?? []).map((event) => ({
      id: String(event.id),
      name: event.title,
      date: new Date(event.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      time: event.start_time ?? '',
      location: event.location ?? event.address ?? 'Lieu à confirmer',
      participants: event.participants_count,
      status: event.status === 'DRAFT' || event.status === 'PENDING' || event.status === 'PENDING_REVIEW'
        ? 'draft'
        : event.status === 'ARCHIVED' || event.status === 'CANCELLED' || event.status === 'COMPLETED'
          ? 'archived'
          : 'published',
      supports_ticketing: false,
    }));
    return filter === 'Brouillons' ? events.filter((item) => item.status === 'draft') : events;
  }, [eventsQuery.data, filter]);

  return (
    <PartnerPage title="Mes événements" subtitle="Consultez et gérez vos événements publiés" actionIcon="add" onAction={() => router.push('/(partner)/add-event-step1')}>
      <FilterChips values={FILTERS} selected={filter} onSelect={setFilter} />
      {eventsQuery.isLoading ? <ActivityIndicator className="mt-10" color={colors.primary} /> : null}
      {eventsQuery.isError ? <Text className="mt-10 text-center" style={{ color: colors.textSecondary }}>Impossible de charger vos événements.</Text> : null}
      {!eventsQuery.isLoading && !eventsQuery.isError && data.length === 0 ? <Text className="mt-10 text-center" style={{ color: colors.textSecondary }}>Aucun événement dans cette catégorie.</Text> : null}
      {data.map((item) => (
        <EventCard
          key={item.id}
          event={item}
          onPress={() => router.push(`/(events)/${item.id}` as Href)}
          onTicketingPress={!isDemo && FEATURE_FLAGS.ticketing_enabled && isPartner && item.supports_ticketing
            ? () => router.push(`/(partner-dashboard)/event/${item.id}/tickets` as Href)
            : undefined}
        />
      ))}
    </PartnerPage>
  );
}
