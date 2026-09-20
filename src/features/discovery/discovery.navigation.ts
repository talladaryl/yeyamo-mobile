import type { Href } from 'expo-router';
import type { DiscoveryItem, DiscoveryType } from './discovery.types';

/** Returns the target service identifier from a UUID or a prefixed Discovery source id. */
export function normalizeDiscoveryId(value: string): string {
  const normalized = value.trim();
  const parts = normalized.split(':').filter(Boolean);
  return parts.at(-1) ?? '';
}

/**
 * Maps only declared Discovery types to an existing mobile detail route.
 * A null result is intentional: callers must display a controlled unavailable state.
 */
export function discoveryHref(item: Pick<DiscoveryItem, 'sourceId' | 'type'>): Href | null {
  const id = normalizeDiscoveryId(item.sourceId);
  if (!id) return null;

  switch (item.type as DiscoveryType) {
    case 'PLACE': return `/(places)/${id}` as Href;
    case 'EVENT': return `/(events)/${id}` as Href;
    case 'ARTWORK': return `/(explore)/artworks/${id}` as Href;
    case 'ARTISAN': return `/(explore)/artisans/${id}` as Href;
    case 'CULTURE':
    case 'CONTENT':
    case 'TRADITION': return `/(explore)/culture/${id}` as Href;
    case 'LANGUAGE': return `/(explore)/languages/${id}` as Href;
    case 'EXPERIENCE': return `/(experiences)/${id}` as Href;
    case 'DESTINATION':
    default: return null;
  }
}
