# YEYAMO — TEST 6 — FINAL RELEASE GATE

Date : 2026-10-01  
Périmètre audité : `yeyamo-mobile`, `yeyamo-api`, `cloud-conf-yeyamo`  
Déploiement : **non exécuté**

## 1. Executive verdict

Les contrats mobile/backend, les tests ciblés et les migrations additives sont cohérents. Deux corrections de consolidation ont été appliquées pendant ce gate : une seule source de vérité pour le reset de compte React Query, et une clé de cache utilisateur pour « Mes suggestions de lieux ». Les fallbacks PostgreSQL de la configuration ont aussi été alignés sur les bases réellement créées par la composition de production.

Le gate statique est vert, mais la décision de mise en production reste **NO** à cet instant : les modifications de configuration doivent d'abord être publiées dans le dépôt de configuration puis servies par Config Server, et Expo signale 12 versions SDK à aligner. Les tests de périphériques et de production du Test 6H restent obligatoires.

## 2. Consolidated change matrix

| Domaine | Mobile | Service backend | Configuration / migration | Kafka | Déploiement requis |
|---|---|---|---|---|---|
| Feed | `feed.api`, `useFeed`, `feed.identity`, `VerticalFeedList`, onglet Feed | `feed-service` | `feed-service.properties` DB corrigée | `content.events`, `interaction.events`, `user.events` | mobile, feed-service, config |
| Social | `social.api`, `useSocial` | `user-service` | `user-service.properties` DB corrigée | `user.events` | mobile, user-service, config |
| Commentaires | écran commentaires, `feed.api` | `interaction-service` | `interaction-service.properties` DB corrigée | `interaction.events` | mobile, interaction-service, config |
| Profil | profil, menu, hooks profile | `user-service`, `content-service` | user config corrigée | — | mobile, user-service, config |
| Messagerie | `chat.api`, `useChat`, écrans chat | `messaging-service` | `messaging-service.properties`; V2 | `event.events`, `messaging.events` | mobile, messaging-service, config |
| Story | `story.api`, `useStory`, viewer | `content-service` | `content-service.properties`; V8 | `content.events` | mobile, content-service, config |
| Média | `media.api`, `media.utils`, client Axios | `media-service` (contrat inchangé) | R2 existant | — | mobile uniquement; media-service non requis par ce pass |
| Suggestion de lieu | review, suivi de suggestions | `place-service` | `place-service.properties` DB corrigée | `place.events` | mobile, place-service, config |
| Sortie | review sortie, `events.api` | `event-service` | `event-service.properties`; V10 | `event.events` | mobile, event-service, config |
| Groupe de sortie | aucun écran de groupe ajouté | `messaging-service` | V2 | `event.events` | messaging-service, config |
| Distribution Feed | — | event → content → feed | V7/V9 existantes, V10 compatible | `event.events` → `content.events` | event, content, feed |
| Distribution Story | viewer conserve la référence | event → content | V7/V8 | `event.events` → `content.events` | event, content |

## 3. Cross-pass regression audit

- Feed, Profile, Messaging et Story distinguent toujours le sujet JWT de l'UUID de profil.
- Le clic sur l'auteur d'un post propre passe par `resolveFeedAuthorNavigation` et ouvre `/(tabs)/profile`.
- Les Stories ne sont pas rendues dans l'onglet Feed; elles restent dans `MessageStories` de l'onglet Messages et comme indicateur de profil.
- Le cache Story conserve l'enveloppe `{ data: Story[] }` pour les écritures React Query.
- Le reset de session est maintenant centralisé dans l'effet de changement d'identité du layout racine; le handler 401 ne duplique plus le reset Messaging.
- Les suggestions privées de lieux sont maintenant indexées par sujet authentifié et supprimées au changement de compte.

## 4. Final identity contract

