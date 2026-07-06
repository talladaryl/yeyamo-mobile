// Hooks personnalisés pour le profil utilisateur
import { useQuery } from '@tanstack/react-query';
import { profileApi } from './profile.api';
import { MOCK_USER_PUBLICATIONS, MOCK_USER_FAVORITES, MOCK_USER_EVENTS, MOCK_USER_RESERVATIONS, MOCK_USER_REVIEWS } from './mockData';

/**
 * Hook pour récupérer les publications de l'utilisateur
 */
export function useUserPublications() {
  return useQuery({
    queryKey: ['profile', 'publications'],
    queryFn: profileApi.getUserPublications,
    staleTime: 1000 * 60 * 5,
    placeholderData: MOCK_USER_PUBLICATIONS,
  });
}

/**
 * Hook pour récupérer les lieux favoris de l'utilisateur
 */
export function useUserFavorites() {
  return useQuery({
    queryKey: ['profile', 'favorites'],
    queryFn: profileApi.getUserFavorites,
    staleTime: 1000 * 60 * 5,
    placeholderData: MOCK_USER_FAVORITES,
  });
}

/**
 * Hook pour récupérer les événements de l'utilisateur
 */
export function useUserEvents() {
  return useQuery({
    queryKey: ['profile', 'events'],
    queryFn: profileApi.getUserEvents,
    staleTime: 1000 * 60 * 5,
    placeholderData: MOCK_USER_EVENTS,
  });
}

/**
 * Hook pour récupérer les réservations de l'utilisateur
 */
export function useUserReservations() {
  return useQuery({
    queryKey: ['profile', 'reservations'],
    queryFn: profileApi.getUserReservations,
    staleTime: 1000 * 60 * 5,
    placeholderData: MOCK_USER_RESERVATIONS,
  });
}

/**
 * Hook pour récupérer les avis de l'utilisateur
 */
export function useUserReviews() {
  return useQuery({
    queryKey: ['profile', 'reviews'],
    queryFn: profileApi.getUserReviews,
    staleTime: 1000 * 60 * 5,
    placeholderData: MOCK_USER_REVIEWS,
  });
}

/**
 * Hook pour récupérer les statistiques du profil
 */
export function useProfileStats() {
  return useQuery({
    queryKey: ['profile', 'stats'],
    queryFn: profileApi.getProfileStats,
    staleTime: 1000 * 60 * 2,
    placeholderData: {
      publications_count: 128,
      followers_count: 2300,
      following_count: 340,
    },
  });
}
