import { useQuery } from '@tanstack/react-query';
import { placesApi } from './places.api';

export function usePlaceCategories() {
  return useQuery({ queryKey: ['place-references', 'categories'], queryFn: placesApi.categories, staleTime: 5 * 60 * 1000 });
}

export function usePlaceRegions() {
  return useQuery({ queryKey: ['place-references', 'regions'], queryFn: placesApi.regions, staleTime: 5 * 60 * 1000 });
}

export function usePlaceCities(regionId?: number) {
  return useQuery({ queryKey: ['place-references', 'cities', regionId], queryFn: () => placesApi.cities(regionId!), enabled: Number.isInteger(regionId), staleTime: 5 * 60 * 1000 });
}
