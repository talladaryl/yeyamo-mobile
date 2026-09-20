import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/auth.store';
import { establishments } from '@/features/partner-dashboard/mockData';
import { placesApi, type PartnerPlaceReference } from '@/features/places/places.api';

export function useMyPartnerPlaces() {
  const sessionMode = useAuthStore((state) => state.sessionMode);
  const isDemo = sessionMode?.startsWith('demo-') ?? false;

  return useQuery({
    queryKey: ['partner', isDemo ? 'demo' : 'backend', 'places', 'me'],
    enabled: isDemo || sessionMode === 'backend',
    queryFn: () => isDemo
      ? Promise.resolve(establishments.map<PartnerPlaceReference>((place) => ({
          id: place.id,
          name: place.name,
          status: 'PUBLISHED',
        })))
      : placesApi.myPlaces().then((page) => page.content),
  });
}
