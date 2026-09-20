import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Reservation } from '@/features/profile/types';
import { useThemeStore } from '@/features/theme/theme.store';

interface ReservationCardProps {
  reservation: Reservation;
  onPress?: () => void;
  onRequestCancellation?: () => void;
}

const statusConfig: Record<Reservation['status'], { label: string; color: string }> = {
  confirmed: { label: 'Confirmee', color: '#10B981' },
  pending: { label: 'En attente', color: '#F59E0B' },
  cancelled: { label: 'Annulee', color: '#EF4444' },
  completed: { label: 'Terminee', color: '#A1A1AA' },
};

export function ReservationCard({ reservation, onPress, onRequestCancellation }: ReservationCardProps) {
  const colors = useThemeStore((state) => state.colors);
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

  const content = <View>
      <View className="flex-row">
        {reservation.place.cover_photo_url ? <Image source={{ uri: reservation.place.cover_photo_url }} className="h-20 w-20 rounded-lg" resizeMode="cover" /> : <View className="h-20 w-20 items-center justify-center rounded-lg" style={{ backgroundColor: colors.elevated }}><Ionicons name="calendar-outline" size={24} color={colors.textMuted} /></View>}

        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold" style={{ color: colors.text }} numberOfLines={1}>
            {reservation.reference ? `Réservation ${reservation.reference}` : 'Réservation'}
          </Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }} numberOfLines={1}>Référence activité : {reservation.activity_id ?? reservation.place.id}</Text>

          <View className="flex-row items-center mt-2">
            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
            <Text className="ml-1 text-xs" style={{ color: colors.textSecondary }}>
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
              <Ionicons name="people-outline" size={14} color={colors.textMuted} />
              <Text className="ml-1 text-xs" style={{ color: colors.textSecondary }}>
                {reservation.guests_count}
              </Text>
            </View>
          </View>
        </View>
      </View>
      {reservation.total_amount !== null && reservation.total_amount !== undefined && reservation.currency ? <Text className="mt-3 text-xs" style={{ color: colors.textSecondary }}>Total : {reservation.total_amount} {reservation.currency}</Text> : null}
      {reservation.payment_status ? <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>Paiement : {reservation.payment_status}</Text> : null}
      {reservation.automatic_refund_available ? <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>Remboursement automatique disponible selon le backend.</Text> : null}
      {onRequestCancellation && (reservation.status === 'confirmed' || reservation.status === 'pending') ? <TouchableOpacity onPress={onRequestCancellation} className="mt-3 self-start" accessibilityRole="button"><Text className="text-xs font-bold" style={{ color: colors.primary }}>Annuler cette réservation</Text></TouchableOpacity> : null}
    </View>;
  return onPress ? <TouchableOpacity onPress={onPress} className="mb-3 rounded-xl p-3" style={{ backgroundColor: colors.card }} activeOpacity={0.7}>{content}</TouchableOpacity> : <View className="mb-3 rounded-xl p-3" style={{ backgroundColor: colors.card }}>{content}</View>;
}
