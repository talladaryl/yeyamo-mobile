import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import type { PartnerEvent } from '@/features/partner-dashboard/types';

interface EventCardProps {
  event: PartnerEvent;
  onPress: () => void;
  onTicketingPress?: () => void;
}

export function EventCard({ event, onPress, onTicketingPress }: EventCardProps) {
  const colors = useThemeStore((state) => state.colors);
  const statusColors = { published: '#10B981', draft: '#F59E0B', archived: '#6B7280' };
  const statusLabels = { published: 'Publié', draft: 'Brouillon', archived: 'Archivé' };

  return (
    <View className="mb-3 overflow-hidden rounded-xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <TouchableOpacity onPress={onPress} className="flex-row p-4" activeOpacity={0.8}>
        <View className="mr-3 h-14 w-14 items-center justify-center rounded-lg bg-[#EF4444]">
          <Text className="text-xl font-bold text-white">{event.date.split(' ')[0]}</Text>
          <Text className="text-[10px] uppercase text-white">{event.date.split(' ')[1]}</Text>
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-base font-semibold" style={{ color: colors.text }}>{event.name}</Text>
          <View className="mb-1 flex-row items-center gap-1"><Icon name="time-outline" size={14} color={colors.textSecondary} /><Text className="text-xs" style={{ color: colors.textSecondary }}>{event.time}</Text></View>
          <View className="mb-2 flex-row items-center gap-1"><Icon name="location-outline" size={14} color={colors.textSecondary} /><Text className="text-xs" style={{ color: colors.textSecondary }}>{event.location}</Text></View>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs" style={{ color: colors.textSecondary }}>{event.participants} participants</Text>
            <View className="rounded px-2 py-1" style={{ backgroundColor: `${statusColors[event.status]}20` }}><Text className="text-xs font-semibold" style={{ color: statusColors[event.status] }}>{statusLabels[event.status]}</Text></View>
          </View>
        </View>
      </TouchableOpacity>
      {onTicketingPress ? (
        <TouchableOpacity onPress={onTicketingPress} className="flex-row items-center justify-center gap-2 border-t py-3" style={{ borderColor: colors.border }}>
          <Icon name="ticket-outline" size={18} color="#EF4444" />
          <Text className="text-sm font-bold text-[#EF4444]">Billetterie</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
