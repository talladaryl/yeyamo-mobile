import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import type { UserSummary } from '@/types/api.types';
import { useThemeStore } from '@/features/theme/theme.store';

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
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="border-t px-4 py-4" style={{ borderColor: colors.border }}>
      <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>Organisateur</Text>

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
            <Text className="text-base font-semibold" style={{ color: colors.text }}>
              {organizer.display_name}
            </Text>
            {organizer.is_verified && <VerifiedBadge size={16} />}
          </View>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>@{organizer.username}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onFollowPress}
          className="rounded-full px-6 py-2"
          style={{ backgroundColor: isFollowing ? colors.elevated : colors.primary }}
          activeOpacity={0.8}
        >
          <Text className="text-sm font-semibold" style={{ color: isFollowing ? colors.text : '#FFFFFF' }}>
            {isFollowing ? 'Abonné' : 'Suivre'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
