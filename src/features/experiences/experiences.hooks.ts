import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { experiencesApi } from './experiences.api';

export function useCatalogExperience(id?: string) {
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  return useQuery({
    queryKey: ['catalog-experience', isDemo ? 'demo' : 'backend', id ?? ''],
    enabled: Boolean(id) && !isDemo,
    queryFn: () => experiencesApi.detail(id!),
  });
}
