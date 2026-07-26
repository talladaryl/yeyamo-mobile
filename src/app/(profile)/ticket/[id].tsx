import { Image } from 'expo-image';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useMyTicket } from '@/features/ticketing/useTicketing';
import { useThemeStore } from '@/features/theme/theme.store';

const date = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function TicketDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const query = useMyTicket(id);
  const ticket = query.data;
  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 pb-3 pt-2"><TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Mon billet</Text></View>
      {query.isLoading ? <ActivityIndicator className="mt-20" color="#EF4444" /> : null}
      {ticket ? <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 36 }}><View className="overflow-hidden rounded-3xl bg-[#EF4444]"><Image source={{ uri: ticket.eventImageUrl }} style={{ width: '100%', height: 170 }} contentFit="cover" /><View className="p-5"><Text className="text-xs font-bold uppercase tracking-widest text-white/70">YeYamo Premium Ticket</Text><Text className="mt-2 text-2xl font-extrabold text-white">{ticket.eventTitle}</Text><View className="mt-5 gap-3"><PremiumLine icon="calendar-outline" label="Date" value={date.format(new Date(ticket.eventDate))} /><PremiumLine icon="location-outline" label="Lieu" value={ticket.eventLocation} /><PremiumLine icon="ticket-outline" label="Type" value={ticket.ticketType} /><PremiumLine icon="map-outline" label="Zone" value={ticket.accessZone} /><PremiumLine icon="key-outline" label="Référence" value={ticket.maskedReference} /></View><View className="mt-6 items-center rounded-2xl bg-white p-5">{ticket.qrCodeImageUrl ? <Image source={{ uri: ticket.qrCodeImageUrl }} style={{ width: 190, height: 190 }} contentFit="contain" /> : <><Icon name="qr-code-outline" size={90} color="#18181B" /><Text className="mt-3 text-center text-xs text-[#52525B]">Le QR sécurisé sera affiché dès sa réception du backend.</Text></>}</View></View></View></ScrollView> : null}
    </SafeScreen>
  );
}

function PremiumLine({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <View className="flex-row items-center"><View className="h-9 w-9 items-center justify-center rounded-full bg-white/15"><Icon name={icon} size={18} color="#FFFFFF" /></View><View className="ml-3 flex-1"><Text className="text-[10px] uppercase text-white/60">{label}</Text><Text className="mt-0.5 text-sm font-semibold text-white">{value}</Text></View></View>;
}
