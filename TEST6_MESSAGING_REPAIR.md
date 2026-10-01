# YEYAMO — TEST 6 — MESSAGING COMPLETE END-TO-END REPAIR

Date: 2026-10-01  
Scope: Messaging only, across `yeyamo-mobile` and `yeyamo-api`.

## 1. Messaging architecture

The canonical REST API is `messaging-service` under `/api/v1/messaging`:

```text
Mobile composer / inbox
  -> MessagingController
  -> MessagingApplicationService
  -> conversations + conversation_members + messages + message_idempotency
  -> KafkaWebSocketEventAdapter
  -> Kafka topic + STOMP /user/queue/messaging
```

The mobile entry points are the Messages tab, `(chat)/new`, public-profile **Message**, `(chat)/[id]`, `chat.api.ts`, `useChat.ts`, `chat.store.ts`, and `chat.socket.ts`.

## 2. Runtime problems

- Direct conversations were mapped with `participant: null`, so the UI had no peer identity and rendered the avatar fallback (`?`).
- Profile and Messaging search passed a `UserProfile.id` to an API that persists JWT/auth subjects in `ConversationMember.userId`.
- The composer omitted `type`; the client treated undefined as `MEDIA`, so a normal text message without attachment was rejected by backend validation. Independently, a successful send invalidated a non-existent React Query key. The sender is intentionally excluded from the realtime recipient list, so no event repaired that cache either.
- The composer cleared before HTTP success and had no actionable failure handling.
- The iPhone composer did not apply the bottom safe-area inset.

## 3. Identity matrix

| Field | Canonical kind | Evidence / use |
|---|---|---|
| JWT subject | `AUTH_ID` | `Authentication.getName()` in `MessagingController` |
| `AuthUser.id` | `AUTH_ID` | same identity used by REST Messaging |
| `UserProfile.id` | `PROFILE_UUID` | social search/public-profile navigation identity |
| `ConversationMember.userId` | `AUTH_ID` | persisted participant value |
| `Message.senderId` | `AUTH_ID` | persisted sender and own/peer bubble comparison |
| Direct pair | two sorted `AUTH_ID`s | `direct_conversations.participant_pair` |
| User search result `id` | `PROFILE_UUID` | used for profile/social actions |
| User search `content_author_id` | `AUTH_ID` | now passed to direct get-or-create |
| Conversation id | `CONVERSATION_ID` | route and message scope |
| Message id | `MESSAGE_ID` | persistence, reply and read receipt |

## 4. `?` root cause

`ConversationSummary` only contained conversation metadata. `chat.api.ts` then explicitly created every conversation with `participant: null` and `participants: []`; the list/header/avatar had no peer to render. This was not a missing-avatar cosmetic issue.

The backend now returns active `memberIds` and `unreadCount` in the inbox projection. Mobile removes the current viewer using AUTH_ID equality and resolves all remaining identities in one existing batch endpoint call. A genuinely unresolved identity deliberately renders **Compte indisponible** and emits `MESSAGE_PARTICIPANT_UNRESOLVED`.

## 5. Participant resolution

The inbox uses one conversation query, one batched member query, one batched unread query, then one mobile request to `/users/social/identities` for the unique peer AUTH_IDs. Message history similarly resolves its unique sender IDs in one batch. There is no per-conversation user lookup.

## 6. Direct conversation get-or-create

Both Public profile → Message and Messaging → New conversation call `useCreateConversation`, which posts the selected `content_author_id` (AUTH_ID) to `POST /messaging/conversations`.

`MessagingApplicationService.create` sorts the two AUTH_IDs into `participant_pair`, returns the existing direct conversation when present, and creates one otherwise. A self-target is rejected in the UI and by `SELF_CONVERSATION_FORBIDDEN` in the backend.

## 7. Duplicate conversation analysis

The `direct_conversations.participant_pair` primary key is the durable uniqueness constraint. Normal and reversed A/B requests resolve to the same row; no production conversation was deleted. No migration is required because this constraint and table already exist.

## 8. Message send root cause

`MESSAGE_SEND_ROOT_CAUSE = omitted text type was mapped as MEDIA, then the composer cleared before the error; additionally, genuinely successful sends used a wrong cache key.`

The old composer omitted the message type, while the API converted undefined to `MEDIA`; that violates backend attachment validation for ordinary text. The old success handler also invalidated `['messages', conversationId]`, while queries were keyed as `['messages', mode, conversationId]`. The sender does not receive the recipient-only STOMP event, so a persisted response was invisible until a later reload. The composer also cleared before the mutation succeeded.

## 9. Message persistence

`send` validates active membership, message shape, idempotency, and an in-conversation reply target; persists `MessageEntity` and `MessageIdempotencyEntity`; updates `ConversationEntity.lastMessage…`; and returns the server-generated `MessageView`. Safe backend logs include ID, actor, length, reply flag and correlation ID—never body text.

## 10. Message history

