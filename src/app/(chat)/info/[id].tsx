import { Alert, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { ConversationAvatar } from '@/components/chat/ConversationAvatar';
import { Avatar } from '@/components/ui/Avatar';
import { useConversations } from '@/features/chat/useChat';
import { useThemeStore } from '@/features/theme/theme.store';
import { useChatStore } from '@/features/chat/chat.store';

type ActionButtonProps = {
  icon: string;
  label: string;
  onPress: () => void;
};

function ActionButton({ icon, label, onPress }: ActionButtonProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity onPress={onPress} className="flex-1 items-center" activeOpacity={0.75}>
      <View className="h-14 w-14 items-center justify-center rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <Icon name={icon} size={22} color={colors.text} />
      </View>
      <Text className="mt-2 text-[11px] font-medium" style={{ color: colors.text }}>{label}</Text>
    </TouchableOpacity>
  );
}

type SettingRowProps = {
  icon: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  destructive?: boolean;
  onPress?: () => void;
};

function SettingRow({ icon, iconColor, title, subtitle, destructive, onPress }: SettingRowProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} className="min-h-14 flex-row items-center px-4 py-3">
      <View className="h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${iconColor}1A` }}>
        <Icon name={icon} size={19} color={iconColor} />
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-sm font-medium" style={{ color: destructive ? colors.primary : colors.text }}>{title}</Text>
        {subtitle ? <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{subtitle}</Text> : null}
      </View>
      {!destructive ? <Icon name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </TouchableOpacity>
  );
}

