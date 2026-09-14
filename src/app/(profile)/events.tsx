import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { EventParticipantItem } from '@/components/profile/EventParticipantItem';
import { Button } from '@/components/ui/Button';
import { EmptyState, LoadingState } from '@/components/ui/ViewStates';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useUserEvents } from '@/features/profile/useProfile';
import { useThemeStore } from '@/features/theme/theme.store';

export default function EventsScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const { data: events, isLoading } = useUserEvents();
  return <SafeScreen><Header title="Mes sorties" onBack={() => router.back()} />{isLoading ? <LoadingState /> : events?.length ? <FlatList data={events} keyExtractor={(item) => item.id.toString()} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} renderItem={({ item }) => <EventParticipantItem participation={item} onPress={() => router.push(`/(events)/${item.event.id}`)} />} /> : <EmptyState title="Aucune sortie prévue" message="Rejoignez des événements pour les voir ici" icon={<Ionicons name="calendar-outline" size={64} color={colors.textMuted} />} />}{events?.length ? <View className="absolute bottom-6 left-0 right-0 px-4"><TouchableOpacity onPress={() => router.push('/(create)/event')} className="h-14 w-14 self-end items-center justify-center rounded-full" style={{ backgroundColor: colors.primary }} accessibilityRole="button" accessibilityLabel="Créer une sortie"><Ionicons name="add" size={30} color="#FFFFFF" /></TouchableOpacity></View> : <View className="absolute bottom-6 left-4 right-4"><Button label="Créer une sortie" onPress={() => router.push('/(create)/event')} /></View>}</SafeScreen>;
}

function Header({ title, onBack }: { title: string; onBack: () => void }) { const colors = useThemeStore((state) => state.colors); return <View className="flex-row items-center justify-between border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={onBack} className="-ml-2 p-2" accessibilityRole="button" accessibilityLabel="Retour"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="text-xl font-bold" style={{ color: colors.text }}>{title}</Text><View className="w-10" /></View>; }