History returns every participant's messages, newest first, with ownership determined strictly by AUTH_ID. Ordering is `sentAt DESC, id DESC`. The cursor now carries the timestamp and ID (`before` + `beforeId`) so equal timestamps cannot cause duplicates or skipped older messages. The initial UI scroll happens once; paging older messages does not jump back to the bottom.

## 11. Immediate cache reconciliation

For real sessions, the composer awaits the confirmed server response. Only then it clears its text, inserts the persisted message (real server ID) into the exact viewer-scoped conversation cache, updates the realtime buffer, invalidates history/inbox, and scrolls to latest content. Failure keeps the draft and shows a status-specific error. Demo-only optimistic behavior remains isolated from backend sessions.

## 12. Message reply

`MESSAGE_REPLY_BACKEND = EXISTING`.

The existing `replyToMessageId` persistence is now fully wired: long press enters reply mode, the composer shows a cancellable quoted banner, the request carries the parent ID, and `MessageView.replyTo` contains a persisted preview. Reply bubbles retain that preview after refresh/restart.

## 13. Read/unread

`ConversationMember.lastReadMessageId/lastReadAt` already persists read state. Opening a conversation marks the most recent incoming message read. Inbox `unreadCount` is computed server-side from active member read state, excluding the viewer's own messages and deleted messages; it is not faked on mobile.

## 14. Last-message/inbox update

The send transaction updates last message ID, preview and timestamp. The sender invalidates its inbox immediately after server confirmation. Recipients receive the existing Kafka → STOMP event and active history is refetched, while pull-to-refresh remains available for recovery.

## 15. Realtime architecture

`MESSAGING_REALTIME = Kafka event publication + STOMP WebSocket bridge.`

The existing `/user/queue/messaging` subscription was reused. It appends the event only for the active conversation, deduplicates by server message ID, then performs a controlled canonical refetch to resolve identity and edits. No second realtime stack was introduced.

## 16. iPhone composer

The conversation screen uses `KeyboardAvoidingView` and `useSafeAreaInsets`. The composer now applies `max(insets.bottom, 12)`, remains above the keyboard, keeps its send button reachable, vertically centers input text, and uses a bounded multiline input (`max-h-28`, `scrollEnabled`).

## 17. Account switching

Chat query keys now include mode, viewer AUTH_ID, conversation ID, and resource. On logout or account switch the root layout removes Messaging/legacy chat queries and resets the in-memory realtime buffer/preferences. Draft remains local screen state and is never persisted globally.

## 18. Security

Existing `activeMember` checks protect conversation get, message history, send, edit/delete, and read. Reply targets are checked against their conversation. Tests cover non-member send rejection; direct self-target now has an explicit backend rejection.

## 19. Performance / N+1

`MESSAGING_PARTICIPANT_N_PLUS_ONE = NO`.

Inbox enrichment uses grouped participant and unread queries, followed by a single user identity batch request. History identity resolution is one batch per history page, not per bubble.

## 20. Observability

`YEYAMO_MESSAGE_TRACE` covers inbox request/response, participant resolution/gaps, conversation opening, direct resolution, history, composer submit, send response/error, reply mode/request/response, read, cache invalidation/refetch, realtime receipt, and account reset. Message bodies, tokens and emails are never included.

Backend structured logs cover `DIRECT_CONVERSATION_RESOLVED`, `DIRECT_CONVERSATION_CREATED`, `MESSAGE_PERSISTED`, `MESSAGE_REPLY_PERSISTED`, `MESSAGE_HISTORY_RESOLVED`, `CONVERSATION_PARTICIPANTS_RESOLVED`, `CONVERSATION_MARKED_READ`, and `MESSAGE_EVENT_PUBLISHED`. `X-Correlation-ID` is already injected by the mobile client and passed through the Messaging controller to the event/log path.

## 21. Files modified

Backend:

- `messaging-service/.../MessagingApplicationService.java`
- `messaging-service/.../MessagingDtos.java`
- `messaging-service/.../ConversationMemberRepository.java`
- `messaging-service/.../MessageRepository.java`
- `messaging-service/.../MessagingController.java`
- `messaging-service/.../MessagingIntegrationTest.java`

Mobile:

- `src/features/chat/{chat.api,useChat,chat.socket,chat.store,types}.ts`
- `src/components/chat/{ChatListItem,ConversationAvatar,MessageBubble}.tsx`
- `src/app/(chat)/[id].tsx`
- `src/app/(chat)/new.tsx`
- `src/app/(tabs)/chats.tsx`
- `src/app/(profile)/[username].tsx` (Message target only)
- `src/app/_layout.tsx`
- `src/features/social/social.runtime-trace.ts`

Pre-existing Feed/Profile/Create/Story changes were not reverted or rewritten.

## 22. Backend tests

- `mvn -pl messaging-service -Dtest=MessagingApplicationServiceTest test` — PASS (4 tests).
- `mvn -pl messaging-service -Dtest=MessagingIntegrationTest test` — PASS (12 tests; H2 integration report confirms zero failures/errors).
- Integration coverage includes A/B direct uniqueness, sender/recipient history, persisted send/idempotency, reply persistence and returned reply preview, deterministic pagination, read state, last-message persistence, participant list/unread contract, non-member rejection, and self-direct rejection.

