import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { PartnerEvent } from '@/features/partner-dashboard/types';

interface EventCardProps {
  event: PartnerEvent;
  onPress: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const statusColors = {
    published: '#10B981',
    draft: '#F59E0B',
    archived: '#6B7280',
  };

  const statusLabels = {
    published: 'Publié',
    draft: 'Brouillon',
    archived: 'Archivé',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#161616] rounded-xl p-4 mb-3 flex-row"
      activeOpacity={0.8}
    >
      {/* Date Badge */}
      <View className="bg-[#EF4444] rounded-lg w-14 h-14 items-center justify-center mr-3">
        <Text className="text-white text-xl font-bold">
          {event.date.split(' ')[0]}
        </Text>
        <Text className="text-white text-[10px] uppercase">
          {event.date.split(' ')[1]}
        </Text>
      </View>

      {/* Event Info */}
      <View className="flex-1">
        <Text className="text-white font-semibold text-base mb-1">
          {event.name}
        </Text>
        <View className="flex-row items-center gap-1 mb-1">
          <Icon library="ionicons" name="time-outline" size={14} color="#A1A1AA" />
          <Text className="text-[#A1A1AA] text-xs">
            {event.time}
          </Text>
        </View>
        <View className="flex-row items-center gap-1 mb-2">
          <Icon library="ionicons" name="location-outline" size={14} color="#A1A1AA" />
          <Text className="text-[#A1A1AA] text-xs">
            {event.location}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-[#A1A1AA] text-xs">
            {event.participants} participants
          </Text>
          <View
            className="px-2 py-1 rounded"
            style={{ backgroundColor: `${statusColors[event.status]}20` }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: statusColors[event.status] }}
            >
              {statusLabels[event.status]}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
