import { View, Text } from 'react-native';
import { timeAgo } from '@/utils/format';
import type { ChatMessage } from '@/features/chat/types';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <View
      className={`max-w-[75%] mb-2 ${isOwnMessage ? 'self-end' : 'self-start'}`}
    >
      <View
        className={`px-4 py-3 rounded-2xl ${
          isOwnMessage
            ? 'bg-[#7C3AED] rounded-br-sm'
            : 'bg-[#1F1F1F] rounded-bl-sm'
        }`}
      >
        <Text className="text-white text-sm leading-5">{message.body}</Text>
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
