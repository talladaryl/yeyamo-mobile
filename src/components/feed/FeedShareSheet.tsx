import { useMemo } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import type { Conversation } from '@/features/chat/types';
import type { FeedPost } from '@/features/feed/types';
import type { EntityId, UserSummary } from '@/types/api.types';

type FeedShareSheetProps = {
  visible: boolean;
  post: FeedPost | null;
  conversations: Conversation[];
  playbackRate: number;
  isSaved: boolean;
  isInterested: boolean;
  onClose: () => void;
  onSendToFriend: (conversationId: EntityId) => void;
  onPlaybackRateChange: (rate: number) => void;
  onSave: () => void;
  onInterested: () => void;
  onNotInterested: () => void;
};

type ShareFriend = { conversationId: EntityId; user: UserSummary };

export function FeedShareSheet({
  visible,
  post,
  conversations,
  playbackRate,
  isSaved,
  isInterested,
  onClose,
  onSendToFriend,
  onPlaybackRateChange,
  onSave,
  onInterested,
  onNotInterested,
}: FeedShareSheetProps) {
  const friends = useMemo<ShareFriend[]>(() => conversations.flatMap((conversation) => {
    if (conversation.type === 'group' || !conversation.participant) return [];
    return [{ conversationId: conversation.id, user: conversation.participant }];
  }).slice(0, 10), [conversations]);

  if (!post) return null;

  const postUrl = `https://yeyamo.app/posts/${post.id}`;
  const shareMessage = `Découvre cette publication sur Yeyamo\n${postUrl}`;

  const openUrl = async (url: string, fallbackToSystem = true) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        onClose();
        return;
      }
    } catch {}
    if (fallbackToSystem) await openSystemShare();
  };

  const openSystemShare = async () => {
    try {
      await Share.share({ title: 'Yeyamo', message: shareMessage, url: postUrl });
      onClose();
    } catch {
      Alert.alert('Partage impossible', "Le menu de partage n'a pas pu être ouvert.");
    }
  };

  const download = async () => {
    const mediaUrl = post.media[0]?.url;
    if (!mediaUrl) {
      Alert.alert('Média indisponible', "Cette publication ne contient aucun média à télécharger.");
      return;
    }
    Alert.alert(
      'Télécharger le média',
      "Le média va s'ouvrir. Utilisez ensuite l'option Enregistrer de votre téléphone.",
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Ouvrir', onPress: () => void openUrl(mediaUrl, false) },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/45" onPress={onClose} accessibilityLabel="Fermer le partage" />
        <SafeAreaView edges={['bottom']} className="overflow-hidden rounded-t-[28px] bg-[#191919]">
          <View className="items-center pb-2 pt-3">
            <View className="h-1 w-11 rounded-full bg-white/30" />
            <Text className="mt-3 text-[15px] font-extrabold text-white">Partager avec</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 16 }}>
            {friends.map(({ conversationId, user }) => (
              <TouchableOpacity key={String(conversationId)} onPress={() => onSendToFriend(conversationId)} className="w-16 items-center" activeOpacity={0.75}>
                <Avatar uri={user.avatar_url} displayName={user.display_name} size={52} />
                <Text className="mt-2 w-16 text-center text-[11px] text-white" numberOfLines={1}>{user.display_name}</Text>
              </TouchableOpacity>
            ))}
            {!friends.length ? <Text className="py-5 text-sm text-white/55">Aucun ami disponible</Text> : null}
          </ScrollView>

          <View className="mx-4 h-px bg-white/10" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 18 }}>
            <ShareTarget label="WhatsApp" icon="logo-whatsapp" color="#25D366" onPress={() => void openUrl(`whatsapp://send?text=${encodeURIComponent(shareMessage)}`)} />
            <ShareTarget label="Facebook" icon="logo-facebook" color="#1877F2" onPress={() => void openUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`)} />
            <ShareTarget label="TikTok" icon="logo-tiktok" color="#111111" onPress={() => void openSystemShare()} />
            <ShareTarget label="Plus" icon="ellipsis-horizontal" color="#52525B" onPress={() => void openSystemShare()} />
          </ScrollView>

          {post.type === 'video' ? (
            <View className="mx-4 mb-3 flex-row items-center justify-between rounded-2xl bg-white/[0.07] px-4 py-3">
              <View className="flex-row items-center">
                <Icon name="speedometer-outline" size={21} color="#FFFFFF" />
                <Text className="ml-2 text-sm font-bold text-white">Vitesse</Text>
              </View>
              <View className="flex-row gap-2">
                {[1, 1.5, 2].map((rate) => (
                  <TouchableOpacity key={rate} onPress={() => onPlaybackRateChange(rate)} className={`rounded-full px-3 py-2 ${playbackRate === rate ? 'bg-[#EF4444]' : 'bg-white/10'}`}>
                    <Text className="text-xs font-extrabold text-white">×{rate}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 18, gap: 18 }}>
            <SheetAction label={isInterested ? 'Intéressé' : "Ça m'intéresse"} icon={isInterested ? 'heart' : 'heart-outline'} active={isInterested} onPress={onInterested} />
            <SheetAction label="Pas intéressé" icon="eye-off-outline" onPress={onNotInterested} />
            <SheetAction label={isSaved ? 'Enregistré' : 'Enregistrer'} icon={isSaved ? 'bookmark' : 'bookmark-outline'} active={isSaved} onPress={onSave} />
            <SheetAction label="Télécharger" icon="download-outline" onPress={() => void download()} />
            <SheetAction label="Ouvrir le lien" icon="link-outline" onPress={() => void openUrl(postUrl, false)} />
            <SheetAction label="Signaler" icon="flag-outline" onPress={() => Alert.alert('Signalement', 'Merci. Nous allons examiner cette publication.')} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function ShareTarget({ label, icon, color, onPress }: { label: string; icon: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="w-16 items-center" activeOpacity={0.75}>
      <View className="h-[52px] w-[52px] items-center justify-center rounded-full" style={{ backgroundColor: color }}>
        <Icon name={icon} size={26} color="#FFFFFF" />
      </View>
      <Text className="mt-2 text-center text-[11px] text-white">{label}</Text>
    </TouchableOpacity>
  );
}

function SheetAction({ label, icon, active = false, onPress }: { label: string; icon: string; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="w-[70px] items-center" activeOpacity={0.75}>
      <View className={`h-[52px] w-[52px] items-center justify-center rounded-full ${active ? 'bg-[#EF4444]' : 'bg-white/10'}`}>
        <Icon name={icon} size={24} color="#FFFFFF" />
      </View>
      <Text className="mt-2 text-center text-[11px] leading-4 text-white" numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}
