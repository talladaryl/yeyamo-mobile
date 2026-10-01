# YEYAMO — TEST 6 — Feed / commentaires / suivi / navigation

Date : 2026-10-01

## 1. Runtime evidence

Le test iOS fournit deux espaces d'identité pour le même compte : `authUserId=252` et le profil social `41155a66-2464-4710-8625-17011059335d`. Le Feed résolvait bien l'auteur de la publication, mais ses composants ne conservaient pas l'identifiant auth dans le modèle affiché. Ils naviguaient donc systématiquement vers une route de profil public.

Le même test prouve que `490606cf-83ec-490b-bb54-40cdf4282a66` est un UUID de profil valide pour Follow, tandis que `52` ne l'est pas. L'ancien composant utilisait indistinctement `post.author.id`, ce qui pouvait envoyer `52` à une route qui exige un UUID.

## 2. Root causes

- Navigation auteur : comparaison/route construite à partir d'un identifiant de présentation, sans pont auth subject ↔ UUID social.
- Auto-follow : le bouton était affiché sur une publication de l'utilisateur courant et pouvait envoyer son propre UUID social.
- Feed Abonnements : aucun contrat backend ne distinguait cette audience de la découverte.
- Commentaires : `BottomSheetTextInput` était rendu dans une feuille Gorhom ; la feuille n'offrait pas un compositeur iOS stable et visible avec le clavier.
- Performance : une page Feed effectuait un appel de résumé d'interactions et un appel de métadonnées média par carte.

## 3. Identity/navigation

`src/features/feed/feed.identity.ts` est l'unique helper de décision. Il compare exclusivement auth avec auth et profil avec profil ; il ne compare jamais `252` à un UUID.

- Publication courante : `router.push('/(tabs)/profile')`.
- Autre auteur résolu : `/(profile)/{profileUuid}`.
- Auteur non résolu : aucune route fictive ; le Feed explique que le profil est indisponible.

La trace DEV `[YEYAMO_FEED_TRACE] FEED_PROFILE_NAVIGATION` contient : `viewerAuthUserId`, `viewerProfileId`, `postAuthorAuthUserId`, `postAuthorProfileId`, `isOwnPost`, `destination`, `postId`.

## 4. Legacy author 52

Le code et les logs runtime existants prouvent que la publication garde `PostEntity.authorId=52` mais que le résolveur ne retournait aucune identité sociale. Le poste Docker local est arrêté et `psql` n'est pas présent ; aucune base locale n'est donc disponible pour prétendre prouver si le profil 52 est absent, supprimé ou privé.

Statut actuel : **DATA_GAP à classifier au premier retest déployé**. `user-service` écrit désormais `CONTENT_AUTHOR_IDENTITIES_RESOLVED` avec `missingAuthUserIds` et `notVisibleAuthUserIds`. Pour 52 :

- `missingAuthUserIds=[52]` : profil social absent ou migration manquante ;
- `notVisibleAuthUserIds=[52]` : profil existant mais non visible au viewer.

Le mobile affiche explicitement « Profil indisponible », ne fabrique aucun nom d'utilisateur, ne propose ni Follow ni navigation publique pour cet auteur.

## 5. Self-follow

Le backend interdisait déjà le self-follow (`CANNOT_FOLLOW_YOURSELF`), et un test le couvre. Le mobile l'empêche désormais avant toute requête : une publication propre n'a pas de bouton Follow.

`FOLLOW_TARGET_RESOLVED` trace les deux identités et `isSelf`. `FOLLOW_TARGET_UNRESOLVED` protège un auteur legacy sans UUID. Aucun appel Follow n'est envoyé dans ces deux cas.

## 6. Follow target resolution

Le Feed conserve maintenant séparément :

- `author_auth_user_id` : sujet auth du contenu ;
- `author_profile_id` : UUID social canonique, ou `null`.

Seul `author_profile_id` est passé à `POST/DELETE /users/social/{profileUuid}/follow`. En erreur, `FOLLOW_ERROR` journalise uniquement `status`, `serverCode`, `serverMessage`, `targetProfileId` et `correlationId`, jamais de JWT.

## 7. For You Feed

`GET /feed?audience=FOR_YOU` préserve le classement de découverte et son cache organique. La clé React Query inclut explicitement `FOR_YOU`, empêchant toute contamination de pagination avec l'autre mode.

## 8. Following Feed

`GET /feed?audience=FOLLOWING` est un flux serveur :

1. `feed-service` propage le bearer du viewer à `user-service` ;
2. `user-service` renvoie les auth subjects suivis ;
3. `feed-service` interroge sa projection uniquement pour ces auteurs, avec pagination et ordre de publication ;
4. aucune publicité n'est injectée dans cette audience.

