// Item de liste pour followers/following
import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import type { FollowUser } from '@/features/social/types';

interface UserListItemProps {
  user: FollowUser;
  onPress: () => void;
  onFollowPress: () => void;
  onRemovePress?: () => void;
  showFollowButton?: boolean;
  showRemoveButton?: boolean;
}

export function UserListItem({
  user,
  onPress,
  onFollowPress,
  onRemovePress,
  showFollowButton = true,
  showRemoveButton = false,
}: UserListItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A]"
      activeOpacity={0.7}
    >
      <Avatar uri={user.avatar_url} displayName={user.display_name} size={52} />

      <View className="flex-1 ml-3">
        <View className="flex-row items-center gap-1">
          <Text className="text-[#18181B] dark:text-white font-semibold text-base">{user.display_name}</Text>
          {user.is_verified && <Icon library="ionicons" name="checkmark-circle" size={16} color="#EF4444" />}
        </View>
        <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm">@{user.username}</Text>
        {user.city && (
          <View className="flex-row items-center gap-1 mt-1">
            <Icon name="location-outline" size={12} color="#52525B" />
            <Text className="text-[#52525B] text-xs">{user.city}</Text>
          </View>
        )}
      </View>

      {showFollowButton && (
        <TouchableOpacity
          onPress={onFollowPress}
          className={`px-4 py-2 rounded-full ${user.is_following ? 'bg-[#F4F4F5] dark:bg-[#27272A]' : 'bg-[#EF4444]'}`}
          activeOpacity={0.8}
        >
          <Text className={`text-sm font-semibold ${user.is_following ? 'text-[#18181B] dark:text-white' : 'text-white'}`}>
            {user.is_following ? 'Abonné' : 'Suivre'}
          </Text>
        </TouchableOpacity>
      )}

      {showRemoveButton && onRemovePress && (
        <TouchableOpacity
          onPress={onRemovePress}
          className="px-4 py-2 rounded-full bg-[#F4F4F5] dark:bg-[#27272A]"
          activeOpacity={0.8}
        >
          <Text className="text-[#18181B] dark:text-white text-sm font-semibold">Retirer</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
