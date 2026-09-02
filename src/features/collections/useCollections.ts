// Hooks personnalisés pour les collections
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { collectionsApi } from './collections.api';
import { MOCK_COLLECTIONS, MOCK_COLLECTION_SUMMARIES } from './mockData';
import type { CreateCollectionInput, UpdateCollectionInput, AddToCollectionInput } from './types';
import type { EntityId } from '@/types/api.types';

/**
 * Hook pour récupérer toutes les collections de l'utilisateur
 */
export function useUserCollections() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['collections', isDemo ? 'demo' : 'backend', 'user'],
    queryFn: () =>
      isDemo ? Promise.resolve(MOCK_COLLECTIONS) : collectionsApi.getUserCollections(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: isDemo ? MOCK_COLLECTIONS : undefined,
  });
}

/**
 * Hook pour récupérer les collections publiques
 */
export function usePublicCollections() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['collections', isDemo ? 'demo' : 'backend', 'public'],
    queryFn: () =>
      isDemo ? Promise.resolve([]) : collectionsApi.getPublicCollections(),
    staleTime: 1000 * 60 * 5,
    placeholderData: [],
  });
}

/**
 * Hook pour récupérer une collection spécifique
 */
export function useCollection(id: EntityId) {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['collections', isDemo ? 'demo' : 'backend', id],
    queryFn: () =>
      isDemo
        ? Promise.resolve(MOCK_COLLECTIONS.find((c) => String(c.id) === String(id)) ?? MOCK_COLLECTIONS[0])
        : collectionsApi.getCollection(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    placeholderData: isDemo ? MOCK_COLLECTIONS.find((c) => String(c.id) === String(id)) : undefined,
  });
}

/**
 * Hook pour récupérer les résumés de collections
 */
export function useCollectionSummaries() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['collections', isDemo ? 'demo' : 'backend', 'summaries'],
    queryFn: () =>
      isDemo
        ? Promise.resolve(MOCK_COLLECTION_SUMMARIES)
        : collectionsApi.getCollectionSummaries(),
    staleTime: 1000 * 60 * 5,
    placeholderData: isDemo ? MOCK_COLLECTION_SUMMARIES : undefined,
  });
}

/**
 * Hook pour créer une collection
 */
export function useCreateCollection() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  return useMutation({
    mutationFn: (input: CreateCollectionInput) =>
      isDemo
        ? Promise.resolve({
            ...MOCK_COLLECTIONS[0],
            ...input,
            id: Date.now(),
            places: [],
            places_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        : collectionsApi.createCollection(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

/**
 * Hook pour mettre à jour une collection
 */
export function useUpdateCollection() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  return useMutation({
    mutationFn: ({ id, input }: { id: EntityId; input: UpdateCollectionInput }) =>
      isDemo
        ? Promise.resolve({
            ...(MOCK_COLLECTIONS.find((c) => String(c.id) === String(id)) ?? MOCK_COLLECTIONS[0]),
            ...input,
            updated_at: new Date().toISOString(),
          })
        : collectionsApi.updateCollection(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collections', id] });
    },
  });
}

/**
 * Hook pour supprimer une collection
 */
export function useDeleteCollection() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  return useMutation({
    mutationFn: (id: EntityId) =>
      isDemo ? Promise.resolve() : collectionsApi.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

/**
 * Hook pour ajouter un lieu à une collection
 */
export function useAddPlaceToCollection() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  return useMutation({
    mutationFn: (input: AddToCollectionInput) =>
      isDemo ? Promise.resolve() : collectionsApi.addPlaceToCollection(input),
    onSuccess: (_, { collection_id }) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collections', collection_id] });
    },
  });
}

/**
 * Hook pour retirer un lieu d'une collection
 */
export function useRemovePlaceFromCollection() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  return useMutation({
    mutationFn: ({ collectionId, placeId }: { collectionId: EntityId; placeId: EntityId }) =>
      isDemo
        ? Promise.resolve()
        : collectionsApi.removePlaceFromCollection(collectionId, placeId),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collections', collectionId] });
    },
  });
}

export function useUpdatePlaceInCollection() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);

  return useMutation({
    mutationFn: ({
      collectionId,
      placeId,
      isPriority,
      note,
    }: {
      collectionId: EntityId;
      placeId: EntityId;
      isPriority: boolean;
      note?: string;
    }) =>
      isDemo
        ? Promise.resolve()
        : collectionsApi.updatePlaceInCollection(collectionId, placeId, {
            is_priority: isPriority,
            note,
          }),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collections', collectionId] });
    },
  });
}