Les publications propres sont **exclues** : « Abonnements » contient strictement les comptes suivis. Le cache découverte n'est pas réutilisé pour ce mode afin de ne jamais servir une relation Follow périmée.

La configuration ajoutée est `yeyamo.user-service.base-url=${USER_SERVICE_BASE_URL:http://user-service:8080}` dans la configuration Feed déployée.

## 9. Story strip removal

Le carrousel `StoriesList` et son chargement ont été retirés de `src/app/(tabs)/index.tsx`. Aucune API Story, création Story, viewer Story ou interface Messaging n'a été supprimé.

## 10. Comments

La route commentaires est maintenant une page sûre avec :

- header et retour ;
- liste de commentaires ;
- `KeyboardAvoidingView` iOS ;
- compositeur natif fixe au bas, avec safe area ;
- bouton envoyer toujours accessible ;
- `keyboardShouldPersistTaps="always"` et fermeture interactive du clavier dans la liste.

Les traces couvrent `COMMENT_OPEN`, `COMMENT_LIST_REQUEST`, `COMMENT_LIST_RESPONSE`, `COMMENT_SUBMIT`, `COMMENT_CREATE_RESPONSE`, `COMMENT_CACHE_UPDATE` et `COMMENT_REFETCH`, sans texte de commentaire.

## 11. Replies

Le backend supportait déjà `parentId` et vérifie que le parent appartient à la même publication. Le mobile transmet désormais ce champ, affiche les réponses sous leur parent, indique « Réponse à … » dans le compositeur et permet l'annulation.

Les traces dédiées sont `COMMENT_REPLY_MODE`, `COMMENT_REPLY_SUBMIT` et `COMMENT_REPLY_RESPONSE`.

## 12. Comment reactions

Le backend possède un modèle persistant de **like** de commentaire (`PUT/DELETE /interactions/comments/{id}/like`). La liste de commentaires retourne maintenant `likeCount` et `liked` pour le viewer. Le mobile rend le cœur et le compteur, utilise la réponse serveur, puis rafraîchit la liste.

Il n'existe ni modèle ni route de dislike de commentaire. Aucun faux compteur ou schéma parallèle n'a été créé : `COMMENT_DISLIKE = NOT_APPLICABLE`.

Les traces actives sont `COMMENT_LIKE_REQUEST` et `COMMENT_LIKE_RESPONSE`.

## 13. Feed performance

La page Feed utilisait deux N+1 : résumés d'interactions et métadonnées média.

- Nouveau `POST /api/v1/interactions/posts/summaries` (maximum 50 IDs) ;
- Nouveau `GET /api/v1/media/batch?ids=...` (maximum 50 IDs) ;
- le résolveur d'identités auteur était déjà batché.

Après redéploiement, une page Feed utilise un appel de page, un appel d'identités, un batch interactions et un batch média. Les anciens appels unitaires ne servent que de compatibilité pendant un déploiement progressif. `VerticalFeedList` a aussi un `renderItem` memoïsé ; sa fenêtre de rendu reste volontairement réduite.

## 14. Observability

Ajouts :

- `[YEYAMO_FEED_TRACE] FEED_PROFILE_NAVIGATION` ;
- `[YEYAMO_FEED_TRACE] FEED_MODE_CHANGED` ;
- `FOLLOW_TARGET_RESOLVED`, `FOLLOW_TARGET_UNRESOLVED`, `FOLLOW_ERROR` ;
- traces de cycle commentaires/réponses/like décrites ci-dessus ;
- backend `CONTENT_AUTHOR_IDENTITIES_RESOLVED` pour classifier les auteurs legacy sans exposer de contenu privé.

## 15. Files modified

Mobile :

- `src/app/(tabs)/index.tsx`
- `src/app/(post)/[id]/comments.tsx`
- `src/components/comments/CommentInput.tsx`
- `src/components/comments/CommentItem.tsx`
- `src/components/feed/VerticalFeedItem.tsx`
- `src/components/feed/VerticalFeedList.tsx`
- `src/features/feed/feed.api.ts`
- `src/features/feed/feed.identity.ts`
- `src/features/feed/types.ts`
- `src/features/feed/useFeed.ts`
- `src/features/media/media.api.ts`
- `src/features/social/useSocial.ts`

API/configuration :

- `feed-service/.../FeedAudience.java`
- `feed-service/.../FollowingAuthorResolver.java`
- `feed-service/.../UserServiceFollowingAuthorClient.java`
- `feed-service/.../FeedQueryService.java`
- `feed-service/.../FeedProjectionPort.java`
- `feed-service/.../JpaFeedProjectionAdapter.java`
- `feed-service/.../SpringFeedPostRepository.java`
- `feed-service/.../FeedController.java`
- `feed-service/.../FeedQueryServiceTests.java`
- `interaction-service/.../InteractionQueryService.java`
- `interaction-service/.../InteractionController.java`
- `interaction-service/.../CommentResponse.java`
- `interaction-service/.../PostSummariesRequest.java`
- `media-service/.../MediaController.java`
- `user-service/.../SocialGraphService.java`
- `user-service/.../SocialGraphAlignmentTest.java`
- `cloud-conf-yeyamo/feed-service.properties`

