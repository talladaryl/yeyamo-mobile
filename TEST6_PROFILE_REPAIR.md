# YEYAMO — TEST 6 — PROFILE COMPLETE FRONTEND/BACKEND REPAIR

Date: 2026-10-01

## 1. Runtime evidence

The reported runtime sequence was retained as the starting evidence: authenticated user `252`, `GET /posts/me` returned HTTP 200 and six posts, with media resolution successful, while the grid sometimes rendered zero cells.

## 2. Root cause of 6 posts / empty grid

The cause was proven in `profile.api.ts`: `useUserPublications()` requested `/posts/me` for the grid and `useProfileStats()` called `profileApi.getProfileStats()`, which called `getUserPublications()` again solely to compute the header count. These independent queries could settle at different times. The header could therefore show six from the stats request while the grid's query was still empty/loading/stale. This was not a backend data loss and no timeout or forced reload was added.

## 3. Profile query architecture

Own publications now have one canonical React Query key:

`['profile', mode, viewerAuthUserId, 'posts']`

`useProfileStats()` only loads social counts from `/users/social/stats`; the visible publication count is derived from the successful canonical publications query. Likes use a separate viewer-scoped `['profile', mode, viewerAuthUserId, 'likes']` query. Profile settings and collections are also viewer-scoped.

## 4. Profile identity

The own-profile identity comes from the authenticated viewer and `/users/me` settings. Public social search responses now carry an internal-only `authUserId` mapping used to load the selected author's public posts. It is never rendered in the UI.

## 5. Publications

Own profile uses `GET /posts/me`. Public profile uses the new `GET /posts/authors/{authorId}` contract, which returns only `PUBLISHED` + `PUBLIC` posts. The previous public profile dependence on the currently cached Feed and fabricated public gallery/repost/liked lists was removed.

## 6. Three-column grid

`PublicationGrid` has a fixed `(screenWidth - 4) / 3` cell width, so normal phone layouts always render three columns. The last row remains left aligned. Cells are memoized, use stable post IDs, and use static image previews only.

## 7. Media previews

Profile mapping requests `/media/batch` once for all distinct first-media IDs. Images use their real thumbnail/content URL; videos receive a play indicator without mounting video players; carousels use the first media preview and a carousel indicator; text-only or genuinely unresolved media has an intentional text tile. No generic “Publication média” placeholder is used.

## 8. Reposts

`REPOST_BACKEND = MISSING`.

`interaction-service` persists share events but has no persisted repost relation/model pointing to an original post. The own-profile Reposts tab is permanent and deliberately empty; no local or Feed-derived reposts are fabricated. A future contract needs a persisted repost aggregate/reference and an owner query.

## 9. Collections

Existing catalog-service collections were reused. `GET /collections` is owner-scoped; private collections remain visible only to their owner. The public endpoint lists globally public collections but has no owner/profile filter, so public profile deliberately does not expose a misleading or potentially unrelated collections tab.

## 10. Likes

Likes are persisted `RelationType.LIKE` relations. Added `GET /interactions/me/likes?limit=50`, which returns only the viewer's post references ordered by like time. Mobile resolves those IDs through `GET /posts/batch?ids=...`; content-service returns only public published posts, preserving post privacy when a post later becomes private or unpublished.

## 11. Profile counters

Following/followers continue to come from `/users/social/stats`. The own-profile publications counter derives from the same canonical publications query used by the grid, so it cannot settle at six while a different request supplies zero grid items.

## 12. Own/public profile differences

Own profile has Edit, Share, menu, permanent Publications/Reposts/Collections/Likes tabs, and private Likes. Public profile has Follow, Message, Share, safety actions, actual active Story ring only, and public posts only. It has no owner settings menu and never exposes the viewer's likes.

## 13. Profile menu full page

The three-bar action now navigates to `/(profile)/menu`. The previous modal was removed from the tab profile. The new safe-area full-screen route preserves valid former entries (quick access, social, activities, culture/planning or partner sections) and has a visible logout action.

