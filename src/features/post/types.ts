export type PostType = 'video' | 'image' | 'carousel' | 'story';

export interface CreatePostPayload {
  type: PostType;
  caption?: string;
  place_id?: number;
  media_ids: number[];
}

export interface UploadedMedia {
  id: number;
  url: string;
  type: 'image' | 'video';
}
