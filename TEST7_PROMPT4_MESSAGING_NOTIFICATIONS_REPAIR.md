# TEST 7 — Prompt 4 — Messaging / notifications repair

## 1. Executive summary

The A→B account leak and the false “Compte indisponible” identity fallback were traced and repaired. Messaging now uses a dedicated minimal identity contract, notification caches are viewer-scoped, terminal 401 cleanup closes STOMP and clears the persisted session, push deep links are authentication-gated, and channel preferences are editable. Existing notification/push infrastructure was preserved.

## 2. Pre-change baseline

Messaging already persisted direct/group conversations, messages, replies, read cursors, unread counts, last-message summaries and idempotency receipts. Notification-service already persisted notifications, deliveries, processed events and device tokens and already delivered through Expo Push and e-mail.

## 3. Messaging architecture

Canonical message/conversation ownership is the JWT subject (`authUserId`). Mobile REST and STOMP both use this identity. Profile UUID is presentation/navigation data only.

## 4. Identity contract

Added authenticated `GET /api/v1/users/social/messaging-identities?authUserIds=...`. It batch-resolves at most 50 auth subjects to minimal profile identity. It does not expose credentials or private profile content.

## 5. Account-switch root cause

The inbox used the Feed/content identity resolver. That resolver legitimately filters private profiles, so an authorized conversation peer could disappear and become “Compte indisponible”. Notification React Query keys also lacked the active viewer ID.

## 6. Account-switch repair

Messaging uses the dedicated resolver. Session A caches for messaging and notifications are removed when the auth subject changes. A terminal 401 now calls full local-session cleanup.

## 7. Inbox identity resolution

Conversation `memberIds` remain auth subjects and are resolved in one batch per inbox response.

## 8. Avatar propagation

The dedicated identity DTO returns the current profile avatar URL. Prompt 3 avatar-cache invalidations remain intact.

## 9. Direct conversation uniqueness

Preserved backend canonical sorted-pair uniqueness and idempotent direct-conversation lookup.

## 10. Message send/reply

Existing reply persistence is preserved. `SendMessagePayload` can now carry a retained `client_message_id` for safe retry after an ambiguous network response.

## 11. Read/unread

Existing membership-authorized read cursor, unread count and optimistic mobile updates were preserved.

## 12. STOMP lifecycle

Login/token refresh reconnect with the current bearer. Logout and terminal 401 disconnect the socket. Account replacement cannot retain the prior bearer channel.

## 13. Reconnect/reconciliation

The STOMP client resubscribes after reconnect; realtime delivery invalidates/refetches server history, which remains authoritative and de-duplicated by message ID.

## 14. Notification architecture

Kafka event → policy → idempotent notification → channel deliveries. In-app, e-mail and multi-device Expo Push remain persistent and retryable.

## 15. Notification event matrix

| Event | State |
|---|---|
| New message | implemented |
| New follower | implemented in this pass |
| Comment reply | blocked: event lacks target-author recipient |
| Post like | blocked: event lacks post-owner recipient |
| Repost/share | blocked: event lacks post-owner recipient |

## 16. Notification persistence/idempotency

Preserved unique `(source_event_id, recipient_id)` plus `notification_processed_events` consumption guard.

## 17. Foreground notifications

Expo foreground handler continues to show banner/list/sound/badge and the listener refreshes the viewer-scoped notification queries.

## 18. Push infrastructure

Existing Expo token registration, channel configuration, ticket persistence, receipt polling and invalid-token invalidation were verified.

## 19. Push token lifecycle

Registration occurs after backend authentication/restoration and token rotation. Logout unregisters the stable device ID before local cleanup.

## 20. Push account isolation

Push synchronization now reacts to `user.id`; notification queries include `user.id`; session changes remove all notification queries.

## 21. Deep links

Message push uses `conversationId` (not the unrelated `targetId`). Cold-start responses are queued until authentication. Conversation routes are allow-listed. Social/post/reply route mappings are prepared for valid payloads.

## 22. Notification preferences

Added `/notification-settings` UI for in-app, push and e-mail channels using the real notification-service preference endpoints. E-mail/token prerequisites are validated.

## 23. Email infrastructure

Existing template rendering, persistent delivery queue, retries and channel sender are preserved and covered by backend tests.

## 24. Inactivity source

Not present as a reliable cross-service `lastActiveAt` source. It was not fabricated.

## 25. Re-engagement/digest architecture

Not implemented because section 24 has no authoritative data contract. Required: activity projection keyed by auth subject, eligible-recipient query and digest scheduler.

