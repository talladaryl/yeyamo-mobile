import { Text, TouchableOpacity, View } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';
import { timeAgo, truncate } from '@/utils/format';
import { ConversationAvatar } from './ConversationAvatar';
import type { Conversation } from '@/features/chat/types';

interface ChatListItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export function ChatListItem({ conversation, onPress }: ChatListItemProps) {
  const colors = useThemeStore((state) => state.colors);
  const { last_message: lastMessage, unread_count: unreadCount } = conversation;
  const displayName = conversation.type === 'group'
    ? conversation.group_name
    : conversation.participant?.display_name;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="mx-4 mb-2 flex-row items-center gap-3 rounded-2xl border px-3 py-3"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <ConversationAvatar conversation={conversation} size={52} />

      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 text-sm font-bold" style={{ color: colors.text }} numberOfLines={1}>
            {displayName}
          </Text>
          {lastMessage ? (
            <Text className="text-[11px]" style={{ color: colors.textMuted }}>
              {timeAgo(lastMessage.created_at)}
            </Text>
          ) : null}
        </View>
        <View className="mt-1 flex-row items-center justify-between">
          <Text className="flex-1 text-sm" style={{ color: colors.textSecondary }} numberOfLines={1}>
            {lastMessage ? truncate(lastMessage.body, 46) : 'Aucun message'}
          </Text>
          {unreadCount > 0 ? (
            <View className="ml-2 h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1.5">
              <Text className="text-xs font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
