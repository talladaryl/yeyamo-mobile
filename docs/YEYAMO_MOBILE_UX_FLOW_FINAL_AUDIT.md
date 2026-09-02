# YeYamo Mobile — final UI/UX and flow audit

Date: 12 August 2026  
Scope: the twelve requested improvements, existing Expo Router routes, React Query hooks, Zustand stores, API clients, DTOs, feature flags, and demo-only mocks.

## Audit rule applied

Every changed flow was traced from source UI → router payload → destination route → feature hook/API client → documented backend contract. Existing components were extended where possible; the only added shared elements are a feed-mode capsule, a resource-route resolver, and CTA suggestion logic because the prior logic was fragmented or absent. No sixth tab, invented API endpoint, mock fallback in backend mode, or replacement business module was introduced.

## Delivery matrix

| # | Feature | EXISTED_BEFORE / WHAT_WAS_WRONG | Files modified | API_USED | UX_IMPROVEMENTS | TEST_STATUS | REMAINING_BACKEND_DEPENDENCY |
|---:|---|---|---|---|---|---|---|
| 1 | Water UI | Theme and floating tab bar existed but used white/black dominant surfaces and lacked conceptual glass tokens. | `theme.ts`, `FloatingTabBar.tsx`, `Input.tsx`, `WATER_UI_REFACTOR.md` | None | Cold background, milk/cards, constrained glass, soft borders, dark blue-grey surfaces. | Typecheck passed; visual device check pending. | None. |
| 2 | Bottom nav / Feed mode | The tab bar overlapped the bottom metadata/action area; no feed context switch existed. | `(tabs)/_layout.tsx`, `VerticalFeedList.tsx`, `VerticalFeedItem.tsx`, `FeedModeSwitch.tsx`, `useFloatingNavigation.ts`, `(tabs)/index.tsx` | `GET /feed` | Safe-area compact bar; visible post text/actions; reduced-motion-aware capsule that fades on downward scroll. | Typecheck passed; device safe-area check pending. | **BLOCKED_BY_BACKEND** for subscriptions: see below. |
| 3 | Stories | Consumer and partner editors only logged to console; toolbar and viewer had inert actions. | `(create)/story.tsx`, `(partner)/story.tsx`, `(story)/[id].tsx`, `post.api.ts`, `usePost.ts` | Existing media upload, `POST /stories`, `GET /stories`, `POST /stories/{id}/view` | Real image upload then story creation; duration control; working remove/close; unsupported decorative actions removed. | Typecheck passed; authenticated upload needs device/backend test. | **BLOCKED_BY_BACKEND** for promo resource/CTA, overlays, replies, music, stickers, and analytics. |
| 4 | Comments | Feed route already used a transparent bottom sheet, but the post-detail comment icon was inert and comment controls advertised unsupported mutations. | `(post)/[id].tsx`, `(post)/[id]/comments.tsx`, `CommentInput.tsx`, `CommentItem.tsx` | `GET /interactions/posts/{id}/comments`, `POST /interactions/posts/{id}/comments` | 55/88% sheet retained, virtual list, sticky avatar input, keyboard-safe input, unsupported reply/like icons removed. The underlying feed player stays mounted behind the transparent modal. | Typecheck passed; iOS/Android keyboard and real video playback pending. | Comment pagination, replies, reply list, comment reactions, and deletion DTO/query contract. |
| 5 | Profile / saved / notifications | Per-screen routing was duplicated; type casing and unknown notification payloads could generate a dead end. Publications also exposed a false "saved posts" tab. | `resource-route.ts`, notifications API/types/screen, profile publications screen | Notification service; existing profile posts/favorites endpoints | Allow-listed common resolver, normalized notification types, safe unavailable state, real post route from profile, favorites entry no longer assumes every saved item is a post. | Typecheck passed; each backend notification type requires integration test. | Saved-resource envelope with `type`, `id`, and metadata for all resource kinds; booking detail route/DTO. |
| 6 | Campaign / promotion CTA | Campaign step 5 exposed raw image/destination fields with no guidance. | `campaign-actions.ts`, campaign creation screen | Existing campaign create DTO | Contextual CTA suggestions; recommended action marker; external destination clearly optional; the published preview is preserved. | Typecheck passed. | **BLOCKED_BY_BACKEND** for media upload association and promotion media/gallery. |
| 7 | Booking / event participation | Place `Réserver` was a visible no-op. Events already use register/unregister and ticket routes. | place detail screen | Existing event register/unregister and ticketing APIs | Place CTA now explains the verified unavailable state instead of pretending to reserve. Paid events retain the existing ticket flow. | Typecheck passed; ticket checkout is pre-existing and needs device test. | **BLOCKED_BY_BACKEND** for activity mapping, availability/request DTO, price/fees/policy, booking confirmation state, and native payment challenge. |
| 8 | Artisans / artworks | Artisans had no coordinates, and "Contact" simply opened generic messages even though partner and messaging IDs differ. | artisan detail; artwork detail | `GET /artisans`, profile, artisan artworks, artwork detail/offer | Certified artworks only appear from `authenticityStatus === VERIFIED`; contact now gives a truthful blocked state rather than opening an unrelated inbox. | Typecheck passed. | **BLOCKED_BY_BACKEND** for artisan coordinates/distance/cover/avatar, messaging user/conversation identifier, and rich related/artwork metadata. |
| 9 | Custom artwork quote | Existing implementation created a direct commerce order without configuration or quote support. | artwork detail | Existing artwork offer/order API | Direct fixed-price order is labelled as purchase. A custom-order offer is no longer represented as a fake purchase/quote flow. | Typecheck passed. | **BLOCKED_BY_BACKEND / LEGAL_PAYMENT_FLOW** for configuration, quote statuses, artisan quote actions, customer accept/refuse, deposit/payment terms, escrow/legal state, and notification payload. |
| 10 | Trending challenges | Join → create post → submit association already exists, but DTO has no creator class, participants, media/example, or trend signal. | No unsafe UI change; existing detail route audited. | Culture challenge join/submission APIs | Existing reuse of Create Post is retained. | Existing flow typechecked. | **BLOCKED_BY_BACKEND** for official/community origin, trend flag, participant count, end-time presentation fields, and reward/example media. |
| 11 | Languages programme | Languages, lessons, audio, quiz, attempt, completion, and progress exist. Personal goal/programme fields do not. | Existing language/lesson flows audited; audio control made label-capable for reused media contexts. | Culture language, lesson, attempt, completion, progress APIs | No fake daily programme or generic diagnostic questions added. | Existing flow typechecked. | **BLOCKED_BY_BACKEND** for programme configuration (goal, level, schedule, reminder), diagnostic question set, recommended programme, day/streak/home payload, and reminder registration. |
| 12 | Culture journey | Culture contents, categories endpoint, graph relations, language and content details exist; graph responses lack a resource type and generic save is absent. | culture detail; existing culture explorer audited | Culture content, languages, challenges, graph APIs | Functional share now creates a YeYamo deep link; related content stays non-clickable until its target type is known. | Typecheck passed; native share device test pending. | **BLOCKED_BY_BACKEND** for country-aware region selection contract, graph target resource type, and typed save/unsave contract for culture content. |

