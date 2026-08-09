import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { ChatTabs } from '@/components/chat/ChatTabs';
import { PinnedChats } from '@/components/chat/PinnedChats';
import { useConversations } from '@/features/chat/useChat';
import { useThemeStore } from '@/features/theme/theme.store';
import type { ChatTab, Conversation } from '@/features/chat/types';
import type { EntityId } from '@/types/api.types';
import { useFloatingNavigationScroll } from '@/hooks/useFloatingNavigation';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

function conversationName(conversation: Conversation) {
  return conversation.type === 'group'
    ? conversation.group_name ?? ''
    : conversation.participant?.display_name ?? '';
}

export default function ChatsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const floatingScroll = useFloatingNavigationScroll();
  const tabBarHeight = useBottomTabBarHeight();
  const [activeTab, setActiveTab] = useState<ChatTab>('recent');
  const [search, setSearch] = useState('');
  const { data: conversations = [], isLoading, isError } = useConversations();

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
      const matchesSearch = !normalizedSearch
        || conversationName(conversation).toLocaleLowerCase('fr').includes(normalizedSearch)
        || conversation.last_message?.body.toLocaleLowerCase('fr').includes(normalizedSearch);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, conversations, search]);

  const pinnedConversations = useMemo(
    () => conversations.filter((conversation) => conversation.is_pinned),
    [conversations],
  );
  const listConversations = filteredConversations;

  const openConversation = (id: EntityId) => router.push(`/(chat)/${id}`);

  return (
    <SafeScreen style={{ backgroundColor: colors.background }}>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-3">
        <View>
          <Text className="text-3xl font-extrabold" style={{ color: colors.text }}>Messages</Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
            Restez connecté à votre communauté
          </Text>
        </View>
        <TouchableOpacity
          className="h-11 w-11 items-center justify-center rounded-2xl border"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
          accessibilityLabel="Filtrer les conversations"
        >
          <Icon name="options-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View
        className="mx-4 mt-3 h-12 flex-row items-center rounded-2xl border px-4"
        style={{ backgroundColor: colors.elevated, borderColor: colors.border }}
      >
        <Icon name="search-outline" size={20} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          className="ml-3 flex-1 text-sm"
          style={{ color: colors.text }}
          placeholder="Rechercher une conversation..."
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Effacer la recherche">
            <Icon name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Icon name="cloud-offline-outline" size={44} color={colors.primary} />
          <Text className="mt-3 text-center font-semibold" style={{ color: colors.text }}>
            Impossible de charger les conversations
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <FlatList
            {...floatingScroll}
            data={listConversations}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
            ListHeaderComponent={activeTab === 'recent' && !search ? (
              <>
                <PinnedChats conversations={pinnedConversations} onPress={openConversation} />
                <Text className="mb-3 px-4 text-sm font-bold" style={{ color: colors.text }}>
                  Conversations
                </Text>
              </>
            ) : null}
            renderItem={({ item }) => (
              <ChatListItem conversation={item} onPress={() => openConversation(item.id)} />
            )}
            ListEmptyComponent={(
              <View className="items-center justify-center px-8 py-20">
                <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
                  <Icon name="chatbubble-ellipses-outline" size={32} color={colors.textMuted} />
                </View>
                <Text className="mt-4 text-lg font-bold" style={{ color: colors.text }}>Aucune conversation</Text>
                <Text className="mt-1 text-center text-sm" style={{ color: colors.textSecondary }}>
                  Modifiez vos filtres ou commencez une nouvelle discussion.
                </Text>
              </View>
            )}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            className="absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 10 }}
            accessibilityLabel="Nouvelle conversation"
          >
            <Icon name="create-outline" size={25} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeScreen>
  );
}
