# TEST 7 — Prompt 6 — Final release gate

## 1. Executive summary
Les blockers Like, Reply, Share, digest email et tests recommendation sont fermés au niveau code/tests. Aucun déploiement n’a été exécuté. La release reste soumise aux tests iPhone, aux credentials push/SMTP et à FFmpeg dans l’image media-service.

## 2. Prompt 1–5 consolidated state
Les contrats Feed/Following, profil/story, média, messaging/push et session/offline/intérêts sont conservés. Leur validation appareil reste nécessaire.

## 3. Remaining blockers before changes
Les événements interaction ne portaient pas de destinataire canonique; le digest n’existait pas; recommendation avait seulement expiré pendant le test global.

## 4. Like notification root cause/fix
`interaction.like.added` ne contenait que `postId/userId`. notification-service résout maintenant l’auteur via `/internal/posts/{postId}/owner`, après persistance du like, et supprime le self-like.

## 5. Reply notification root cause/fix
L’événement commentaire ignorait l’auteur parent. interaction-service ajoute `parentCommentId/parentAuthorId`; notification-service ne traite comme Reply que les commentaires ayant un parent et supprime le self-reply.

## 6. Repost/share decision
Le domaine canonique existe (`interaction_shares`, idempotency key, `interaction.post.shared`). La notification Share est donc implémentée; elle résout le propriétaire du post et supprime le self-share.

## 7. Notification event contracts
Like: `postId,userId`; Reply: `postId,commentId,parentCommentId,authorId,parentAuthorId`; Share: `postId,shareId,userId,channel`. Le reçu Kafka et la contrainte `(source_event_id,recipient_id)` assurent la déduplication. Les données push conservent post/comment/share IDs.

## 8. Email re-engagement architecture
Scheduler notification-service → endpoint interne user-service → préférences email → notifications non lues significatives → digest agrégé → delivery email existante.

## 9. Activity integration
La source reste `lastActiveAt` serveur dans user-service. L’énumération inactive demeure privée sous `/internal/**` avec `X-Internal-Token`.

## 10. Digest aggregation
Une notification/email résume likes, followers, replies et nouveaux messages; aucun corps de message privé n’est inclus.

## 11. Digest frequency/idempotency
Seuil inactif 7 jours, cooldown 7 jours, scan 6 h, tous configurables. `reengagement_digest_state` persiste le dernier envoi; source UUID déterministe et contrainte notification empêchent le doublon.

## 12. Recommendation test completion
La suite ciblée passe: 39 tests, 0 échec. Projection, consumer et scoring d’intérêts sont couverts; aucun retuning n’a été fait.

## 13. Global release matrix
| Domaine | État |
|---|---|
| Auth/startup, Offline, Interests | RUNTIME_REQUIRED |
| Feed, Comments, Follow, Profile, Story, Media, Create | RUNTIME_REQUIRED |
| Outing, Explorer, Group, Messaging, Push | RUNTIME_REQUIRED |
| Notifications, Email, Recommendations | PASS statique / RUNTIME_REQUIRED production |
| Account switch | RUNTIME_REQUIRED |

## 14. Auth/startup
SecureStore, refresh, 401/403 terminal, erreur réseau non terminale et splash borné sont statiquement cohérents. Cold-start physique requis.

## 15. Offline
NetInfo pilote React Query et la bannière. Cache mémoire conservé, mutations échouent explicitement. Aucun cache Feed disque promis.

## 16. Interests
Catégories serveur, persistance user-service, migration comptes existants complétés et éditeur Paramètres sont présents.

## 17. Recommendations
Les intérêts alimentent la projection et ajoutent un bonus, jamais un hard filter; Following reste indépendant.

## 18. Feed
For You/Following, pagination, interactions et rendu média sont présents; validation données réelles/appareil requise.

## 19. Comments
Bottom sheet, reply et clavier ont une implémentation; la chaîne Reply notification est désormais contractuelle et testée.

## 20. Profile
Grille, statistiques, favoris/collections et story ring restent inchangés; runtime requis.

## 21. Story
Photo/vidéo/styles/persistance sont préservés; rendu et restart sur appareil requis.

## 22. Media
Pipeline R2/caméra/retry préservé. La miniature vidéo dépend réellement de FFmpeg.

