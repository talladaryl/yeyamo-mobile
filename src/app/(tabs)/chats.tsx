import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { ChatTabs } from '@/components/chat/ChatTabs';
import { InboxNotifications } from '@/components/chat/InboxNotifications';
import { MessageStories } from '@/components/chat/MessageStories';
import { PinnedChats } from '@/components/chat/PinnedChats';
import { Icon } from '@/components/ui/Icon';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useAuth } from '@/features/auth/useAuth';
import { useConversations } from '@/features/chat/useChat';
import type { ChatTab, Conversation } from '@/features/chat/types';
import { useUnreadCount } from '@/features/notifications/useNotifications';
import { useStories } from '@/features/story/useStory';
import { useThemeStore } from '@/features/theme/theme.store';
import type { EntityId } from '@/types/api.types';

type InboxSection = 'messages' | 'notifications';

function conversationName(conversation: Conversation) {
  return conversation.type === 'group' ? conversation.group_name ?? '' : conversation.participant?.display_name ?? '';
}

export default function ChatsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const tabBarHeight = useBottomTabBarHeight();
  const [inboxSection, setInboxSection] = useState<InboxSection>('messages');
  const [activeTab, setActiveTab] = useState<ChatTab>('recent');
  const [search, setSearch] = useState('');
  const { data: conversations = [], isLoading, isError } = useConversations();
  const { data: unreadNotifications = 0 } = useUnreadCount();
  const { data: stories = [] } = useStories();
  const { user } = useAuth();
  const unreadMessages = conversations.reduce((total, conversation) => total + conversation.unread_count, 0);

  const counts = useMemo(() => ({
    recent: conversations.length,
    main: conversations.filter((item) => item.type !== 'group').length,
    unread: conversations.filter((item) => item.unread_count > 0).length,
    groups: conversations.filter((item) => item.type === 'group').length,
  }), [conversations]);

  const filteredConversations = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('fr');
    return conversations.filter((conversation) => {
      const matchesTab = activeTab === 'recent'
        || (activeTab === 'main' && conversation.type !== 'group')
        || (activeTab === 'unread' && conversation.unread_count > 0)
        || (activeTab === 'groups' && conversation.type === 'group');
      return matchesTab && (!normalizedSearch
        || conversationName(conversation).toLocaleLowerCase('fr').includes(normalizedSearch)
        || conversation.last_message?.body.toLocaleLowerCase('fr').includes(normalizedSearch));
    });
  }, [activeTab, conversations, search]);

  const pinnedConversations = useMemo(() => conversations.filter((conversation) => conversation.is_pinned), [conversations]);
  const openConversation = (id: EntityId) => router.push(`/(chat)/${id}`);

  return (
    <SafeScreen style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-3">
        <View>
          <Text className="text-3xl font-extrabold" style={{ color: colors.text }}>Boîte de réception</Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>Messages, activités et informations Yeyamo</Text>
        </View>
        {inboxSection === 'messages' ? (
          <TouchableOpacity className="h-11 w-11 items-center justify-center rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }} accessibilityLabel="Filtrer les conversations">
            <Icon name="options-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View className="mx-4 my-2 flex-row rounded-2xl p-1" style={{ backgroundColor: colors.elevated }}>
        <InboxTab label="Messages" count={unreadMessages} active={inboxSection === 'messages'} onPress={() => setInboxSection('messages')} />
        <InboxTab label="Notifications" count={unreadNotifications} active={inboxSection === 'notifications'} onPress={() => setInboxSection('notifications')} />
      </View>

      {inboxSection === 'notifications' ? <InboxNotifications /> : (
        <>
          <MessageStories stories={stories} currentUserId={user?.id} />
          <View className="mx-4 mt-3 h-12 flex-row items-center rounded-2xl border px-4" style={{ backgroundColor: colors.elevated, borderColor: colors.border }}>
            <Icon name="search-outline" size={20} color={colors.textMuted} />
            <TextInput value={search} onChangeText={setSearch} className="ml-3 flex-1 text-sm" style={{ color: colors.text }} placeholder="Rechercher une conversation..." placeholderTextColor={colors.textMuted} returnKeyType="search" />
            {search ? <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Effacer la recherche"><Icon name="close-circle" size={20} color={colors.textMuted} /></TouchableOpacity> : null}
          </View>
          <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

          {isLoading ? (
            <View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View>
          ) : isError ? (
            <View className="flex-1 items-center justify-center px-8"><Icon name="cloud-offline-outline" size={44} color={colors.primary} /><Text className="mt-3 text-center font-semibold" style={{ color: colors.text }}>Impossible de charger les conversations</Text></View>
          ) : (
            <View className="flex-1">
              <FlatList
                data={filteredConversations}
                keyExtractor={(item) => String(item.id)}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
                ListHeaderComponent={activeTab === 'recent' && !search ? <><PinnedChats conversations={pinnedConversations} onPress={openConversation} /><Text className="mb-3 px-4 text-sm font-bold" style={{ color: colors.text }}>Conversations</Text></> : null}
                renderItem={({ item }) => <ChatListItem conversation={item} onPress={() => openConversation(item.id)} />}
                ListEmptyComponent={<View className="items-center justify-center px-8 py-20"><View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="chatbubble-ellipses-outline" size={32} color={colors.textMuted} /></View><Text className="mt-4 text-lg font-bold" style={{ color: colors.text }}>Aucune conversation</Text><Text className="mt-1 text-center text-sm" style={{ color: colors.textSecondary }}>Modifiez vos filtres ou commencez une nouvelle discussion.</Text></View>}
              />
              <TouchableOpacity
                onPress={() => router.push('/(chat)/new')}
                activeOpacity={0.85}
                className="absolute right-5 h-14 w-14 items-center justify-center rounded-full"
                style={{ bottom: tabBarHeight + 12, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 }}
                accessibilityLabel="Nouvelle conversation"
              >
                <Icon name="create-outline" size={25} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeScreen>
  );
}

function InboxTab({ label, count, active, onPress }: { label: string; count: number; active: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity onPress={onPress} className="flex-1 flex-row items-center justify-center rounded-xl py-3" style={{ backgroundColor: active ? colors.card : 'transparent' }} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <Text className="text-sm font-extrabold" style={{ color: active ? colors.text : colors.textSecondary }}>{label}</Text>
      {count > 0 ? <View className="ml-2 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1.5 py-0.5"><Text className="text-[10px] font-extrabold text-white">{count > 99 ? '99+' : count}</Text></View> : null}
    </TouchableOpacity>
  );
}
