import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';
import { ConversationAvatar } from './ConversationAvatar';
import type { Conversation } from '@/features/chat/types';
import type { EntityId } from '@/types/api.types';

interface PinnedChatsProps {
  conversations: Conversation[];
  onPress: (id: EntityId) => void;
}

export function PinnedChats({ conversations, onPress }: PinnedChatsProps) {
  const colors = useThemeStore((state) => state.colors);
  if (conversations.length === 0) return null;

  return (
    <View className="pb-4 pt-1">
      <Text className="mb-3 px-4 text-sm font-bold" style={{ color: colors.text }}>
        Épinglées
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-5 px-4"
      >
        {conversations.map((conversation) => {
          const displayName = conversation.type === 'group'
            ? conversation.group_name
            : conversation.participant?.display_name;

          return (
            <TouchableOpacity
              key={conversation.id}
              onPress={() => onPress(conversation.id)}
              activeOpacity={0.75}
              className="w-[68px] items-center"
            >
              <ConversationAvatar conversation={conversation} size={56} />
              <Text className="mt-2 text-xs font-semibold" style={{ color: colors.text }} numberOfLines={1}>
                {displayName}
              </Text>
              <Text className="mt-0.5 text-[10px]" style={{ color: colors.textMuted }} numberOfLines={1}>
                {conversation.type === 'partner' ? 'Partenaire' : conversation.type === 'group' ? 'Groupe' : 'En ligne'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
