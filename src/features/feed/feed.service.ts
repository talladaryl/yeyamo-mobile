import { feedApi } from './feed.api';

export const feedService = {
  async toggleLike(postId: number, isLiked: boolean): Promise<void> {
    if (isLiked) {
      await feedApi.unlikePost(postId);
    } else {
      await feedApi.likePost(postId);
    }
  },

  async toggleSave(postId: number, isSaved: boolean): Promise<void> {
    if (isSaved) {
      await feedApi.unsavePost(postId);
    } else {
      await feedApi.savePost(postId);
    }
  },
};
