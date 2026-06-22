import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { useConversations } from '@/features/chat/useChat';

export default function ChatsScreen() {
  const router = useRouter();
  const { data: conversations, isLoading, isError } = useConversations();

  return (
    <SafeScreen>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold">Messages</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#7C3AED" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[#EF4444] text-center">Failed to load chats.</Text>
        </View>
      ) : conversations?.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6 gap-2">
          <Text style={{ fontSize: 48 }}>💬</Text>
          <Text className="text-white text-lg font-semibold">No messages yet</Text>
          <Text className="text-[#A1A1AA] text-sm text-center">
            Start a conversation with someone you follow.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ChatListItem
              conversation={item}
              onPress={() => router.push(`/(chat)/${item.id}`)}
            />
          )}
          ItemSeparatorComponent={() => (
            <View className="h-px bg-[#27272A] mx-4" />
          )}
        />
      )}
    </SafeScreen>
  );
}
