import type { EntityId, UserSummary, MediaAttachment } from '@/types/api.types';

export interface FeedPost {
  id: EntityId;
  type: 'video' | 'image' | 'carousel';
  caption: string | null;
  media: MediaAttachment[];
  author: UserSummary;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_saved: boolean;
  place_tag: { id: EntityId; name: string; location?: string; region_id?: number } | null;
  comments?: PostComment[];
  linked_content?: { type: 'proverb' | 'recipe' | 'artwork' | 'artist' | 'language' | 'culture'; id: string; label: string };
  created_at: string;
}

export type OrganicFeedItem = FeedPost & { item_kind?: 'organic' };

export interface SponsoredFeedItem {
  item_kind: 'sponsored';
  id: string;
  delivery_id: string;
  campaign_id: string;
  sponsor: UserSummary;
  media: MediaAttachment[];
  caption: string | null;
  cta: { label: string };
  promoted_entity: { type: 'place' | 'event' | 'post' | 'partner'; id: EntityId };
  impression_tracking_token: string;
  click_tracking_token: string;
}

export type FeedItem = OrganicFeedItem | SponsoredFeedItem;

export function isSponsoredFeedItem(item: FeedItem): item is SponsoredFeedItem {
  return item.item_kind === 'sponsored';
}

export interface PostComment {
  id: string;
  author: UserSummary;
  text: string;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
}
