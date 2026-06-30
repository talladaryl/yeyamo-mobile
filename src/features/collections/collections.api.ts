// API endpoints pour les collections
import { apiClient } from '@/services/api/client';
import type {
  Collection,
  CollectionSummary,
  CreateCollectionInput,
  UpdateCollectionInput,
  AddToCollectionInput,
} from './types';

export const collectionsApi = {
  /**
   * Récupère toutes les collections de l'utilisateur
   */
  getUserCollections: async (): Promise<Collection[]> => {
    const response = await apiClient.get<{ data: Collection[] }>('/collections');
    return response.data.data;
  },

  /**
   * Récupère les collections publiques
   */
  getPublicCollections: async (): Promise<Collection[]> => {
    const response = await apiClient.get<{ data: Collection[] }>('/collections/public');
    return response.data.data;
  },

  /**
   * Récupère les détails d'une collection
   */
  getCollection: async (id: number): Promise<Collection> => {
    const response = await apiClient.get<{ data: Collection }>(`/collections/${id}`);
    return response.data.data;
  },

  /**
   * Crée une nouvelle collection
   */
  createCollection: async (input: CreateCollectionInput): Promise<Collection> => {
    const response = await apiClient.post<{ data: Collection }>('/collections', input);
    return response.data.data;
  },

  /**
   * Met à jour une collection
   */
  updateCollection: async (id: number, input: UpdateCollectionInput): Promise<Collection> => {
    const response = await apiClient.put<{ data: Collection }>(`/collections/${id}`, input);
    return response.data.data;
  },

  /**
   * Supprime une collection
   */
  deleteCollection: async (id: number): Promise<void> => {
    await apiClient.delete(`/collections/${id}`);
  },

  /**
   * Ajoute un lieu à une collection
   */
  addPlaceToCollection: async (input: AddToCollectionInput): Promise<void> => {
    await apiClient.post('/collections/places', input);
  },

  /**
   * Retire un lieu d'une collection
   */
  removePlaceFromCollection: async (collectionId: number, placeId: number): Promise<void> => {
    await apiClient.delete(`/collections/${collectionId}/places/${placeId}`);
  },

  /**
   * Récupère les résumés de collections (pour le sélecteur)
   */
  getCollectionSummaries: async (): Promise<CollectionSummary[]> => {
    const response = await apiClient.get<{ data: CollectionSummary[] }>('/collections/summaries');
    return response.data.data;
  },
};