## 23. Create
Publication, story, sortie et suggestion conservent leurs contrats; test clavier/upload réel requis.

## 24. Outing/group
Distribution Feed/Story et lien groupe canonique restent en place; test multi-compte requis.

## 25. Explorer
Pays, planification, participation et favoris restent à vérifier contre l’environnement déployé.

## 26. Messaging
AUTH_ID, REST history, STOMP et réconciliation restent inchangés. Test deux comptes/reconnexion requis.

## 27. Notifications
Message, follower, Like, Reply et Share utilisent le pipeline persistant/idempotent commun. Les auto-événements interactionnels sont supprimés.

## 28. Push
Types `POST_LIKED`, `COMMENT_REPLIED`, `POST_REPOSTED` et IDs structurés sont alignés au routeur mobile. Foreground/background/terminated nécessitent un appareil.

## 29. Email
Digest implémenté mais désactivé par défaut. Activation exige SMTP validé, adresses utilisateurs et `REENGAGEMENT_ENABLED=true` après smoke tests.

## 30. Account switching
Les caches principaux sont supprimés au changement d’identité et tokens push désinscrits; test A→B→A→B obligatoire.

## 31. Identity audit
Propriétaires de post/comment et destinataires sont des AUTH_ID. PROFILE_UUID reste présentation/social; aucune conversion heuristique n’a été ajoutée.

## 32. React Query cache audit
Feed, stories, profile, social, post, interactions, place suggestions, messaging et notifications sont retirés au changement de viewer. Intérêts ont un cache SecureStore associé au viewerId.

## 33. API contracts
Ajouts cohérents: content internal owner, user internal inactive, user interests/activity. Le mobile notification mappe les nouveaux types vers `postId`.

## 34. Kafka contracts
interaction-service produit sur `interaction.events`; notification-service consomme le même topic et utilise eventId/version 1/processed receipt. user-service produit historiquement `user-events`; recommendation écoute également le legacy topic.

## 35. Config audit
La divergence Feed `interaction-events` a été corrigée vers `${INTERACTION_EVENTS_TOPIC:interaction.events}`. URLs content/user, digest et token interne sont configurables. Aucun secret n’est ajouté.

## 36. Migration inventory
Unreleased détectées: content V9; interaction V8; notification V8/V9/V10; user V7; recommendation V8. Toutes sont additives.

## 37. Native dependency inventory
Ajouts récents: `expo-gl` et `@react-native-community/netinfo`; caméra, notifications, maps, WebView et SecureStore sont natifs. Expo Go n’est pas la gate de release.

## 38. iOS/Android config
Camera/photo/microphone/notifications doivent être revérifiés dans les manifests générés EAS. Maps dépend des clés de build. Aucun broad storage permission n’a été ajouté.

## 39. Security
Endpoints internes fail-closed sans token; ownership normal reste appliqué au deep link; tokens et secrets ne sont pas loggés. Test push cross-account reste P1 runtime.

## 40. Performance
Activité throttlée, digest par lot 500 et fréquence 6 h. Risque à surveiller: résolution synchrone content-service pour chaque événement Like/Share et traitement digest utilisateur par utilisateur.

## 41. Observability
Logs structurés existent pour auth/feed/interaction/messaging/media/recommendation. Ajouter des métriques métier digest avant montée en charge serait souhaitable.

## 42. Backend tests
Recommendation: 39/39 PASS. Content/interaction/notification reactor: PASS; notification: 37/37. Nouvelle relance notification après mapping push: 37/37 PASS. `git diff --check`: PASS.

## 43. Mobile tests
TypeScript PASS. Lint: 0 erreur, 1 warning préexistant `partner.api.ts`. `expo install --check` n’a pas pu joindre son service (`ECONNREFUSED 127.0.0.1:9`): dépendance réseau, classée WARNING.

## 44. Runtime tests required
Tous les scénarios appareil demandés, deux comptes, réseau coupé/rétabli, push foreground/background/terminated, SMTP sandbox et chaîne Kafka réelle.

## 45. Production prerequisites
Token inter-service commun, bases sauvegardées, Kafka `interaction.events`, SMTP/Brevo, Expo project/credentials/access token, clés Maps, R2, FFmpeg dans media-service.

