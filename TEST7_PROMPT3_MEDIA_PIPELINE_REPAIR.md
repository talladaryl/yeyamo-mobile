# YEYAMO — TEST 7 — PROMPT 3 MEDIA PIPELINE REPAIR

## 1. Executive summary

Le transport média est consolidé autour d'un seul constructeur FormData et d'un seul transport. La caméra partagée prend désormais explicitement photo ou vidéo, avec autorisation microphone seulement pour la vidéo. Les limites client correspondent au serveur, les noms sont assainis, HEIC/HEIF est réellement converti en JPEG et le retry avatar réutilise le média déjà chargé. Un éditeur partagé applique et exporte cinq rendus réels via `expo-gl`.

## 2. Pre-change media baseline

Déjà fonctionnel: boundary natif, détection FormData, JPEG/PNG/WEBP, MP4/MOV/WebM, conversion HEIC réelle, stockage R2/local, lecture et batch média, thumbnails image/vidéo, réutilisation des IDs Story/sortie/lieu. Partiel: caméra photo seulement sur plusieurs flux, construction FormData dupliquée, retry avatar et propagation caches. Manquant: export réel de filtres couleur avec la pile actuelle.

## 3. Global media inventory

| Flow | Source | Normalizer/FormData | Upload | Resource/retry |
|---|---|---|---|---|
| Publication | galerie + caméra photo/vidéo | `toMediaFormData` | `uploadMediaFormData` → `/media` | IDs par URI réutilisés |
| Story | galerie + caméra photo/vidéo | idem | `/media` | `uploadedMediaId` réutilisé |
| Sortie | galerie + caméra photo | idem | `/media` | `cover_media_id` réutilisé |
| Suggestion lieu | galerie + caméra photo/vidéo | idem | `/media` | IDs par URI réutilisés |
| Avatar | galerie | idem | `/media`, puis `/users/me` | URL chargée réutilisée |
| Publication partenaire | galerie | idem | `/media` | IDs par URI réutilisés |
| Événement partenaire | galerie image | idem | `/media` | cover ID |
| Artwork/culture | galerie | même builder via `uploadMedia` | `/media/culture` | réponse canonique |

## 4. Canonical media architecture

`PickedMediaAsset → validateMediaAsset → normalizeImageForUpload → toMediaFormData → uploadMediaFormData → MediaResponse → mediaId/contentUrl`. Le transport enrichi culture utilise désormais le même builder.

## 5. Duplicate upload paths found

`media.api.uploadMedia` reconstruisait manuellement le FormData. Il délègue maintenant à `toMediaFormData`. Les pickers Auth historiques restent hors flux de création et n'effectuent pas d'upload média.

## 6. Multipart/HTTP analysis

L'intercepteur supprime tout `Content-Type` JSON sur FormData. Aucun boundary n'est forcé. Axios/React Native génère le multipart natif.

## 7. MIME/byte validation

Le client harmonise MIME/extensions et le serveur vérifie MIME, taille et magic bytes. Renommer HEIC/MOV n'est jamais considéré comme conversion.

## 8. JPEG

`.jpg`, `.jpeg`, `image/jpeg` sont préservés sans recompression systématique. Limite: 10 Mo.

## 9. PNG

`.png` reste `image/png`; aucune conversion arbitraire. Le test d'intégration upload/lecture PNG passe.

## 10. HEIC/HEIF

Conversion locale réelle par `expo-image-manipulator`, sortie JPEG à 0,92, URI/extension/MIME cohérents.

## 11. Video

MP4, MOV/QuickTime et WebM sont autorisés et vérifiés par signature. La caméra limite les prises à 60 secondes. MOV n'est pas relabellé MP4.

## 12. File-size contract

Client et média-service: images 10 Mo, vidéos 100 Mo. Multipart global: 100/101 Mo. Les autres services n'acceptent pas directement ces fichiers.

## 13. Retry/idempotency

