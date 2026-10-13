import { useEffect, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { formatCount } from '@/utils/format';
import type { FeedPost } from '@/features/feed/types';

const COLLAPSED_DESCRIPTION_LINES = 5;

type VerticalFeedItemProps = {
  post: FeedPost;
  height: number;
  bottomOverlayInset: number;
  isActive: boolean;
  isFollowing: boolean;
  canFollow: boolean;
  isSaved: boolean;
  playbackRate: number;
  onFollow: () => void;
  onAuthorPress: () => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onOpenOutingGroup?: () => void;
};

/** A single full-height Feed card with information overlaid on the media. */
export function VerticalFeedItem({
  post,
  height,
  bottomOverlayInset,
  isActive,
  isFollowing,
  canFollow,
  isSaved,
  playbackRate,
  onFollow,
  onAuthorPress,
  onLike,
  onComment,
  onShare,
  onSave,
  onOpenOutingGroup,
}: VerticalFeedItemProps) {
  const router = useRouter();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const primaryMedia = post.media[0];
  const isVideo = primaryMedia?.type === 'video';
  const videoUri = isVideo ? primaryMedia.url : '';
  const backendLinked = post.linkedContent;
  const legacyLinked = post.linked_content;
  const linkedRoute = backendLinked
    ? (backendLinked.type === 'PROVERB' ? '/(explore)/proverbs/' : '/(explore)/recipes/')
    : legacyLinked ? ({ proverb: '/(explore)/proverbs/', recipe: '/(explore)/recipes/', artwork: '/(explore)/artworks/', artist: '/(explore)/artisans/', language: '/(explore)/languages/', culture: '/(explore)/culture/' } as const)[legacyLinked.type] : null;
  const linkedId = backendLinked?.id ?? legacyLinked?.id;
  const linkedLabel = backendLinked ? backendLinked.title ?? (backendLinked.type === 'PROVERB' ? 'Voir le proverbe' : 'Voir la recette') : legacyLinked?.label;
  const description = post.caption?.trim() ?? '';
  const descriptionExpandable = description.length > 200 || description.split(/\r?\n/).length > COLLAPSED_DESCRIPTION_LINES;
  const isOuting = post.reference_type === 'EVENT' && Boolean(post.reference_id);
  const hasInformationPanel = Boolean(description || linkedRoute || post.place_tag || isOuting);

  const player = useVideoPlayer(
    isVideo && isActive ? videoUri : null,
    (instance) => {
      instance.loop = true;
      instance.playbackRate = playbackRate;
      if (isActive) instance.play();
    },
  );

  useEffect(() => {
    if (post.type === 'video') player.playbackRate = playbackRate;
  }, [playbackRate, player, post.type]);

  return <View style={{ height }} className="bg-[#0A0A0A]">
    <View className="flex-1 overflow-hidden bg-[#0A0A0A]">
      {isVideo ? <VideoView player={player} style={{ flex: 1 }} contentFit="cover" nativeControls={false} /> : primaryMedia ? <Image source={{ uri: primaryMedia.url }} style={{ flex: 1 }} contentFit="cover" /> : <View className="flex-1 items-center justify-center bg-[#171717] px-8"><Text className="text-center text-2xl font-bold leading-9 text-white">{description || 'Publication Yeyamo'}</Text></View>}

      <View className="absolute right-3 gap-4" style={{ bottom: bottomOverlayInset + 18 }}>
        <View className="items-center pb-1">
          <TouchableOpacity onPress={onAuthorPress} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel={`Ouvrir le profil de ${post.author.display_name}`}><Avatar uri={post.author.avatar_url} displayName={post.author.display_name} size={44} /></TouchableOpacity>
          {canFollow ? <TouchableOpacity onPress={onFollow} activeOpacity={0.8} className="-mt-2 h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#EF4444]" accessibilityRole="button" accessibilityLabel={isFollowing ? `Ne plus suivre ${post.author.display_name}` : `Suivre ${post.author.display_name}`}><Icon library="ionicons" name={isFollowing ? 'checkmark' : 'add'} size={16} color="#FFFFFF" /></TouchableOpacity> : null}
        </View>
        <FeedAction icon={post.is_liked ? 'heart' : 'heart-outline'} active={post.is_liked} label={formatCount(post.likes_count)} accessibilityLabel="Aimer la publication" onPress={onLike} />
        <FeedAction icon="chatbubble-outline" label={formatCount(post.comments_count)} accessibilityLabel="Ouvrir les commentaires" onPress={onComment} />
        <FeedAction icon="arrow-redo-outline" label={formatCount(post.shares_count)} accessibilityLabel="Partager la publication" onPress={onShare} />
        <TouchableOpacity onPress={onSave} className="items-center" activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={isSaved ? 'Retirer des favoris' : 'Enregistrer la publication'}><Icon library="ionicons" name={isSaved ? 'bookmark' : 'bookmark-outline'} size={29} color="#FFFFFF" /></TouchableOpacity>
      </View>

      {hasInformationPanel ? <View className="absolute left-4 right-20" style={{ bottom: bottomOverlayInset + 8 }}>
        <Pressable onPress={onAuthorPress} className="mb-1 flex-row items-center gap-1.5"><Text className="text-[15px] font-extrabold text-white" style={{ textShadowColor: '#000000', textShadowRadius: 3 }}>{post.author.display_name}</Text>{post.author.is_verified ? <VerifiedBadge size={15} /> : null}</Pressable>
        {description ? <>
          <Text
            className="text-sm leading-5 text-white"
            style={{ textShadowColor: '#000000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}
            numberOfLines={descriptionExpanded ? undefined : COLLAPSED_DESCRIPTION_LINES}
          >{description}</Text>
          {descriptionExpandable ? <TouchableOpacity onPress={() => setDescriptionExpanded((value) => !value)} className="min-h-8 self-start justify-center" accessibilityRole="button" accessibilityLabel={descriptionExpanded ? 'Voir moins de description' : 'Voir plus de description'}><Text className="text-sm font-extrabold text-white" style={{ textShadowColor: '#000000', textShadowRadius: 3 }}>{descriptionExpanded ? 'Voir moins' : 'Voir plus'}</Text></TouchableOpacity> : null}
        </> : null}

        {linkedRoute && linkedId && linkedLabel ? <TouchableOpacity onPress={() => router.push(`${linkedRoute}${linkedId}` as never)} className="mb-2 mt-2 self-start flex-row items-center rounded-full bg-white/15 px-3 py-2" accessibilityRole="button" accessibilityLabel={linkedLabel}><Icon name="book-outline" size={15} color="#FFFFFF" /><Text className="ml-2 text-xs font-bold text-white">{linkedLabel}</Text><Icon name="chevron-forward" size={14} color="#FFFFFF" /></TouchableOpacity> : null}

        {post.place_tag ? <View className="mb-2 flex-row items-center gap-1"><Icon library="ionicons" name="location" size={14} color="#EF4444" /><Text className="text-xs text-white">{post.place_tag.name}</Text></View> : null}

        {isOuting ? <TouchableOpacity onPress={onOpenOutingGroup} disabled={!onOpenOutingGroup} className="mt-1 min-h-12 flex-row items-center justify-center rounded-xl bg-[#DC2626] px-4 py-3" style={{ opacity: onOpenOutingGroup ? 1 : 0.6 }} accessibilityRole="button" accessibilityLabel="Accéder au groupe de cette sortie"><Icon library="ionicons" name="people" size={18} color="#FFFFFF" /><Text className="ml-2 text-sm font-extrabold text-white">Accéder au groupe</Text><Icon library="ionicons" name="chevron-forward" size={18} color="#FFFFFF" /></TouchableOpacity> : null}
      </View> : null}
    </View>
  </View>;
}

function FeedAction({ icon, active = false, label, accessibilityLabel, onPress }: { icon: 'heart' | 'heart-outline' | 'chatbubble-outline' | 'arrow-redo-outline'; active?: boolean; label: string; accessibilityLabel: string; onPress: () => void }) {
  return <TouchableOpacity onPress={onPress} className="items-center" activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={accessibilityLabel}><Icon library="ionicons" name={icon} size={30} color={active ? '#EF4444' : '#FFFFFF'} />{label ? <Text className="mt-1 text-xs font-semibold text-white">{label}</Text> : null}</TouchableOpacity>;
}
