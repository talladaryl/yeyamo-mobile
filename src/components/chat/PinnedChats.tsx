import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import type { Conversation } from '@/features/chat/types';

interface PinnedChatsProps {
  conversations: Conversation[];
  onPress: (id: number) => void;
}

export function PinnedChats({ conversations, onPress }: PinnedChatsProps) {
  if (conversations.length === 0) return null;

  return (
    <View className="py-3 border-b border-[#27272A]">
      <Text className="text-white text-sm font-semibold px-4 mb-3">Épinglées</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4 gap-4"
      >
        {conversations.map((conv) => {
          const displayName = conv.type === 'group' 
            ? conv.group_name 
            : conv.participant?.display_name;
          const avatarUrl = conv.type === 'group'
            ? conv.participants[0]?.avatar_url
            : conv.participant?.avatar_url;

          return (
            <TouchableOpacity
              key={conv.id}
              onPress={() => onPress(conv.id)}
              className="items-center w-16"
              activeOpacity={0.7}
            >
              <Avatar
                uri={avatarUrl}
                displayName={displayName || ''}
                size={56}
              />
              <Text className="text-white text-xs mt-1.5" numberOfLines={1}>
                {displayName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
