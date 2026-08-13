import type { EntityId } from '@/types/api.types';

/**
 * The mobile app receives resource references from several services (saves,
 * notifications, campaigns). Keep their routing in one allow-listed place so
 * an unknown payload can never generate an arbitrary in-app route.
 */
export type ResourceType =
  | 'post'
  | 'place'
  | 'event'
  | 'experience'
  | 'story'
  | 'profile'
  | 'collection'
  | 'culture'
  | 'challenge'
  | 'artwork'
  | 'artisan'
  | 'order'
  | 'reservation';

export type ResourceRouteInput = {
  type?: string | null;
  id?: EntityId | null;
  metadata?: Record<string, unknown> | null;
};

export type ResourceRouteResolution =
  | { href: string; type: ResourceType }
  | { href: null; type: null; reason: 'missing-reference' | 'unsupported-type' | 'missing-profile-username' };

const aliases: Record<string, ResourceType> = {
  post: 'post',
  place: 'place',
  event: 'event',
  experience: 'experience',
  story: 'story',
  profile: 'profile',
  collection: 'collection',
  culture: 'culture',
  culture_content: 'culture',
  challenge: 'challenge',
  culture_challenge: 'challenge',
  artwork: 'artwork',
  artisan: 'artisan',
  order: 'order',
  artwork_order: 'order',
  reservation: 'reservation',
  booking: 'reservation',
};

function normalizeType(value?: string | null): ResourceType | null {
  if (!value) return null;
  return aliases[value.trim().toLowerCase()] ?? null;
}

function profileUsername(metadata?: Record<string, unknown> | null): string | null {
  const username = metadata?.username ?? metadata?.handle;
  return typeof username === 'string' && username.trim() ? username.trim() : null;
}

export function resolveResourceRoute({ type, id, metadata }: ResourceRouteInput): ResourceRouteResolution {
  const normalizedType = normalizeType(type);
  if (!normalizedType || id === null || id === undefined || String(id).trim() === '') {
    return { href: null, type: null, reason: !normalizedType ? 'unsupported-type' : 'missing-reference' };
  }

  if (normalizedType === 'profile') {
    const username = profileUsername(metadata);
    return username
      ? { href: `/(profile)/${encodeURIComponent(username)}`, type: normalizedType }
      : { href: null, type: null, reason: 'missing-profile-username' };
  }

  const encodedId = encodeURIComponent(String(id));
  const routes: Record<Exclude<ResourceType, 'profile'>, string> = {
    post: `/(post)/${encodedId}`,
    place: `/(places)/${encodedId}`,
    event: `/(events)/${encodedId}`,
    experience: `/(experiences)/${encodedId}`,
    story: `/(story)/${encodedId}`,
    collection: `/(collections)/${encodedId}`,
    culture: `/(explore)/culture/${encodedId}`,
    challenge: `/(explore)/challenges/${encodedId}`,
    artwork: `/(explore)/artworks/${encodedId}`,
    artisan: `/(explore)/artisans/${encodedId}`,
    order: `/(profile)/artwork-orders/${encodedId}`,
    // No booking detail route exists yet. The real, backed list remains the
    // safe fallback instead of routing to a fabricated detail screen.
    reservation: '/(profile)/reservations',
  };

  return { href: routes[normalizedType], type: normalizedType };
}
