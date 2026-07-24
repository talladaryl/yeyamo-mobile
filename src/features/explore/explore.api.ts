import { apiGet } from '@/services/api/client';
import type { Category, Region, TrendingPlace } from './types';

interface BackendRegion {
  id: number;
  name: string;
  slug: string;
  code: string;
  description: string | null;
  coverImage: string | null;
}

interface BackendCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  children: BackendCategory[];
}

interface DiscoveryDocument {
  sourceId: string;
  title: string;
  categoryCode: string | null;
  regionCode: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

function mapCategory(item: BackendCategory): Category {
  return {
    id: item.slug || String(item.id),
    label: item.name,
    icon: item.icon || 'location',
    iconLibrary: 'ionicons',
  };
}

export const exploreApi = {
  getRegions: async (): Promise<Region[]> =>
    (await apiGet<BackendRegion[]>('/regions')).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? '',
      places_count: 0,
      events_count: 0,
      experiences_count: 0,
      cover_image_url: item.coverImage ?? '',
      coordinates: { latitude: 0, longitude: 0 },
    })),

  getCategories: async (): Promise<Category[]> => {
    const items = await apiGet<BackendCategory[]>('/categories');
    return items.flatMap((item) => [mapCategory(item), ...item.children.map(mapCategory)]);
  },

  getTrending: async (): Promise<TrendingPlace[]> =>
    (await apiGet<DiscoveryDocument[]>('/discovery/trending?type=PLACE&limit=20')).map(
      (item) => ({
        id: item.sourceId,
        name: item.title,
        city: item.city ?? '',
        region_id: item.regionCode ?? '',
        rating: 0,
        reviews_count: 0,
        distance_km: 0,
        image_url: '',
        category: item.categoryCode ?? 'place',
      }),
    ),
};