## 46. Remaining issues + severity
P1_RUNTIME: suite iPhone et push isolation. P1_CORE_FLOW: FFmpeg absent/non prouvé dans l’image media. P1_RUNTIME: SMTP/Expo credentials non validés. P2_UX: warning lint hors périmètre. Aucun P0 statique identifié.

## 47. Services to redeploy
Config-server/cloud config; content-service; interaction-service; user-service; recommendation-service; notification-service; feed-service pour correction topic; messaging-service pour les changements Prompt 4; mobile native build.

## 48. Migration order
Backup, puis content V9, interaction V8, user V7, recommendation V8, notification V8→V9→V10. Flyway les applique au démarrage de chaque service; ne jamais renuméroter.

## 49. Deployment order
1 config-server/config; 2 content + user; 3 interaction + recommendation; 4 notification digest désactivé; 5 messaging + feed; 6 smoke tests; 7 activer email après SMTP; 8 build mobile preview; 9 runtime gate; 10 production mobile.

## 50. Rollback plan
Arrêter l’étape fautive, restaurer config précédente et image applicative précédente. Laisser les migrations additives en place. Désactiver immédiatement digest par config. Restaurer DB uniquement en cas de corruption démontrée.

## 51. Per-stage smoke tests
Config: `/actuator/health`. Content: internal owner 200 avec token/401 sans token. User: inactive query idem. Interaction: like/reply/share 201 et outbox publié. Notification: une seule notification après replay. Recommendation: événement intérêt visible en projection. Feed: contenu chargé. Messaging: REST+STOMP. Mobile: scénario final, arrêt au premier échec critique.

## 52. VPS command plan
Phase par phase uniquement: sauvegarde PostgreSQL; `git diff/status`; mise à jour config; rebuild/redeploy d’un groupe; `docker compose ps`/logs; curl health; smoke fonctionnel; décision GO avant groupe suivant. Les commandes exactes dépendent des noms Dokploy réels et ne doivent pas être devinées avant sortie `docker compose config --services`.

## 53. Mobile build/release plan
Configurer secrets EAS, lancer `npx expo install --check` avec réseau, générer un development/preview build iOS (Expo Go insuffisant pour la gate native), exécuter la checklist, puis seulement créer le build production et soumettre.

## 54. Physical iPhone test plan
Installer preview propre → compte A → splash/auth/intérêts/feed/create/story/comment/reply/like/message/outing → offline/online/restart → logout A → compte B → vérifier absence données/push A → répondre/notifier → background/terminated push → A→B→A→B → enregistrer le premier échec exact.

## 55. Final release decision
Le code est prêt pour un déploiement staging séquentiel, pas pour une publication production immédiate. Décision: GO_FOR_STAGED_DEPLOYMENT_WITH_RUNTIME_GATE.

