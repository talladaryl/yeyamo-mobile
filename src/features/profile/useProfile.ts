// Hooks personnalisés pour le profil utilisateur
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toSpringPage } from '@/services/api/contracts';
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
  return useInfiniteQuery({
    queryKey: ['reservations', isDemo ? 'demo' : 'backend'],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      isDemo
        ? Promise.resolve(toSpringPage(MOCK_USER_RESERVATIONS, Number(pageParam), 20))
        : profileApi.getUserReservations(Number(pageParam), 20),
    getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.number + 1,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCancelUserReservation() {
  const queryClient = useQueryClient();
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useMutation({
    mutationFn: ({ id, reason, idempotencyKey }: { id: string; reason: string; idempotencyKey: string }) => {
      if (isDemo) return Promise.reject(new Error('L’annulation de réservation n’est pas disponible en mode démo.'));
      return profileApi.cancelUserReservation(id, reason, idempotencyKey);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reservations', 'backend'] }),
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
