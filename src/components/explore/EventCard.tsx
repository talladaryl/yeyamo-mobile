import { TouchableOpacity, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import type { UpcomingEvent } from '@/features/explore/types';
import { useThemeStore } from '@/features/theme/theme.store';

type EventCardProps = {
  event: UpcomingEvent;
  onPress: () => void;
};

export function EventCard({ event, onPress }: EventCardProps) {
  const colors = useThemeStore((state) => state.colors);
  // Format date range
  const startDate = new Date(event.date_start);
  const endDate = new Date(event.date_end);
  const dateRange = `${startDate.getDate()}-${endDate.getDate()} ${endDate.toLocaleDateString('fr-FR', { month: 'short' })}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mr-3 w-64 overflow-hidden rounded-2xl border"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      activeOpacity={0.9}
    >
      {event.image_url ? <Image source={{ uri: event.image_url }} style={{ width: '100%', height: 140 }} contentFit="cover" /> : <View className="h-[140px] items-center justify-center" style={{ backgroundColor: colors.elevated }}><Icon name="calendar-outline" size={32} color={colors.textMuted} /></View>}

      <View className="p-3">
        <Text className="mb-1 text-sm font-semibold" style={{ color: colors.text }} numberOfLines={1}>
          {event.title}
        </Text>

        <View className="flex-row items-center gap-1 mb-2">
          <Icon library="ionicons" name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text className="text-xs" style={{ color: colors.textSecondary }}>{dateRange}</Text>
        </View>

        {event.location ? <View className="flex-row items-center gap-1"><Icon library="ionicons" name="location-outline" size={14} color={colors.textSecondary} /><Text className="text-xs" style={{ color: colors.textSecondary }}>{event.location}</Text></View> : null}
      </View>
    </TouchableOpacity>
  );
}
