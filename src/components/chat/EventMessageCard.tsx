import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { EventData } from '@/features/chat/types';

interface EventMessageCardProps {
  event: EventData;
  onPress?: () => void;
}

export function EventMessageCard({ event, onPress }: EventMessageCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#1F1F1F] rounded-2xl p-4 border border-[#27272A] my-1"
      activeOpacity={0.8}
    >
      <View className="flex-row items-start gap-3">
        <View className="w-12 h-12 bg-[#EF4444]/20 rounded-xl items-center justify-center">
          <Icon library="ionicons" name="calendar" size={24} color="#EF4444" />
        </View>
        
        <View className="flex-1">
          <Text className="text-white font-bold text-base mb-2">
            {event.title}
          </Text>
          
          <View className="gap-1.5">
            <View className="flex-row items-center gap-2">
              <Icon library="ionicons" name="calendar-outline" size={14} color="#A1A1AA" />
              <Text className="text-[#A1A1AA] text-sm">{event.date}</Text>
            </View>
            
            <View className="flex-row items-center gap-2">
              <Icon library="ionicons" name="time-outline" size={14} color="#A1A1AA" />
              <Text className="text-[#A1A1AA] text-sm">{event.time}</Text>
            </View>
            
            <View className="flex-row items-center gap-2">
              <Icon library="ionicons" name="location-outline" size={14} color="#A1A1AA" />
              <Text className="text-[#A1A1AA] text-sm">{event.location}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
