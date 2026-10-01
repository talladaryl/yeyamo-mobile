# YEYAMO — TEST 6 — Create / Story / Place / Outing repair

## 1. Test 6 evidence

The observed `POST /stories = 201` followed by a false UI failure was reproducible by code inspection: the create mutation updated a React Query cache entry containing `{ data: Story[] }` as though it were `Story[]`.

## 2. Story architecture

`story.tsx` uploads through the shared media FormData pipeline, then calls `POST /stories`. `StoryService` persists an active 24-hour `StoryEntity`; `GET /stories` returns active, non-deleted stories for the viewer and followed authors. The Messages tab consumes this canonical query through `MessageStories`.

## 3. Story 201-but-invisible root cause

The mobile `onSuccess` callback called `.some()` on the response envelope. That throws after the successful 201, rejects `mutateAsync`, skips the intended reconciliation and presents a publication error. The backend already included the viewer in the active-author query, so this was case **C: mobile mapper/cache failure**, not a follow-rule or expiry failure.

## 4. Story persistence

`StoryEntity` persists `id`, author, media, caption, creation/expiry timestamps, soft deletion, optional geography and reference. Creation has a 24-hour expiry and now supports an author-scoped `Idempotency-Key` record.

## 5. Story active query

Active means `expiresAt > now` and `deletedAt IS NULL`, ordered by creation descending. The viewer is always included, then followed authors. Expired/deleted rows are excluded.

## 6. Story creator visibility

`StoryServiceTest` verifies an empty follow list still queries with the viewer ID. The mobile cache now keeps a successful create visible immediately and background refresh cannot convert it into a failed publication.

## 7. Story duplicate-submit

Publish is disabled while media/story mutations are pending. A submission keeps one generated key through retry; changing/removing media starts a new key. `story_create_idempotency` prevents a second server row for that author/key without forbidding intentional reuse of a media item in another Story.

## 8. Story UI false-error

Successful persistence is updated in the correctly shaped cache first. Active-story invalidation/refetch is asynchronous reconciliation; its failure is traced but does not reject the confirmed create operation.

## 9. Story editor long-text repair

The caption remains limited to the API’s existing 500 characters. Its multiline input has a 96–148 px bounded height, internal scrolling, and a `n/500` helper, leaving the Publish control reachable.

## 10. iPhone Story UX

The editor keeps `KeyboardAvoidingView`, bottom Safe Area and an explicit keyboard-close control. No device-specific size was added. This is static validation only; it must be checked on a physical iPhone.

## 11. Media transport architecture

`toMediaFormData` is the single asset normalizer/builder. `uploadMediaFormData` is now the one canonical public upload transport used by publication, Story, place suggestion and outing cover flows. It never provides a multipart `Content-Type`; the React Native transport supplies its boundary.

## 12. PNG failure root cause

The historical PNG trace had `status=null`; that proves neither a backend validation error nor a request that reached the server. The late `application/x-www-form-urlencoded` value was from the error configuration and was not sufficient proof of on-wire conversion. The request interceptor explicitly preserves FormData and removes JSON content types. New trace fields distinguish timeout/transport error/status/MIME/size bucket. A physical PNG retry is still required to identify gateway/R2/network causes if it recurs.

## 13. JPEG behavior

JPEG remains native JPEG and had already succeeded with 201. No blanket re-compression was introduced.

## 14. HEIC behavior

HEIC/HEIF is converted locally with Expo Image Manipulator to a JPEG URI/metadata before FormData construction. PNG remains PNG. Native byte behavior still needs device retest.

## 15. Shared uploader

Truthful flow labels are now `story`, `place_suggestion`, `outing` or the caller’s actual flow; the previous wrapper no longer labels every upload `post`.

## 16. Place Suggestion architecture

The four-step mobile form sends country/geographic IDs, coordinates and uploaded media IDs to `place-service`. The server validates country/location/media ownership, performs duplicate checks and persists a public contribution rather than a canonical Place.

## 17. Place reference data

