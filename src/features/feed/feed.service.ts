import { feedApi } from './feed.api';
import type { EntityId } from '@/types/api.types';

export const feedService = {
  async toggleLike(postId: EntityId, isLiked: boolean): Promise<void> {
    if (isLiked) {
      await feedApi.unlikePost(postId);
    } else {
      await feedApi.likePost(postId);
    }
  },

  async toggleSave(postId: EntityId, isSaved: boolean): Promise<void> {
    if (isSaved) {
      await feedApi.unsavePost(postId);
    } else {
      await feedApi.savePost(postId);
    }
  },
};
