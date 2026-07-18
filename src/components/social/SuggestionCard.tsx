// Carte de suggestion d'utilisateur
import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import type { SuggestionUser } from '@/features/social/types';

interface SuggestionCardProps {
  user: SuggestionUser;
  onPress: () => void;
  onFollowPress: () => void;
  onDismiss?: () => void;
}

export function SuggestionCard({ user, onPress, onDismiss }: SuggestionCardProps) {
  return (
    <View className="px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
      <View className="flex-row items-start">
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <Avatar uri={user.avatar_url} displayName={user.display_name} size={56} />
        </TouchableOpacity>

        <View className="flex-1 ml-3">
          <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <View className="flex-row items-center gap-1">
              <Text className="text-[#18181B] dark:text-white font-semibold text-base">{user.display_name}</Text>
              {user.is_verified && <Icon library="ionicons" name="checkmark-circle" size={16} color="#EF4444" />}
            </View>
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm">@{user.username}</Text>
            {user.bio && (
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1" numberOfLines={2}>
                {user.bio}
              </Text>
            )}
            <Text className="text-[#52525B] text-xs mt-1">{user.reason}</Text>
          </TouchableOpacity>
        </View>

        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} className="ml-2" activeOpacity={0.7}>
            <Icon library="ionicons" name="close" size={20} color="#52525B" />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity
          onPress={onPress}
          className="flex-1 bg-[#EF4444] py-2.5 rounded-full items-center"
          activeOpacity={0.8}
        >
          <Text className="text-sm font-semibold text-white">Suivre</Text>
        </TouchableOpacity>
        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            className="px-4 bg-[#F4F4F5] dark:bg-[#27272A] py-2.5 rounded-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-[#18181B] dark:text-white text-sm font-semibold">Ignorer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
