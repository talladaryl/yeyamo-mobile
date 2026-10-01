import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { ConversationAvatar } from '@/components/chat/ConversationAvatar';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { useChatMessages, useConversations, useMarkConversationRead, useSendMessage } from '@/features/chat/useChat';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';
import { useChatStore, type ChatWallpaper } from '@/features/chat/chat.store';
import type { ChatMessage } from '@/features/chat/types';
import { traceMessageRuntime } from '@/features/social/social.runtime-trace';

function messageSendError(error: unknown): string {
  const apiError = error as { status?: number; code?: string } | null;
  if (apiError?.status === 401) return 'Votre session a expiré. Reconnectez-vous puis réessayez.';
  if (apiError?.status === 403) return 'Vous n’avez plus accès à cette conversation.';
  if (apiError?.status === 404 || apiError?.code === 'CONVERSATION_NOT_FOUND') return 'Cette conversation n’existe plus.';
  if (apiError?.status === 422 || apiError?.status === 400) return 'Le message ne peut pas être envoyé dans son état actuel.';
  if (!apiError?.status) return 'Vérifiez votre connexion puis réessayez.';
  return 'Le serveur n’a pas accepté le message. Réessayez.';
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const currentUser = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();
  const conversationId = id;
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const initialScrollDone = useRef(false);
  const lastMarkedRead = useRef<string | null>(null);
  const wallpaper = useChatStore((state) => state.preferences[conversationId]?.wallpaper ?? 'default');
  const wallpaperColors: Record<ChatWallpaper, string> = {
    default: colors.background,
    sand: '#FFF4DD',
    ocean: '#DDF3FA',
    forest: '#E3F1E5',
    rose: '#FCE7EC',
    midnight: '#161C2B',
  };

  const { data: conversations = [], isLoading: isConversationLoading } = useConversations();
  const conversation = conversations.find((item) => String(item.id) === conversationId);
  const { query, realtimeMessages } = useChatMessages(conversationId);
  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: markRead } = useMarkConversationRead();

  const messages = useMemo<ChatMessage[]>(() => {
    const pagedMessages = query.data?.pages.flatMap((page) => page.data) ?? [];
    const knownIds = new Set(pagedMessages.map((message) => message.id));
    const freshMessages = realtimeMessages.filter((message) => !knownIds.has(message.id));
    return [...pagedMessages, ...freshMessages].sort(
      (left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime(),
    );
  }, [query.data, realtimeMessages]);

  useEffect(() => {
    const latestIncoming = [...messages].reverse().find(
      (message) => String(message.sender.id) !== String(currentUser?.id),
    );
    if (!latestIncoming || lastMarkedRead.current === String(latestIncoming.id)) return;
    lastMarkedRead.current = String(latestIncoming.id);
    markRead({ conversationId, messageId: latestIncoming.id });
  }, [conversationId, currentUser?.id, markRead, messages]);

  useEffect(() => {
    if (!messages.length || initialScrollDone.current) return;
    initialScrollDone.current = true;
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
  }, [messages.length]);

  useEffect(() => {
    if (!conversation) return;
    traceMessageRuntime('MESSAGE_CONVERSATION_OPEN', {
      conversationId: String(conversation.id),
      viewerAuthUserId: currentUser?.id ?? null,
      peerAuthUserId: conversation.participant?.id ?? null,
    });
  }, [conversation, currentUser?.id]);

  const isGroup = conversation?.type === 'group';
  const displayName = isGroup
    ? conversation?.group_name ?? 'Groupe'
    : conversation?.participant?.display_name ?? 'Compte indisponible';
  const subtitle = isGroup
    ? `${conversation?.participants.length ?? 0} membres · Actif`
    : conversation?.type === 'partner'
      ? 'Partenaire · En ligne'
      : 'En ligne';

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/chats');
  };

  const handleSend = useCallback(async () => {
    const body = draft.trim();
    if (!body || isSending) return;
    traceMessageRuntime('MESSAGE_COMPOSER_SUBMIT', {
      conversationId: String(conversationId),
      messageLength: body.length,
      hasReply: Boolean(replyTo),
    });
    if (replyTo) {
      traceMessageRuntime('MESSAGE_REPLY_REQUEST', {
        conversationId: String(conversationId),
        replyToMessageId: String(replyTo.id),
      });
    }
    try {
      await sendMessage({
        conversation_id: conversationId,
        body,
        reply_to_message_id: replyTo?.id ?? null,
      });
      setDraft('');
      setReplyTo(null);
      if (replyTo) {
        traceMessageRuntime('MESSAGE_REPLY_RESPONSE', {
          conversationId: String(conversationId),
          replyToMessageId: String(replyTo.id),
        });
      }
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (error) {
      traceMessageRuntime('MESSAGE_COMPOSER_ERROR', { conversationId: String(conversationId) });
      Alert.alert('Envoi impossible', messageSendError(error));
    }
  }, [conversationId, draft, isSending, replyTo, sendMessage]);

  if (isConversationLoading || !conversation) {
    return (
      <SafeScreen style={{ backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center">
          {isConversationLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Text className="font-semibold" style={{ color: colors.text }}>Conversation introuvable</Text>
              <TouchableOpacity onPress={goBack} className="mt-4 rounded-full px-5 py-2" style={{ backgroundColor: colors.primary }}>
                <Text className="font-semibold text-white">Retour aux messages</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={{ backgroundColor: colors.background }}>
      <View className="h-16 flex-row items-center border-b px-3" style={{ borderColor: colors.border }}>
        <TouchableOpacity onPress={goBack} className="h-11 w-10 items-center justify-center" accessibilityLabel="Retour">
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/(chat)/info/${conversationId}`)}
          className="ml-1 flex-1 flex-row items-center"
          activeOpacity={0.75}
        >
          <ConversationAvatar conversation={conversation} size={42} />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-bold" style={{ color: colors.text }} numberOfLines={1}>{displayName}</Text>
            <Text className="mt-0.5 text-[11px]" style={{ color: colors.textSecondary }} numberOfLines={1}>{subtitle}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(chat)/tools/[section]', params: { section: 'audio', id: String(conversationId) } })} className="h-10 w-10 items-center justify-center" accessibilityLabel="Appeler">
          <Icon name="call-outline" size={21} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(chat)/tools/[section]', params: { section: 'video', id: String(conversationId) } })} className="h-10 w-10 items-center justify-center" accessibilityLabel="Appel vidéo">
          <Icon name="videocam-outline" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/(chat)/info/${conversationId}`)}
          className="h-10 w-9 items-center justify-center"
          accessibilityLabel="Informations de la conversation"
        >
          <Icon name="ellipsis-vertical" size={21} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        style={{ backgroundColor: wallpaperColors[wallpaper] }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {query.isLoading ? (
          <View className="flex-1 items-center justify-center"><ActivityIndicator color={colors.primary} /></View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isOwnMessage={String(item.sender.id) === String(currentUser?.id)}
                showSender={isGroup}
                onReply={(message) => {
                  setReplyTo(message);
                  traceMessageRuntime('MESSAGE_REPLY_MODE', {
                    conversationId: String(conversationId),
                    replyToMessageId: String(message.id),
                  });
                }}
              />
            )}
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 12 }}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={messages.length ? (
              <View className="mb-4 items-center">
                <View className="rounded-full px-4 py-1.5" style={{ backgroundColor: colors.elevated }}>
                  <Text className="text-[10px] font-medium" style={{ color: colors.textSecondary }}>Aujourd’hui</Text>
                </View>
              </View>
            ) : null}
            ListEmptyComponent={(
              <View className="flex-1 items-center justify-center px-8">
                <Icon name="chatbubbles-outline" size={42} color={colors.textMuted} />
                <Text className="mt-3 text-center font-semibold" style={{ color: colors.text }}>Commencez la conversation</Text>
              </View>
            )}
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
            }}
            onEndReachedThreshold={0.1}
          />
        )}

        <View
          className="border-t px-3 pt-2"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          }}
        >
          {replyTo ? (
            <View className="mb-2 flex-row items-center rounded-xl px-3 py-2" style={{ backgroundColor: colors.elevated }}>
              <View className="flex-1 border-l-2 pl-2" style={{ borderColor: colors.primary }}>
                <Text className="text-xs font-bold" style={{ color: colors.text }}>Réponse à {replyTo.sender.display_name}</Text>
                <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }} numberOfLines={1}>{replyTo.body || 'Pièce jointe'}</Text>
              </View>
              <TouchableOpacity onPress={() => setReplyTo(null)} className="ml-2 h-8 w-8 items-center justify-center" accessibilityLabel="Annuler la réponse">
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : null}
          <View className="flex-row items-end gap-1.5">
            <View className="min-h-11 flex-1 flex-row items-end rounded-2xl border px-3" style={{ backgroundColor: colors.elevated, borderColor: colors.border }}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                className="max-h-28 flex-1 py-3 text-sm"
                style={{ color: colors.text }}
                placeholder="Écrivez un message..."
                placeholderTextColor={colors.textMuted}
                multiline
                scrollEnabled
                textAlignVertical="center"
                maxLength={1000}
              />
            </View>
            <TouchableOpacity
              onPress={handleSend}
              disabled={!draft.trim() || isSending}
              activeOpacity={0.8}
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: draft.trim() ? colors.primary : colors.elevated }}
            >
              <Icon name="send" size={18} color={draft.trim() ? '#FFFFFF' : colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
