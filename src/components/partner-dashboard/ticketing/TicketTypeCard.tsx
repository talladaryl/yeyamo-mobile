import { Text, View } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';
import type { TicketType, TicketTypeStatus } from '@/features/ticketing/types';

const STATUS: Record<TicketTypeStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'En vente', color: '#22C55E' },
  SOLD_OUT: { label: 'Épuisé', color: '#EF4444' },
  DRAFT: { label: 'Brouillon', color: '#71717A' },
  SALES_CLOSED: { label: 'Ventes closes', color: '#7C3AED' },
};
const money = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

export function TicketTypeCard({ ticket }: { ticket: TicketType }) {
  const colors = useThemeStore((state) => state.colors);
  const remaining = Math.max(0, ticket.stock - ticket.sold);
  const progress = ticket.stock ? ticket.sold / ticket.stock * 100 : 0;
  const status = STATUS[ticket.status];
  return (
    <View className="mb-3 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <View className="flex-row items-center justify-between"><Text className="text-base font-extrabold" style={{ color: colors.text }}>{ticket.name}</Text><View className="rounded-full px-2.5 py-1" style={{ backgroundColor: `${status.color}20` }}><Text className="text-[10px] font-bold" style={{ color: status.color }}>{status.label}</Text></View></View>
      <Text className="mt-1 text-sm font-bold text-[#EF4444]">{money.format(ticket.price)} FCFA</Text>
      <View className="mt-4 flex-row justify-between"><Small label="Stock" value={ticket.stock} /><Small label="Vendus" value={ticket.sold} /><Small label="Restants" value={remaining} /></View>
      <View className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: colors.elevated }}><View className="h-full rounded-full bg-[#EF4444]" style={{ width: `${Math.min(100, progress)}%` }} /></View>
    </View>
  );
}

function Small({ label, value }: { label: string; value: number }) { const colors = useThemeStore((state) => state.colors); return <View><Text className="text-[10px]" style={{ color: colors.textMuted }}>{label}</Text><Text className="mt-0.5 text-sm font-bold" style={{ color: colors.text }}>{value}</Text></View>; }
