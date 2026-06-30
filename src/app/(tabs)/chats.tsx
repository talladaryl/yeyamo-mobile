import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { ChatTabs } from '@/components/chat/ChatTabs';
import { PinnedChats } from '@/components/chat/PinnedChats';
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

      {/* Pinned Chats */}
      <PinnedChats
        conversations={pinnedConversations}
        onPress={(id) => router.push(`/(chat)/${id}`)}
      />

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
          <Text style={{ fontSize: 48 }}>💬</Text>
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
          data={filteredConversations}
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
