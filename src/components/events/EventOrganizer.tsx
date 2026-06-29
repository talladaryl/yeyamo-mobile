import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import type { UserSummary } from '@/types/api.types';

type EventOrganizerProps = {
  organizer: UserSummary;
  onProfilePress?: () => void;
  onFollowPress?: () => void;
  isFollowing?: boolean;
};

export function EventOrganizer({
  organizer,
  onProfilePress,
  onFollowPress,
  isFollowing = false,
}: EventOrganizerProps) {
  return (
    <View className="px-4 py-4 border-t border-[#27272A]">
      <Text className="text-white text-lg font-bold mb-3">Organisateur</Text>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8}>
          <Avatar
            uri={organizer.avatar_url}
            displayName={organizer.display_name}
            size={48}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onProfilePress}
          className="flex-1"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-1">
            <Text className="text-white font-semibold text-base">
              {organizer.display_name}
            </Text>
            {organizer.is_verified && <VerifiedBadge size={16} />}
          </View>
          <Text className="text-[#A1A1AA] text-sm">@{organizer.username}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onFollowPress}
          className={`${isFollowing ? 'bg-[#27272A]' : 'bg-[#EF4444]'} px-6 py-2 rounded-full`}
          activeOpacity={0.8}
        >
          <Text className="text-white text-sm font-semibold">
            {isFollowing ? 'Abonné' : 'Suivre'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
