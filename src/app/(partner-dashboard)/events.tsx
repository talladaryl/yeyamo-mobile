import { useMemo, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { EventCard } from '@/components/partner-dashboard/EventCard';
import { FilterChips, PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { partnerEvents } from '@/features/partner-dashboard/mockData';
import { useThemeStore } from '@/features/theme/theme.store';

const FILTERS = ['Tous', 'À venir', 'Brouillons', 'Passés'] as const;
export default function EventsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [filter, setFilter] = useState<string>('Tous');
  const data = useMemo(() => filter === 'Brouillons' ? partnerEvents.filter((item) => item.status === 'draft') : partnerEvents, [filter]);
  return (
    <PartnerPage title="Mes événements" subtitle="Consultez et gérez vos événements publiés" actionIcon="add" onAction={() => router.push('/(partner)/add-event-step1')}>
      <FilterChips values={FILTERS} selected={filter} onSelect={setFilter} />
      {data.map((item) => <EventCard key={item.id} event={item} onPress={() => {}} />)}
      <TouchableOpacity onPress={() => router.push('/(partner)/add-event-step1')} className="items-center rounded-xl border p-4" style={{ borderColor: colors.border }}>
        <Text className="font-bold text-[#E60012]">Créer un événement</Text>
      </TouchableOpacity>
    </PartnerPage>
  );
}
