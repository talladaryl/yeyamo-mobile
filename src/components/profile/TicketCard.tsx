import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import type { TicketStatus, TicketSummary } from '@/features/ticketing/types';

const STATUS: Record<TicketStatus, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: 'Paiement en attente', color: '#F59E0B' },
  VALID: { label: 'À venir', color: '#22C55E' }, USED: { label: 'Utilisé', color: '#7C3AED' },
  CANCELLED: { label: 'Annulé', color: '#71717A' }, REFUNDED: { label: 'Remboursé', color: '#71717A' },
  EXPIRED: { label: 'Expiré', color: '#71717A' }, REVOKED: { label: 'Révoqué', color: '#EF4444' },
};
const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function TicketCard({ ticket, onPress }: { ticket: TicketSummary; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  const status = STATUS[ticket.status];
  return <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="mb-3 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><View className="flex-row items-start justify-between gap-3"><View className="flex-1"><Text className="text-base font-extrabold" style={{ color: colors.text }}>Événement {ticket.eventId}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>Référence {ticket.serialNumber}</Text></View><View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${status.color}20` }}><Text className="text-[10px] font-bold" style={{ color: status.color }}>{status.label}</Text></View></View><View className="mt-3 flex-row items-center gap-2"><Icon name="calendar-outline" size={14} color={colors.textSecondary} /><Text className="text-xs" style={{ color: colors.textSecondary }}>{ticket.issuedAt ? date.format(new Date(ticket.issuedAt)) : 'Émission en attente'}</Text></View></TouchableOpacity>;
}
