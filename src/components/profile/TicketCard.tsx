import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import type { OwnedTicket, OwnedTicketStatus } from '@/features/ticketing/types';

const STATUS: Record<OwnedTicketStatus, { label: string; color: string }> = {
  UPCOMING: { label: 'À venir', color: '#22C55E' },
  USED: { label: 'Utilisé', color: '#7C3AED' },
  PAST: { label: 'Passé', color: '#71717A' },
};
const date = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function TicketCard({ ticket, onPress }: { ticket: OwnedTicket; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  const status = STATUS[ticket.status];
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="mb-3 overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <Image source={{ uri: ticket.eventImageUrl }} style={{ width: '100%', height: 125 }} contentFit="cover" />
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-3"><Text className="flex-1 text-base font-extrabold" style={{ color: colors.text }}>{ticket.eventTitle}</Text><View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${status.color}20` }}><Text className="text-[10px] font-bold" style={{ color: status.color }}>{status.label}</Text></View></View>
        <View className="mt-3 gap-1.5"><Line icon="calendar-outline" text={date.format(new Date(ticket.eventDate))} /><Line icon="location-outline" text={ticket.eventLocation} /><Line icon="ticket-outline" text={ticket.ticketType} /></View>
      </View>
    </TouchableOpacity>
  );
}

function Line({ icon, text }: { icon: string; text: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="flex-row items-center gap-2"><Icon name={icon} size={14} color={colors.textSecondary} /><Text className="flex-1 text-xs" style={{ color: colors.textSecondary }}>{text}</Text></View>;
}
