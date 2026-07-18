import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import type { UserSummary } from '@/types/api.types';
import { useThemeStore } from '@/features/theme/theme.store';

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
  const colors = useThemeStore((state) => state.colors);
  const displayParticipants = participants.slice(0, 5);
  const remainingCount = totalCount - displayParticipants.length;

  return (
    <View className="border-t px-4 py-4" style={{ borderColor: colors.border }}>
      <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
        Participants ({totalCount})
      </Text>

      <View className="flex-row items-center">
        {/* Stacked avatars */}
        <View className="flex-row">
          {displayParticipants.map((participant, index) => (
            <View
              key={participant.id}
              style={{ marginLeft: index > 0 ? -12 : 0, zIndex: displayParticipants.length - index, borderColor: colors.background }}
              className="rounded-full border-2"
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
            className="h-10 w-10 items-center justify-center rounded-full border-2"
            style={{ marginLeft: -12, backgroundColor: colors.elevated, borderColor: colors.background }}
          >
            <Text className="text-xs font-semibold" style={{ color: colors.text }}>+{remainingCount}</Text>
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
