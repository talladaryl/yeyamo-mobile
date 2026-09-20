import { apiGet } from '@/services/api/client';
import { normalizeDiscoveryId } from '@/features/discovery/discovery.navigation';
import { type Category, type Region, type TrendingPlace } from './types';

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
interface DiscoveryPage { items: DiscoveryDocument[]; page: number; size: number; hasNext: boolean; }

function mapCategory(item: BackendCategory): Category {
  return {
    id: item.slug || String(item.id),
    label: item.name,
    icon: item.icon || 'location',
    iconLibrary: 'ionicons',
  };
}

function mergeCategories(remote: Category[]): Category[] {
  // In a real session, only categories returned by the backend are displayed.
  // Editorial/demo definitions stay in the explicit demo data path.
  return remote;
}

export const exploreApi = {
  getRegions: async (): Promise<Region[]> =>
    (await apiGet<BackendRegion[]>('/regions')).map((item) => ({
      id: item.id,
      code: item.code,
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
    return mergeCategories(items.flatMap((item) => [mapCategory(item), ...item.children.map(mapCategory)]));
  },

  getTrending: async (regionCode?: string): Promise<TrendingPlace[]> =>
    (await apiGet<DiscoveryPage>('/discovery/trending', { params: { type: 'PLACE', size: 20, ...(regionCode ? { regionCode } : {}) } })).items.map(
      (item) => ({
        id: normalizeDiscoveryId(item.sourceId),
        name: item.title,
        city: item.city ?? '',
        region_id: item.regionCode ?? '',
        category: item.categoryCode ?? '',
      }),
    ),
};