## Explicit backend blocks

### Feed subscriptions

```text
BLOCKED_BY_BACKEND
endpoint: GET /api/v1/feed/following
request: cursor/page, size, optional region context
response: the documented Feed page envelope with only followed-author items
mobile feature: Pour vous | Abonnements
```

### Promotional stories

```text
BLOCKED_BY_BACKEND
endpoint: POST /api/v1/stories with a typed promotion/resource payload (or a documented sub-resource)
request: mediaId, durationSeconds, promotionType, resourceType, resourceId, audience/replies policy
response: Story including media type, linked resource, CTA label/action, expiration and analytics identifiers
mobile feature: Partner promotional story editor and viewer CTA
```

### Campaign media and native destinations

```text
BLOCKED_BY_BACKEND
endpoint: documented campaign-media attach/upload and typed campaign destination fields
request: staged mediaId(s), campaign/draft association, native resource/action destination
response: CreativeConfiguration with media references and typed destination
mobile feature: Campaign step 5 upload, gallery, preview and native CTA routing
```

### Place reservation

```text
BLOCKED_BY_BACKEND
endpoint: existing booking endpoints need their request/response DTOs and a place-to-activity mapping published
request: activityId, slot/date, party size, contact data, note, idempotency key
response: availability, price/fees/total/policy, booking id, confirmation mode/status
mobile feature: Réserver, summary, pending/confirmed result and partner confirmation
```

### Artisan contact and map

```text
BLOCKED_BY_BACKEND
endpoint: artisan profile/map payload and/or direct-conversation resolver
request: artisan/partner id and viewer context
response: latitude, longitude, distance, public messagingUserId or conversationId, cover/avatar, certification fields
mobile feature: nearby artisan map, preview card and direct chat
```

### Custom order / quote / payment

```text
BLOCKED_BY_BACKEND / LEGAL_PAYMENT_FLOW
endpoints: create custom request, artisan quote/decline/request-info, customer accept/refuse, payment intent/confirmation
request: offer/artwork, permitted configuration, attachments, requested date, quote terms and selected payment amount
response: quote/order state machine, totals, deposit eligibility, payment challenge, notifications and legal escrow disclosure
mobile feature: custom commission, quote and deposit/full payment
```

## Mock and error-handling audit

- Feature mocks remain limited to explicit `demo-*` sessions; backend mode continues to call Axios clients.
- Existing normalized errors cover 400, 401, 403, 404, 409, timeout, and offline presentation. Resource routes add a safe unavailable fallback for incomplete notification payloads.
- No frontend 404 is converted into a fabricated resource. Detail screens retain their existing unavailable/retry states.

## Final completion criteria

Completed in the client: UI changes, route consolidation, supported API connections, safe error states, and static type verification.

Not marked complete: any row explicitly marked `BLOCKED_BY_BACKEND`. It is intentionally visible in this audit rather than masked by fake data or invented endpoints.

## Validation run

- `npm run lint`: passed with 0 errors and 87 existing repository warnings.
- `npx tsc --noEmit`: passed.
- `npx expo export`: cannot complete for all platforms because `react-native-web` is absent from the project; no dependency was added outside the requested scope.
- `npx expo export --platform ios --output-dir .tmp-expo-export/final-ios`: passed, bundling 2,728 modules.
