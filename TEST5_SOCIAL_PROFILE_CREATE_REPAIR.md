# YEYAMO — TEST 5 — Social / Feed / Profile / Create repair

Date: 2026-09-28  
Repositories: `yeyamo-mobile`, `yeyamo-api`

## 1. Executive summary

Les causes structurelles des auteurs génériques, des Stories invisibles, des états Like/Favori faux après refresh, des previews de profil absentes et du faux anneau Story ont été identifiées et corrigées. Les contrôles TypeScript, compilation Java et tests unitaires ciblés passent.

Ces changements ne constituent pas une validation sur appareil réel: la conversion HEIC, l'affichage de Story et le scénario A/B doivent encore être exécutés contre les services déployés. `READY_FOR_TEST6 = NO` tant que cette preuve runtime n'existe pas.

## 2. Runtime Test 5 evidence

Les preuves de Test 5 sont conservées: JPEG caméra fonctionnait, HEIC échouait, `POST /stories` pouvait retourner 201 sans Story lisible, et Feed utilisait « Utilisateur … ». Aucun de ces 201/200 n'est requalifié en validation runtime sans le protocole de la section 27.

## 3. Identity architecture

`content-service` persiste `post.authorId` et `story.authorId` avec le **subject JWT**. `user-service` utilise au contraire l'UUID `UserProfile.id` pour le follow et la navigation de profil. `feed-service` projetait seulement le subject. Le mobile appelait donc `fallbackUser(subject)` et produisait « Utilisateur XXX ».

`GET /api/v1/users/social/identities?authUserIds=…` est le pont canonique ajouté: il retourne, pour le viewer connecté, `profileId`, `authUserId`, `displayName`, `avatarUrl` et `isFollowing`. Aucune substitution par le compte courant n'est faite côté mobile.

## 4. Identity ID matrix

| Étape | ID | Type d'identité |
| --- | --- | --- |
| JWT subject | `auth.getName()` | subject d'authentification |
| `/auth/me` | `AuthUser.id` | ID auth numérique |
| `/users/me` | même sujet utilisé par profil | subject auth |
| `profile.id` | UUID `UserProfile.id` | identité sociale/navigation |
| POST author | subject JWT | auteur contenu |
| persisted post author | `PostEntity.authorId` | auteur contenu |
| Kafka event author | `payload.authorId` | auteur contenu |
| Feed projection author | `FeedPost.authorId` | auteur contenu |
| Feed DTO author | `authorId` + résolution `/users/social/identities` | contenu + profil social |
| Profile navigation ID | `profileId` | UUID profil |

## 5. Account switching

Les clés React Query Feed, Story, Post détail, Profile et Social incluent désormais le viewer. Le layout racine supprime les caches Feed, Story, Profile, Social, Post et Interaction lors d'une transition de session et émet `AUTH_SESSION_CHANGED`, `SOCIAL_CACHE_RESET`, `PROFILE_CACHE_RESET`, `FEED_VIEWER_RESET`, `INTERACTION_VIEWER_RESET` et `STORY_VIEWER_RESET`.

## 6. Feed author

Le mapper Feed utilise l'identité résolue par le backend; le nom affiché est `displayName`, jamais l'UUID technique. Le fallback ne reste utilisé que si le profil n'est pas renvoyé par l'API (profil supprimé/invisible ou échec réseau), ce qui est traçable par `hasAuthor: false` dans `FEED_ITEM_RESOLVED`.

## 7. Feed projection

La projection Feed conserve l'auteur subject et les compteurs globaux. Le mobile complète la lecture par `/interactions/posts/{id}/summary`, qui est la source existante des compteurs et de l'état propre au viewer (`likedByViewer`, `favoriteByViewer`). Ceci supprime l'ancien `is_liked: false` codé en dur.

## 8. Likes

`InteractionCommandService` persiste déjà le Like, publie l'événement et invalide son cache; la correction mobile relit l'état serveur après mutation. Le test de projection ajoute le cas: Like sur post 1, publication post 2, Like de post 1 toujours à 1.

## 9. Follow

La relation Follow est déjà persistée en base avec les UUID de profil. Le bug mobile provenait d'un `Set` local initialisé vide. Les Feed items reçoivent désormais `author_is_following` depuis la résolution viewer-aware et le bouton est réconcilié après Follow/Unfollow.

## 10. Comments

Le bouton ouvre la BottomSheet existante avec liste et `CommentInput`. Les appels utilisent le contrat existant `/interactions/posts/{id}/comments`. Après création, le détail et le Feed actif sont invalidés/refetchés; aucune API parallèle n'a été ajoutée.

## 11. Stories

