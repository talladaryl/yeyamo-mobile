// Carte utilisateur pour la recherche
import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import type { UserSearchResult } from '@/features/social/types';

interface UserSearchCardProps {
  user: UserSearchResult;
  onPress: () => void;
  onFollowPress: () => void;
}

export function UserSearchCard({ user, onPress, onFollowPress }: UserSearchCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-3 border-b border-[#27272A]"
      activeOpacity={0.7}
    >
      <Avatar uri={user.avatar_url} displayName={user.display_name} size={56} />

      <View className="flex-1 ml-3">
        <View className="flex-row items-center gap-1">
          <Text className="text-white font-semibold text-base">{user.display_name}</Text>
          {user.is_verified && <Icon library="ionicons" name="checkmark-circle" size={16} color="#EF4444" />}
        </View>
        <Text className="text-[#A1A1AA] text-sm">@{user.username}</Text>
        {user.bio && (
          <Text className="text-[#A1A1AA] text-xs mt-1" numberOfLines={1}>
            {user.bio}
          </Text>
        )}
        <View className="flex-row items-center gap-2 mt-1">
          {user.city && (
            <Text className="text-[#52525B] text-xs">📍 {user.city}</Text>
          )}
          {user.mutual_friends_count > 0 && (
            <Text className="text-[#52525B] text-xs">• {user.mutual_friends_count} amis en commun</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={onFollowPress}
        className={`px-4 py-2 rounded-full ${user.is_following ? 'bg-[#27272A]' : 'bg-[#EF4444]'}`}
        activeOpacity={0.8}
      >
        <Text className="text-white text-sm font-semibold">
          {user.is_following ? 'Abonné' : 'Suivre'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
