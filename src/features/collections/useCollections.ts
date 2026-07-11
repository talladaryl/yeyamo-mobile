// Hooks personnalisés pour les collections
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ENV from '@/config/env';
import { collectionsApi } from './collections.api';
import { MOCK_COLLECTIONS, MOCK_COLLECTION_SUMMARIES } from './mockData';
import type { CreateCollectionInput, UpdateCollectionInput, AddToCollectionInput } from './types';

/**
 * Hook pour récupérer toutes les collections de l'utilisateur
 */
export function useUserCollections() {
  return useQuery({
    queryKey: ['collections', 'user'],
    queryFn: () =>
      ENV.USE_MOCKS ? Promise.resolve(MOCK_COLLECTIONS) : collectionsApi.getUserCollections(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: MOCK_COLLECTIONS,
  });
}

/**
 * Hook pour récupérer les collections publiques
 */
export function usePublicCollections() {
  return useQuery({
    queryKey: ['collections', 'public'],
    queryFn: () =>
      ENV.USE_MOCKS ? Promise.resolve([]) : collectionsApi.getPublicCollections(),
    staleTime: 1000 * 60 * 5,
    placeholderData: [],
  });
}

/**
 * Hook pour récupérer une collection spécifique
 */
export function useCollection(id: number) {
  return useQuery({
    queryKey: ['collections', id],
    queryFn: () =>
      ENV.USE_MOCKS
        ? Promise.resolve(MOCK_COLLECTIONS.find((c) => c.id === id) ?? MOCK_COLLECTIONS[0])
        : collectionsApi.getCollection(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    placeholderData: MOCK_COLLECTIONS.find((c) => c.id === id),
  });
}

/**
 * Hook pour récupérer les résumés de collections
 */
export function useCollectionSummaries() {
  return useQuery({
    queryKey: ['collections', 'summaries'],
    queryFn: () =>
      ENV.USE_MOCKS
        ? Promise.resolve(MOCK_COLLECTION_SUMMARIES)
        : collectionsApi.getCollectionSummaries(),
    staleTime: 1000 * 60 * 5,
    placeholderData: MOCK_COLLECTION_SUMMARIES,
  });
}

/**
 * Hook pour créer une collection
 */
export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCollectionInput) =>
      ENV.USE_MOCKS
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

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateCollectionInput }) =>
      ENV.USE_MOCKS
        ? Promise.resolve({
            ...(MOCK_COLLECTIONS.find((c) => c.id === id) ?? MOCK_COLLECTIONS[0]),
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

  return useMutation({
    mutationFn: (id: number) =>
      ENV.USE_MOCKS ? Promise.resolve() : collectionsApi.deleteCollection(id),
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

  return useMutation({
    mutationFn: (input: AddToCollectionInput) =>
      ENV.USE_MOCKS ? Promise.resolve() : collectionsApi.addPlaceToCollection(input),
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

  return useMutation({
    mutationFn: ({ collectionId, placeId }: { collectionId: number; placeId: number }) =>
      ENV.USE_MOCKS
        ? Promise.resolve()
        : collectionsApi.removePlaceFromCollection(collectionId, placeId),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['collections', collectionId] });
    },
  });
}
