import { useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReservationCard } from '@/components/profile/ReservationCard';
import { EmptyState, LoadingState } from '@/components/ui/ViewStates';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useUserReservations } from '@/features/profile/useProfile';
import { useThemeStore } from '@/features/theme/theme.store';

export default function ReservationsScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const [activeTab, setActiveTab] = useState<'confirmed' | 'pending'>('confirmed'); const { data: reservations, isLoading } = useUserReservations(); const filtered = reservations?.filter((reservation) => reservation.status === activeTab || (activeTab === 'confirmed' && reservation.status === 'confirmed'));
  return <SafeScreen><Header title="Mes réservations" onBack={() => router.back()} /><View className="flex-row border-b px-4 pt-4" style={{ borderColor: colors.border }}><Tab label="Confirmées" active={activeTab === 'confirmed'} onPress={() => setActiveTab('confirmed')} /><Tab label="En attente" active={activeTab === 'pending'} onPress={() => setActiveTab('pending')} /></View>{isLoading ? <LoadingState /> : filtered?.length ? <FlatList data={filtered} keyExtractor={(item) => item.id.toString()} contentContainerStyle={{ padding: 16 }} renderItem={({ item }) => <ReservationCard reservation={item} onPress={() => router.push(`/(places)/${item.place.id}`)} />} /> : <EmptyState title={activeTab === 'confirmed' ? 'Aucune réservation confirmée' : 'Aucune réservation en attente'} message="Réservez des lieux pour qu’ils apparaissent ici" icon={<Ionicons name="calendar-outline" size={64} color={colors.textMuted} />} />}</SafeScreen>;
}

function Header({ title, onBack }: { title: string; onBack: () => void }) { const colors = useThemeStore((state) => state.colors); return <View className="flex-row items-center justify-between border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={onBack} className="-ml-2 p-2" accessibilityRole="button" accessibilityLabel="Retour"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="text-xl font-bold" style={{ color: colors.text }}>{title}</Text><View className="w-10" /></View>; }
function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { const colors = useThemeStore((state) => state.colors); return <TouchableOpacity onPress={onPress} className="flex-1 border-b-2 pb-3" style={{ borderColor: active ? colors.primary : 'transparent' }} accessibilityRole="tab" accessibilityState={{ selected: active }}><Text className="text-center font-semibold" style={{ color: active ? colors.primary : colors.textSecondary }}>{label}</Text></TouchableOpacity>; }
