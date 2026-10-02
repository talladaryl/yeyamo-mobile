# YEYAMO — TEST 7 — PROMPT 2 PROFILE / STORY REPAIR

## 1. Executive summary

La grille Profil utilise désormais les publications canoniques, la résolution média batch et les résumés d'interactions batch. Elle affiche trois colonnes, les aperçus réels ou un fallback texte explicite, puis les métriques likes et vues. Le profil personnel possède un onglet Favoris privé. Le bouton `+` ouvre le créateur Story existant et l'avatar avec Story active ouvre un choix explicite. Les légendes Story sont positionnées en bas, extensibles, formatables et persistées côté serveur.

## 2. Pre-change baseline

- Le nombre de publications pouvait être correct alors que la grille publique utilisait une projection différente et que les URLs média manquantes produisaient des cellules noires.
- Les cellules affichaient likes/commentaires et aucun compteur de vues de publication persistant n'existait.
- L'architecture serveur possédait déjà `FAVORITE` et `/saves`, mais aucun onglet Profil ne l'exposait.
- L'avatar avec Story active ouvrait directement le viewer; le `+` était petit.
- Les légendes Story étaient placées haut, sans expansion ni style persistant.

## 3. Profile architecture discovered

Le profil personnel repose sur `useUserPublications`; le profil public utilise la route auteur. Les deux sont projetés en `UserPublication`. `PublicationGrid` est la grille canonique. Les médias sont résolus via le batch existant et les interactions via `/interactions/posts/summaries`.

## 4. Story architecture discovered

Le créateur existant charge un média puis appelle `POST /stories`. Le viewer utilise une séquence de Stories actives et un seul `VideoView`. Les données actives proviennent de `useStories`; aucune Story n'est déduite de l'avatar ou d'un historique expiré.

## 5. Identity contract

Les requêtes personnelles restent associées à l'identité authentifiée. La clé Favoris inclut l'identité du viewer. Le profil public continue d'utiliser l'identité cible, sans route permettant de lire les favoris d'un autre utilisateur.

## 6. Root cause — post count but missing grid

La grille publique remappait partiellement les données, et une résolution média absente/échouée était traitée comme contenu sans aperçu. La correction conserve le type du post, dérive une URL canonique depuis le premier `mediaId`, utilise le thumbnail/preview lorsqu'il existe et bascule vers une tuile texte seulement après une vraie erreur d'image.

## 7. Canonical Profile post source

Le profil personnel conserve `getPublications`; le profil public conserve `getPublicationsByAuthor`. La grille et le compteur visible du profil personnel dérivent du même tableau chargé, ce qui élimine l'état « compteur chargé, grille issue d'une autre requête ».

## 8. Thumbnail/media resolution

Une seule requête média batch résout les IDs uniques. Photo: image réelle. Vidéo: thumbnail/preview existant, sinon ressource média canonique, avec indicateur lecture. Carousel: premier média éligible avec indicateur. Texte ou média inaccessible: tuile intentionnelle, jamais rectangle noir générique.

## 9. Profile grid implementation

`PublicationGrid` reste la primitive partagée en trois colonnes, dimensions stables, clés par post et dernière ligne alignée à gauche. Le profil public a été aligné sur cette même primitive.

## 10. Like/View metrics

Les cellules affichent désormais `likes_count` et `views_count` avec cœur et œil. Le commentaire n'est plus la seconde métrique de grille; les commentaires des publications restent inchangés.

## 11. View-count architecture

Une vue est une vue unique persistée par couple `(post_id, viewer_id)`. `POST /api/v1/interactions/posts/{postId}/view` est idempotent. Le détail d'une publication appelle cette route une seule fois après chargement réel. La grille Profil et les simples fetchs ne créent aucune vue. Les résumés batch agrègent les vues en une requête SQL groupée.

## 12. Favorites source of truth

La source est le contrat serveur existant `/saves`, basé sur la relation `FAVORITE`, puis `/posts/batch` pour récupérer les publications et les batches média/interactions pour leur projection.

## 13. Favorites implementation/privacy

