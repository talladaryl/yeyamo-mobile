import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedApi } from '../feed/feed.api';
import { postApi } from './post.api';
import { FEED_QUERY_KEY } from '../feed/useFeed';

export function usePostDetail(postId: number) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => feedApi.getPost(postId),
    select: (res) => res.data,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export function useUploadMedia() {
  return useMutation({
    mutationFn: (formData: FormData) => postApi.uploadMedia(formData),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => postApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}