## 16. Tests

Passed :

- `npx tsc --noEmit`
- ESLint ciblé de tous les fichiers mobile modifiés
- `feed-service`: `FeedQueryServiceTests` (4 tests)
- `user-service`: `SocialGraphAlignmentTest` (5 tests)
- `interaction-service`: `InteractionCommandServiceTest,CommentLikeServiceTest` (5 tests)
- compilation `media-service`
- `git diff --check` dans les deux dépôts

Non terminé : `npm run lint` global a dépassé 120 secondes sans produire d'erreur ESLint ; le lint ciblé est vert. Aucun runner de tests React Native/Jest n'est configuré dans `package.json`, donc les scénarios UI iOS restent à exécuter sur appareil.

## 17. Deployment requirements

Déployer ensemble :

- `user-service` (résolution owner/private et diagnostic legacy) ;
- `feed-service` et la configuration `USER_SERVICE_BASE_URL` ;
- `interaction-service` (batch des compteurs et états like de commentaires) ;
- `media-service` (batch de métadonnées) ;
- un nouveau build mobile iOS.

Aucune migration de base n'est requise.

## 18. Exact Test 6B procedure

1. Se connecter avec A (`authUserId=252`).
2. Dans Feed, toucher avatar et nom d'une publication A : arrivée dans l'onglet Profil ; vérifier `OWN_PROFILE_TAB`.
3. Toucher une publication B résolue : arrivée sur le profil public B ; vérifier `PUBLIC_PROFILE`.
4. Vérifier qu'aucun Follow n'est visible sur A ; suivre B, rafraîchir et redémarrer l'application : état conservé.
5. Ouvrir le log pour l'auteur 52. Relever `CONTENT_AUTHOR_IDENTITIES_RESOLVED` et renseigner la cause réelle selon `missingAuthUserIds` ou `notVisibleAuthUserIds`.
6. Vérifier l'absence totale de bande Story au sommet de Feed, puis vérifier que Stories reste accessible dans Messaging.
7. Passer Pour vous → Abonnements → Pour vous ; paginer et rafraîchir chaque mode. B doit voir A si B suit A ; C ne doit pas apparaître si B ne le suit pas.
8. Ouvrir les commentaires, saisir une phrase, envoyer, rafraîchir, répondre à un commentaire, liker une réponse, rafraîchir. Le compositeur doit rester au-dessus du clavier.
9. Vérifier dans l'inspecteur réseau que les résumés passent par `/interactions/posts/summaries` et les médias par `/media/batch` après déploiement.

## 19. Remaining blockers

- La classification réelle de l'auteur legacy 52 attend le log déployé ou l'accès à la base de production ; elle n'est pas devinée.
- Le produit ne spécifie pas de dislike de commentaire. Il reste volontairement absent jusqu'à validation fonctionnelle et modèle de données dédié.
- Le warning VirtualizedList doit être réévalué sur un appareil avec média réel après les batchs ; aucun refactor massif du lecteur vidéo n'a été fait.

## 20. Final verdict

Les chemins Feed, navigation, Follow, commentaires, réponses et likes sont désormais cohérents avec les identités canoniques et les contrats serveur. Le retest iOS est prêt après le déploiement coordonné des quatre services et du build mobile.

OWN_POST_NAVIGATION = READY
OTHER_PROFILE_NAVIGATION = READY

LEGACY_AUTHOR_52 = DATA_GAP_PENDING_DEPLOYED_DIAGNOSTIC
SELF_FOLLOW = PREVENTED
FOLLOW_TARGET_RESOLUTION = READY
FOLLOW_PERSISTENCE = READY_FOR_RETEST

FEED_STORY_STRIP_REMOVED = YES
FOR_YOU_FEED = READY
FOLLOWING_FEED = READY
FEED_MODE_PAGINATION = READY

COMMENT_COMPOSER = READY
COMMENT_CREATE = READY
COMMENT_REPLY = READY
COMMENT_LIKE = READY
COMMENT_DISLIKE = NOT_APPLICABLE
COMMENT_PERSISTENCE = READY_FOR_RETEST

FEED_N_PLUS_ONE = NO
FEED_PERFORMANCE = BATCHED_AND_RENDER_ITEM_MEMOIZED

MOBILE_REBUILD = YES

API_REDEPLOY = YES

DATABASE_MIGRATION_REQUIRED = NO

SERVICES_TO_REDEPLOY = user-service, feed-service, interaction-service, media-service

READY_FOR_FEED_RETEST = YES