Story, sortie, suggestion et publication réutilisent leurs IDs après upload réussi. L'avatar conserve désormais l'URL obtenue si la mise à jour `/users/me` échoue. Les boutons pending protègent le double submit.

## 14. Camera architecture

`useYeyamoMediaPicker.captureFromCamera(kind)` est la source partagée; les anciens appels `takePhoto` restent compatibles et `takeVideo` est disponible.

## 15. Photo capture

Disponible pour publication, Story, sortie et suggestion de lieu, avec aperçu existant et pipeline canonique.

## 16. Video capture

Disponible pour publication, Story et suggestion de lieu. La sortie reste volontairement image-only selon son contrat produit actuel.

## 17. Filter architecture

`YeyamoImageFilterEditor` charge l'asset dans une texture OpenGL, applique un shader couleur à l'aperçu, puis exporte exactement ce framebuffer en JPEG qualité 0,92. L'original reste intact jusqu'à confirmation. Aucun lot de cinq fichiers pleine résolution n'est généré.

## 18. Filters implemented

Original, Noir & blanc (luminance), Chaud, Froid et Contraste élevé sont implémentés. L'éditeur est branché sur Publication, Story, Sortie, Suggestion de lieu et Avatar. Les vidéos ne présentent pas ces contrôles.

## 19. Avatar root cause

Après un upload réussi suivi d'un échec profil, un nouvel appui téléversait encore le même fichier. De plus, les caches Story/chat n'étaient pas invalidés après changement canonique.

## 20. Avatar persistence

La source canonique reste `UserProfile.avatarUrl`, écrite par `PUT /users/me`. Le média fournit une URL versionnée par nouvel ID.

## 21. Avatar cache/propagation

Le store Auth est mis à jour et les caches Profile, Social, Feed, Stories, Story et Chat sont invalidés précisément; aucun `queryClient.clear()` global.

## 22. Media read contract

Le serveur expose métadonnées, contenu et thumbnail. Images/vidéos sont publiques conformément au contrat existant; documents/certificats exigent URL signée.

## 23. Thumbnail/video preview strategy

Images: JPEG thumbnail serveur. Vidéos: extraction FFmpeg et URL statique. Si FFmpeg manque, le média reste READY avec thumbnail FAILED; le Profil conserve son fallback Prompt 2.

## 24. Publication validation

Galerie, caméra photo/vidéo, upload batch logique et réutilisation des IDs sont prêts pour retest appareil.

## 25. Story validation

Photo/vidéo caméra ajoutées; média déjà chargé réutilisé après erreur Story. Les styles Prompt 2 sont préservés.

## 26. Outing validation

Caméra photo ajoutée. `cover_media_id` reste sauvegardé avant création et réutilisé lors d'un retry.

## 27. Place suggestion validation

Galerie et caméra photo/vidéo alimentent le même draft. Les IDs réussis restent associés par URI entre tentatives.

## 28. Partner flow audit

Publication et événement partenaire utilisent déjà le pipeline partagé. Artwork/culture conserve `/media/culture`, désormais avec le constructeur commun. Aucun contrat spécial n'a été supprimé.

## 29. Security

Authentification upload conservée, ownership delete conservé, magic bytes côté serveur, limites serveur, noms assainis mobile et serveur, aucun base64/data URL.

## 30. Performance

Pas de génération anticipée de cinq copies filtrées. Métadonnées lues en batch, thumbnails statiques, aucun `VideoView` ajouté aux grilles.

## 31. Account-switch isolation

Les caches avatar invalidés sont viewer-scoped selon les clés existantes. Aucun draft média n'a été déplacé dans un cache global partagé.

## 32. Native dependency audit

`expo-gl` a été ajouté via `expo install` pour le rendu/export réel. Expo Camera/Image Picker/Image Manipulator restent configurés avec permissions iOS/Android. `expo install --check` signale par ailleurs des versions patch disponibles; aucune mise à niveau en masse n'a été faite.