Cause prouvée: `content-service` appelait user-service sans Bearer, demandait des UUID de profil alors que les Stories sont indexées par subject auth, et excluait la Story du viewer lorsque sa liste following était vide. Il transmet désormais le Bearer, récupère les subjects suivis via `/following/content-author-ids`, et inclut toujours le subject du viewer.

## 12. Story ring

Le ring est construit uniquement à partir de `groupActiveStories`, qui filtre les Stories expirées. Le profil personnel compare le subject retenu dans la Story avec l'utilisateur connecté; le profil public compare son UUID de profil. Le cercle bleu auparavant affiché sans preuve de Story a été retiré.

## 13. Profile architecture

`/posts/me` reste le contrat source. Le client résout les `mediaIds` via l'endpoint réel `/media/{id}` pour obtenir les URLs de lecture/thumbnail, sans fabriquer d'URL de placeholder.

## 14. Profile posts count/list

Le compteur et la grille utilisent tous deux `/posts/me`, via `getProfileStats()` et `getUserPublications()`, avec la même identité connectée et une clé de cache viewer-scoped. La publication invalide Feed, publications et stats du profil.

## 15. Profile media previews

La grille personnelle ne rend plus « Publication média » pour un média existant: le premier média résolu est affiché; vidéo et carrousel conservent leur indicateur; un vrai post texte reçoit seulement le fallback texte.

## 16. Profile TikTok-style grid

`PublicationGrid` et `MediaGrid` calculent `availableWidth / 3` avec `useWindowDimensions`; aucune centrage de dernière ligne n'est appliqué. Le profil personnel utilise désormais `PublicationGrid` au lieu de la grille de placeholders locale.

## 17. Media HEIC/HEIF

`expo-image-manipulator` (compatible Expo SDK 57) a été ajouté. Les MIME/extensions HEIC/HEIF sont détectés; `manipulateAsync(..., SaveFormat.JPEG)` crée une nouvelle URI JPEG avant `FormData`. La normalisation partagée couvre publication, Story, suggestion de lieu, sorties avec cover, profil et flux partenaire. Le fichier n'est plus seulement renommé.

## 18. Create regression

Les flux JPEG existants sont conservés. Seul `toMediaFormData` est devenu asynchrone pour normaliser les HEIC avant upload; chacun de ses appelants est attendu avant la mutation. Aucune logique métier Create n'a été réécrite.

## 19. Cache/query invalidation

| Mutation | État local | Source finale |
| --- | --- | --- |
| Like | optimiste, rollback sur erreur | invalidation Feed + refetch summary serveur |
| Follow | optimiste, rollback sur erreur | invalidation Social/Feed + identité résolue |
| Comment | aucun faux succès | refetch détail + invalidation Feed |
| Post publish | aucun | invalidation Feed, Profile publications, Profile stats |
| Story create | ajout ciblé puis invalidation Story | endpoint active stories |

## 20. Backend event propagation

`interaction.like.*` est persisté puis consommé par Feed; `content.post.*` conserve la projection; le nouveau test vérifie que l'arrivée d'un second post ne réinitialise pas les métriques du premier. Les Stories sont lues directement depuis content-service et ne créent pas artificiellement une projection Feed.

## 21. Observability

Canaux DEV: `YEYAMO_SOCIAL_TRACE`, `YEYAMO_PROFILE_TRACE`, `YEYAMO_FEED_TRACE`, `YEYAMO_INTERACTION_TRACE`, `YEYAMO_STORY_TRACE`, `YEYAMO_MEDIA_TRACE`. Ils ne journalisent ni JWT, ni cookies, ni email, ni URI locale complète, ni contenu de commentaire.

Les événements backend ajoutés sont `STORY_CREATED`, `STORY_ACTIVE_RESOLVED`, `FOLLOW_PERSISTED`, `FOLLOW_REMOVED`, `LIKE_PERSISTED`, `LIKE_REMOVED`, `COMMENT_PERSISTED`, `FEED_POST_PROJECTED` et `FEED_INTERACTION_PROJECTED`, avec correlation ID lorsque disponible.

## 22. Files modified

### Mobile

`package.json`, `package-lock.json`; `src/app/_layout.tsx`; `src/app/(tabs)/profile.tsx`; `src/app/(profile)/[username].tsx`, `edit-profile.tsx`; `src/app/(post)/[id].tsx`, `[id]/comments.tsx`; `src/app/(story)/[id].tsx`; `src/app/(create)/event-review.tsx`, `publication.tsx`, `story.tsx`, `suggest-place-review.tsx`; `src/app/(partner)/publication.tsx`, `add-event-step4.tsx`; `src/components/feed/VerticalFeedItem.tsx`, `VerticalFeedList.tsx`, `VideoCard.tsx`; `src/components/profile/MediaGrid.tsx`, `PublicationGrid.tsx`; `src/components/story/StoriesList.tsx`; `src/features/feed/feed.api.ts`, `types.ts`, `useFeed.ts`; `src/features/media/media.api.ts`, `media.utils.ts`; `src/features/post/post.api.ts`, `post.service.ts`, `usePost.ts`; `src/features/profile/profile.api.ts`, `types.ts`, `useProfile.ts`; `src/features/social/social.api.ts`, `social.runtime-trace.ts`, `useSocial.ts`; `src/features/story/story.api.ts`, `types.ts`, `useStory.ts`.

