// Hooks personnalisés pour le profil utilisateur
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { profileApi } from './profile.api';
import { MOCK_USER_PUBLICATIONS, MOCK_USER_FAVORITES, MOCK_USER_EVENTS, MOCK_USER_RESERVATIONS, MOCK_USER_REVIEWS } from './mockData';

/**
 * Hook pour récupérer les publications de l'utilisateur
 */
export function useUserPublications() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['profile', isDemo ? 'demo' : 'backend', 'publications'],
    queryFn: () =>
      isDemo ? Promise.resolve(MOCK_USER_PUBLICATIONS) : profileApi.getUserPublications(),
    staleTime: 1000 * 60 * 5,
    placeholderData: isDemo ? MOCK_USER_PUBLICATIONS : undefined,
  });
}

/**
 * Hook pour récupérer les lieux favoris de l'utilisateur
 */
export function useUserFavorites() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['profile', isDemo ? 'demo' : 'backend', 'favorites'],
    queryFn: () =>
      isDemo ? Promise.resolve(MOCK_USER_FAVORITES) : profileApi.getUserFavorites(),
    staleTime: 1000 * 60 * 5,
    placeholderData: isDemo ? MOCK_USER_FAVORITES : undefined,
  });
}

/**
 * Hook pour récupérer les événements de l'utilisateur
 */
export function useUserEvents() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['profile', isDemo ? 'demo' : 'backend', 'events'],
    queryFn: () =>
      isDemo ? Promise.resolve(MOCK_USER_EVENTS) : profileApi.getUserEvents(),
    staleTime: 1000 * 60 * 5,
    placeholderData: isDemo ? MOCK_USER_EVENTS : undefined,
  });
}

/**
 * Hook pour récupérer les réservations de l'utilisateur
 */
export function useUserReservations() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['profile', isDemo ? 'demo' : 'backend', 'reservations'],
    queryFn: () =>
      isDemo ? Promise.resolve(MOCK_USER_RESERVATIONS) : profileApi.getUserReservations(),
    staleTime: 1000 * 60 * 5,
    placeholderData: isDemo ? MOCK_USER_RESERVATIONS : undefined,
  });
}

/**
 * Hook pour récupérer les avis de l'utilisateur
 */
export function useUserReviews() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['profile', isDemo ? 'demo' : 'backend', 'reviews'],
    queryFn: () =>
      isDemo ? Promise.resolve(MOCK_USER_REVIEWS) : profileApi.getUserReviews(),
    staleTime: 1000 * 60 * 5,
    placeholderData: isDemo ? MOCK_USER_REVIEWS : undefined,
  });
}

/**
 * Hook pour récupérer les statistiques du profil
 */
export function useProfileStats() {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['profile', isDemo ? 'demo' : 'backend', 'stats'],
    queryFn: () =>
      isDemo
        ? Promise.resolve({
            publications_count: 128,
            followers_count: 2300,
            following_count: 340,
          })
        : profileApi.getProfileStats(),
    staleTime: 1000 * 60 * 2,
    placeholderData: isDemo ? {
      publications_count: 128,
      followers_count: 2300,
      following_count: 340,
    } : undefined,
  });
}
