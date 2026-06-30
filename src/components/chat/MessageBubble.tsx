import { View, Text } from 'react-native';
import { timeAgo } from '@/utils/format';
import { MessageAttachment } from './MessageAttachment';
import { EventMessageCard } from './EventMessageCard';
import { SystemMessage } from './SystemMessage';
import type { ChatMessage } from '@/features/chat/types';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  // System message
  if (message.message_type === 'system') {
    return <SystemMessage message={message.body} />;
  }

  // Event card
  if (message.message_type === 'event' && message.event_data) {
    return (
      <View className="max-w-[85%] mb-2 self-start">
        <EventMessageCard event={message.event_data} />
        <Text className="text-[#52525B] text-xs mt-1 ml-1">
          {timeAgo(message.created_at)}
        </Text>
      </View>
    );
  }

  // Regular message with optional attachments
  return (
    <View
      className={`max-w-[75%] mb-2 ${isOwnMessage ? 'self-end' : 'self-start'}`}
    >
      <View
        className={`px-4 py-3 rounded-2xl ${
          isOwnMessage
            ? 'bg-[#EF4444] rounded-br-sm'
            : 'bg-[#27272A] rounded-bl-sm'
        }`}
      >
        {message.body ? (
          <Text className="text-white text-sm leading-5">{message.body}</Text>
        ) : null}
        
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <View className={message.body ? 'mt-2' : ''}>
            {message.attachments.map((attachment) => (
              <MessageAttachment key={attachment.id} attachment={attachment} />
            ))}
          </View>
        )}
      </View>
      <Text
        className={`text-[#52525B] text-xs mt-1 ${
          isOwnMessage ? 'text-right' : 'text-left'
        }`}
      >
        {timeAgo(message.created_at)}
        {isOwnMessage && message.read_at ? '  ✓✓' : ''}
      </Text>
    </View>
  );
}