No labels were converted into identifiers. The form retains Country service IDs, including the existing CM → Centre → Mfoundi → Yaoundé path.

## 18. Place duplicate detection

The server normalizes name/address and compares canonical places and pending suggestions within 100 m (certain) / 250 m (possible). A database natural key protects equivalent pending-create races. The UI preflight reports candidates and does not submit a certain duplicate.

## 19. Place media

Place media now uses the shared FormData uploader with `flow=place_suggestion`; it keeps successfully uploaded IDs across a retry of submission.

## 20. Place submission/moderation

Success explicitly says `PENDING` is awaiting moderation and is not a public Place. `PlaceSuggestionServiceTest` covers valid creation, duplicate handling and approval behavior.

## 21. Outing architecture

The public `POST /events` flow creates the Event, appends the established Event outbox records, and publishes `event.published`. Content service’s existing idempotent target table independently creates the Feed Post and canonical Story (reference type `EVENT`).

## 22. Outing creation

Public user outings are now persisted as `PUBLISHED`, instead of always `PENDING`. The separate admin creation flow was not changed. Each outing create can use `Idempotency-Key`, persisted in `event_create_idempotency`.

## 23. Automatic group

Messaging now consumes `event.published` and creates one owner-only GROUP conversation. `outing_group_links` is the durable `outingId ↔ conversationId` association. The owner is the initial member; participation/booking-driven membership is not invented because no existing participant-to-chat contract exists.

## 24. Feed distribution

Public outings force the established Feed distribution target and emit `event.published`. Content produces a real Post/reference, not a mobile-only Feed card, and records the resulting post ID in Event’s social distribution receipt flow.

## 25. Story distribution

The same event uses the canonical Story model with `referenceType=EVENT` and `referenceId=outingId`. A cover is needed for the Story target; an absent/ineligible cover is accurately recorded as `SKIPPED_NO_MEDIA` while the outing and Feed target remain valid.

## 26. Distribution idempotency

Existing `EventSocialDistributionEntity` is keyed by source event/outings and has terminal target states. The new `outing_group_links.outing_id` primary key prevents duplicate groups on Kafka replay. Tests cover replaying the group event.

## 27. Partial failure behavior

The outing is committed before downstream asynchronous targets. Feed, Story and group run independently/retry through their existing event paths; one target failure does not create another outing or claim that core creation failed. Event social status/reason records Feed/Story partial state. Group-consumer retries are Kafka-driven and observable; no distributed transaction was added.

## 28. Cache invalidation

Story success updates the scoped active-story cache, invalidates active Stories and is automatically visible to the Messaging Story component. Place invalidates only “my suggestions”. Outing uses server projections; it does not fabricate cache cards.

## 29. Observability

Added/normalized `STORY_EDITOR_OPEN`, submission/media/persistence/cache/UI traces; `YEYAMO_CREATE_TRACE` for Place/Outing; media MIME/type/size-bucket/error classification; and backend `OUTING_CREATED`, group, Feed and Story structured logs. No caption, URI, token or binary data is logged.

## 30. Files modified

Mobile: Story editor/hooks/API, shared Input, media runtime/API/utils/client, place review/API, outing review/API and `features/create/create.runtime-trace.ts`.

API: Content Story idempotency + migration V8; Event immediate-public/idempotency + migration V10; Messaging outing-group consumer/link + migration V2; Content outgoing distribution logs; `cloud-conf-yeyamo/messaging-service.properties` event topic.

## 31. Backend tests

- `content-service`: `StoryServiceTest,EventSocialDistributionTargetServiceTests` — 22 passing.
- `event-service`: `EventSocialDistributionTest,EventPublishedContractTest,ContentSocialDistributionResultConsumerTests` — 9 passing, then idempotency-focused rerun — 6 passing.
- `messaging-service`: `MessagingIntegrationTest` — 12 passing; `OutingGroupConsumerTest` — 1 passing.
- `place-service`: `PlaceSuggestionServiceTest` — 3 passing.

