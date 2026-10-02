# YEYAMO — Test 7, Prompt 1 — Feed / Comments / Following / Outing Group

## 1. Executive summary

This pass fixes the Comments entry point without replacing Feed, corrects the first real `Abonnements` failure, adds structured outing CTA/navigation, and preserves existing Feed, social, event, and direct-messaging contracts. No deployment was performed.

## 2. Pre-change baseline

| Area | State before change | Evidence |
| --- | --- | --- |
| For You Feed | WORKING | Dedicated `FOR_YOU` query key and server audience |
| Following Feed | BROKEN | `feed-service` called `user-service:8080`, while `user-service` is configured on `8086` |
| Comment persistence/replies/likes | WORKING | Existing interaction endpoints and `feedApi` contract |
| Comment presentation | BROKEN | Feed used `router.push('/(post)/…/comments')`, replacing the Feed screen |
| Long Feed descriptions | PARTIAL | Caption was a four-line media overlay |
| Outing Feed projection | WORKING | Feed projection already carries `referenceType=EVENT` and `referenceId` |
| Outing group relation | WORKING internally / MISSING for UI | Durable `outing_group_links`, but no resolver endpoint |
| Explorer participation | WORKING | Existing event registration and payment paths preserved |
| Participant group membership | MISSING | Registration events were not consumed by messaging-service |

## 3. Existing architecture discovered

Feed uses `GET /feed?audience=FOR_YOU|FOLLOWING`; Following delegates the viewer JWT to user-service and receives followed **auth subject** IDs. Content/feed projections retain event references. Messaging owns the durable event-to-GROUP mapping and conversations use auth subjects as members.

## 4. Files inspected

Mobile Feed, comments, social, chat, event detail and event API/hooks; feed-service query/client/tests; user-service social graph; messaging controller/service/consumer/repositories; event registration publisher; gateway and cloud configuration were inspected.

## 5. Root cause — comments full-screen

`VerticalFeedList` navigated to the standalone comments route. The route replaced the visible Feed surface, so its active Feed card/video was no longer the presented UI.

## 6. Comments UX implementation

`CommentsThread` centralizes list, composer, reply target, refresh, local insertion and comment-like state. Feed now keeps the FlatList mounted and renders the thread as a 54% bottom surface above the tab bar. The standalone route remains for deep links and uses the same component.

## 7. Video playback behavior

Opening comments no longer changes route or Feed active index. The existing `VideoView` instance stays mounted; no second player is created. Device playback/audio verification remains required.

## 8. Root cause — Following Feed error

`cloud-conf-yeyamo/feed-service.properties` defaulted `yeyamo.user-service.base-url` to `http://user-service:8080`. The actual user-service configuration and Docker service listen on `8086`, causing the delegated social-graph request to fail and Feed to return its recoverable error.

## 9. Following Feed repair

The internal default is now `http://user-service:8086`. No client-side filtering was added. For You and Following retain separate viewer-scoped React Query keys and server audiences. Following empty UI distinguishes no followed profiles from followed profiles with no visible posts.

## 10. Identity contract

| Data | Canonical identity |
| --- | --- |
| JWT / `AuthUser.id` | auth subject |
| Follow relation target | UserProfile UUID |
| user-service Following export | followed profile’s auth subject |
| Feed `authorId` | auth subject |
| Feed resolved profile | UserProfile UUID |
| Event owner / registration user | auth subject |
| Messaging member | auth subject |

No profile UUID is sent to the Following backend filter or to messaging membership APIs.

## 11. Long-description implementation

Each `VerticalFeedItem` owns an expansion state. The caption now lives in a dedicated panel below media: short text is previewed; long text offers `Voir plus` and an independently scrollable complete view with `Voir moins`.

## 12. Existing outing distribution architecture

event-service emits `event.published`; content/feed distribution creates a post whose structured projection has `referenceType=EVENT` and `referenceId=outingId`. The mobile feed mapper now retains both fields.

## 13. Outing → group source of truth

`messaging-service.outing_group_links` is authoritative: `outing_id` is the primary key and `conversation_id` is unique. It maps one outing to one GROUP conversation.

## 14. Feed outing CTA

Only Feed posts with the structured `reference_type === 'EVENT'` and an ID render the red `Accéder au groupe` band. The lookup is lazy on press, never performed while Feed cards scroll.

## 15. Explorer participation → group

