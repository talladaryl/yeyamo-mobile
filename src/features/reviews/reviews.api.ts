import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost } from '@/services/api/client';
import { createIdempotencyKey } from '@/services/api/contracts';

export type ReviewTargetType = 'PLACE' | 'EXPERIENCE' | 'ARTISAN' | 'EVENT';

export interface VerifiedReview {
  id: string;
  userId: string;
  placeId: string;
  targetType: ReviewTargetType;
  evidenceReference: string;
  rating: number;
  comment: string | null;
  status: 'ACTIVE' | 'HIDDEN' | 'REPORTED' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAggregate { count: number; averageRating: number | null; }
interface ReviewPage { content: VerifiedReview[]; totalPages: number; totalElements: number; }

export const reviewsApi = {
  list: (targetType: ReviewTargetType, targetId: string, page = 0) =>
    apiGet<ReviewPage>(`/reviews/${targetType}/${targetId}?page=${page}&size=20&sort=createdAt,desc`),
  aggregate: (targetType: ReviewTargetType, targetId: string) =>
    apiGet<ReviewAggregate>(`/reviews/${targetType}/${targetId}/aggregate`),
  create: (input: { targetType: ReviewTargetType; targetId: string; rating: number; comment?: string }) =>
    apiPost<VerifiedReview>('/reviews', input, { headers: { 'Idempotency-Key': createIdempotencyKey() } }),
  remove: (reviewId: string) => apiDelete<void>(`/reviews/${reviewId}`, { headers: { 'Idempotency-Key': createIdempotencyKey() } }),
  report: (reviewId: string) => apiPost<void>(`/reviews/${reviewId}/report`),
};

export function usePublicReviews(targetType: ReviewTargetType, targetId: string | undefined) {
  const enabled = Boolean(targetId);
  const reviews = useQuery({ queryKey: ['verified-reviews', targetType, targetId], queryFn: () => reviewsApi.list(targetType, targetId!), enabled });
  const aggregate = useQuery({ queryKey: ['verified-review-aggregate', targetType, targetId], queryFn: () => reviewsApi.aggregate(targetType, targetId!), enabled });
  return { reviews, aggregate };
}

export function useCreateVerifiedReview() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: (_, input) => {
      void client.invalidateQueries({ queryKey: ['verified-reviews', input.targetType, input.targetId] });
      void client.invalidateQueries({ queryKey: ['verified-review-aggregate', input.targetType, input.targetId] });
      void client.invalidateQueries({ queryKey: ['profile', 'backend', 'reviews'] });
    },
  });
}