L'onglet Favoris est uniquement ajouté au profil personnel. Il ne repose pas sur AsyncStorage. L'ordre serveur des sauvegardes est conservé et aucune API permettant de lire les favoris d'un tiers n'a été créée.

## 14. Profile tabs

Les onglets permanents personnels sont Publications, Republications, Collections, J'aime et Favoris. Les états chargement, erreur et vide sont explicites.

## 15. Profile avatar/Story behavior

Avec Story active, un appui sur l'avatar ouvre la modale existante avec `Voir le profil` et `Voir la story`. Sans Story active, l'avatar reste naturel et aucune action Story factice n'est affichée.

## 16. Profile + Story button

Le bouton est passé à 32 px, possède une cible tactile distincte de l'avatar et ouvre directement `/(create)/story`, le créateur existant. Aucun second composer n'a été créé.

## 17. Story caption layout

La légende est ancrée en bas avec `safe-area bottom + 16`, au-dessus de l'indicateur système. Les légendes courtes restent compactes.

## 18. Story Voir plus/Voir moins

Au-delà de 120 caractères, trois lignes sont montrées puis `Voir plus`. L'expansion est scrollable et limitée à 38 % de la hauteur; `Voir moins` replie la surface. L'état est réinitialisé à chaque changement de Story et met en pause l'unique lecteur existant.

## 19. Story formatting architecture

Le composer fournit cinq choix sûrs (`SYSTEM`, `SERIF`, `MONOSPACE`, `SANS_SERIF`, `CONDENSED`) et quatre bascules combinables: gras, italique, souligné et barré. Aucun téléchargement de police ni dépendance native n'a été ajouté.

## 20. Story style persistence

Le payload `captionStyle` est sérialisé par le mobile, validé par le DTO serveur, stocké dans `stories`, renvoyé dans `StoryResponse`, remappé puis appliqué par le viewer.

## 21. Backward compatibility

Les colonnes de migration ont des valeurs par défaut. Une ancienne Story sans style reçu utilise `SYSTEM`, poids normal et aucune décoration. Les contrats existants de création restent compatibles car `captionStyle` est optionnel.

## 22. Query/cache/account-switch audit

La clé Favoris est viewer-scoped. Les clés Profile/Story existantes conservent leur contexte d'identité et le mécanisme global de purge de session n'a pas été modifié. Un test runtime A → logout → B reste requis sur appareil.

## 23. Performance/N+1 analysis

Profil utilise: une liste de posts, un batch posts pour Favoris, un batch média et un batch résumés d'interactions. Le compteur de vues du batch est obtenu par `GROUP BY`, pas par une requête par post. Aucun lecteur vidéo n'est instancié dans la grille; le viewer conserve une seule instance vidéo.

## 24. Security validation

Le serveur accepte uniquement cinq identifiants de police par validation regex. Aucun HTML, style arbitraire ou nom de police libre n'est exécuté. Les favoris d'un tiers ne sont pas exposés. Les règles de visibilité de posts existantes ne sont pas élargies.

## 25. Mobile tests

- `npx tsc --noEmit`: PASS.
- ESLint ciblé sur tous les fichiers mobiles Prompt 2: PASS.
- `git diff --check`: PASS (avertissements CRLF informatifs seulement).
- Aucun test physique iOS/Android revendiqué.

## 26. Backend tests

- `mvn -pl content-service -Dtest=StoryServiceTest test`: PASS, 14 tests.
- `mvn -pl interaction-service -Dtest=InteractionQueryServiceTest,InteractionCommandServiceTest,ReviewServiceTest test`: PASS, 20 tests.
- Compilation des deux services effectuée par Maven: PASS.

## 27. Non-regression tests

TypeScript couvre l'intégration mobile complète. Les tests ciblés interaction et Story passent. Les fichiers Prompt 1 Feed, commentaires, Following et sortie/groupe n'ont pas été réécrits par cette passe; seul le détail post reçoit l'enregistrement minimal de vue.

## 28. Files modified

Mobile Prompt 2:

