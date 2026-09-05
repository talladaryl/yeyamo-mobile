import { apiDelete, apiGet, apiPost } from '@/services/api/client';

export type InteractionTarget = 'PLACE' | 'EVENT' | 'EXPERIENCE' | 'ARTWORK' | 'CULTURE_CONTENT' | 'ARTISAN';
export type InteractionType = 'FAVORITE' | 'LIKE' | 'COMMENT';

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
};
