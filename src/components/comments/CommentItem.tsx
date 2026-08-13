import { Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Icon } from '@/components/ui/Icon';
import { timeAgo, formatCount } from '@/utils/format';
import type { Comment } from '@/features/comments/types';
import { useThemeStore } from '@/features/theme/theme.store';

type CommentItemProps = {
  comment: Comment;
  onReply?: () => void;
  onLike?: () => void;
  onShowReplies?: () => void;
};

export function CommentItem({ comment, onReply, onLike, onShowReplies }: CommentItemProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="flex-row gap-3 px-4 py-3">
      <Avatar uri={comment.user.avatar_url} displayName={comment.user.display_name} size={36} />
      <View className="flex-1">
        <View className="mb-1 flex-row items-center gap-1">
          <Text className="text-sm font-semibold" style={{ color: colors.text }}>{comment.user.username}</Text>
          {comment.user.is_verified ? <VerifiedBadge size={14} /> : null}
        </View>
        <Text className="mb-2 text-sm leading-5" style={{ color: colors.text }}>{comment.content}</Text>
        <View className="flex-row items-center gap-4">
          {onReply ? <TouchableOpacity onPress={onReply} activeOpacity={0.7}><Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>Répondre</Text></TouchableOpacity> : null}
          <Text className="text-xs" style={{ color: colors.textSecondary }}>{timeAgo(comment.created_at)}</Text>
          {comment.likes_count > 0 ? <Text className="text-xs" style={{ color: colors.textSecondary }}>{formatCount(comment.likes_count)} j'aime</Text> : null}
          {comment.replies_count > 0 && onShowReplies ? <TouchableOpacity onPress={onShowReplies} activeOpacity={0.7}><Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>— Afficher {comment.replies_count} réponse{comment.replies_count > 1 ? 's' : ''}</Text></TouchableOpacity> : null}
        </View>
      </View>
      {onLike ? <TouchableOpacity onPress={onLike} activeOpacity={0.7} className="pt-1"><Icon library="ionicons" name={comment.is_liked ? 'heart' : 'heart-outline'} size={20} color={comment.is_liked ? colors.primary : colors.textMuted} /></TouchableOpacity> : null}
    </View>
  );
}
