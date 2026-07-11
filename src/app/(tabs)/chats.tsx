import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { ChatTabs } from '@/components/chat/ChatTabs';
import { useConversations } from '@/features/chat/useChat';
import type { ChatTab } from '@/features/chat/types';

export default function ChatsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ChatTab>('recent');
  const { data: conversations, isLoading, isError } = useConversations();

  // Filter conversations based on active tab
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    
    switch (activeTab) {
      case 'recent':
        return conversations;
      case 'main':
        return conversations.filter(c => c.type === 'partner' || c.type === 'user');
      case 'unread':
        return conversations.filter(c => c.unread_count > 0);
      case 'groups':
        return conversations.filter(c => c.type === 'group');
      default:
        return conversations;
    }
  }, [conversations, activeTab]);

  const pinnedConversations = useMemo(() => {
    return conversations?.filter(c => c.is_pinned) ?? [];
  }, [conversations]);

  const regularConversations = useMemo(() => {
    return filteredConversations.filter((conversation) => !conversation.is_pinned);
  }, [filteredConversations]);

  const counts = useMemo(() => {
    if (!conversations) return { recent: 0, main: 0, unread: 0, groups: 0 };
    return {
      recent: conversations.length,
      main: conversations.filter(c => c.type !== 'group').length,
      unread: conversations.filter(c => c.unread_count > 0).length,
      groups: conversations.filter(c => c.type === 'group').length,
    };
  }, [conversations]);

  return (
    <SafeScreen>
      {/* Header */}
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-white text-2xl font-bold">Messages</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Icon library="ionicons" name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#EF4444" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[#EF4444] text-center">Failed to load chats.</Text>
        </View>
      ) : filteredConversations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6 gap-2">
          <Icon name="chatbubble-ellipses-outline" size={48} color="#52525B" />
          <Text className="text-white text-lg font-semibold">
            {activeTab === 'unread' ? 'Aucun message non lu' : 'Aucun message'}
          </Text>
          <Text className="text-[#A1A1AA] text-sm text-center">
            {activeTab === 'groups' 
              ? 'Créez un groupe pour échanger avec plusieurs personnes.'
              : 'Commencez une conversation avec quelqu\'un.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={regularConversations}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            pinnedConversations.length > 0 && activeTab === 'recent' ? (
              <View className="px-4 pt-3 pb-2">
                <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-2">
                  Épinglées
                </Text>
                <View className="bg-[#161616] rounded-xl overflow-hidden">
                  {pinnedConversations.map((conversation, index) => (
                    <View key={conversation.id}>
                      <ChatListItem
                        conversation={conversation}
                        onPress={() => router.push(`/(chat)/${conversation.id}`)}
                      />
                      {index < pinnedConversations.length - 1 ? (
                        <View className="h-px bg-[#27272A] mx-4" />
                      ) : null}
                    </View>
                  ))}
                </View>
                <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mt-5 mb-2">
                  Conversations
                </Text>
              </View>
            ) : null
          }
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