| Champ / usage | Namespace canonique | Règle vérifiée |
|---|---|---|
| `AuthUser.id`, JWT `sub` | `AUTH_ID` texte | identité de session et `Authentication#getName()` |
| `UserProfile.id` | `PROFILE_UUID` | profil social, follow et route de profil public |
| `Post.authorId` | `AUTH_ID` | résolu via `/users/social/identities` avant affichage |
| `Story.authorId` | `AUTH_ID` | conservé dans `author_auth_user_id`; `author.id` reste le profil |
| `Message.senderId` | `AUTH_ID` | résolu en batch pour l'affichage |
| `ConversationMember.userId` | `AUTH_ID` | création Direct et membres de groupe |
| Follow target | `PROFILE_UUID` | jamais l'`AUTH_ID` du post |
| Route profil public | `PROFILE_UUID` | le nom de fichier `[username]` est historique; le Feed lui passe l'UUID |
| `Event.ownerUserId` / sortie | `AUTH_ID` | organisateur et propriétaire de l'idempotence |
| Groupe de sortie | `AUTH_ID` | groupe owner-only initial, lien durable vers l'outing |

Aucune comparaison fonctionnelle `authId === profileId` n'a été retenue : la décision de propriété Feed compare séparément les deux espaces et n'ouvre le profil public que pour une identité résolue tierce.

## 5. Feed status

`Pour vous` et `Abonnements` utilisent `GET /feed?...&audience=FOR_YOU|FOLLOWING`. Le backend reçoit l'enum `FeedAudience`; `FOLLOWING` résout les auteurs suivis depuis user-service côté serveur. Il ne s'agit donc pas d'un filtrage client simulé. Les tests `FeedQueryServiceTests` et `FeedGatewayContractTest` passent.

## 6. Comments status

Le bouton Feed ouvre le panneau dédié, qui charge `GET /interactions/posts/{id}/comments`, crée un commentaire ou une réponse via le même contrat `parentId`, rafraîchit le détail et invalide les pages Feed actives. Les réactions de commentaire utilisent les endpoints de like/unlike et la valeur retournée par le serveur. Tests Interaction : 10/10.

## 7. Profile status

Le profil propriétaire utilise une seule query `/posts/me` pour sa grille et son décompte; les statistiques sociales ne déclenchent plus de second appel `/posts/me`. La grille utilise les médias réels, les onglets restent visibles quand ils sont vides. Reposts reste volontairement un état vide : aucun modèle persistant de repost n'est exposé par le backend.

## 8. Messaging status

Les conversations et messages utilisent des `AUTH_ID`, résolvent les profils par lot, créent les Directs avec le destinataire `AUTH_ID`, envoient explicitement `TEXT`, conservent `replyToMessageId`, réconcilient seulement après réponse serveur et utilisent des clés incluant le lecteur. Les tests Messaging, réponse, partner et groupe de sortie passent : 28/28.

## 9. Story status

`POST /stories` conserve une clé d'idempotence pour une tentative de soumission. Le backend associe `(author_id, idempotency_key)` à une seule Story. Le cache React Query est toujours une enveloppe `{ data: Story[] }`; les opérations `.some` et `.map` visent `response.data`. Les Stories actives restent visibles dans Messages et le viewer.

Les champs backend `referenceType` et `referenceId` sont maintenant conservés dans le type/mapping mobile (`reference_type`, `reference_id`). Le viewer ne fournit pas encore de navigation vers une sortie depuis cette référence : c'est documenté, sans comportement fictif.

## 10. Media status

Le transport canonique est `toMediaFormData` → `uploadMediaFormData` → client Axios. Il supprime le header JSON pour `FormData` sans forcer `Content-Type: multipart/form-data`, afin que React Native produise la boundary. Publication, Story, suggestion de lieu, sortie, profil et partenaires passent par cette chaîne ou son adaptateur `postApi.uploadMedia`.

Inventaire : `media.utils.ts` et `media.api.ts` sont canoniques; `postApi.uploadMedia` est un adaptateur utilisé; les écrans Create/Partner/Profile sont des appelants; `multipart.test.mts` est un test. Aucun autre créateur de `FormData` ni header multipart manuel n'a été trouvé.