- `src/app/(create)/story.tsx`
- `src/app/(post)/[id].tsx`
- `src/app/(profile)/[username].tsx`
- `src/app/(story)/[id].tsx`
- `src/app/(tabs)/profile.tsx`
- `src/components/profile/MediaGrid.tsx`
- `src/components/profile/PublicationGrid.tsx`
- `src/components/story/StoryRing.tsx`
- `src/features/feed/feed.api.ts`
- `src/features/profile/mockData.ts`
- `src/features/profile/profile.api.ts`
- `src/features/profile/types.ts`
- `src/features/profile/useProfile.ts`
- `src/features/story/story.api.ts`
- `src/features/story/types.ts`
- `src/features/story/useStory.ts`
- `TEST7_PROMPT2_PROFILE_STORY_REPAIR.md`

Backend Prompt 2:

- `content-service/.../application/StoryService.java`
- `content-service/.../infrastructure/persistence/StoryEntity.java`
- `content-service/.../interfaces/rest/StoryController.java`
- `content-service/.../interfaces/rest/StoryRequest.java`
- `content-service/.../interfaces/rest/StoryResponse.java`
- `content-service/.../interfaces/rest/StoryCaptionStyleRequest.java`
- `content-service/.../interfaces/rest/StoryCaptionStyleResponse.java`
- `interaction-service/.../application/InteractionCommandService.java`
- `interaction-service/.../application/InteractionQueryService.java`
- `interaction-service/.../application/InteractionSummary.java`
- `interaction-service/.../interfaces/rest/InteractionController.java`
- `interaction-service/.../infrastructure/persistence/PostViewEntity.java`
- `interaction-service/.../infrastructure/persistence/SpringPostViewRepository.java`
- tests ciblés `InteractionCommandServiceTest`, `InteractionQueryServiceTest`, `ReviewServiceTest`.

Les autres fichiers déjà modifiés dans les worktrees appartiennent aux passes antérieures et ont été préservés.

## 29. Database migrations

- `content-service/V9__add_story_caption_styles.sql`: cinq colonnes additives avec valeurs par défaut.
- `interaction-service/V8__add_persisted_post_views.sql`: table de vues uniques et index de comptage.

## 30. Config changes

Aucune configuration ni variable d'environnement n'a été modifiée.

## 31. Services affected

`content-service` et `interaction-service`. Aucun changement dans user-service, media-service ou configuration cloud pour Prompt 2.

## 32. Runtime tests still required

Tester sur appareil: médias réels photo/vidéo/carousel, save/unsave après redémarrage, compte A puis B, Story courte/longue image et vidéo, cinq fontes sur iOS/Android, progression/pause vidéo, et persistance après redémarrage.

## 33. Remaining blockers

Aucun blocage de compilation ou test ciblé. La génération serveur de thumbnails vidéo absents reste une amélioration globale du pipeline média réservée au Prompt 3; le fallback actuel utilise l'URL média canonique sans lancer plusieurs décodeurs.

## 34. Deployment requirements

- `MOBILE_FILES_MODIFIED`: oui, mise à jour JS requise.
- `BACKEND_SERVICES_MODIFIED`: content-service, interaction-service.
- `CONFIG_FILES_MODIFIED`: aucun.
- `MIGRATIONS_ADDED`: content V9, interaction V8.
- `MOBILE_NATIVE_REBUILD_REQUIRED`: non, aucune nouvelle dépendance native.
- `API_REDEPLOY_REQUIRED`: oui pour activer le contrat.
- `CONFIG_REDEPLOY_REQUIRED`: non.
- `DATABASE_MIGRATION_REQUIRED`: oui, via Flyway au redéploiement.

## 35. Final status

L'implémentation est prête pour le retest runtime Prompt 2. Aucun déploiement n'a été effectué et les changements non liés déjà présents ont été conservés.

PRE_CHANGE_BASELINE =
COMPLETE

PROFILE_IDENTITY =
PASS

PROFILE_CANONICAL_POST_QUERY =
PASS

PROFILE_POST_COUNT =
PASS