### API

`user-service`: `SocialGraphService`, `SocialGraphController`, `UserProfileRepository`, `JpaUserProfileRepositoryAdapter`, `SpringDataUserProfileRepository`, `FeedAuthorIdentityResponse`, `SocialGraphAlignmentTest`.

`content-service`: `StoryService`, `UserServiceClient`, `StoryController`, `StoryServiceTest`.

`interaction-service`: `InteractionCommandService`.

`feed-service`: `FeedEventConsumer`, `FeedProjectionCommandServiceTests`.

## 23. Backend tests

- `mvn -pl user-service,content-service -am -Dtest=SocialGraphAlignmentTest,StoryServiceTest test`: PASS — 3 + 13 tests.
- `mvn -pl interaction-service,feed-service -am -Dtest=InteractionCommandServiceTest,FeedProjectionCommandServiceTests,FeedEventConsumerTests test`: PASS — 4 + 2 + 7 tests.
- Compilation des services user/content/interaction/feed: PASS.

## 24. Mobile tests

- `npx tsc --noEmit`: PASS.
- `npx eslint --no-cache src`: PASS, 0 erreur. Une alerte préexistante hors périmètre demeure dans `src/features/partner-dashboard/partner.api.ts` (syntaxe `Array<T>`).
- `npm run lint`: non concluant à cause d'un verrou EPERM du cache `.expo/cache/eslint`; aucun défaut de code n'a été signalé. La variante sans cache est le contrôle retenu.

## 25. Integration tests

Pas exécutés contre `https://api.yeyamo.com` ni sur appareil iOS dans cet environnement. Statut: `BLOCKED` par absence de sessions A/B et d'appareil réel; ce n'est pas un succès runtime implicite.

## 26. Deployment requirements

Déployer `user-service`, `content-service`, `interaction-service` et `feed-service`, puis reconstruire le client mobile (nouveau module natif Expo ImageManipulator). Aucune migration de base ni modification de cloud-config n'est requise.

## 27. Test 6 exact procedure

1. Créer A et B, avec profil social actif pour chacun.
2. A: créer deux posts JPEG et une Story JPEG. Vérifier `GET /stories` contient la Story et le ring A ouvre le viewer.
3. B: suivre A, liker et commenter le premier post A. Rafraîchir, redémarrer, puis créer un post A: état Like/Follow/commentaire doit rester cohérent.
4. Se déconnecter B, connecter A: vérifier absence de fuite `viewerLiked`/`isFollowing`.
5. A: publier une vraie image HEIC depuis galerie iOS. Vérifier traces `MEDIA_SOURCE_DETECTED`, `MEDIA_CONVERSION_SUCCESS`, `MEDIA_UPLOAD_RESPONSE`; Feed et profil affichent la miniature.
6. Vérifier trois posts A: grille `[A1][A2][A3]` en trois colonnes, miniatures réelles, tap ouvre le bon post.
7. Capturer les traces mobile et logs backend avec les correlation IDs, sans données sensibles.

## 28. Remaining blockers

- La conversion HEIC réelle requiert une preuve sur appareil iOS avec une image HEIC réelle.
- La lecture Story, le ring et le viewer exigent une preuve contre les quatre services déployés.
- La résolution Feed par item fait actuellement des lectures `summary` par post; une API batch peut être étudiée après Test 6 si la télémétrie montre une latence réelle.

## 29. Messaging next audit

`MESSAGING = OUT_OF_SCOPE_NEXT_AUDIT`.

## 30. Final verdict

