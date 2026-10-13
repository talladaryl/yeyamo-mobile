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
export type ReviewEligibilityReason = 'ELIGIBLE' | 'EVENT_NOT_COMPLETED' | 'REGISTRATION_NOT_CONFIRMED' | 'BOOKING_NOT_ELIGIBLE' | 'CHECKIN_REQUIRED' | 'VERIFICATION_NOT_SUPPORTED' | 'TARGET_NOT_FOUND';
export interface ReviewEligibility {
  eligible: boolean;
  reasonCode: ReviewEligibilityReason;
  targetType: ReviewTargetType;
  targetId: string;
}

export const reviewsApi = {
  list: (targetType: ReviewTargetType, targetId: string, page = 0) =>
    apiGet<ReviewPage>(`/reviews/${targetType}/${targetId}?page=${page}&size=20&sort=createdAt,desc`),
  aggregate: (targetType: ReviewTargetType, targetId: string) =>
    apiGet<ReviewAggregate>(`/reviews/${targetType}/${targetId}/aggregate`),
  eligibility: (targetType: ReviewTargetType, targetId: string) =>
    apiGet<ReviewEligibility>(`/reviews/eligibility?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`),
  create: (input: { targetType: ReviewTargetType; targetId: string; rating: number; comment?: string }) =>
    apiPost<VerifiedReview>('/reviews', input, { headers: { 'Idempotency-Key': createIdempotencyKey() } }),
  remove: (reviewId: string) => apiDelete<void>(`/reviews/${reviewId}`, { headers: { 'Idempotency-Key': createIdempotencyKey() } }),
  report: (reviewId: string) => apiPost<void>(`/reviews/${reviewId}/report`),
};

export function useReviewEligibility(targetType: ReviewTargetType, targetId: string, enabled = true) {
  return useQuery({
    queryKey: ['verified-review-eligibility', targetType, targetId],
    queryFn: () => reviewsApi.eligibility(targetType, targetId),
    enabled: enabled && Boolean(targetId),
    staleTime: 30_000,
  });
}

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
