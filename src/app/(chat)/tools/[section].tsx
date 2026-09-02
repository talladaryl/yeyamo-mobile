import { useMemo, useState } from 'react';
import { FlatList, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { ConversationAvatar } from '@/components/chat/ConversationAvatar';
import { useChatMessages, useConversations } from '@/features/chat/useChat';
import { useChatStore, type ChatWallpaper } from '@/features/chat/chat.store';
import { useThemeStore } from '@/features/theme/theme.store';
import type { ChatMessage } from '@/features/chat/types';

const WALLPAPERS: Array<{ id: ChatWallpaper; name: string; colors: [string, string] }> = [
  { id: 'default', name: 'Classique', colors: ['#F3F4F6', '#E5E7EB'] },
  { id: 'sand', name: 'Sable', colors: ['#FFF7E6', '#EAD7B7'] },
  { id: 'ocean', name: 'Océan', colors: ['#DDF4FF', '#9ED7EA'] },
  { id: 'forest', name: 'Forêt', colors: ['#E4F3E7', '#A8CEAE'] },
  { id: 'rose', name: 'Rosée', colors: ['#FFE8EC', '#F4B7C3'] },
  { id: 'midnight', name: 'Minuit', colors: ['#202638', '#0D1220'] },
];

const TITLES: Record<string, string> = {
  media: 'Médias, liens et documents',
  pinned: 'Messages épinglés',
  notifications: 'Notifications',
  wallpaper: 'Fond d’écran',
  search: 'Rechercher',
};

export default function ChatToolScreen() {
  const { section, id } = useLocalSearchParams<{ section: string; id: string }>();
  const conversationId = id;
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const preferences = useChatStore((state) => state.preferences[conversationId]);
  const setPreferences = useChatStore((state) => state.setConversationPreferences);
  const { data: conversations = [] } = useConversations();
  const { query, realtimeMessages } = useChatMessages(conversationId);
  const [search, setSearch] = useState('');
  const [isMuted, setMuted] = useState(false);
  const [isSpeakerOn, setSpeakerOn] = useState(false);
  const [isCameraOn, setCameraOn] = useState(section === 'video');
  const conversation = conversations.find((item) => String(item.id) === conversationId);
  const messages = useMemo(() => {
    const loaded = query.data?.pages.flatMap((page) => page.data) ?? [];
    return [...loaded, ...realtimeMessages].filter((message, index, all) => all.findIndex((item) => item.id === message.id) === index);
  }, [query.data, realtimeMessages]);
  const filtered = messages.filter((message) => message.body.toLocaleLowerCase('fr').includes(search.trim().toLocaleLowerCase('fr')));
  const media = messages.filter((message) => message.media_url || message.attachments.length > 0);
  const pinned = messages.filter((message, index) => message.message_type === 'event' || index % 2 === 0).slice(0, 3);

  const goBack = () => router.canGoBack() ? router.back() : router.replace(`/(chat)/info/${conversationId}`);

  if ((section === 'audio' || section === 'video') && conversation) {
    const displayName = conversation.type === 'group' ? conversation.group_name : conversation.participant?.display_name;
    return (
      <View className="flex-1 bg-[#10131A] px-5 pb-12 pt-20">
        <View className="items-center">
          <ConversationAvatar conversation={conversation} size={112} />
          <Text className="mt-5 text-2xl font-extrabold text-white">{displayName}</Text>
          <Text className="mt-2 text-sm text-white/70">{section === 'video' ? 'Appel vidéo en cours…' : 'Appel audio en cours…'}</Text>
        </View>
        {section === 'video' && isCameraOn ? <View className="mx-2 mt-8 flex-1 items-center justify-center rounded-[28px] border border-white/10 bg-[#202638]"><Icon name="videocam" size={52} color="#FFFFFF" /><Text className="mt-3 text-white/70">Aperçu caméra</Text></View> : <View className="flex-1" />}
        <View className="flex-row items-center justify-around">
          <TouchableOpacity onPress={() => setMuted((value) => !value)} className="items-center"><View className="h-14 w-14 items-center justify-center rounded-full bg-white/15"><Icon name={isMuted ? 'mic-off' : 'mic'} size={24} color="#FFFFFF" /></View><Text className="mt-2 text-xs text-white">Micro</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setSpeakerOn((value) => !value)} className="items-center"><View className={`h-14 w-14 items-center justify-center rounded-full ${isSpeakerOn ? 'bg-white' : 'bg-white/15'}`}><Icon name="volume-high" size={24} color={isSpeakerOn ? '#10131A' : '#FFFFFF'} /></View><Text className="mt-2 text-xs text-white">Haut-parleur</Text></TouchableOpacity>
          {section === 'video' ? <TouchableOpacity onPress={() => setCameraOn((value) => !value)} className="items-center"><View className="h-14 w-14 items-center justify-center rounded-full bg-white/15"><Icon name={isCameraOn ? 'videocam' : 'videocam-off'} size={24} color="#FFFFFF" /></View><Text className="mt-2 text-xs text-white">Caméra</Text></TouchableOpacity> : null}
          <TouchableOpacity onPress={goBack} className="items-center"><View className="h-14 w-14 items-center justify-center rounded-full bg-[#EF4444]"><Icon name="call" size={25} color="#FFFFFF" /></View><Text className="mt-2 text-xs text-white">Raccrocher</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  const Header = () => (
    <View className="h-16 flex-row items-center border-b px-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <TouchableOpacity onPress={goBack} className="h-11 w-11 items-center justify-center"><Icon name="chevron-back" size={26} color={colors.text} /></TouchableOpacity>
      <Text className="flex-1 text-center text-base font-bold" style={{ color: colors.text }}>{TITLES[section] ?? 'Conversation'}</Text>
      <View className="w-11" />
    </View>
  );

  if (section === 'wallpaper') {
    return (
      <SafeScreen><Header /><ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text className="mb-1 text-lg font-extrabold" style={{ color: colors.text }}>Fonds Yeyamo</Text>
        <Text className="mb-5 text-sm" style={{ color: colors.textSecondary }}>Des fonds système sobres, sans utiliser vos photos.</Text>
        <View className="flex-row flex-wrap justify-between">
          {WALLPAPERS.map((wallpaper) => {
            const selected = (preferences?.wallpaper ?? 'default') === wallpaper.id;
            return (
              <TouchableOpacity key={wallpaper.id} onPress={() => setPreferences(conversationId, { wallpaper: wallpaper.id })} className="mb-4 w-[48%]" activeOpacity={0.8}>
                <LinearGradient colors={wallpaper.colors} className="h-44 overflow-hidden rounded-3xl border" style={{ borderColor: selected ? '#EF4444' : colors.border }}>
                  <View className="flex-1 justify-center gap-2 px-4">
                    <View className="h-7 w-3/4 self-start rounded-2xl bg-white/75" />
                    <View className="h-9 w-4/5 self-end rounded-2xl bg-[#EF4444]/70" />
                    <View className="h-7 w-2/3 self-start rounded-2xl bg-white/75" />
                  </View>
                  {selected ? <View className="absolute right-3 top-3 h-7 w-7 items-center justify-center rounded-full bg-[#EF4444]"><Icon name="checkmark" size={18} color="#FFFFFF" /></View> : null}
                </LinearGradient>
                <Text className="mt-2 text-center text-sm font-semibold" style={{ color: colors.text }}>{wallpaper.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView></SafeScreen>
    );
  }

  if (section === 'notifications') {
    const enabled = preferences?.notificationsEnabled ?? true;
    return (
      <SafeScreen><Header /><View className="p-4">
        <View className="flex-row items-center rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#FEF3C7]"><Icon name="notifications-outline" size={23} color="#D97706" /></View>
          <View className="ml-3 flex-1"><Text className="font-bold" style={{ color: colors.text }}>Notifications de cette conversation</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{enabled ? 'Sons et alertes activés' : 'Conversation en sourdine'}</Text></View>
          <Switch value={enabled} onValueChange={(value) => setPreferences(conversationId, { notificationsEnabled: value })} trackColor={{ false: colors.border, true: '#FCA5A5' }} thumbColor={enabled ? '#EF4444' : '#FFFFFF'} />
        </View>
      </View></SafeScreen>
    );
  }

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View className="mx-4 mb-2 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <Text className="text-sm font-bold" style={{ color: colors.text }}>{item.sender.display_name}</Text>
      {item.body ? <Text className="mt-1 text-sm leading-5" style={{ color: colors.textSecondary }}>{item.body}</Text> : null}
      {item.media_url ? <Image source={{ uri: item.media_url }} style={{ height: 180, marginTop: 10, borderRadius: 14 }} contentFit="cover" /> : null}
      {item.attachments.map((attachment) => <View key={attachment.id} className="mt-3 flex-row items-center rounded-xl p-3" style={{ backgroundColor: colors.elevated }}><Icon name="document-outline" size={20} color="#EF4444" /><Text className="ml-2 flex-1 text-sm" style={{ color: colors.text }}>{attachment.name}</Text></View>)}
    </View>
  );

  const data = section === 'media' ? media : section === 'pinned' ? pinned : filtered;
  return (
    <SafeScreen><Header />
      {section === 'search' ? <View className="mx-4 my-3 flex-row items-center rounded-2xl border px-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Icon name="search" size={19} color={colors.textMuted} /><TextInput autoFocus value={search} onChangeText={setSearch} className="ml-2 h-12 flex-1" style={{ color: colors.text }} placeholder="Rechercher dans la conversation" placeholderTextColor={colors.textMuted} /></View> : null}
      <FlatList data={data} keyExtractor={(item) => String(item.id)} renderItem={renderMessage} contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }} ListEmptyComponent={<View className="items-center px-8 py-20"><Icon name={section === 'media' ? 'images-outline' : 'search-outline'} size={42} color={colors.textMuted} /><Text className="mt-3 text-center font-semibold" style={{ color: colors.text }}>Aucun élément trouvé</Text><Text className="mt-1 text-center text-sm" style={{ color: colors.textSecondary }}>{conversation?.group_name ?? conversation?.participant?.display_name}</Text></View>} />
    </SafeScreen>
  );
}