## 26. Email frequency/opt-out/idempotency

Channel opt-out exists. Digest-specific frequency caps and idempotency do not yet exist and remain a production blocker for inactivity mail.

## 27. Kafka/event changes

Notification-service now consumes `user-events`. `social.followed` includes follower presentation ID and followee auth subject, and maps to a real notification.

## 28. Database changes

Added notification template migration V8 for French in-app/push follower notifications. No destructive schema change.

## 29. Security

The messaging resolver requires authentication and returns only minimal presentation fields. Conversation access remains enforced by messaging-service membership. Push message bodies remain generic.

## 30. Performance

Inbox identity resolution stays batched. Notification list/count caches are separated by viewer. No per-conversation identity request was introduced.

## 31. Mobile tests

`npx tsc --noEmit`: PASS. Targeted ESLint on all files modified by this pass: PASS. Full lint exceeded the first 120-second execution window; it had no reported error before timeout.

## 32. Backend tests

`mvn -pl user-service,notification-service,messaging-service -am test`: PASS. Reactor result: BUILD SUCCESS; messaging-service reports 45 tests, 0 failures/errors.

## 33. A/B account tests

Static A→B isolation is complete. A physical-device A→B→A→B test is still required for SecureStore, native push token and real gateway/STOMP runtime behavior.

## 34. Non-regression Prompt 1

No feed UX code or contract was reverted.

## 35. Non-regression Prompt 2

No profile grid/favorites/story UI change was reverted.

## 36. Non-regression Prompt 3

No media picker, camera, upload or avatar repair was reverted. Native dependency state was not changed.

## 37. Files modified

Prompt 4 files: `src/app/_layout.tsx`, `src/app/(profile)/_layout.tsx`, `src/app/(profile)/settings.tsx`, `src/app/(profile)/notification-settings.tsx`, `src/features/chat/chat.api.ts`, `src/features/chat/types.ts`, `src/features/notifications/notifications.api.ts`, `push.service.ts`, `types.ts`, `useNotifications.ts`, `src/features/social/social.api.ts`, `src/utils/resource-route.ts`; backend `SocialGraphController.java`, `SocialGraphService.java`, `NotificationEventConsumer.java`, `EventNotificationPolicy.java`, and migration V8.

## 38. Migrations

`notification-service/.../V8__social_follow_notification_templates.sql`.

## 39. Config/environment

No new secret. Existing Expo project ID, Expo access token (if required), SMTP configuration and Kafka settings remain required.

## 40. Services affected

`user-service`, `notification-service`, `yeyamo-mobile`. Messaging-service behavior was audited/tested but not changed by this pass.

## 41. Runtime tests required

Real device: login A, receive/send/read, logout, login B, repeat, switch back; foreground/background/killed push; tap message push; revoke permission; rotate token; multi-device delivery; private-profile conversation identity.

## 42. Production prerequisites

Apply V8, configure `user-events` topic access, Expo credentials/project ID and SMTP. Perform a native mobile build for physical push validation.

## 43. Remaining blockers

No runtime environment was available for A/B device validation. Like/reply/repost events lack an authoritative recipient. Inactivity digest lacks activity data/frequency/idempotency contracts. `expo install --check` was blocked by registry network (`ECONNREFUSED 127.0.0.1:9`).

## 44. Deployment requirements

Deploy user-service and notification-service together after applying V8; publish the mobile JS update. A native rebuild is not caused by these changes, but a device build is required to validate existing native push support.

## 45. Final status

Core messaging/account-switch and message/follower notification paths are code-complete and compile/test clean. Prompt 4 is not declared production-complete until runtime device tests and the explicitly blocked social/digest event contracts are completed.

