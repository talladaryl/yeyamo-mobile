import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api/client';
import type { SpringPage } from '@/services/api/contracts';

export type InteractionTarget = 'POST' | 'PLACE' | 'EVENT' | 'ACTIVITY' | 'EXPERIENCE' | 'ARTWORK' | 'CULTURE_CONTENT' | 'ARTISAN';
export type ExplorerFeedbackTarget = 'POST' | 'PLACE' | 'EVENT' | 'ACTIVITY' | 'EXPERIENCE' | 'CULTURE_CONTENT';
export type ExplorerFavoriteTarget = ExplorerFeedbackTarget;
export type FeedbackType = 'INTERESTED' | 'NOT_INTERESTED';
export type InteractionType = 'FAVORITE' | 'LIKE' | 'COMMENT' | 'FOLLOW';

export interface GenericInteraction {
  id: string;
  targetType: InteractionTarget;
  targetId: string;
  userId: string;
  interactionType: InteractionType;
  body: string | null;
  status: 'ACTIVE' | 'REMOVED' | 'PENDING_MODERATION';
  createdAt: string;
  updatedAt: string;
}

export const genericInteractionsApi = {
  feedback: (targetType: ExplorerFeedbackTarget, targetId: string, feedbackType: FeedbackType) =>
    apiPut<GenericInteraction>('/interactions/feedback', { targetType, targetId, feedbackType }),
  removeFeedback: (targetType: ExplorerFeedbackTarget, targetId: string) =>
    apiDelete<void>('/interactions/feedback', { params: { targetType, targetId } }),
  favorite: (targetType: ExplorerFavoriteTarget, targetId: string) =>
    apiPut<GenericInteraction>(`/interactions/favorites/${targetType}/${encodeURIComponent(targetId)}`),
  removeFavorite: (targetType: ExplorerFavoriteTarget, targetId: string) =>
    apiDelete<void>(`/interactions/favorites/${targetType}/${encodeURIComponent(targetId)}`),
  favorites: (page = 0, size = 20) =>
    apiGet<SpringPage<GenericInteraction>>('/interactions/favorites', { params: { page, size } }),
  status: (target: InteractionTarget, targetId: string, type: InteractionType) =>
    apiGet<GenericInteraction | null>(`/interactions/${target}/${encodeURIComponent(targetId)}/${type}/status`),
  toggle: (target: InteractionTarget, targetId: string, type: InteractionType, active: boolean) =>
    active
      ? apiDelete<void>(`/interactions/${target}/${encodeURIComponent(targetId)}/${type}`)
      : apiPost<GenericInteraction>(`/interactions/${target}/${encodeURIComponent(targetId)}/${type}`),
  comments: (target: InteractionTarget, targetId: string) =>
    apiGet<GenericInteraction[]>(`/interactions/${target}/${encodeURIComponent(targetId)}/comments`),
  comment: (target: InteractionTarget, targetId: string, body: string) =>
    apiPost<GenericInteraction>(`/interactions/${target}/${encodeURIComponent(targetId)}/COMMENT`, { body }),
  mine: (target: InteractionTarget, type: InteractionType, limit = 50) =>
    apiGet<GenericInteraction[]>(`/interactions/${target}/${type}/me`, { params: { limit } }),
};
