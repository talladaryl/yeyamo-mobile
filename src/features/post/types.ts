import type { EntityId } from '@/types/api.types';

export type PostType = 'video' | 'image' | 'carousel' | 'story';

export interface CreatePostPayload {
  type: PostType;
  caption?: string;
  place_id?: EntityId;
  media_ids: EntityId[];
}

export interface UploadedMedia {
  id: EntityId;
  url: string;
  type: 'image' | 'video';
}
