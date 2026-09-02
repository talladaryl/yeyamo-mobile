import { useMemo, useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { EventCard } from '@/components/partner-dashboard/EventCard';
import { FilterChips, PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { partnerEvents } from '@/features/partner-dashboard/mockData';
import { useAuthStore } from '@/features/auth/auth.store';
import { FEATURE_FLAGS } from '@/config/featureFlags';

const FILTERS = ['Tous', 'À venir', 'Brouillons', 'Passés'] as const;

export default function EventsScreen() {
  const router = useRouter();
  const isDemo = useAuthStore((state) => state.sessionMode === 'demo-partner');
  const isPartner = useAuthStore((state) => state.user?.user_type === 'partner');
  const [filter, setFilter] = useState<string>('Tous');
  const data = useMemo(() => {
    const events = isDemo ? partnerEvents : [];
    return filter === 'Brouillons' ? events.filter((item) => item.status === 'draft') : events;
  }, [filter, isDemo]);

  return (
    <PartnerPage title="Mes événements" subtitle="Consultez et gérez vos événements publiés" actionIcon="add" onAction={() => router.push('/(partner)/add-event-step1')}>
      <FilterChips values={FILTERS} selected={filter} onSelect={setFilter} />
      {data.map((item) => (
        <EventCard
          key={item.id}
          event={item}
          onPress={() => {}}
          onTicketingPress={FEATURE_FLAGS.ticketing_enabled && isPartner && item.supports_ticketing
            ? () => router.push(`/(partner-dashboard)/event/${item.id}/tickets` as Href)
            : undefined}
        />
      ))}
    </PartnerPage>
  );
}