## 11. Place Suggestion status

La création reste sur le contrat place-service existant. Les médias sont envoyés par le transport commun, l'état est lu depuis le serveur, et les suggestions de l'utilisateur sont désormais isolées par `AUTH_ID` dans React Query. Tests pays, contrat création et suggestion : 7/7.

## 12. Outing status

Une sortie publique créée par le flux mobile est publiée, idempotente via V10, puis émet `event.published`. Content crée au plus une projection Feed et une Story selon les flags. Messaging crée au plus un groupe owner-only lié durablement à l'outing. Les tests Event/contrat/outbox : 17/17; Content distribution : 28/28.

## 13. Query-key audit

| Famille | Clé canonique / portée |
|---|---|
| Feed | `['feed', mode, AUTH_ID, audience, ...]` |
| Détail post / commentaires | `['post', mode, AUTH_ID, postId]`; `['interactions']` est purgé à la bascule |
| Profil / posts / likes | `['profile', mode, AUTH_ID, resource]` |
| Profil public | `['profile', mode, viewerAuthId, 'public-posts', profileUuid]` |
| Social | `['social', mode, resource, AUTH_ID]` |
| Stories | `['stories', mode, AUTH_ID]`; détail `['story', mode, AUTH_ID, id]` |
| Inbox / historique | `['messaging', mode, AUTH_ID, 'conversations']` et `['messaging', mode, AUTH_ID, 'conversation', id, 'messages']` |
| Suggestions de lieux propres | `['place-suggestions', 'mine', AUTH_ID]` |
| Événements | `['events', mode, 'upcoming'|'id']`; contenu public/partagé |

Les invalidations Feed, Story, Profil et Messaging correspondent à ces préfixes. Le préfixe Suggestions de lieux a été corrigé dans ce gate.

## 14. Account-switch audit

Un unique effet RootLayout détecte le changement de `AUTH_ID`, supprime Feed, Stories, Profile, Social, Post, Interactions, Suggestions privées et Messaging, puis vide le store de chat. Une seconde déconnexion concurrente a été retirée. À l'authentification, seules les queries Feed/Story sont invalidées pour le nouveau lecteur. Un logout → login B ne peut plus relire les données de A depuis ces caches.

## 15. Mobile dependency/build audit

`expo-image-manipulator` est présent dans `package.json` et `package-lock.json` à `~57.0.20`; il est utilisé pour la normalisation HEIC/JPEG. Il ne demande pas de plugin Expo explicite. Les changements de code TypeScript nécessitent une mise à jour JS.

Impossible de prouver localement la provenance du binaire installé sur les téléphones. Un binaire construit avant l'ajout du module natif doit être reconstruit; un binaire Expo SDK 57 incluant déjà ce module compatible peut recevoir le bundle JS.

## 16. Expo dependency check

`npx expo install --check` a été exécuté. Il ne signale pas `expo-image-manipulator`, mais recommande 12 mises à niveau compatibles SDK 57 : `expo` et 11 modules (`asset`, `auth-session`, `camera`, `constants`, `image-picker`, `linking`, `location`, `navigation-bar`, `notifications`, `router`, `video`). Aucune mise à niveau automatique n'a été effectuée. C'est un avertissement de release à résoudre dans un pass de dépendances contrôlé ou à accepter explicitement après test sur les binaires ciblés.

## 17. Backend compile

Les modules testés ont tous compilé avant l'exécution de leurs suites : user, interaction, feed, content, event, messaging, place et api-gateway. Aucun nouveau échec de compilation n'a été observé.

## 18. Backend combined tests

| Module | Commande / couverture | Résultat |
|---|---|---|
| user-service | `mvn -pl user-service test` | 22/22 |
| interaction-service | command/query/comment-like/generic | 10/10 |
| feed-service | query/projection/consumer/robustness | 14/14 |
| content-service | post/story/distribution/consumer | 28/28 |
| event-service | outing/idempotence/contrat/outbox | 17/17 |
| messaging-service | send/reply/direct/partner/group | 28/28 |
| place-service | pays/création/suggestion | 7/7 |
| api-gateway | mobile/feed contracts | 4/4 |

