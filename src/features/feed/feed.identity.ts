import type { EntityId } from '@/types/api.types';

export type ViewerSocialIdentity = {
  authUserId: string | null;
  profileId: EntityId | null;
};

export type FeedAuthorNavigation = {
  isOwnPost: boolean;
  destination: 'OWN_PROFILE_TAB' | 'PUBLIC_PROFILE' | 'UNRESOLVED_AUTHOR';
  profileId: EntityId | null;
};

/**
 * Auth subjects and social profile UUIDs belong to separate namespaces. This
 * is the only Feed helper allowed to decide author ownership/navigation.
 */
export function resolveFeedAuthorNavigation(
  viewer: ViewerSocialIdentity,
  author: { authUserId?: string | null; profileId?: EntityId | null },
): FeedAuthorNavigation {
  const sameAuthSubject = Boolean(viewer.authUserId && author.authUserId
    && String(viewer.authUserId) === String(author.authUserId));
  const sameProfile = Boolean(viewer.profileId && author.profileId
    && String(viewer.profileId) === String(author.profileId));
  const isOwnPost = sameAuthSubject || sameProfile;
  if (isOwnPost) return { isOwnPost, destination: 'OWN_PROFILE_TAB', profileId: author.profileId ?? viewer.profileId };
  if (author.profileId) return { isOwnPost: false, destination: 'PUBLIC_PROFILE', profileId: author.profileId };
  return { isOwnPost: false, destination: 'UNRESOLVED_AUTHOR', profileId: null };
}
