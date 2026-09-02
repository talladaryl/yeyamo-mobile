// Types pour le système de collections
import type { Place } from '@/features/explore/types';
import type { EntityId } from '@/types/api.types';

export interface Collection {
  id: EntityId;
  name: string;
  description?: string;
  cover_image_url?: string;
  places: CollectionPlace[];
  places_count: number;
  visibility: 'private' | 'public';
  owner_id: EntityId;
  created_at: string;
  updated_at: string;
}

export interface CollectionPlace extends Place {
  added_at: string;
  is_priority?: boolean; // Flag rouge
  note?: string;
}

export interface CollectionSummary {
  id: EntityId;
  name: string;
  cover_image_url?: string;
  places_count: number;
  visibility: 'private' | 'public';
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  cover_image_url?: string;
  visibility: 'private' | 'public';
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  cover_image_url?: string;
  visibility?: 'private' | 'public';
}

export interface AddToCollectionInput {
  collection_id: EntityId;
  place_id: EntityId;
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
    value: 'public' as const,
    label: 'Publique',
    description: 'Visible pour tous les utilisateurs',
    icon: 'earth',
  },
] as const;