La suite Feed complète a produit 35 rapports Surefire sans échec mais le processus Maven a dépassé le délai de fermeture de l'environnement. La suite ciblée de 14 tests, incluant les contrats Test 6, a ensuite terminé avec `BUILD SUCCESS`.

## 19. Migration inventory

| Service | Base PostgreSQL | Migration | But | Ordre | Présente en production |
|---|---|---|---|---|---|
| content-service | `yeyamo_content` | V8 | idempotence Story `(author,key)` | après V7 | à vérifier avant déploiement |
| event-service | `yeyamo_event` | V10 | idempotence sortie `(owner,key)` | après V9 | à vérifier avant déploiement |
| messaging-service | `yeyamo_messaging` | V2 | lien durable outing → conversation | après V1 | à vérifier avant déploiement |

Les migrations Feed/User/Interaction/Place antérieures restent dans leurs services respectifs et ne sont pas modifiées par ce pass.

## 20. Flyway safety

Les noms V8/V10/V2 sont valides et leurs versions sont strictement après celles existantes dans chaque service. Elles sont additives, forward-only et ne modifient ni statuts historiques ni conversations Direct existantes. Aucune migration déjà appliquée n'a été éditée. Flyway est activé et JPA est en `validate` dans les trois services concernés.

## 21. Kafka contract matrix

| Topic | Producteur | Type | Consommateur | But |
|---|---|---|---|---|
| `event.events` | event-service outbox | `event.published` | content-service, messaging-service | distribution sociale et groupe de sortie |
| `content.events` | content-service outbox | `content.post.published`, `content.story.created`, résultats | feed-service, event-service | projection Feed et retour de statut |
| `interaction.events` | interaction-service outbox | likes/commentaires | feed-service | compteurs/projections Feed |
| `user.events` | user-service | identité/social | feed-service | règles audience/sociales |
| `messaging.events` | messaging-service | messages/groupe créé | clients/consommateurs concernés | temps réel Messaging |

## 22. Config audit

`EVENT_EVENTS_TOPIC` est défini comme `yeyamo.kafka.topics.event-events=${EVENT_EVENTS_TOPIC:event.events}` dans Messaging et correspond exactement à l'annotation `@KafkaListener`; Event et Content utilisent le même nom.

Les fallbacks DB ont été corrigés contre `POSTGRES_MULTIPLE_DATABASES` de `docker-compose.yml` : `yeyamo_user`, `yeyamo_content`, `yeyamo_interaction`, `yeyamo_feed`, `yeyamo_messaging`, `yeyamo_event`, `yeyamo_place`, tous via `postgres:5432` et surchargeables par `SPRING_DATASOURCE_URL`.

Config Server prod utilise Git (`CONFIG_GIT_URI`, branche `CONFIG_GIT_BRANCH`) avec `clone-on-start` et `force-pull`. Une nouvelle révision de configuration exige donc publication de `cloud-conf-yeyamo`, puis redémarrage/refresh contrôlé de Config Server et des clients concernés; aucun refresh automatique n'est déduit du code.

## 23. Gateway/security audit

Les prédicats Gateway existants couvrent `/api/v1/users/**`, `/feed`, `/interactions/**`, `/posts/**`, `/stories/**`, `/media/**`, `/place-suggestions/**`, `/events/**` et `/messaging/**`. Aucun routage dupliqué n'est requis. Les tests `MobileIntegrationContractTest` et `FeedGatewayContractTest` passent.

`/users/social/identities`, Messaging, Story création, uploads Media, Place Suggestions et mutations Event restent authentifiés. Les lectures publiques explicitement prévues (par exemple certains Events et médias) le restent; aucune mutation n'a été rendue publique.

## 24. Performance findings