PROMPT1_CONSOLIDATED = PARTIAL
PROMPT2_CONSOLIDATED = PARTIAL
PROMPT3_CONSOLIDATED = PARTIAL
PROMPT4_CONSOLIDATED = PARTIAL
PROMPT5_CONSOLIDATED = PARTIAL
LIKE_NOTIFICATION_RECIPIENT = PASS
LIKE_NOTIFICATION_PERSISTENCE = PASS
LIKE_NOTIFICATION_IDEMPOTENCY = PASS
LIKE_NOTIFICATION_DEEP_LINK = PASS
REPLY_NOTIFICATION_RECIPIENT = PASS
REPLY_NOTIFICATION_PERSISTENCE = PASS
REPLY_NOTIFICATION_IDEMPOTENCY = PASS
REPLY_NOTIFICATION_DEEP_LINK = PASS
REPOST_CANONICAL_DOMAIN = YES
REPOST_NOTIFICATION = PASS
EMAIL_ACTIVITY_SOURCE = PASS
EMAIL_INACTIVE_QUERY = PASS
EMAIL_DIGEST = PASS
EMAIL_DIGEST_AGGREGATION = PASS
EMAIL_DIGEST_FREQUENCY_CAP = PASS
EMAIL_DIGEST_IDEMPOTENCY = PASS
EMAIL_DIGEST_OPT_OUT = PASS
EMAIL_MESSAGE_PRIVACY = PASS
RECOMMENDATION_TARGETED_TESTS = PASS
RECOMMENDATION_INTEREST_PROJECTION = PASS
RECOMMENDATION_INTEREST_SCORING = PASS
FOLLOWING_RECOMMENDATION_NON_REGRESSION = PASS
AUTH_STARTUP_GATE = RUNTIME_REQUIRED
OFFLINE_GATE = RUNTIME_REQUIRED
INTEREST_ONBOARDING_GATE = RUNTIME_REQUIRED
FEED_GATE = RUNTIME_REQUIRED
COMMENTS_GATE = RUNTIME_REQUIRED
PROFILE_GATE = RUNTIME_REQUIRED
STORY_GATE = RUNTIME_REQUIRED
MEDIA_GATE = RUNTIME_REQUIRED
AVATAR_REPEATED_UPDATE_GATE = RUNTIME_REQUIRED
CREATE_GATE = RUNTIME_REQUIRED
OUTING_GROUP_GATE = RUNTIME_REQUIRED
EXPLORER_GATE = RUNTIME_REQUIRED
MESSAGING_GATE = RUNTIME_REQUIRED
REALTIME_GATE = RUNTIME_REQUIRED
NOTIFICATION_GATE = RUNTIME_REQUIRED
PUSH_GATE = RUNTIME_REQUIRED
PUSH_ACCOUNT_ISOLATION = RUNTIME_REQUIRED
EMAIL_GATE = PASS
ACCOUNT_SWITCH_GLOBAL_GATE = RUNTIME_REQUIRED
AUTH_ID_PROFILE_UUID_AUDIT = PASS
VIEWER_QUERY_KEY_AUDIT = PASS
API_CONTRACT_AUDIT = PASS
KAFKA_CONTRACT_AUDIT = PASS
KAFKA_TOPIC_NAMING = PASS
CONFIG_AUDIT = PASS
MIGRATION_AUDIT = PASS
FLYWAY_SAFETY = PASS
EXISTING_DATA_MIGRATION_SAFETY = PASS
MEDIA_FFMPEG_PRODUCTION = BLOCKED
EXPO_PUSH_PRODUCTION = RUNTIME_REQUIRED
SMTP_PRODUCTION = MISSING_PREREQUISITE
SECURITY_GATE = PASS
PERFORMANCE_GATE = WARNING
OBSERVABILITY_GATE = WARNING
MOBILE_TYPESCRIPT = PASS
MOBILE_LINT = WARNING
EXPO_INSTALL_CHECK = WARNING
BACKEND_TARGETED_TESTS = PASS
BACKEND_BROAD_TESTS = PASS
DATABASE_MIGRATION_REQUIRED = YES
ALL_MIGRATIONS = CONTENT_V9_INTERACTION_V8_NOTIFICATION_V8_V9_V10_USER_V7_RECOMMENDATION_V8
CONFIG_REDEPLOY_REQUIRED = YES
KAFKA_CONFIG_CHANGE_REQUIRED = YES
NEW_NATIVE_DEPENDENCIES_TOTAL = EXPO_GL_NETINFO
MOBILE_NATIVE_REBUILD_REQUIRED = YES
MOBILE_JS_UPDATE_REQUIRED = YES
BACKEND_SERVICES_TO_REDEPLOY = CONFIG_CONTENT_INTERACTION_USER_RECOMMENDATION_NOTIFICATION_FEED_MESSAGING
DEPLOYMENT_ORDER = CONFIG_THEN_CONTENT_USER_THEN_INTERACTION_RECOMMENDATION_THEN_NOTIFICATION_THEN_MESSAGING_FEED_THEN_MOBILE
ROLLBACK_PLAN = READY
VPS_COMMAND_PLAN = READY
IPHONE_RUNTIME_PLAN = READY
P0_SECURITY_BLOCKERS = NONE_STATIC
P0_DATA_LOSS_BLOCKERS = NONE_STATIC
P1_CORE_FLOW_BLOCKERS = MEDIA_FFMPEG_PRODUCTION_IMAGE
P1_RUNTIME_BLOCKERS = IPHONE_PUSH_SMTP_RUNTIME_VALIDATION
DEFERRED_FEATURES = PERSISTENT_OFFLINE_FEED_CACHE
STATIC_CODE_READY = YES
RUNTIME_READY = NO
PRODUCTION_READY = NO
READY_FOR_STAGED_DEPLOYMENT = YES
FINAL_RELEASE_DECISION = GO_FOR_STAGED_DEPLOYMENT_WITH_RUNTIME_GATE
