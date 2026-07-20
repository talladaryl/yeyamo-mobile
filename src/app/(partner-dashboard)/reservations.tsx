import { useMemo, useState } from 'react';
import { FilterChips, PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { ReservationCard } from '@/components/partner-dashboard/ReservationCard';
import { reservations } from '@/features/partner-dashboard/mockData';

const FILTERS = ['Toutes (3)', 'Confirmées', 'En attente', 'Annulées'] as const;
export default function ReservationsScreen() {
  const [filter, setFilter] = useState<string>(FILTERS[0]);
  const data = useMemo(() => {
    if (filter === 'Confirmées') return reservations.filter((item) => item.status === 'confirmed');
    if (filter === 'En attente') return reservations.filter((item) => item.status === 'pending');
    if (filter === 'Annulées') return reservations.filter((item) => item.status === 'cancelled');
    return reservations;
  }, [filter]);
  return (
    <PartnerPage title="Mes réservations" subtitle="Suivez les réservations et demandes reçues">
      <FilterChips values={FILTERS} selected={filter} onSelect={setFilter} />
      {data.map((item) => <ReservationCard key={item.id} reservation={item} onPress={() => {}} />)}
    </PartnerPage>
  );
}
