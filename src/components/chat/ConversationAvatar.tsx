import { View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import type { Conversation } from '@/features/chat/types';

type Props = {
  conversation: Conversation;
  size?: number;
  showOnline?: boolean;
};

export function ConversationAvatar({ conversation, size = 52, showOnline = true }: Props) {
  const isGroup = conversation.type === 'group';
  const displayName = isGroup ? conversation.group_name : conversation.participant?.display_name;

  if (isGroup && conversation.participants.length > 1) {
    const itemSize = Math.round(size * 0.68);
    return (
      <View style={{ width: size, height: size }}>
        <Avatar
          uri={conversation.participants[0]?.avatar_url}
          displayName={conversation.participants[0]?.display_name}
          size={itemSize}
          className="absolute left-0 top-0"
        />
        <Avatar
          uri={conversation.participants[1]?.avatar_url}
          displayName={conversation.participants[1]?.display_name}
          size={itemSize}
          className="absolute bottom-0 right-0 border-2 border-[#0A0A0A]"
        />
      </View>
    );
  }

  return (
    <View className="relative">
      <Avatar
        uri={conversation.participant?.avatar_url}
        displayName={displayName}
        size={size}
      />
      {showOnline ? (
        <View className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0A0A0A] bg-[#22C55E]" />
      ) : null}
    </View>
  );
}
