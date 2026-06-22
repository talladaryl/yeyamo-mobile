import { TouchableOpacity, View, Text } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { timeAgo, truncate } from '@/utils/format';
import type { Conversation } from '@/features/chat/types';

interface ChatListItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export function ChatListItem({ conversation, onPress }: ChatListItemProps) {
  const { participant, last_message, unread_count } = conversation;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3 gap-3"
    >
      <Avatar
        uri={participant.avatar_url}
        displayName={participant.display_name}
        size={48}
      />
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <Text className="text-white font-semibold text-sm">
            {participant.display_name}
          </Text>
          {last_message ? (
            <Text className="text-[#52525B] text-xs">
              {timeAgo(last_message.created_at)}
            </Text>
          ) : null}
        </View>
        <View className="flex-row justify-between items-center mt-0.5">
          <Text className="text-[#A1A1AA] text-sm flex-1" numberOfLines={1}>
            {last_message ? truncate(last_message.body, 40) : 'No messages yet'}
          </Text>
          {unread_count > 0 ? (
            <View className="bg-[#7C3AED] rounded-full w-5 h-5 items-center justify-center ml-2">
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
