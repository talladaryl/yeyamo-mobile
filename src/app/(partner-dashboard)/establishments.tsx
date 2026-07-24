import { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { EstablishmentCard } from '@/components/partner-dashboard/EstablishmentCard';
import { FilterChips, PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { establishments } from '@/features/partner-dashboard/mockData';
import { useThemeStore } from '@/features/theme/theme.store';
import { useAuthStore } from '@/features/auth/auth.store';

const FILTERS = ['Tous (3)', 'Actifs (2)', 'En attente (1)', 'Inactifs (0)'] as const;

export default function EstablishmentsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const isDemo = useAuthStore((state) => state.sessionMode === 'demo-partner');
  const [filter, setFilter] = useState<string>(FILTERS[0]);
  return (
    <PartnerPage title="Mes établissements" subtitle="Gérez tous vos lieux et leurs informations" actionIcon="add" onAction={() => router.push('/(partner)/add-place-step1')}>
      <FilterChips values={FILTERS} selected={filter} onSelect={setFilter} />
      {(isDemo ? establishments : []).map((item) => <EstablishmentCard key={item.id} establishment={item} onPress={() => {}} />)}
      <TouchableOpacity onPress={() => router.push('/(partner)/add-place-step1')} className="items-center rounded-xl border p-4" style={{ borderColor: colors.border }}>
        <Text className="font-bold text-[#E60012]">Ajouter un établissement</Text>
      </TouchableOpacity>
    </PartnerPage>
  );
}