`VerticalFeedList` possède un `renderItem` et un `keyExtractor` stables, mémorise la résolution des profils suivis et n'introduit pas de nouvelle requête par rendu. Le signal `VirtualizedList` reste **NON_BLOCKING** : aucun profilage appareil n'a été fait et aucune réarchitecture Feed n'a été introduite. Les métadonnées média sont déjà chargées par batch quand disponible, avec fallback de compatibilité.

## 25. Deployment dependency graph

```text
cloud-conf-yeyamo (Git revision)
        ↓
config-server
        ↓
PostgreSQL backup → Flyway (content V8, event V10, messaging V2)
        ↓
user-service / interaction-service / place-service / feed-service
        ↓
content-service ← event-service → messaging-service
        ↓
mobile JS update (et binaire conditionnel)
```

`event-service` ne doit pas publier `event.published` avant que le nouveau consumer Messaging et Content, avec leurs schémas, soient disponibles.

## 26. Zero-downtime compatibility

Les trois schémas ajoutés sont compatibles avec les anciennes applications : les anciennes versions ignorent les nouvelles tables. Les envelopes Kafka sont versionnées (`eventVersion=1`) et les consommateurs ne lisent que les champs nécessaires; les champs supplémentaires sont tolérés.

Pour éviter de perdre le groupe automatique durant une fenêtre mixte, démarrer Content et Messaging avant Event. Les anciens consommateurs ignorent les champs inconnus. Conserver les tables additives lors d'un rollback applicatif.

## 27. Production backup requirements

**Oui.** Avant Flyway, réaliser un snapshot PostgreSQL ou un dump cohérent des bases : `yeyamo_content`, `yeyamo_event`, `yeyamo_messaging`, ainsi que `yeyamo_user`, `yeyamo_interaction`, `yeyamo_feed` et `yeyamo_place` car leurs URLs de configuration changent. La topologie source est un Postgres partagé avec bases logiques séparées, non des schémas partagés.

## 28. Rollback strategy

Ne pas supprimer les tables V8/V10/V2. En cas d'incident, restaurer l'image applicative précédente seulement après avoir vérifié sa compatibilité avec les tables additives; elle est attendue ici. Désactiver temporairement le trafic de création de sortie/Story si nécessaire, surveiller les outboxes et corriger par nouvelle migration, jamais par modification d'une migration appliquée. Revenir à une version de configuration précédente est possible uniquement après confirmation des URLs et de la sauvegarde.

## 29. Environment/config requirements

Sans exposer de secret, vérifier la présence de : `CONFIG_GIT_URI`, `CONFIG_GIT_BRANCH`, `CONFIG_SERVER_USERNAME`, `CONFIG_SERVER_PASSWORD`, `SPRING_DATASOURCE_URL` (surcharge optionnelle), `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `KAFKA_BOOTSTRAP_SERVERS`, `EVENT_EVENTS_TOPIC`, `CONTENT_EVENTS_TOPIC`, `MESSAGING_EVENTS_TOPIC`, `JWT_SECRET`, `INTERNAL_SERVICE_TOKEN`, `MEDIA_SERVICE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_BUCKET_NAME`, `R2_PRIVATE_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`, et les clés Maps/Google/Apple déjà requises par mobile.

## 30. Dokploy deployment scope

Noms exacts dérivés de `docker-compose.production.yml` :

- Configuration : `config-server` (nouvelle révision Git de `cloud-conf-yeyamo`).
- Services applicatifs Test 6 : `user-service`, `interaction-service`, `feed-service`, `place-service`, `content-service`, `messaging-service`, `event-service`.
- Distribution mobile : artefact/bundle `yeyamo-mobile`.
- Pas de redéploiement requis par ce pass : `api-gateway` (routes déjà présentes, tests passants), `media-service` (aucune modification serveur), `country-config-service`, `auth-service` et les autres services non listés.

## 31. Final deployment manifest

```text
DEPLOYMENT_MANIFEST
CONFIG:
- cloud-conf-yeyamo revision containing EVENT_EVENTS_TOPIC and aligned datasource fallbacks
- config-server reload/restart against that revision

