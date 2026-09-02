import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { categories, regions, trendingPlaces } from './mockData';
import { exploreApi } from './explore.api';

function useDemoMode() {
  return useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
}

export function useRegions() {
  const isDemo = useDemoMode();
  return useQuery({
    queryKey: ['explore', isDemo ? 'demo' : 'backend', 'regions'],
    queryFn: () => isDemo ? Promise.resolve(regions) : exploreApi.getRegions(),
    placeholderData: isDemo ? regions : undefined,
  });
}

export function useCategories() {
  const isDemo = useDemoMode();
  return useQuery({
    queryKey: ['explore', isDemo ? 'demo' : 'backend', 'categories'],
    queryFn: () => isDemo ? Promise.resolve(categories) : exploreApi.getCategories(),
    placeholderData: isDemo ? categories : undefined,
  });
}

export function useTrendingPlaces() {
  const isDemo = useDemoMode();
  return useQuery({
    queryKey: ['explore', isDemo ? 'demo' : 'backend', 'trending'],
    queryFn: () => isDemo ? Promise.resolve(trendingPlaces) : exploreApi.getTrending(),
    placeholderData: isDemo ? trendingPlaces : undefined,
  });
}