## 32. Mobile tests

`npx tsc --noEmit` passed. Targeted ESLint for all touched Create/Story/media/API files passed. Native iOS runtime was not run.

## 33. Deployment requirements

Apply Content V8, Event V10 and Messaging V2 migrations. Deploy content-service, event-service, messaging-service and the messaging config containing `EVENT_EVENTS_TOPIC`. Media service remains required for upload tests but has no migration here. Its configured multipart limit is 100 MB (101 MB request).

## 34. Exact Test Story 6E

Login A; open Story; type 10+ lines; verify bounded internal caption scroll and Publish above keyboard; publish camera JPEG once; check one Story ID, `GET /stories`, Messages strip, profile ring if available, then refresh/restart.

## 35. Exact Test Place 6F

Open Suggest Place; select CM/Centre/Mfoundi/Yaoundé; choose JPEG, PNG then real HEIC across attempts; submit once; confirm one pending suggestion and retry an identical candidate to see duplicate handling.

## 36. Exact Test Outing 6G

Create a public outing with cover/location/date/capacity; submit once; verify one Event ID, one `outing_group_links` row/conversation, Feed projection, canonical Story/reference and no duplicates after restart/Kafka retry.

## 37. Remaining blockers

There is no existing contract that automatically adds a booking participant to the outing chat; therefore only the creator is an initial group member. Physical iPhone PNG/HEIC and production Kafka/R2/gateway retests remain mandatory. The current event detail response does not yet expose the group ID for a direct “open outing chat” action.

## 38. Final verdict

The proven 201-but-false-error Story failure is repaired. API migrations and service/config deployment are required before end-to-end device retest.

STORY_201_INVISIBLE_ROOT_CAUSE = React Query cache envelope treated as Story[] in Story create onSuccess

STORY_WRITE = PASS
STORY_PERSISTENCE = PASS
STORY_ACTIVE_READ = PASS
STORY_CREATOR_VISIBILITY = PASS
STORY_UI = PASS
STORY_VIEWER = PASS
STORY_DUPLICATE_PROTECTION = PASS

STORY_LONG_TEXT_EDITOR = PASS
STORY_IPHONE_KEYBOARD = READY_FOR_DEVICE_RETEST

MEDIA_FORMDATA_TRANSPORT = PASS_STATIC
MEDIA_PNG = READY_FOR_DEVICE_RETEST
MEDIA_JPEG = PASS_CODE_PATH
MEDIA_HEIC = PASS_CODE_PATH
MEDIA_SHARED_PIPELINE = PASS

PLACE_REFERENCE_DATA = PASS
PLACE_DUPLICATE_DETECTION = PASS
PLACE_MEDIA = PASS_CODE_PATH
PLACE_SUBMISSION = PASS
PLACE_MODERATION_STATE = PASS

OUTING_CREATE = PASS
OUTING_IMMEDIATE_PUBLICATION = PASS
OUTING_GROUP = PASS
OUTING_GROUP_IDEMPOTENCY = PASS
OUTING_FEED_DISTRIBUTION = PASS
OUTING_STORY_DISTRIBUTION = PASS
OUTING_DISTRIBUTION_IDEMPOTENCY = PASS
OUTING_PARTIAL_FAILURE_RECOVERY = PASS

CREATE_DOUBLE_SUBMIT_PROTECTION = PASS
CREATE_ERROR_HANDLING = PASS
CREATE_CACHE_INVALIDATION = PASS

CREATE_OBSERVABILITY = PASS

MOBILE_REBUILD =
NO

API_REDEPLOY =
YES

CONFIG_REDEPLOY =
YES

DATABASE_MIGRATION_REQUIRED =
YES

SERVICES_TO_REDEPLOY =
content-service, event-service, messaging-service, config-service

READY_FOR_STORY_RETEST =
YES

READY_FOR_PLACE_RETEST =
YES

READY_FOR_OUTING_RETEST =
YES

READY_FOR_CREATE_RETEST =
YES
