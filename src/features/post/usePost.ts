import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { MOCK_FEED_POSTS } from '@/features/mock/mockData';
import { feedApi } from '../feed/feed.api';
import { postApi } from './post.api';
import type { CreatePostPayload } from './types';
import { FEED_QUERY_KEY } from '../feed/useFeed';
import type { EntityId } from '@/types/api.types';
import { traceProfileRuntime } from '@/features/social/social.runtime-trace';

export function usePostDetail(postId: EntityId) {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const viewerId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ['post', isDemo ? 'demo' : 'backend', String(viewerId ?? 'anonymous'), postId],
    queryFn: () =>
      isDemo
        ? Promise.resolve({
            data: MOCK_FEED_POSTS.find((post) => String(post.id) === String(postId)) ?? MOCK_FEED_POSTS[0],
          })
        : feedApi.getPost(postId),
    select: (res) => res.data,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: (payload: CreatePostPayload) =>
      isDemo
        ? Promise.resolve({ data: { id: Date.now() } })
        : postApi.createPost(payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['profile', 'backend'] });
      traceProfileRuntime('PROFILE_CACHE_INVALIDATED', { flow: 'post', postId: String(result.data.id), resource: 'posts-and-stats' });
    },
  });
}

export function useUploadMedia() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: (formData: FormData) =>
      isDemo
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
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: (postId: EntityId) =>
      isDemo ? Promise.resolve() : postApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}
