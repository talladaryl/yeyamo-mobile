import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import type { Reservation } from '@/features/partner-dashboard/types';

interface ReservationCardProps {
  reservation: Reservation;
  onPress: () => void;
}

export function ReservationCard({ reservation, onPress }: ReservationCardProps) {
  const statusColors = {
    confirmed: '#10B981',
    pending: '#F59E0B',
    cancelled: '#EF4444',
  };

  const statusLabels = {
    confirmed: 'Confirmé',
    pending: 'En attente',
    cancelled: 'Annulé',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#161616] rounded-xl p-4 mb-3"
      activeOpacity={0.8}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center gap-3">
          <Avatar
            uri={reservation.customer_avatar}
            displayName={reservation.customer_name}
            size={40}
          />
          <View>
            <Text className="text-white font-semibold text-base">
              {reservation.customer_name}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <Icon library="ionicons" name="star" size={12} color="#F59E0B" />
              <Text className="text-[#A1A1AA] text-xs">
                {reservation.establishment}
              </Text>
            </View>
          </View>
        </View>
        <View
          className="px-2 py-1 rounded"
          style={{ backgroundColor: `${statusColors[reservation.status]}20` }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: statusColors[reservation.status] }}
          >
            {statusLabels[reservation.status]}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between border-t border-[#27272A] pt-3">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="calendar-outline" size={14} color="#A1A1AA" />
            <Text className="text-[#A1A1AA] text-xs">
              {reservation.date}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="time-outline" size={14} color="#A1A1AA" />
            <Text className="text-[#A1A1AA] text-xs">
              {reservation.time}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="people-outline" size={14} color="#A1A1AA" />
            <Text className="text-[#A1A1AA] text-xs">
              {reservation.guests}
            </Text>
          </View>
        </View>
        <Text className="text-white font-bold text-sm">
          {reservation.amount.toLocaleString()} FCFA
        </Text>
      </View>
    </TouchableOpacity>
  );
}
