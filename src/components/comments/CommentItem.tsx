import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '@/components/ui/Avatar';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Icon } from '@/components/ui/Icon';
import { timeAgo, formatCount } from '@/utils/format';
import type { Comment } from '@/features/comments/types';

type CommentItemProps = {
  comment: Comment;
  onReply?: () => void;
  onLike?: () => void;
  onShowReplies?: () => void;
};

export function CommentItem({ comment, onReply, onLike, onShowReplies }: CommentItemProps) {
  return (
    <View className="flex-row gap-3 px-4 py-3">
      <Avatar
        uri={comment.user.avatar_url}
        displayName={comment.user.display_name}
        size={36}
      />

      <View className="flex-1">
        <View className="flex-row items-center gap-1 mb-1">
          <Text className="text-[#18181B] dark:text-white font-semibold text-sm">
            {comment.user.username}
          </Text>
          {comment.user.is_verified && <VerifiedBadge size={14} />}
        </View>

        <Text className="text-[#18181B] dark:text-white text-sm leading-5 mb-2">
          {comment.content}
        </Text>

        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={onReply} activeOpacity={0.7}>
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-medium">Répondre</Text>
          </TouchableOpacity>

          <Text className="text-[#52525B] text-xs">{timeAgo(comment.created_at)}</Text>

          {comment.likes_count > 0 && (
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs">
              {formatCount(comment.likes_count)} j'aime
            </Text>
          )}

          {comment.replies_count > 0 && (
            <TouchableOpacity onPress={onShowReplies} activeOpacity={0.7}>
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-medium">
                — Afficher {comment.replies_count} réponse{comment.replies_count > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity onPress={onLike} activeOpacity={0.7} className="pt-1">
        <Icon
          library="ionicons"
          name={comment.is_liked ? 'heart' : 'heart-outline'}
          size={20}
          color={comment.is_liked ? '#EF4444' : '#A1A1AA'}
        />
      </TouchableOpacity>
    </View>
  );
}