export default function ChatInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const conversationId = Number(id);
  const { data: conversations = [], isLoading } = useConversations();
  const [isMoreOpen, setMoreOpen] = useState(false);
  const preferences = useChatStore((state) => state.preferences[conversationId]);
  const conversation = conversations.find((item) => item.id === conversationId);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/(chat)/${conversationId}`);
  };

  if (!conversation) {
    return (
      <SafeScreen style={{ backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.textSecondary }}>{isLoading ? 'Chargement...' : 'Conversation introuvable'}</Text>
        </View>
      </SafeScreen>
    );
  }

  const isGroup = conversation.type === 'group';
  const isPartner = conversation.type === 'partner';
  const displayName = isGroup ? conversation.group_name : conversation.participant?.display_name;
  const subtitle = isGroup
    ? `Groupe · ${conversation.participants.length} membres`
    : isPartner
      ? 'Partenaire · En ligne'
      : 'En ligne';

  const confirmAction = (title: string, message: string, action: string, onConfirm?: () => void) => {
    Alert.alert(title, message, [
      { text: 'Annuler', style: 'cancel' },
      { text: action, style: 'destructive', onPress: onConfirm },
    ]);
  };

  const openTool = (section: string) => router.push({ pathname: '/(chat)/tools/[section]', params: { section, id: String(conversationId) } });

  return (
    <SafeScreen style={{ backgroundColor: colors.background }}>
      <View className="h-16 flex-row items-center border-b px-3" style={{ borderColor: colors.border }}>
        <TouchableOpacity onPress={goBack} className="h-11 w-11 items-center justify-center" accessibilityLabel="Retour">
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-base font-bold" style={{ color: colors.text }}>Infos conversation</Text>
        <View className="w-11" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="items-center px-4 pb-6 pt-7">
          <ConversationAvatar conversation={conversation} size={88} />
          <Text className="mt-4 text-xl font-extrabold" style={{ color: colors.text }}>{displayName}</Text>
          <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{subtitle}</Text>
        </View>

        <View className="mb-6 flex-row px-3">
          <ActionButton icon="call-outline" label="Audio" onPress={() => openTool('audio')} />
          <ActionButton icon="videocam-outline" label="Vidéo" onPress={() => openTool('video')} />
          <ActionButton icon="search-outline" label="Rechercher" onPress={() => openTool('search')} />
          <ActionButton icon="ellipsis-horizontal" label="Plus" onPress={() => setMoreOpen(true)} />
        </View>

        <View className="mx-4 overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <SettingRow icon="images-outline" iconColor="#38BDF8" title="Médias, liens et documents" subtitle="Photos, vidéos et fichiers" onPress={() => openTool('media')} />
          <View className="ml-16 h-px" style={{ backgroundColor: colors.border }} />
          <SettingRow icon="pin-outline" iconColor="#F59E0B" title="Messages épinglés" subtitle="Retrouvez les messages importants" onPress={() => openTool('pinned')} />
          <View className="ml-16 h-px" style={{ backgroundColor: colors.border }} />
          <SettingRow icon="notifications-outline" iconColor="#F59E0B" title="Notifications" subtitle={(preferences?.notificationsEnabled ?? true) ? 'Activées' : 'En sourdine'} onPress={() => openTool('notifications')} />
          <View className="ml-16 h-px" style={{ backgroundColor: colors.border }} />
          <SettingRow icon="color-palette-outline" iconColor="#A78BFA" title="Fond d’écran" subtitle="Fonds système Yeyamo" onPress={() => openTool('wallpaper')} />
        </View>

        {isGroup ? (
          <View className="mx-4 mt-5 overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <View className="flex-row items-center justify-between px-4 py-4">
              <Text className="text-sm font-bold" style={{ color: colors.text }}>Membres</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>{conversation.participants.length}</Text>
            </View>
            {conversation.participants.map((participant, index) => (
              <View key={participant.id}>
                {index ? <View className="ml-16 h-px" style={{ backgroundColor: colors.border }} /> : null}
                <View className="flex-row items-center px-4 py-3">
                  <Avatar uri={participant.avatar_url} displayName={participant.display_name} size={38} />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold" style={{ color: colors.text }}>{participant.display_name}</Text>
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>@{participant.username}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {isPartner ? (
          <View className="mx-4 mt-5 rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Text className="mb-4 text-sm font-bold" style={{ color: colors.text }}>Informations du partenaire</Text>
            <View className="flex-row justify-between gap-4">
              <Text className="text-xs" style={{ color: colors.textSecondary }}>Catégorie</Text>
              <Text className="flex-1 text-right text-xs font-medium" style={{ color: colors.text }}>Hôtel & Resort</Text>
            </View>
            <View className="my-3 h-px" style={{ backgroundColor: colors.border }} />
            <View className="flex-row justify-between gap-4">
              <Text className="text-xs" style={{ color: colors.textSecondary }}>Adresse</Text>
              <Text className="flex-1 text-right text-xs font-medium" style={{ color: colors.text }}>Bonapriso, Douala</Text>
            </View>
          </View>
        ) : null}

        <View className="mx-4 mt-5 overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <SettingRow
            icon="ban-outline"
            iconColor={colors.primary}
            title={isGroup ? 'Quitter le groupe' : isPartner ? 'Bloquer le partenaire' : 'Bloquer ce contact'}
            destructive
            onPress={() => confirmAction('Confirmer cette action', 'Vous pourrez modifier ce choix plus tard dans les paramètres.', 'Confirmer')}
          />
          <View className="ml-16 h-px" style={{ backgroundColor: colors.border }} />
          <SettingRow
            icon="flag-outline"
            iconColor={colors.primary}
            title={isGroup ? 'Signaler le groupe' : 'Signaler ce contact'}
            destructive
            onPress={() => confirmAction('Signaler', 'Voulez-vous signaler un comportement inapproprié ?', 'Signaler')}
          />
          <View className="ml-16 h-px" style={{ backgroundColor: colors.border }} />
          <SettingRow
            icon="trash-outline"
            iconColor={colors.primary}
            title="Supprimer la conversation"
            destructive
            onPress={() => confirmAction(
              'Supprimer la conversation',
              'Cette action est irréversible.',
              'Supprimer',
              () => router.replace('/(tabs)/chats'),
            )}
          />
        </View>

        <Modal visible={isMoreOpen} transparent animationType="fade" onRequestClose={() => setMoreOpen(false)}>
          <Pressable className="flex-1 justify-end bg-black/45" onPress={() => setMoreOpen(false)}>
            <Pressable className="rounded-t-[28px] px-4 pb-8 pt-3" style={{ backgroundColor: colors.card }} onPress={(event) => event.stopPropagation()}>
              <View className="mb-4 h-1 w-10 self-center rounded-full" style={{ backgroundColor: colors.border }} />
              <Text className="mb-4 text-lg font-extrabold" style={{ color: colors.text }}>Plus d’actions</Text>
              {!isGroup && conversation.participant ? <SettingRow icon="person-outline" iconColor="#38BDF8" title="Voir le profil" onPress={() => { setMoreOpen(false); router.push(`/(profile)/${conversation.participant?.username}`); }} /> : null}
              <SettingRow icon="search-outline" iconColor="#A78BFA" title="Rechercher dans la conversation" onPress={() => { setMoreOpen(false); openTool('search'); }} />
              <SettingRow icon="notifications-off-outline" iconColor="#F59E0B" title="Gérer les notifications" onPress={() => { setMoreOpen(false); openTool('notifications'); }} />
              <SettingRow icon="share-outline" iconColor="#10B981" title="Exporter la conversation" onPress={() => Alert.alert('Export', 'La préparation de l’export de cette conversation a commencé.')} />
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </SafeScreen>
  );
}
