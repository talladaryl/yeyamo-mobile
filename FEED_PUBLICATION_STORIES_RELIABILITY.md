# YEYAMO MOBILE — Feed, publication et Stories

## Périmètre

Cette passe ne modifie aucun backend ni contrat API.
Routes existantes utilisées : `GET /feed`, `GET /media/{id}`, `POST /media`, `POST /posts`, `POST /posts/{id}/publish`, `GET /stories`, `GET /stories/{id}`, `POST /stories`, `POST /stories/{id}/view`.

## Audit et corrections

| Sujet | Constat | Correction appliquée |
| --- | --- | --- |
| Pagination Feed | La page courante pouvait être redemandée. | Calcul strict à partir de `current_page` / `last_page`. |
| Authentification / cache | Feed possible avant hydratation ou avec cache d’une session précédente. | Requêtes conditionnées à une session hydratée/authentifiée ; caches supprimés à la déconnexion et invalidés à la connexion. |
| États Feed | États de chargement, vide, erreur et erreur de page suivante incomplets. | États globaux, pull-to-refresh et footer de reprise. |
| Personnalisation | Intérêts/région affichés comme si le backend les acceptait. | Limités au mode démo ; aucun faux onglet « Suivis ». |
| Média Feed | Les `mediaIds` étaient toujours des images. | Résolution via `GET /media/{id}` ; rendu réel image/vidéo. |
| Publication | Image obligatoire, JPEG forcé, échecs mélangés. | Texte seul, MIME/nom cohérents, 10 médias maximum, preview et erreurs par phase. |
| Publication partenaire | Deuxième pipeline qui forçait le JPEG. | Même picker/multipart partagé, texte seul, image ou vidéo. |
| Post vers Feed | Création du brouillon et publication opaques. | `PostPublicationError` distingue `create` de `publish`; invalidation après succès confirmé. |
| Stories par auteur | Les stories supplémentaires du même auteur étaient supprimées. | Une pastille par auteur conserve la séquence complète. |
| Lecteur Stories | Durée 5 s fixe, tap fermant tout, image forcée. | Segments, précédent/suivant, pause au maintien, durée vidéo réelle 5–60 s, image ou vidéo réelle. |
| Création Story | Images uniquement, JPEG forcé. | Galerie photo/vidéo, caméra photo, permissions explicites, MIME conservé, légende optionnelle. |
| Visibilité Stories | Stories uniquement dans la messagerie. | Barre Stories dans Feed et messagerie ; création confirmée insérée au cache courant. |

## Pipeline média

`PickedMediaAsset` conserve URI, type, nom, MIME, dimensions, durée et taille.
`toMediaFormData` conserve un MIME supporté et ne crée un nom que si nécessaire.
Ordre : sélection → `POST /media` par fichier → `POST /posts` avec les `mediaIds` confirmés → `POST /posts/{id}/publish` → invalidation Feed.
Aucun faux succès ni URL inventée n’est créé.
Le contrat ne propose pas la suppression de médias orphelins : après un upload réussi et une création échouée, les identifiants sont gardés pour reprendre sans réuploader, sans prétendre nettoyer le serveur.

## Limites backend identifiées, sans contournement artificiel

1. `GET /feed` accepte seulement `page` et `size`, pas les intérêts/région.
2. Feed et Story exposent `mediaId` mais pas le MIME. Le client appelle `GET /media/{id}`. Si ce lookup échoue, ID et URL restent réels mais le type est provisoirement image ; `media_metadata_complete` le trace.
3. `GET /stories` renvoie les comptes suivis mais pas l’auteur connecté. La réponse confirmée de `POST /stories` est ajoutée au cache pour visibilité immédiate. La persistance après redémarrage exige que le backend retourne aussi les stories propres, ou une route existante équivalente.
4. Une Story texte seule avec fond/police/stickers n’est pas ajoutée : le contrat exige `mediaId`. La légende image/vidéo utilise le `caption` existant.

## Fichiers modifiés pour cette passe

- `src/app/_layout.tsx`, `src/app/(tabs)/index.tsx`
- `src/app/(create)/publication.tsx`, `src/app/(create)/story.tsx`
- `src/app/(partner)/publication.tsx`, `src/app/(story)/[id].tsx`
- `src/app/(profile)/[username].tsx`
- `src/components/media/useYeyamoMediaPicker.ts`
- `src/components/chat/MessageStories.tsx`
- `src/components/feed/VerticalFeedItem.tsx`, `VerticalFeedList.tsx`
- `src/components/profile/MediaGrid.tsx`
- `src/components/story/StoriesList.tsx`, `StoryRing.tsx`
- `src/features/create/types.ts`
- `src/features/feed/feed.api.ts`, `types.ts`, `useFeed.ts`
- `src/features/media/media.api.ts`, `media.utils.ts`
- `src/features/mock/mockData.ts`
- `src/features/post/post.api.ts`, `usePost.ts`
- `src/features/profile/types.ts`
- `src/features/story/mockData.ts`, `story.api.ts`, `types.ts`, `useStory.ts`

## Validation

| Vérification | Résultat |
| --- | --- |
| `npx tsc --noEmit` | PASS |
| ESLint ciblé Feed / média / publication / Stories | PASS, sans erreur ni avertissement |
| `npm run lint` | Non terminé : `expo lint` a dépassé 60 s sans erreur avant l’arrêt imposé. |
| `git diff --check` | PASS |
| Build / export Android | Non exécuté, conformément à la demande. |

## Checklist manuelle

### Feed

- Se connecter puis ouvrir le Feed : aucune requête avant hydratation.
- Actualiser et arriver à la fin d’une page de plus de 20 publications : la page suivante s’ajoute une seule fois.
- Couper le réseau au chargement initial puis à la page suivante : les actions de reprise restent accessibles.
- Vérifier image, vidéo et texte seul : vidéo lue par le lecteur, aucun cadre image vide pour le texte.

### Publication

- Publier une légende sans média.
- Publier PNG, WEBP, MP4 ou MOV selon appareil : le multipart ne doit pas les déclarer JPEG.
- Forcer un échec après upload, reprendre : un média déjà confirmé ne repart pas une seconde fois.
- Refaire le scénario depuis la publication partenaire.

### Stories

- Créer une story image puis vidéo : la création confirmée apparaît aussitôt dans la barre Feed.
- Ouvrir un auteur ayant plusieurs stories, avancer, reculer, maintenir le doigt : toute la séquence reste dans le lecteur.
- Vérifier durée vidéo et marquage « vu ».
- Après redémarrage, la disparition des stories du compte connecté relève de la limite backend n°3, pas d’un cache frontend à masquer.
