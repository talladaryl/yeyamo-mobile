import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ENV from '@/config/env';
import { MOCK_FEED_POSTS } from '@/features/mock/mockData';
import { feedApi } from '../feed/feed.api';
import { postApi } from './post.api';
import type { CreatePostPayload } from './types';
import { FEED_QUERY_KEY } from '../feed/useFeed';

export function usePostDetail(postId: number) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () =>
      ENV.USE_MOCKS
        ? Promise.resolve({
            data: MOCK_FEED_POSTS.find((post) => post.id === postId) ?? MOCK_FEED_POSTS[0],
          })
        : feedApi.getPost(postId),
    select: (res) => res.data,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) =>
      ENV.USE_MOCKS
        ? Promise.resolve({ data: { id: Date.now() } })
        : postApi.createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export function useUploadMedia() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      ENV.USE_MOCKS
        ? Promise.resolve({
            data: {
              id: Date.now(),
              url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080',
              type: 'image' as const,
            },
          })
        : postApi.uploadMedia(formData),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) =>
      ENV.USE_MOCKS ? Promise.resolve() : postApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}
