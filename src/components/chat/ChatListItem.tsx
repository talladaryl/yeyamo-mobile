import { TouchableOpacity, View, Text } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { timeAgo, truncate } from '@/utils/format';
import type { Conversation } from '@/features/chat/types';

interface ChatListItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export function ChatListItem({ conversation, onPress }: ChatListItemProps) {
  const { last_message, unread_count, type, participant, participants, group_name } = conversation;

  const displayName = type === 'group' ? group_name : participant?.display_name;
  const avatarUrl = type === 'group' ? participants[0]?.avatar_url : participant?.avatar_url;
  const isGroup = type === 'group';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3 gap-3"
    >
      {/* Avatar or Group Avatars */}
      {isGroup && participants.length > 1 ? (
        <View className="relative w-12 h-12">
          <Avatar
            uri={participants[0]?.avatar_url}
            displayName={participants[0]?.display_name}
            size={32}
            className="absolute top-0 left-0"
          />
          <Avatar
            uri={participants[1]?.avatar_url}
            displayName={participants[1]?.display_name}
            size={32}
            className="absolute bottom-0 right-0 border-2 border-[#0A0A0A]"
          />
        </View>
      ) : (
        <Avatar
          uri={avatarUrl}
          displayName={displayName || ''}
          size={48}
        />
      )}

      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <Text className="text-white font-semibold text-sm">
            {displayName}
          </Text>
          {last_message ? (
            <Text className="text-[#52525B] text-xs">
              {timeAgo(last_message.created_at)}
            </Text>
          ) : null}
        </View>
        <View className="flex-row justify-between items-center mt-0.5">
          <Text className="text-[#A1A1AA] text-sm flex-1" numberOfLines={1}>
            {last_message ? truncate(last_message.body, 40) : 'Aucun message'}
          </Text>
          {unread_count > 0 ? (
            <View className="bg-[#EF4444] rounded-full min-w-5 h-5 px-1.5 items-center justify-center ml-2">
              <Text className="text-white text-xs font-bold">
                {unread_count > 9 ? '9+' : unread_count}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
