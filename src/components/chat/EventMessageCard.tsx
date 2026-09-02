import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import type { EventData } from '@/features/chat/types';

interface EventMessageCardProps {
  event: EventData;
  onPress?: () => void;
}

export function EventMessageCard({ event, onPress }: EventMessageCardProps) {
  const colors = useThemeStore((state) => state.colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="my-1 rounded-2xl border p-4"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <View className="flex-row items-start gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#EF4444]/15">
          <Icon name="calendar-outline" size={22} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="mb-2 text-sm font-bold" style={{ color: colors.text }}>{event.title}</Text>
          <View className="gap-1.5">
            <View className="flex-row items-center gap-2">
              <Icon name="calendar-outline" size={13} color={colors.textSecondary} />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>{event.date}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Icon name="time-outline" size={13} color={colors.textSecondary} />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>{event.time}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Icon name="location-outline" size={13} color={colors.textSecondary} />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>{event.location}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