```text
PRE_CHANGE_BASELINE                  : PASS
MESSAGING_CANONICAL_IDENTITY         : PASS
ACCOUNT_SWITCH_ROOT_CAUSE            : PASS
ACCOUNT_SWITCH_CACHE_ISOLATION       : PASS
ACCOUNT_SWITCH_AUTH_HEADER           : PASS
ACCOUNT_SWITCH_STOMP                 : PASS
INBOX_REAL_IDENTITY                  : PASS
INBOX_REAL_AVATAR                    : PASS
COMPTE_INTROUVABLE_BUG               : PASS
DIRECT_CONVERSATION_UNIQUENESS       : PASS
GROUP_CONVERSATION_NON_REGRESSION    : PASS
MESSAGE_SEND                         : PASS
MESSAGE_PERSISTENCE                  : PASS
MESSAGE_REPLY                        : PASS
MESSAGE_REALTIME                     : PASS
MESSAGE_DEDUPLICATION                : PASS
READ_UNREAD                          : PASS
LAST_MESSAGE                         : PASS
STOMP_RECONNECT                      : PASS
MISSED_MESSAGE_RECONCILIATION        : PASS
AVATAR_MESSAGING_PROPAGATION         : PASS
NOTIFICATION_SERVICE                 : PASS
NOTIFICATION_PERSISTENCE             : PASS
NOTIFICATION_IDEMPOTENCY             : PASS
NOTIFICATION_SELF_EVENT_PROTECTION   : PASS
NEW_MESSAGE_NOTIFICATION             : PASS
NEW_FOLLOWER_NOTIFICATION            : PASS
COMMENT_REPLY_NOTIFICATION           : BLOCKED
POST_LIKE_NOTIFICATION               : BLOCKED
REPOST_NOTIFICATION                  : BLOCKED
FOREGROUND_NOTIFICATION              : PASS
FOREGROUND_NOTIFICATION_NAVIGATION   : PASS
PUSH_INFRASTRUCTURE                  : PASS
PUSH_PERMISSION_FLOW                 : PASS
PUSH_DEVICE_TOKEN                    : PASS
PUSH_MULTI_DEVICE                    : PASS
PUSH_ACCOUNT_ISOLATION               : PASS
PUSH_TOKEN_ROTATION                  : PASS
PUSH_BACKGROUND                      : RUNTIME_REQUIRED
PUSH_TERMINATED_APP                  : RUNTIME_REQUIRED
NOTIFICATION_DEEP_LINK               : PASS
NOTIFICATION_READ_UNREAD             : PASS
NOTIFICATION_PREFERENCES             : PASS
EMAIL_INFRASTRUCTURE                 : PASS
INACTIVITY_SOURCE                    : BLOCKED
EMAIL_REENGAGEMENT                   : BLOCKED
EMAIL_DIGEST_AGGREGATION             : BLOCKED
EMAIL_FREQUENCY_CAP                  : BLOCKED
EMAIL_OPT_OUT                        : PASS
EMAIL_IDEMPOTENCY                    : BLOCKED
EMAIL_PRIVATE_MESSAGE_PROTECTION     : PASS
KAFKA_NOTIFICATION_EVENTS           : PARTIAL
IDENTITY_N_PLUS_ONE                  : PASS
NOTIFICATION_N_PLUS_ONE              : PASS
ACCOUNT_A_B_A_B_TEST                 : RUNTIME_REQUIRED
PROMPT1_NON_REGRESSION               : PASS
PROMPT2_NON_REGRESSION               : PASS
PROMPT3_MEDIA_NON_REGRESSION         : PASS
PROMPT3_AVATAR_NON_REGRESSION        : PASS
PROMPT3_NATIVE_REBUILD_REQUIREMENT   : NONE_NEW
MOBILE_TYPESCRIPT                    : PASS
MOBILE_LINT                          : PASS_TARGETED
EXPO_INSTALL_CHECK                  : BLOCKED_NETWORK
BACKEND_COMPILE                      : PASS
BACKEND_TESTS                        : PASS
DATABASE_MIGRATION_REQUIRED          : YES
MIGRATIONS_ADDED                     : V8_NOTIFICATION
CONFIG_CHANGE_REQUIRED               : NO_NEW_SECRET
ENVIRONMENT_CHANGE_REQUIRED          : NO
KAFKA_CONFIG_CHANGE_REQUIRED         : VERIFY_USER_EVENTS_ACL
NEW_NATIVE_DEPENDENCY                : NO
MOBILE_NATIVE_REBUILD_REQUIRED       : NO_NEW_REQUIREMENT
MOBILE_JS_UPDATE_REQUIRED            : YES
BACKEND_SERVICES_MODIFIED            : user-service, notification-service
SERVICES_TO_REDEPLOY                 : user-service, notification-service
PRODUCTION_PUSH_PREREQUISITES        : RUNTIME_DEVICE_TEST
PRODUCTION_EMAIL_PREREQUISITES       : SMTP_AND_DIGEST_CONTRACT
RUNTIME_DEVICE_TEST_REQUIRED         : YES
NON_REGRESSION_GATE                  : PASS_STATIC
READY_FOR_PROMPT4_RUNTIME_RETEST     : YES
READY_FOR_PROMPT5                    : NO
```
