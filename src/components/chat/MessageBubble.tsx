import { Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { timeAgo } from '@/utils/format';
import { EventMessageCard } from './EventMessageCard';
import { MessageAttachment } from './MessageAttachment';
import { SystemMessage } from './SystemMessage';
import type { ChatMessage } from '@/features/chat/types';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showSender?: boolean;
  onReply?: (message: ChatMessage) => void;
}

export function MessageBubble({ message, isOwnMessage, showSender = false, onReply }: MessageBubbleProps) {
  const colors = useThemeStore((state) => state.colors);

  if (message.message_type === 'system') {
    return <SystemMessage message={message.body} />;
  }

  if (message.message_type === 'event' && message.event_data) {
    return (
      <View className="mb-3 max-w-[88%] self-start">
        <EventMessageCard event={message.event_data} />
        <Text className="ml-2 mt-1 text-[10px]" style={{ color: colors.textMuted }}>
          {timeAgo(message.created_at)}
        </Text>
      </View>
    );
  }

  return (
    <View className={`mb-3 flex-row items-end gap-2 ${isOwnMessage ? 'self-end' : 'self-start'}`}>
      {!isOwnMessage && showSender ? (
        <Avatar uri={message.sender.avatar_url} displayName={message.sender.display_name} size={28} />
      ) : null}
      <View className="max-w-[78%]">
        {!isOwnMessage && showSender ? (
          <Text className="mb-1 ml-1 text-[11px] font-semibold" style={{ color: colors.primary }}>
            {message.sender.display_name}
          </Text>
        ) : null}
        <TouchableOpacity
          activeOpacity={0.85}
          onLongPress={() => onReply?.(message)}
          delayLongPress={350}
          className={`px-4 py-3 ${isOwnMessage ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'}`}
          style={{ backgroundColor: isOwnMessage ? colors.primary : colors.elevated }}
        >
          {message.reply_to ? (
            <View className="mb-2 border-l-2 pl-2" style={{ borderColor: isOwnMessage ? '#FFFFFF' : colors.primary }}>
              <Text className="text-[11px] font-semibold" style={{ color: isOwnMessage ? '#FFFFFF' : colors.text }} numberOfLines={1}>
                {message.reply_to.sender.display_name}
              </Text>
              <Text className="mt-0.5 text-[11px]" style={{ color: isOwnMessage ? '#FFFFFF' : colors.textSecondary }} numberOfLines={1}>
                {message.reply_to.body || 'Pièce jointe'}
              </Text>
            </View>
          ) : null}
          {message.body ? (
            <Text className="text-sm leading-5" style={{ color: isOwnMessage ? '#FFFFFF' : colors.text }}>
              {message.body}
            </Text>
          ) : null}
          {message.attachments?.length ? (
            <View className={message.body ? 'mt-2' : ''}>
              {message.attachments.map((attachment) => (
                <MessageAttachment key={attachment.id} attachment={attachment} />
              ))}
            </View>
          ) : null}
        </TouchableOpacity>
        <View className={`mt-1 flex-row items-center gap-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <Text className="text-[10px]" style={{ color: colors.textMuted }}>{timeAgo(message.created_at)}</Text>
          {isOwnMessage ? (
            <Icon name={message.read_at ? 'checkmark-done' : 'checkmark'} size={13} color={message.read_at ? colors.primary : colors.textMuted} />
          ) : null}
        </View>
      </View>
    </View>
  );
}
