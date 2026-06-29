import { TouchableOpacity, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import type { UpcomingEvent } from '@/features/explore/types';

type EventCardProps = {
  event: UpcomingEvent;
  onPress: () => void;
};

export function EventCard({ event, onPress }: EventCardProps) {
  // Format date range
  const startDate = new Date(event.date_start);
  const endDate = new Date(event.date_end);
  const dateRange = `${startDate.getDate()}-${endDate.getDate()} ${endDate.toLocaleDateString('fr-FR', { month: 'short' })}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-64 mr-3 bg-[#161616] rounded-2xl overflow-hidden"
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: event.image_url }}
        style={{ width: '100%', height: 140 }}
        contentFit="cover"
      />

      <View className="p-3">
        <Text className="text-white font-semibold text-sm mb-1" numberOfLines={1}>
          {event.title}
        </Text>

        <View className="flex-row items-center gap-1 mb-2">
          <Icon library="ionicons" name="calendar-outline" size={14} color="#A1A1AA" />
          <Text className="text-[#A1A1AA] text-xs">{dateRange}</Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Icon library="ionicons" name="location-outline" size={14} color="#A1A1AA" />
          <Text className="text-[#A1A1AA] text-xs">{event.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