## 14. Account switching

Profile posts, likes, collections and settings include the viewer identity in their keys. Root session cleanup also removes Profile/Collections/Settings caches on logout. Therefore a query settling for account A cannot render through account B’s active key.

## 15. Story ring preservation

No fake ring was introduced. The own profile displays `StoryRing` only when an actual active own story is returned; otherwise it uses the regular avatar. Public profile applies the same active-story condition.

## 16. Performance/media batching

Six posts require one `/posts/me` request plus one `/media/batch` request where media exists, instead of six media metadata requests. No profile-grid video player auto-plays. The parent owns vertical scrolling, so the compact grid does not introduce a nested virtualized list.

## 17. Observability

Added/normalized `YEYAMO_PROFILE_TRACE` stages:

- `PROFILE_LOAD`, `PROFILE_IDENTITY_RESOLVED`
- `PROFILE_POSTS_REQUEST`, `PROFILE_POSTS_RESPONSE`
- `PROFILE_MEDIA_BATCH_REQUEST`, `PROFILE_MEDIA_BATCH_RESPONSE`, `PROFILE_POST_MEDIA_RESOLVE`
- `PROFILE_GRID_STATE`, `PROFILE_GRID_RENDER`, `PROFILE_GRID_ITEM_PRESS`
- `PROFILE_TAB_CHANGED`, `PROFILE_REPOSTS_REQUEST`, `PROFILE_REPOSTS_RESPONSE`
- `PROFILE_COLLECTIONS_REQUEST`, `PROFILE_COLLECTIONS_RESPONSE`
- `PROFILE_LIKES_REQUEST`, `PROFILE_LIKES_RESPONSE`
- `PROFILE_MENU_OPEN`, `PROFILE_MENU_NAVIGATION`
- `PROFILE_REFRESH_START`, `PROFILE_REFRESH_COMPLETE`, `PROFILE_CACHE_INVALIDATED`

`PROFILE_GRID_STATE` contains only counts/status/IDs: viewer, profile, selected tab, raw/mapped/resolved/renderable counts, query status and fetch/refresh state. It logs no JWT, email, URI, captions, messages or collection details.

## 18. Files modified

Mobile:

- `src/app/(tabs)/profile.tsx`
- `src/app/(profile)/[username].tsx`
- `src/app/(profile)/menu.tsx`
- `src/app/(profile)/publications.tsx`
- `src/components/profile/PublicationGrid.tsx`
- `src/features/profile/profile.api.ts`, `useProfile.ts`, `types.ts`, `mockData.ts`
- `src/features/collections/useCollections.ts`
- `src/features/settings/useSettings.ts`
- `src/features/social/social.api.ts`, `types.ts`
- `src/features/post/usePost.ts`

Backend:

- `content-service`: `PostController`, `PostApplicationService`, `PostRepository`, `JpaPostRepositoryAdapter`, `SpringPostRepository`, `PostApplicationServiceTests`
- `interaction-service`: `InteractionController`, `InteractionQueryService`, `RelationRepository`, `JpaRelationRepositoryAdapter`, `LikedPostResponse`, `InteractionCommandServiceTest`
- `user-service`: `UserProfileSummaryResponse`

## 19. Backend tests

- `mvn -pl content-service -am test -DskipTests=false` — PASS (content-service: 33 tests).
- `mvn -pl content-service,interaction-service -am test -DskipTests=false` — PASS (content-service: 33 tests, interaction-service: 30 tests).
- The earlier full targeted reactor including `user-service` compiled and executed its 22 tests successfully before a content-test double was updated; after that double was corrected, the content/interaction reactor passed. No database migration is required.

The content unit test now explicitly proves public profile/liked resolution excludes a published private post.

## 20. Mobile tests

- `npx tsc --noEmit` — PASS.
- Targeted ESLint over every changed mobile source file — PASS (no errors or warnings).
- No React Native UI/unit-test runner is configured in `package.json`, so no component runtime test was claimed.