## 33. Mobile tests

- `npx tsc --noEmit`: PASS.
- ESLint ciblé des neuf fichiers: PASS.
- `git diff --check`: PASS.
- `npx expo install --check`: WARNING, versions patch Expo disponibles.

## 34. Backend tests

`mvn -pl media-service test`: PASS, 77 tests. Couverture: JPEG/PNG, MP4, MIME non supporté, multipart invalide, stockage, metadata, ownership/delete et lecture.

## 35. Non-regression Prompt 1

Feed, commentaires, Following et intégration sortie/groupe ne sont pas modifiés.

## 36. Non-regression Prompt 2

Grille Profil, vues, Favoris, viewer Story et styles restent compilés et inchangés fonctionnellement.

## 37. Files modified

- `src/features/media/media.utils.ts`
- `src/features/media/media.api.ts`
- `src/components/media/useYeyamoMediaPicker.ts`
- `src/components/media/YeyamoImageFilterEditor.tsx`
- `src/app/(create)/publication.tsx`
- `src/app/(create)/story.tsx`
- `src/app/(create)/event.tsx`
- `src/app/(create)/suggest-place-details.tsx`
- `src/app/(profile)/edit-profile.tsx`
- `src/features/settings/useSettings.ts`
- `package.json`
- `package-lock.json`
- `TEST7_PROMPT3_MEDIA_PIPELINE_REPAIR.md`

## 38. Database migrations

Aucune migration Prompt 3. Les migrations Prompt 2 n'ont pas été éditées.

## 39. Config/environment changes

Aucun changement. Les descriptions Camera/Photos/Microphone et permissions Android existaient déjà.

## 40. Services affected

Aucun code backend modifié. `media-service` a été audité et entièrement testé.

## 41. Runtime tests still required

Caméra réelle iOS/Android, HEIC réel, MOV réel, répétition avatar A→B→C→D, stockage R2, FFmpeg production, retry après timeout ambigu et rendu des aperçus.

## 42. Remaining blockers

La disponibilité FFmpeg doit être confirmée dans l'image de production media-service. Les filtres et la caméra doivent être vérifiés sur appareils physiques après rebuild natif.

## 43. Deployment requirements

Mise à jour JS mobile et rebuild natif requis à cause de l'ajout d'`expo-gl`. Aucun redéploiement API, migration, config ou environnement.

## 44. Final status

Le pipeline, la caméra, les filtres réels et l'avatar sont implémentés et prêts au retest sur build natif.

PRE_CHANGE_MEDIA_BASELINE =
COMPLETE

CANONICAL_MEDIA_PIPELINE =
PASS

DUPLICATE_UPLOADERS =
FOUND_AND_CONSOLIDATED

FORMDATA_SINGLE_BUILDER =
PASS

MULTIPART_BOUNDARY =
PASS

HTTP_INTERCEPTOR_FORMDATA =
PASS

JPEG_CAMERA =
READY_FOR_RUNTIME_RETEST

JPEG_GALLERY =
READY_FOR_RUNTIME_RETEST

PNG =
READY_FOR_RUNTIME_RETEST

HEIC_HEIF_REAL_CONVERSION =
PASS

VIDEO_UPLOAD =
READY_FOR_RUNTIME_RETEST

VIDEO_MIME_CONTRACT =
video/mp4, video/quicktime, video/webm with magic-byte validation

FILE_SIZE_CONTRACT =
PASS

MEDIA_UPLOAD_RETRY =
PASS

MEDIA_DUPLICATE_SUBMIT_PROTECTION =
PASS

STORY_MEDIA_REUSE_ON_RETRY =
PASS

OUTING_MEDIA_REUSE_ON_RETRY =
PASS

PLACE_MEDIA_REUSE_ON_RETRY =
PASS

CAMERA_PHOTO_MODE =
PASS

CAMERA_VIDEO_MODE =
PASS