MIGRATIONS:
- content-service: V8__add_story_create_idempotency.sql
- event-service: V10__add_event_create_idempotency.sql
- messaging-service: V2__add_outing_group_links.sql

BACKEND:
1. user-service
2. interaction-service
3. feed-service
4. place-service
5. content-service
6. messaging-service
7. event-service

MOBILE:
- JS bundle/update: required
- native binary: conditional on installed binary containing Expo SDK 57 expo-image-manipulator

NO_DEPLOY:
- api-gateway, media-service, country-config-service, auth-service and unrelated services
```

## 32. Exact deployment order

1. **PostgreSQL snapshot** — prerequisite de toute migration. Validation : backup restaurable; rollback point : arrêt avant migration.
2. **Publier la révision cloud-conf-yeyamo** — Config Server ne lit que le dépôt Git configuré. Validation : endpoint Config Server retourne les URLs et `EVENT_EVENTS_TOPIC`; rollback : révision Git précédente.
3. **Redémarrer/refresh `config-server`** — `clone-on-start` charge la révision. Validation : health readiness UP et configuration résolue; rollback : image/config précédente.
4. **Déployer `user-service`, `interaction-service`, `feed-service`, `place-service`** — consommation de configuration DB corrigée. Validation : health UP, connexion DB, Flyway sans erreur; rollback : image précédente, schéma conservé.
5. **Déployer `content-service` puis `messaging-service`** — V8/V2 et consumers prêts avant publication d'events. Validation : V8/V2 appliquées, pas de boucle de désérialisation Kafka; rollback : image précédente, tables conservées.
6. **Déployer `event-service`** — V10 et émission `event.published` seulement après les consumers. Validation : V10 appliquée, outbox envoi réussi; rollback : image précédente, table conservée.
7. **Déployer le bundle mobile**, puis le binaire si la condition native est remplie. Validation : version/bundle attendue et Test 6H; rollback : bundle ou build précédent compatible.

## 33. Health-check protocol

Avant les tests fonctionnels, vérifier pour chaque service déployé : conteneur healthy, `/actuator/health/readiness` UP, aucune erreur Flyway (`Validate failed`, `Migration checksum mismatch`), aucune boucle Kafka (`Unsupported event version`, `Unexpected producer`, désérialisation répétée), aucune boucle de restart, et connexion Postgres valide.

Dans les logs, rechercher positivement `OUTING_CREATED`, `OUTING_FEED_PROJECTED`, `OUTING_STORY_CREATED`, `OUTING_GROUP_CREATED`, `STORY_CREATED`, `STORY_CREATE_IDEMPOTENT_REPLAY` et `FEED_POST_PROJECTED`; rechercher négativement `OUTING_*_DISTRIBUTION_FAILED` et les outboxes avec `last_error` non nul.

## 34. Post-deployment Test 6H

1. Se connecter avec A, vérifier `/users/me` puis `/users/social/identities`.
2. Depuis Feed, toucher son post : profil propre; toucher un post tiers : profil public. Vérifier `Pour vous`/`Abonnements` et absence de Story strip.
3. Créer commentaire, réponse, like puis unlike; rafraîchir Feed et panneau.
4. Avec un compte ayant six posts, vérifier compte=6, grille=6, trois colonnes, miniatures et menu plein écran.
5. Entre A/B, vérifier nom, Direct, message `TEXT`, réponse, lecture/non-lu, refresh/restart, safe area iPhone.
6. Créer une Story JPEG, puis PNG puis HEIC réel : une seule Story, Messages, viewer et traces `YEYAMO_STORY_TRACE`/`YEYAMO_MEDIA_TRACE`.
7. Suggestion CM → Centre → Mfoundi → Yaoundé, média, statut `PENDING`, doublon.
8. Créer une sortie publique : exactement un Event, un groupe, un post Feed et une Story. Redémarrer/refetch puis vérifier absence de doublon.

Les canaux présents sont : `YEYAMO_FEED_TRACE`, `YEYAMO_PROFILE_TRACE`, `YEYAMO_SOCIAL_TRACE`, `YEYAMO_INTERACTION_TRACE`, `YEYAMO_STORY_TRACE`, `YEYAMO_MEDIA_TRACE`, `YEYAMO_MESSAGE_TRACE`, `YEYAMO_CREATE_TRACE`. Les traces inspectées enregistrent identifiants, états et compteurs, jamais token, URI locale, binaire ni légende complète.

## 35. Remaining blockers

1. Publier la configuration corrigée dans le dépôt Git servi par Config Server, puis appliquer l'ordre de déploiement.
2. Décider et traiter les 12 recommandations Expo avant release finale, ou les accepter explicitement après validation sur les binaires ciblés.
3. Déterminer si le binaire installé date d'avant `expo-image-manipulator`; dans ce cas, reconstruire iOS/Android.
4. Exécuter Test 6H réel : PNG, HEIC, Kafka production et safe area ne sont pas validés en production par ce gate.
5. La navigation du viewer Story vers la sortie référencée n'est pas encore implémentée, bien que la référence soit désormais conservée.

## 36. Final go/no-go

**NO-GO temporaire pour un déploiement production immédiat.** Le code et les tests ciblés sont prêts, mais les prérequis de configuration publiée, santé Expo et tests appareil/production doivent être levés. Après ces prérequis, le manifeste et l'ordre ci-dessus sont prêts à être appliqués sans redesign supplémentaire.

CROSS_PASS_REGRESSION =
PASS

IDENTITY_CONTRACT =
PASS

OWN_POST_PROFILE_ROUTING =
PASS

FEED_FOR_YOU_FOLLOWING =
PASS

FEED_STORY_STRIP_REMOVED =
PASS

COMMENTS_CREATE =
PASS

COMMENTS_REPLY =
PASS

COMMENTS_REACTION =
PASS

PROFILE_CANONICAL_QUERY =
PASS

PROFILE_GRID =
PASS

PROFILE_MENU_PAGE =
PASS

MESSAGING_IDENTITY =
PASS

MESSAGING_SEND =
PASS

MESSAGING_REPLY =
PASS

STORY_CACHE_SHAPE =
PASS

STORY_CREATE_READ =
PASS

STORY_IDEMPOTENCY =
PASS

MEDIA_SHARED_TRANSPORT =
PASS

MEDIA_PNG =
READY_FOR_RUNTIME_RETEST

MEDIA_HEIC =
READY_FOR_RUNTIME_RETEST

PLACE_SUGGESTION =
PASS

OUTING_CREATE =
PASS

OUTING_GROUP =
PASS

OUTING_FEED =
PASS

OUTING_STORY =
PASS

QUERY_KEY_AUDIT =
PASS

ACCOUNT_SWITCH_ISOLATION =
PASS

VIRTUALIZEDLIST =
NON_BLOCKING

EXPO_INSTALL_CHECK =
WARNING

MOBILE_NATIVE_REBUILD_REQUIRED =
CONDITIONAL

MOBILE_JS_BUNDLE_UPDATE_REQUIRED =
YES

DATABASE_MIGRATIONS =
content-service V8; event-service V10; messaging-service V2

CONFIG_DEPLOY =
YES — publish cloud-conf-yeyamo and refresh/restart config-server plus affected clients

BACKEND_DEPLOY =
user-service, interaction-service, feed-service, place-service, content-service, messaging-service, event-service

NO_DEPLOY =
api-gateway, media-service, country-config-service, auth-service and unrelated services

PRODUCTION_BACKUP_REQUIRED =
YES

ROLLBACK_PLAN =
READY

STATIC_TEST_GATE =
PASS

BACKEND_TEST_GATE =
PASS

DEPLOYMENT_MANIFEST =
READY

READY_FOR_PRODUCTION_DEPLOYMENT =
NO

READY_FOR_POST_DEPLOYMENT_TEST6H =
YES
