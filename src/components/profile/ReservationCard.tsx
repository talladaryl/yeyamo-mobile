import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Reservation } from '@/features/profile/types';

interface ReservationCardProps {
  reservation: Reservation;
  onPress: () => void;
}

const statusConfig: Record<Reservation['status'], { label: string; color: string }> = {
  confirmed: { label: 'Confirmee', color: '#10B981' },
  pending: { label: 'En attente', color: '#F59E0B' },
  cancelled: { label: 'Annulee', color: '#EF4444' },
  completed: { label: 'Terminee', color: '#A1A1AA' },
};

export function ReservationCard({ reservation, onPress }: ReservationCardProps) {
  const status = statusConfig[reservation.status];
  const reservationDate = new Date(reservation.reservation_date);
  const formattedDate = reservationDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = reservationDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white dark:bg-[#161616] rounded-xl p-3 mb-3"
      activeOpacity={0.7}
    >
      <View className="flex-row">
        <Image
          source={{ uri: reservation.place.cover_photo_url }}
          className="w-20 h-20 rounded-lg"
          resizeMode="cover"
        />

        <View className="flex-1 ml-3">
          <Text className="text-[#18181B] dark:text-white font-semibold text-base" numberOfLines={1}>
            {reservation.place.name}
          </Text>
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm" numberOfLines={1}>
            {reservation.place.category.name} - {reservation.place.city}
          </Text>

          <View className="flex-row items-center mt-2">
            <Ionicons name="calendar-outline" size={14} color="#A1A1AA" />
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs ml-1">
              {formattedDate} a {formattedTime}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View
              className="px-3 py-1 rounded-full self-start"
              style={{ backgroundColor: `${status.color}20` }}
            >
              <Text className="text-xs font-semibold" style={{ color: status.color }}>
                {status.label}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="people-outline" size={14} color="#A1A1AA" />
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs ml-1">
                {reservation.guests_count}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