| Feature | Write | Persistence | Read | Refresh | Restart | UI | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Publication JPEG | UNIT_TESTED | UNIT_TESTED | STATICALLY_FIXED | STATICALLY_FIXED | NOT_APPLICABLE | STATICALLY_FIXED | RUNTIME_EVIDENCE_AVAILABLE |
| Publication HEIC | STATICALLY_FIXED | BLOCKED | BLOCKED | BLOCKED | BLOCKED | STATICALLY_FIXED | STILL_BROKEN until iOS proof |
| Story | UNIT_TESTED | UNIT_TESTED | UNIT_TESTED | STATICALLY_FIXED | BLOCKED | STATICALLY_FIXED | RUNTIME_EVIDENCE_AVAILABLE |
| Like | UNIT_TESTED | UNIT_TESTED | UNIT_TESTED | STATICALLY_FIXED | BLOCKED | STATICALLY_FIXED | UNIT_TESTED |
| Follow | UNIT_TESTED | UNIT_TESTED | STATICALLY_FIXED | STATICALLY_FIXED | BLOCKED | STATICALLY_FIXED | UNIT_TESTED |
| Comment | UNIT_TESTED | UNIT_TESTED | STATICALLY_FIXED | STATICALLY_FIXED | BLOCKED | STATICALLY_FIXED | UNIT_TESTED |
| Profile posts | STATICALLY_FIXED | existing | STATICALLY_FIXED | STATICALLY_FIXED | BLOCKED | STATICALLY_FIXED | UNIT_TESTED |
| Story ring | existing | existing | UNIT_TESTED | STATICALLY_FIXED | BLOCKED | STATICALLY_FIXED | RUNTIME_EVIDENCE_AVAILABLE |

| Feature | Mobile trace | Backend trace | Correlation ID | Tested |
| --- | --- | --- | --- | --- |
| Post | `YEYAMO_MEDIA_TRACE` | Feed projection | yes where supplied | unit/static |
| Story | `YEYAMO_STORY_TRACE` | `STORY_*` | yes | unit/static |
| Like | `YEYAMO_INTERACTION_TRACE` | `LIKE_*`, Feed | yes | unit |
| Follow | `YEYAMO_SOCIAL_TRACE` | `FOLLOW_*` | yes | unit/static |
| Comment | `YEYAMO_INTERACTION_TRACE` | `COMMENT_PERSISTED` | yes | unit/static |
| Profile | `YEYAMO_PROFILE_TRACE` | identity resolver | request correlation | static |
| Feed | `YEYAMO_FEED_TRACE` | `FEED_*` | yes | unit/static |
| HEIC | `YEYAMO_MEDIA_TRACE` | media-service existing logs | request correlation | static |

IDENTITY_ROOT_CAUSE = ROOT_CAUSE_PROVEN — subject auth et UUID profil étaient confondus; le bridge backend est ajouté.
FEED_AUTHOR = STATICALLY_FIXED
ACCOUNT_SWITCH_ISOLATION = STATICALLY_FIXED

FEED_PROJECTION = UNIT_TESTED

LIKE_PERSISTENCE = UNIT_TESTED
LIKE_AFTER_REFETCH = STATICALLY_FIXED
LIKE_AFTER_NEW_POST = UNIT_TESTED

FOLLOW_PERSISTENCE = UNIT_TESTED
FOLLOW_AFTER_REFETCH = STATICALLY_FIXED

COMMENTS_UI = STATICALLY_FIXED
COMMENTS_PERSISTENCE = UNIT_TESTED

STORY_CREATE = UNIT_TESTED
STORY_READ = UNIT_TESTED
STORY_ACTIVE_STATE = UNIT_TESTED
STORY_RING = STATICALLY_FIXED
STORY_VIEWER = STATICALLY_FIXED

PROFILE_IDENTITY = STATICALLY_FIXED
PROFILE_POST_COUNT = STATICALLY_FIXED
PROFILE_POST_LIST = STATICALLY_FIXED
PROFILE_MEDIA_PREVIEW = STATICALLY_FIXED
PROFILE_GRID_3_COLUMNS = STATICALLY_FIXED
PROFILE_REFRESH_AFTER_PUBLISH = STATICALLY_FIXED

HEIC_ROOT_CAUSE = ROOT_CAUSE_PROVEN
HEIC_CONVERSION = STATICALLY_FIXED
HEIC_UPLOAD = BLOCKED_BY_REAL_IOS_RUNTIME_TEST

PUBLICATION_JPEG = RUNTIME_EVIDENCE_AVAILABLE
PUBLICATION_HEIC = BLOCKED_BY_REAL_IOS_RUNTIME_TEST
PLACE_SUGGESTION_MEDIA = STATICALLY_FIXED

CREATE_REGRESSION = UNIT_TESTED

OBSERVABILITY_SOCIAL = STATICALLY_FIXED
OBSERVABILITY_PROFILE = STATICALLY_FIXED
OBSERVABILITY_INTERACTIONS = STATICALLY_FIXED
OBSERVABILITY_STORY = STATICALLY_FIXED

MESSAGING =
OUT_OF_SCOPE_NEXT_AUDIT

MOBILE_REBUILD =
YES

API_REDEPLOY =
YES

CONFIG_REDEPLOY =
NO

DATABASE_MIGRATION_REQUIRED =
NO

SERVICES_TO_REDEPLOY =
user-service, content-service, interaction-service, feed-service

READY_FOR_TEST6 =
NO
