import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { FilterChips, PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { useMyPartnerPlaces } from '@/features/partner/partner-places.hooks';
import { useThemeStore } from '@/features/theme/theme.store';

const FILTERS = ['Tous', 'Actifs', 'En attente', 'Inactifs'] as const;

export default function EstablishmentsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const places = useMyPartnerPlaces();
  const [filter, setFilter] = useState<string>(FILTERS[0]);
  return (
    <PartnerPage title="Mes établissements" subtitle="Gérez tous vos lieux et leurs informations" actionIcon="add" onAction={() => router.push('/(partner)/add-place-step1')}>
      <FilterChips values={FILTERS} selected={filter} onSelect={setFilter} />
      {places.isLoading ? <ActivityIndicator className="mt-10" color={colors.primary} /> : null}
      {places.isError ? <View className="mt-8 items-center"><Text style={{ color: colors.textSecondary }}>Impossible de charger vos établissements.</Text><TouchableOpacity onPress={() => places.refetch()} className="mt-4 rounded-full bg-[#EF4444] px-5 py-3"><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity></View> : null}
      {!places.isLoading && !places.isError && (places.data?.length ?? 0) === 0 ? <Text className="mt-10 text-center" style={{ color: colors.textSecondary }}>Aucun établissement pour le moment.</Text> : null}
      {(places.data ?? []).map((item) => <TouchableOpacity key={item.id} onPress={() => router.push(`/(places)/${item.id}`)} className="mb-3 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="text-base font-bold" style={{ color: colors.text }}>{item.name}</Text><Text className="mt-2 text-xs font-semibold" style={{ color: item.status === 'PUBLISHED' ? '#10B981' : colors.textSecondary }}>{item.status === 'PUBLISHED' ? 'Publié' : item.status}</Text></TouchableOpacity>)}
    </PartnerPage>
  );
}