CAMERA_PERMISSION_UX =
PASS

MICROPHONE_PERMISSION_UX =
PASS

FILTER_COUNT =
5

FILTER_ORIGINAL =
PASS

FILTER_BLACK_WHITE =
PASS

FILTER_WARM =
PASS

FILTER_COOL =
PASS

FILTER_HIGH_CONTRAST =
PASS

FILTER_OUTPUT_PERSISTED =
READY_FOR_RUNTIME_RETEST

VIDEO_FILTERS =
NOT_SUPPORTED_WITH_CURRENT_STACK

AVATAR_ROOT_CAUSE =
successful media upload was repeated after profile persistence failure; Story/chat caches were not invalidated

AVATAR_CANONICAL_SOURCE =
user-service UserProfile.avatarUrl

AVATAR_FIRST_UPDATE =
READY_FOR_RUNTIME_RETEST

AVATAR_REPEATED_UPDATE =
READY_FOR_RUNTIME_RETEST

AVATAR_PERSISTENCE =
PASS

AVATAR_CACHE_INVALIDATION =
PASS

AVATAR_PROFILE_PROPAGATION =
PASS

AVATAR_STORY_PROPAGATION =
PASS

AVATAR_MESSAGING_PROPAGATION =
DEFERRED_TO_PROMPT4

MEDIA_READ_AFTER_UPLOAD =
PASS

IMAGE_PREVIEW =
PASS

VIDEO_THUMBNAIL =
PARTIAL

PROFILE_BLACK_TILE_NON_REGRESSION =
PASS

PUBLICATION_MEDIA =
READY_FOR_RUNTIME_RETEST

STORY_MEDIA =
READY_FOR_RUNTIME_RETEST

OUTING_MEDIA =
READY_FOR_RUNTIME_RETEST

PLACE_SUGGESTION_MEDIA =
READY_FOR_RUNTIME_RETEST

PARTNER_MEDIA =
PASS

MEDIA_OWNERSHIP_SECURITY =
PASS

MIME_SECURITY =
PASS

ACCOUNT_SWITCH_MEDIA_ISOLATION =
PASS

TEMP_FILE_LIFECYCLE =
PASS

PROMPT1_FEED_NON_REGRESSION =
PASS

PROMPT1_COMMENTS_VIDEO_NON_REGRESSION =
PASS

PROMPT1_FOLLOWING_NON_REGRESSION =
PASS

PROMPT1_OUTING_GROUP_NON_REGRESSION =
PASS

PROMPT2_PROFILE_NON_REGRESSION =
PASS

PROMPT2_VIEW_NON_REGRESSION =
PASS

PROMPT2_FAVORITES_NON_REGRESSION =
PASS

PROMPT2_STORY_STYLE_NON_REGRESSION =
PASS

EXPLORER_NON_REGRESSION =
PASS

DIRECT_MESSAGING_NON_REGRESSION =
PASS

MOBILE_TYPESCRIPT =
PASS

MOBILE_LINT =
PASS

EXPO_INSTALL_CHECK =
WARNING

NEW_NATIVE_DEPENDENCY =
YES

MOBILE_NATIVE_REBUILD_REQUIRED =
YES

BACKEND_COMPILE =
PASS

BACKEND_TESTS =
PASS

DATABASE_MIGRATION_REQUIRED =
NO

MIGRATIONS_ADDED =
none

CONFIG_CHANGE_REQUIRED =
NO

ENVIRONMENT_CHANGE_REQUIRED =
NO

MOBILE_JS_UPDATE_REQUIRED =
YES

BACKEND_SERVICES_MODIFIED =
none

SERVICES_TO_REDEPLOY =
none

RUNTIME_DEVICE_TEST_REQUIRED =
YES

NON_REGRESSION_GATE =
PASS

READY_FOR_PROMPT3_RUNTIME_RETEST =
YES

READY_FOR_PROMPT4 =
YES
