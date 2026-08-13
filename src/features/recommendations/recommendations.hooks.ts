import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { recommendationsApi } from './recommendations.api';
import type { RecommendationRequest } from './recommendations.types';

export function useRecommendations(request: RecommendationRequest = {}) {
  const backendSession = useAuthStore((state) => state.sessionMode === 'backend');
  return useQuery({
    queryKey: ['recommendations', backendSession ? 'backend' : 'local', request],
    enabled: backendSession,
    queryFn: () => recommendationsApi.list(request),
    staleTime: 60_000,
  });
}
