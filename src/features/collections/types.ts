// Types pour le système de collections
import type { Place } from '@/features/explore/types';

export interface Collection {
  id: number;
  name: string;
  description?: string;
  cover_image_url?: string;
  places: CollectionPlace[];
  places_count: number;
  visibility: 'private' | 'friends' | 'public';
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionPlace extends Place {
  added_at: string;
  is_priority?: boolean; // Flag rouge
  note?: string;
}

export interface CollectionSummary {
  id: number;
  name: string;
  cover_image_url?: string;
  places_count: number;
  visibility: 'private' | 'friends' | 'public';
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  cover_image_url?: string;
  visibility: 'private' | 'friends' | 'public';
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  cover_image_url?: string;
  visibility?: 'private' | 'friends' | 'public';
}

export interface AddToCollectionInput {
  collection_id: number;
  place_id: number;
  is_priority?: boolean;
  note?: string;
}

export type CollectionTab = 'saved' | 'public';

export const VISIBILITY_OPTIONS = [
  {
    value: 'private' as const,
    label: 'Privée',
    description: 'Seulement vous',
    icon: 'lock-closed',
  },
  {
    value: 'friends' as const,
    label: 'Amis',
    description: 'Visible pour vos amis',
    icon: 'people',
  },
  {
    value: 'public' as const,
    label: 'Publique',
    description: 'Visible pour tous les utilisateurs',
    icon: 'earth',
  },
] as const;