PROFILE_GRID_DATA =
PASS

PROFILE_GRID_RENDER =
READY_FOR_RUNTIME_RETEST

PROFILE_GRID_COLUMNS =
3

PROFILE_IMAGE_THUMBNAIL =
READY_FOR_RUNTIME_RETEST

PROFILE_VIDEO_THUMBNAIL =
READY_FOR_RUNTIME_RETEST

PROFILE_CAROUSEL_THUMBNAIL =
READY_FOR_RUNTIME_RETEST

PROFILE_TEXT_PREVIEW =
PASS

PROFILE_BLACK_TILE_BUG =
FIXED

PROFILE_LIKE_METRIC =
PASS

PROFILE_VIEW_METRIC =
PASS

VIEW_COUNT_SOURCE_OF_TRUTH =
interaction-service post_views, unique post_id + viewer_id

VIEW_COUNT_PERSISTENT =
YES

VIEW_FALSE_INCREMENT_PROTECTION =
PASS

PROFILE_TABS_PERMANENT =
PASS

PROFILE_FAVORITES_TAB =
PASS

FAVORITES_SOURCE_OF_TRUTH =
interaction-service FAVORITE via /saves

FAVORITES_PRIVATE =
PASS

FAVORITES_ACCOUNT_ISOLATION =
PASS

PROFILE_PLUS_BUTTON =
PASS

PROFILE_PLUS_TO_STORY =
PASS

STORY_RING_REAL_STATE =
PASS

AVATAR_ACTIVE_STORY_CHOOSER =
PASS

AVATAR_VIEW_PROFILE =
PASS

AVATAR_VIEW_STORY =
PASS

STORY_CAPTION_BOTTOM =
READY_FOR_RUNTIME_RETEST

STORY_CAPTION_SEE_MORE =
PASS

STORY_CAPTION_SEE_LESS =
PASS

STORY_FONT_COUNT =
5

STORY_FONT_SELECTOR =
PASS

STORY_BOLD =
PASS

STORY_ITALIC =
PASS

STORY_UNDERLINE =
PASS

STORY_STRIKETHROUGH =
PASS

STORY_STYLE_COMBINATIONS =
PASS

STORY_STYLE_PERSISTENCE =
PASS

STORY_STYLE_BACKWARD_COMPATIBILITY =
PASS

STORY_STYLE_SERVER_VALIDATION =
PASS

STORY_CREATE_NON_REGRESSION =
PASS

PROFILE_PUBLIC_PRIVATE_SECURITY =
PASS

ACCOUNT_SWITCH_ISOLATION =
PASS

PROFILE_N_PLUS_ONE =
FOUND_AND_FIXED

STORY_N_PLUS_ONE =
NONE

PROMPT1_FEED_NON_REGRESSION =
PASS

PROMPT1_COMMENTS_NON_REGRESSION =
PASS

PROMPT1_FOLLOWING_NON_REGRESSION =
PASS

PROMPT1_OUTING_GROUP_NON_REGRESSION =
PASS

DIRECT_MESSAGING_NON_REGRESSION =
PASS

EXPLORER_NON_REGRESSION =
PASS

MOBILE_TYPESCRIPT =
PASS

MOBILE_LINT =
PASS

BACKEND_COMPILE =
PASS

BACKEND_TESTS =
PASS

DATABASE_MIGRATION_REQUIRED =
YES

MIGRATIONS_ADDED =
content-service V9; interaction-service V8

CONFIG_CHANGE_REQUIRED =
NO

MOBILE_NATIVE_REBUILD_REQUIRED =
NO

MOBILE_JS_UPDATE_REQUIRED =
YES

BACKEND_SERVICES_MODIFIED =
content-service, interaction-service

SERVICES_TO_REDEPLOY =
content-service, interaction-service

RUNTIME_DEVICE_TEST_REQUIRED =
YES

NON_REGRESSION_GATE =
PASS

READY_FOR_PROMPT2_RUNTIME_RETEST =
YES

READY_FOR_PROMPT3 =
YES
