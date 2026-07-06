// Item d'événement auquel l'utilisateur participe
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EventParticipation } from '@/features/profile/types';

interface EventParticipantItemProps {
  participation: EventParticipation;
  onPress: () => void;
}

export function EventParticipantItem({ participation, onPress }: EventParticipantItemProps) {
  const { event, status } = participation;
  const participantsPreview = participation.participants_preview ?? [];
  const totalParticipants = participation.total_participants ?? participation.participants_count;
  const eventDate = new Date(event.start_date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#161616] rounded-xl p-4 mb-3"
      activeOpacity={0.7}
    >
      <View className="flex-row">
        {/* Badge date */}
        <View className="bg-[#EF4444] rounded-xl w-14 h-14 items-center justify-center mr-4">
          <Text className="text-white text-xl font-bold">{day}</Text>
          <Text className="text-white text-xs font-semibold">{month}</Text>
        </View>

        {/* Informations */}
        <View className="flex-1">
          <Text className="text-white font-semibold text-base mb-1" numberOfLines={1}>
            {event.title}
          </Text>
          <Text className="text-[#A1A1AA] text-sm mb-2" numberOfLines={1}>
            {event.place.name} • {eventDate.toLocaleDateString('fr-FR')}
          </Text>

          {/* Participants */}
          <View className="flex-row items-center">
            <View className="flex-row -space-x-2 mr-2">
              {participantsPreview.slice(0, 4).map((participant) => (
                <Image
                  key={participant.id}
                  source={{ uri: participant.avatar_url || 'https://via.placeholder.com/32' }}
                  className="w-6 h-6 rounded-full border-2 border-[#161616]"
                />
              ))}
            </View>
            <Text className="text-[#A1A1AA] text-xs">
              {totalParticipants}+ participants
            </Text>
          </View>
        </View>

        {/* Statut */}
        {status === 'confirmed' && (
          <View className="bg-[#10B981]/20 px-3 py-1 rounded-full self-start">
            <Text className="text-[#10B981] text-xs font-semibold">Confirmée</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
