import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import type { Reservation } from '@/features/partner-dashboard/types';
import { useThemeStore } from '@/features/theme/theme.store';

interface ReservationCardProps {
  reservation: Reservation;
  onPress: () => void;
}

export function ReservationCard({ reservation, onPress }: ReservationCardProps) {
  const colors = useThemeStore((state) => state.colors);
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
      className="mb-3 rounded-xl border p-4"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
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
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              {reservation.customer_name}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <Icon library="ionicons" name="star" size={12} color="#F59E0B" />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
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

      <View className="flex-row items-center justify-between border-t pt-3" style={{ borderColor: colors.border }}>
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="calendar-outline" size={14} color="#A1A1AA" />
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {reservation.date}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="time-outline" size={14} color="#A1A1AA" />
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {reservation.time}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="people-outline" size={14} color="#A1A1AA" />
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {reservation.guests}
            </Text>
          </View>
        </View>
        <Text className="text-sm font-bold" style={{ color: colors.text }}>
          {reservation.amount.toLocaleString()} FCFA
        </Text>
      </View>
    </TouchableOpacity>
  );
}
