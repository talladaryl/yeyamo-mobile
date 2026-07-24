import { apiClient } from '@/services/api/client';
import { fromSpringPage, type SpringPage } from '@/services/api/contracts';
import type { EntityId } from '@/types/api.types';
import type {
  AddToCollectionInput,
  Collection,
  CollectionPlace,
  CollectionSummary,
  CreateCollectionInput,
  UpdateCollectionInput,
} from './types';

interface BackendAsset {
  id: string;
  name: string;
  categoryCode: string | null;
  regionCode: string | null;
  city: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: string;
}

interface BackendCollectionItem {
  assetId: string;
  addedAt: string;
  isPriority: boolean;
  note: string | null;
}

interface BackendCollection {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  coverAssetId: string | null;
  createdAt: string;
  updatedAt: string;
  places: BackendAsset[] | null;
  items: BackendCollectionItem[] | null;
}

interface BackendCollectionSummary {
  id: string;
  title: string;
  coverAssetId: string | null;
  placeCount: number;
}

function mapPlace(asset: BackendAsset, item?: BackendCollectionItem): CollectionPlace {
  return {
    id: asset.id,
    name: asset.name,
    category: { id: asset.categoryCode ?? 'unknown', name: asset.categoryCode ?? 'Autre' },
    address: asset.address ?? '',
    city: asset.city ?? '',
    region: asset.regionCode ?? '',
    latitude: asset.latitude,
    longitude: asset.longitude,
    photos: [],
    cover_photo_url: '',
    rating: 0,
    reviews_count: 0,
    amenities: [],
    opening_hours: [],
    phone: null,
    website: null,
    is_verified: asset.status === 'PUBLISHED',
    created_at: asset.createdAt,
    added_at: item?.addedAt ?? asset.createdAt,
    is_priority: item?.isPriority ?? false,
    note: item?.note ?? undefined,
  };
}

function mapCollection(collection: BackendCollection): Collection {
  const items = collection.items ?? [];
  const places = (collection.places ?? []).map((asset) =>
    mapPlace(asset, items.find((item) => item.assetId === asset.id)),
  );
  return {
    id: collection.id,
    name: collection.title,
    description: collection.description ?? undefined,
    cover_image_url: undefined,
    places,
    places_count: items.length || places.length,
    visibility: collection.isPublic ? 'public' : 'private',
    owner_id: collection.userId,
    created_at: collection.createdAt,
    updated_at: collection.updatedAt,
  };
}

function toBackendInput(input: CreateCollectionInput | UpdateCollectionInput) {
  return {
    title: input.name,
    description: input.description ?? null,
    isPublic: input.visibility === 'public',
    coverAssetId: null,
  };
}

export const collectionsApi = {
  getUserCollections: async (): Promise<Collection[]> => {
    const { data } = await apiClient.get<SpringPage<BackendCollection>>('/collections');
    return fromSpringPage(data).data.map(mapCollection);
  },

  getPublicCollections: async (): Promise<Collection[]> => {
    const { data } = await apiClient.get<SpringPage<BackendCollection>>('/collections/public');
    return fromSpringPage(data).data.map(mapCollection);
  },

  getCollection: async (id: EntityId): Promise<Collection> => {
    const { data } = await apiClient.get<BackendCollection>(`/collections/${id}`);
    return mapCollection(data);
  },

  createCollection: async (input: CreateCollectionInput): Promise<Collection> => {
    const { data } = await apiClient.post<BackendCollection>(
      '/collections',
      toBackendInput(input),
    );
    return mapCollection(data);
  },

  updateCollection: async (
    id: EntityId,
    input: UpdateCollectionInput,
  ): Promise<Collection> => {
    const current = await collectionsApi.getCollection(id);
    const merged: CreateCollectionInput = {
      name: input.name ?? current.name,
      description: input.description ?? current.description,
      visibility: input.visibility ?? current.visibility,
    };
    const { data } = await apiClient.put<BackendCollection>(
      `/collections/${id}`,
      toBackendInput(merged),
    );
    return mapCollection(data);
  },

  deleteCollection: async (id: EntityId): Promise<void> => {
    await apiClient.delete(`/collections/${id}`);
  },

  addPlaceToCollection: async (input: AddToCollectionInput): Promise<void> => {
    await apiClient.post('/collections/places', {
      collectionId: input.collection_id,
      assetId: input.place_id,
      isPriority: input.is_priority,
      note: input.note,
    });
  },

  updatePlaceInCollection: async (
    collectionId: EntityId,
    assetId: EntityId,
    input: { is_priority?: boolean; note?: string },
  ): Promise<void> => {
    await apiClient.patch(`/collections/${collectionId}/places/${assetId}`, {
      isPriority: input.is_priority,
      note: input.note,
    });
  },

  removePlaceFromCollection: async (
    collectionId: EntityId,
    assetId: EntityId,
  ): Promise<void> => {
    await apiClient.delete(`/collections/${collectionId}/places/${assetId}`);
  },

  getCollectionSummaries: async (): Promise<CollectionSummary[]> => {
    const { data } = await apiClient.get<BackendCollectionSummary[]>('/collections/summaries');
    return data.map((summary) => ({
      id: summary.id,
      name: summary.title,
      cover_image_url: undefined,
      places_count: summary.placeCount,
      visibility: 'private',
    }));
  },
};
