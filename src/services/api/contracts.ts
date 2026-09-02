import ENV from '@/config/env';
import type { PaginatedResponse, UserSummary } from '@/types/api.types';

export type EntityId = string | number;

export interface SpringPage<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export function toPaginatedResponse<T>(
  items: T[],
  page = 0,
  size = Math.max(items.length, 1),
  hasNext = false,
  total = items.length,
): PaginatedResponse<T> {
  const lastPage = Math.max(page, Math.ceil(total / size) - 1);
  return {
    data: items,
    meta: {
      current_page: page,
      last_page: lastPage,
      per_page: size,
      total,
    },
    links: {
      first: page > 0 ? '0' : null,
      last: hasNext ? null : String(lastPage),
      prev: page > 0 ? String(page - 1) : null,
      next: hasNext ? String(page + 1) : null,
    },
  };
}

/** Builds a Spring Page envelope for explicitly selected demo sessions only. */
export function toSpringPage<T>(items: T[], page = 0, size = Math.max(items.length, 1)): SpringPage<T> {
  return {
    content: items,
    number: page,
    size,
    totalElements: items.length,
    totalPages: items.length === 0 ? 0 : Math.ceil(items.length / size),
    first: page === 0,
    last: true,
  };
}

export function fromSpringPage<T>(page: SpringPage<T>): PaginatedResponse<T> {
  return toPaginatedResponse(
    page.content,
    page.number,
    page.size,
    !page.last,
    page.totalElements,
  );
}

export function absoluteApiUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${ENV.API_BASE_URL.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function mediaContentUrl(mediaId: EntityId): string {
  return `${ENV.API_BASE_URL.replace(/\/$/, '')}/api/v1/media/${mediaId}/content`;
}

export function fallbackUser(id: EntityId, displayName?: string | null): UserSummary {
  const label = displayName?.trim() || `Utilisateur ${String(id).slice(0, 8)}`;
  return {
    id,
    username: label.toLowerCase().replace(/\s+/g, '_'),
    display_name: label,
    avatar_url: null,
    is_verified: false,
  };
}

export function createIdempotencyKey(): string {
  return `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