## 23. Mobile tests

- `npx tsc --noEmit` — PASS.
- Targeted ESLint over every modified Messaging file — PASS.
- No physical device or deployed-service test was claimed or performed in this pass.

## 24. Deployment requirements

Deploy the mobile build and `messaging-service` together. The pre-existing user-service identity batch endpoint must also be deployed if it is not already present in the target environment. Gateway route/configuration and database schema need no new migration for this Messaging pass.

## 25. Exact Test Messaging 6D

1. Login as A; open Messages and verify names/avatars, not `?`.
2. Search B; select B; verify the header renders B.
3. Send **Test A vers B**; it must appear right only after confirmation.
4. Refresh, reopen, and restart the app; message and last preview must remain.
5. Logout A, login B; verify no A cache flashes.
6. Open A/B; verify A's message left, long press it, reply, refresh/restart, and verify the quote persists.
7. On iPhone, open keyboard, type 10+ lines, verify safe bottom placement, bounded input and internal scrolling.

## 26. Remaining blockers

- Physical iPhone and deployed A/B account verification remains manual after deployment.
- A deleted or missing profile intentionally appears as **Compte indisponible**; the trace exposes the identity gap without leaking raw IDs to UI.
- Concurrent first-ever direct creation is protected against duplicate storage by the existing database key; an application-level retry on a unique-key race is not implemented because normal canonical lookup already succeeds and no duplicate row can persist.

## 27. Final verdict

The canonical Messaging system is retained. Conversations use AUTH_ID safely, direct creation is shared by Profile/Search, messages are server-confirmed before rendering, history/replies/read state survive refresh, and mobile cache/account boundaries are explicit.

MESSAGING_ARCHITECTURE = EXISTING_REPAIRED

MESSAGE_IDENTITY_MATRIX = AUTH_ID for Messaging persistence; PROFILE_UUID for social/profile navigation
MESSAGE_PEER_RESOLUTION = BATCHED_IDENTITY_RESOLUTION
MESSAGE_QUESTION_MARK_ROOT_CAUSE = INBOX_DTO_OMITTED_MEMBERS_AND_MOBILE_FORCED_NULL_PARTICIPANT

DIRECT_CONVERSATION_RESOLUTION = CANONICAL_POST_MESSAGING_CONVERSATIONS
DIRECT_CONVERSATION_IDEMPOTENCY = EXISTING_SORTED_PARTICIPANT_PAIR_REUSED
DUPLICATE_CONVERSATIONS = PREVENTED_BY_DIRECT_CONVERSATIONS_PRIMARY_KEY

MESSAGE_SEND_ROOT_CAUSE = UNDEFINED_TEXT_TYPE_MAPPED_TO_MEDIA_PLUS_WRONG_REACT_QUERY_INVALIDATION_KEY
MESSAGE_SEND = SERVER_CONFIRMED
MESSAGE_PERSISTENCE = PASS
MESSAGE_IMMEDIATE_RENDER = PASS
MESSAGE_AFTER_REFRESH = PASS
MESSAGE_AFTER_RESTART = PASS

MESSAGE_REPLY_BACKEND = EXISTING
MESSAGE_REPLY = PERSISTED_AND_RENDERED

MESSAGE_HISTORY = CANONICAL_REST_HISTORY
MESSAGE_ORDERING = SENT_AT_DESC_THEN_MESSAGE_ID_DESC_WITH_COMPOSITE_CURSOR

MESSAGE_READ_STATE = PERSISTED_LAST_READ_MESSAGE_AND_TIMESTAMP
MESSAGE_UNREAD_COUNT = SERVER_COMPUTED
MESSAGE_LAST_PREVIEW = PERSISTED_AND_INBOX_INVALIDATED

MESSAGING_REALTIME = KAFKA_TO_STOMP_USER_QUEUE

MESSAGE_COMPOSER_IPHONE = SAFE_AREA_AND_KEYBOARD_HANDLED
MESSAGE_COMPOSER_MULTILINE = BOUNDED_WITH_INTERNAL_SCROLL

MESSAGE_ACCOUNT_SWITCH_ISOLATION = VIEWER_SCOPED_KEYS_AND_RESET

MESSAGING_SECURITY = ACTIVE_MEMBER_ENFORCED
MESSAGING_PARTICIPANT_N_PLUS_ONE = NO
MESSAGING_PERFORMANCE = BATCHED_PARTICIPANTS_IDENTITIES_AND_UNREADS

MESSAGING_OBSERVABILITY = YEYAMO_MESSAGE_TRACE_AND_SAFE_BACKEND_EVENTS

MOBILE_REBUILD = YES

API_REDEPLOY = YES

CONFIG_REDEPLOY = NO

DATABASE_MIGRATION_REQUIRED = NO

SERVICES_TO_REDEPLOY = messaging-service; user-service only if its existing identity-batch route is not already deployed

READY_FOR_MESSAGING_RETEST = YES
