import { useState } from 'react';
import { useRouter } from 'expo-router';
import { EstablishmentCard } from '@/components/partner-dashboard/EstablishmentCard';
import { FilterChips, PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { establishments } from '@/features/partner-dashboard/mockData';
import { useAuthStore } from '@/features/auth/auth.store';

const FILTERS = ['Tous', 'Actifs', 'En attente', 'Inactifs'] as const;

export default function EstablishmentsScreen() {
  const router = useRouter();
  const isDemo = useAuthStore((state) => state.sessionMode === 'demo-partner');
  const [filter, setFilter] = useState<string>(FILTERS[0]);
  return (
    <PartnerPage title="Mes établissements" subtitle="Gérez tous vos lieux et leurs informations" actionIcon="add" onAction={() => router.push('/(partner)/add-place-step1')}>
      <FilterChips values={FILTERS} selected={filter} onSelect={setFilter} />
      {(isDemo ? establishments : []).map((item) => <EstablishmentCard key={item.id} establishment={item} onPress={() => {}} />)}
    </PartnerPage>
  );
}
