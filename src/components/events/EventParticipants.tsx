import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import type { UserSummary } from '@/types/api.types';

type EventParticipantsProps = {
  participants: UserSummary[];
  totalCount: number;
  onSeeAllPress?: () => void;
};

export function EventParticipants({
  participants,
  totalCount,
  onSeeAllPress,
}: EventParticipantsProps) {
  const displayParticipants = participants.slice(0, 5);
  const remainingCount = totalCount - displayParticipants.length;

  return (
    <View className="px-4 py-4 border-t border-[#27272A]">
      <Text className="text-white text-lg font-bold mb-3">
        Participants ({totalCount})
      </Text>

      <View className="flex-row items-center">
        {/* Stacked avatars */}
        <View className="flex-row">
          {displayParticipants.map((participant, index) => (
            <View
              key={participant.id}
              style={{ marginLeft: index > 0 ? -12 : 0, zIndex: displayParticipants.length - index }}
              className="border-2 border-[#0A0A0A] rounded-full"
            >
              <Avatar
                uri={participant.avatar_url}
                displayName={participant.display_name}
                size={40}
              />
            </View>
          ))}
        </View>

        {/* Remaining count */}
        {remainingCount > 0 && (
          <View
            className="bg-[#27272A] w-10 h-10 rounded-full items-center justify-center border-2 border-[#0A0A0A]"
            style={{ marginLeft: -12 }}
          >
            <Text className="text-white text-xs font-semibold">+{remainingCount}</Text>
          </View>
        )}

        {/* See all button */}
        {onSeeAllPress && (
          <TouchableOpacity
            onPress={onSeeAllPress}
            className="ml-4"
            activeOpacity={0.7}
          >
            <Text className="text-[#EF4444] text-sm font-semibold">Voir tout</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