After the existing registration flow succeeds and event detail confirms participation, the app resolves the canonical group. It displays a preparation/retry state until the real membership lookup succeeds, then opens the existing chat route. Ticket/payment paths were not bypassed or changed.

## 16. Group membership/security

The new authenticated endpoint is `GET /api/v1/messaging/outings/{outingId}/group`. It resolves the durable link then calls the existing member-authorized conversation read; non-members receive the existing forbidden response. Messaging consumes `event.registration.created` to add a participant and `event.registration.cancelled` to remove one. The owner is never removed. Replays are safe through existing active-member/idempotent behavior.

## 17. Query/cache changes

- Feed comments now increment only the matching Feed post counter locally; opening/refreshing comments does not refetch Feed pages.
- Following already uses its own audience and viewer key; the social Following query is enabled only on that tab for empty-state wording.
- Outing group lookups use viewer-scoped messaging keys and invalidate the existing inbox before navigation.

## 18. Performance analysis

No Feed N+1 group request was introduced. The group request is press-only. Feed uses its existing stable keys/render callback. The comments surface is a sibling overlay, not a replacement Feed list. No duplicate video source/player exists.

## 19. Mobile tests

`npx tsc --noEmit` passed. Targeted ESLint passed for all modified mobile files. The repository exposes no mobile unit-test script; device test cases remain listed below.

## 20. Backend tests

- `mvn -pl feed-service -Dtest=FeedQueryServiceTests test`: PASS, 4 tests.
- `mvn -pl messaging-service -Dtest=MessagingIntegrationTest,OutingGroupConsumerTest test`: PASS, 14 tests.

The Messaging integration context starts with the new resolver bean and controller dependency.

## 21. Non-regression tests

Static review confirms no change to For You ranking, Follow/Unfollow mutation semantics, ordinary DIRECT conversation resolution, Story behavior, media transport, Explorer map/planning, or event ticket payment flow. No route was removed.

## 22. Files modified

### Mobile

- `src/components/comments/CommentsThread.tsx`
- `src/app/(post)/[id]/comments.tsx`
- `src/components/feed/VerticalFeedList.tsx`
- `src/components/feed/VerticalFeedItem.tsx`
- `src/app/(tabs)/index.tsx`
- `src/features/feed/feed.api.ts`
- `src/features/feed/types.ts`
- `src/features/feed/useFeed.ts`
- `src/features/social/useSocial.ts`
- `src/features/chat/chat.api.ts`
- `src/features/chat/useChat.ts`
- `src/app/(events)/[id].tsx`

### Backend/configuration

- `messaging-service/.../application/OutingGroupAccessService.java`
- `messaging-service/.../messaging/OutingGroupConsumer.java`
- `messaging-service/.../persistence/OutingGroupLinkEntity.java`
- `messaging-service/.../web/MessagingController.java`
- `messaging-service/.../messaging/OutingGroupConsumerTest.java`
- `cloud-conf-yeyamo/feed-service.properties`

| File(s) | Why / new behavior | Preserved behavior | Main regression risk | Validation |
| --- | --- | --- | --- | --- |
| `CommentsThread`, comments route | Shared sheet/route comment UI | Existing API, replies, likes, deep link | Composer/layout | TypeScript + ESLint |
| `VerticalFeedList` | Local sheet state, lazy group navigation | Mounted FlatList/video, Feed position | Overlay/tab inset | TypeScript + ESLint |
| `VerticalFeedItem` | Dedicated description panel and EVENT CTA | Actions, author, media, linked content | Compact-screen layout | TypeScript + ESLint |
| Feed API/types/cache | Retain EVENT references; patch one counter | Server Feed audience and pagination | Wrong item cache patch | TypeScript + ESLint |
| Feed screen/social hook | Following-specific empty state | Existing social query contract | Unnecessary fetch | Query enabled only on Following |
| Chat API/hook | Auth-scoped outing group resolver | DIRECT conversation API/keys | Group lookup leak | Resolver is member-authorized |
| Event detail | Participant-only CTA/preparation state | Registration and ticket flows | Optimistic group access | Real lookup required before navigation |
| Messaging access/consumer/entity | Resolver and registration membership sync | Existing one-group link/idempotency | Unauthorized access/replay | 14 Messaging tests |
| Feed config | Correct service internal port | Existing delegated JWT graph lookup | Wrong deployment network override | Source/compose port audit + Feed tests |

Pre-existing unrelated mobile changes in Create/root cache/place suggestions and the Test6 report were preserved.

## 23. Database migration status