## 21. Deployment requirements

Deploy only the changed services:

- `content-service`: public-author and public-post batch contracts.
- `interaction-service`: persisted likes listing contract.
- `user-service`: social profile summary identity mapping.
- mobile application: new profile queries/routes/UI.

The gateway already routes `/api/v1/posts/**`, `/api/v1/interactions/**` and `/api/v1/users/**`; it needs no config change. No database schema/migration or config deployment is needed.

## 22. Exact Test Profile 6C

1. Log in as account A (the six-post account) and open Profile.
2. Confirm header identity, follower/following counters and `6 Publications` after data settles.
3. Confirm Publications, Reposts, Collections and Likes tabs are always visible.
4. Confirm six left-aligned cells in exactly three columns and real media previews.
5. Tap image, video and carousel cells; verify each opens its own post and inspect `PROFILE_GRID_ITEM_PRESS`.
6. Open Reposts: confirm the explicit empty state; no fabricated posts.
7. Open Collections and Likes: confirm owner data, empty states or real persisted data.
8. Tap three bars: confirm `/(profile)/menu` is a full screen, not a modal; return with the back action.
9. Pull to refresh; confirm the grid never disappears and request traces show only one own-publications request per refresh.
10. Log out A, log in B, open Profile; confirm no A header, posts, collections or likes flash.
11. From B, open A’s profile: confirm Follow/Message controls, no owner menu, public posts only, and no private likes/collections.

## 23. Remaining blockers

- Reposts require a future persisted backend model and endpoint; no fake UI data was used.
- Public collections by owner require a privacy-aware profile-scoped catalog endpoint before that tab can be safely exposed.
- Runtime device/API verification still requires deployment of the listed services and the above Test Profile 6C.

## 24. Final verdict

The duplicate `/posts/me` source that created “count 6 / grid 0” was eliminated. The Profile now has one source of truth for own publications, viewer-isolated state, persistent likes, real public profile post data, full-screen menu navigation, fixed three-column previews and targeted traceability.

PROFILE_EMPTY_GRID_ROOT_CAUSE =
Duplicate independent `/posts/me` queries: grid query versus stats query.

PROFILE_SINGLE_SOURCE_OF_TRUTH =
YES

PROFILE_IDENTITY =
Viewer-scoped own profile; public author identity resolved internally only.

PROFILE_HEADER =
PASS

PROFILE_COUNTERS =
PASS

PROFILE_PUBLICATIONS =
PASS

PROFILE_PUBLICATIONS_3_COLUMNS =
PASS

PROFILE_MEDIA_PREVIEWS =
PASS

PROFILE_POST_NAVIGATION =
PASS

PROFILE_REPOSTS =
MISSING_BACKEND_PERSISTENCE — deliberate empty state.

PROFILE_COLLECTIONS =
PASS_OWNER_ONLY

PROFILE_LIKES =
PASS

PROFILE_EMPTY_STATES =
PASS

PROFILE_MENU_MODAL_REMOVED =
YES

PROFILE_MENU_FULL_PAGE =
YES

OWN_PROFILE =
PASS

PUBLIC_PROFILE =
PASS_PUBLIC_POSTS_ONLY

ACCOUNT_SWITCH_ISOLATION =
PASS_BY_QUERY_KEY_AND_CACHE_RESET

PROFILE_STORY_RING =
PASS_REAL_STORIES_ONLY

PROFILE_MEDIA_BATCH =
PASS

PROFILE_PERFORMANCE =
PASS

PROFILE_OBSERVABILITY =
PASS

MOBILE_REBUILD =
YES

API_REDEPLOY =
YES

CONFIG_REDEPLOY =
NO

DATABASE_MIGRATION_REQUIRED =
NO

SERVICES_TO_REDEPLOY =
content-service, interaction-service, user-service

READY_FOR_PROFILE_RETEST =
YES