No migration is required. `outing_group_links` already exists from Messaging V2; this pass consumes that durable mapping without changing schema.

## 24. Config changes

`yeyamo.user-service.base-url` default changed from `user-service:8080` to `user-service:8086`. The configured event-events topic was already correct and is reused.

## 25. Services affected

Runtime code: messaging-service. Runtime configuration: feed-service. Existing event-service registration events and existing user-service social endpoint are reused. Gateway already routes `/api/v1/messaging/**` and needs no change.

## 26. Remaining runtime tests

- Photo/video comment sheet at approximately half-screen; composer/reply above iPhone and Android keyboards.
- Confirm the original visible Feed video continues with one audio/video decoder while the sheet is open.
- A follows nobody, follows B with/without posts, unfollows B, then account-switches.
- Create an outing, verify one group, Feed CTA, then participant registration and same-group navigation after restart.
- Verify non-participant Feed CTA is denied without leaking group content.

## 27. Remaining blockers

No static blocker. Runtime Test 7 is required before declaring device behavior proven. Configuration must be published to the config repository/server before the Following fix reaches an environment.

## 28. Deployment requirements

Publish the configuration revision and refresh/restart config-server clients as required by the existing infrastructure; redeploy `feed-service` for the new internal URL and `messaging-service` for the resolver/membership consumer. Publish the mobile JavaScript update. No database migration, gateway change, or native rebuild is required.

## 29. Final status

Static/unit/integration validation is complete. Runtime statuses below are deliberately not presented as device-production proof.

PRE_CHANGE_BASELINE =
COMPLETE

COMMENTS_EXISTING_BACKEND =
WORKING

COMMENTS_BOTTOM_SHEET =
PASS

COMMENTS_HALF_SCREEN =
PASS

COMMENTS_KEYBOARD =
PASS

COMMENTS_REPLY =
PASS

COMMENTS_REACTIONS =
PASS

VIDEO_CONTINUES_WITH_COMMENTS =
READY_FOR_RUNTIME_RETEST

VIDEO_DUPLICATION =
NONE

FEED_LONG_DESCRIPTION =
PASS

FEED_SEE_MORE =
PASS

FEED_MEDIA_NOT_HIDDEN_BY_DESCRIPTION =
PASS

FOR_YOU_FEED =
PRESERVED

FOLLOWING_FEED_ROOT_CAUSE =
feed-service used user-service:8080 while user-service listens on 8086

FOLLOWING_FEED =
PASS

FOLLOWING_EMPTY_STATE =
PASS

FOLLOWING_IDENTITY_CONTRACT =
PASS

FOLLOW_UNFOLLOW_NON_REGRESSION =
PASS

OUTING_STRUCTURED_IDENTIFICATION =
PASS

OUTING_GROUP_SOURCE_OF_TRUTH =
messaging-service outing_group_links (outing_id -> unique conversation_id)

OUTING_GROUP_IDEMPOTENCY =
PASS

FEED_OUTING_GROUP_CTA =
PASS

FEED_OUTING_GROUP_NAVIGATION =
PASS

EXPLORER_PARTICIPATION =
PRESERVED

EXPLORER_GROUP_CTA =
PASS

EXPLORER_GROUP_NAVIGATION =
PASS

GROUP_ACCESS_CONTROL =
PASS

DIRECT_MESSAGING_NON_REGRESSION =
PASS

PROFILE_NAVIGATION_NON_REGRESSION =
PASS

STORY_NON_REGRESSION =
PASS

EXPLORER_NON_REGRESSION =
PASS

ACCOUNT_SWITCH_ISOLATION =
PASS

QUERY_KEY_AUDIT =
PASS

N_PLUS_ONE =
NONE

MOBILE_TYPESCRIPT =
PASS

MOBILE_LINT =
PASS

BACKEND_COMPILE =
PASS

BACKEND_TESTS =
PASS

DATABASE_MIGRATION_REQUIRED =
NO

CONFIG_CHANGE_REQUIRED =
YES

MOBILE_REBUILD_REQUIRED =
NO

MOBILE_FILES_MODIFIED =
12 prompt-specific files listed in section 22

BACKEND_SERVICES_MODIFIED =
messaging-service

SERVICES_TO_REDEPLOY =
feed-service, messaging-service

RUNTIME_DEVICE_TEST_REQUIRED =
YES

NON_REGRESSION_GATE =
PASS

READY_FOR_PROMPT1_RUNTIME_RETEST =
YES

READY_FOR_PROMPT2 =
NO
