# YEYAMO MOBILE — PROFIL, COLLECTIONS ET SÉCURITÉ

## 1. Contrats backend vérifiés

| Domaine | Endpoint réellement utilisé | État |
|---|---|---|
| Profil | `GET/PUT /users/me`, `PATCH /users/me/location` | Utilisé |
| Avatar | `POST /media`, puis `PUT /users/me` avec l’URL retournée | Utilisé |
| Pays et villes | `GET /countries`, `GET /countries/{code}/cities` | Utilisé |
| Social | recherche, abonnés, abonnements, suggestions, activité, paramètres et follow/unfollow sous `/users/social` | Utilisé |
| Collections | `/collections`, `/collections/public`, `/collections/{id}` | Utilisé |
| Sessions | `GET/DELETE /auth/sessions/{sessionId}` | Utilisé |
| Mot de passe | `PUT /auth/password` | Utilisé |

## 2. Profil et certification

- `email_verified`, `phone_verified`, `is_certified`, `verification_status` et `badge_type` sont désormais distincts dans le modèle d’authentification.
- `is_verified` n’est plus déduit de `emailVerifiedAt` : la vérification e-mail ne crée aucun badge public.
- Le profil principal ne présente plus de stories, highlights, republications, favoris, vues ou compteurs locaux comme s’ils étaient réels.
- Les compteurs et publications utilisent des requêtes réelles avec états chargement, erreur et vide.

## 3. Édition du profil

| Champ | État |
|---|---|
| Nom affiché, bio | Persistés via `PUT /users/me` |
| Avatar | Galerie → `POST /media` → URL retournée → `PUT /users/me` |
| Identifiant | Lecture seule : aucune route de modification confirmée |
| Pays et ville | Sélecteurs réels, persistés via `PATCH /users/me/location` |
| Centres d’intérêt | Préférence Explorer locale, clairement indiquée comme telle |
| Genre, région texte libre | Retirés : absents du contrat profil |

## 4. Collections

- Une couverture galerie n’est plus proposée comme enregistrée : `coverAssetId` n’accepte actuellement qu’un asset catalogue, pas un média téléversé.
- Les résumés de collections ne forcent plus une visibilité privée lorsque `isPublic` est absent de leur réponse.
- Les listes et détails ont des états chargement, erreur et vide ; le détail ne route plus « Modifier » vers une création.

## 5. Réseau social et confidentialité

- Recherche : délai de 300 ms et minimum de deux caractères.
- Follow/unfollow : mise à jour optimiste avec restauration en cas d’erreur puis invalidation serveur.
- Abonnés et abonnements : états chargement, erreur, vide et composants alignés avec les tokens du thème.
- Confidentialité : uniquement les paramètres social backend pris en charge (`profileVisibility`, activité, abonnés, abonnements). Les préférences non supportées ne sont plus simulées localement.

## 6. Sécurité et session

- E-mail et téléphone affichent seulement les preuves réellement fournies.
- La 2FA est affichée comme indisponible : aucune bascule locale trompeuse.
- Les sessions affichent seulement ID, état et expiration, car le backend ne fournit ni appareil, ni IP, ni emplacement.
- La déconnexion purge les caches privés Profil, Social, Collections, Réservations, Notifications, Stories et Sessions.
- Un écran de changement de mot de passe utilise `PUT /auth/password`.

## 7. Suppression et désactivation de compte

`POST /auth/account/deactivate` et `DELETE /users/me` ont été confirmés côté backend. Leur déclenchement côté mobile reste volontairement désactivé dans cet écran : l’activation crée une capacité de suppression définitive sur un compte réel et demande l’autorisation explicite du propriétaire. Aucun faux succès ni logout local ne subsiste.

## 8. BACKEND_REQUIRED

| Besoin | Contrat manquant |
|---|---|
| Certification publique | `isCertified`, statut et type de badge dans les réponses profil/social |
| Vérification téléphone | état vérifié et flux OTP téléphone |
| 2FA | enrolment, challenge et désactivation 2FA |
| Couverture personnalisée de collection | liaison d’un média `POST /media` avec `Collection.coverAssetId` ou URL publique |
| Résumés de collection | champ `isPublic` dans `GET /collections/summaries` |
| Profil public social | identifiant de navigation stable plutôt que nom généré à partir de `displayName` |
| Détails de sessions | device, plateforme, IP et localisation si souhaités |
| Intérêts profil | lecture/écriture dans le contrat `/users/me` |
| Lieu des avis/réservations | projection place lisible dans leurs endpoints |

## 9. Fichiers modifiés dans cette passe

- `src/app/(tabs)/profile.tsx`
- `src/app/(profile)/about.tsx`
- `src/app/(profile)/edit-profile.tsx`
- `src/app/(profile)/change-password.tsx`
- `src/app/(profile)/security.tsx`
- `src/app/(profile)/delete-account.tsx`
- `src/app/(profile)/privacy.tsx`
- `src/app/(profile)/social-settings.tsx`
- `src/app/(profile)/search.tsx`
- `src/app/(profile)/followers.tsx`
- `src/app/(profile)/following.tsx`
- `src/app/(profile)/events.tsx`
- `src/app/(profile)/reviews.tsx`
- `src/app/(profile)/settings.tsx`
- `src/app/(collections)/index.tsx`
- `src/app/(collections)/create.tsx`
- `src/app/(collections)/[id].tsx`
- `src/app/_layout.tsx`
- `src/components/collections/CollectionCard.tsx`
- `src/components/social/UserListItem.tsx`
- `src/components/social/UserSearchCard.tsx`
- `src/features/auth/useSecurity.ts`
- `src/features/auth/types.ts`
- `src/features/collections/collections.api.ts`
- `src/features/collections/types.ts`
- `src/features/profile/profile.api.ts`
- `src/features/social/useSocial.ts`

## 10. Validation

| Vérification | Résultat |
|---|---|
| `npx tsc --noEmit` | PASS |
| lint ciblé sans cache | PASS |
| `npm run lint` | Non exécutable : verrou EPERM sur `.expo/cache/eslint/.cache_uy4utm` |
| Build Android | Non lancé, conformément à la consigne |

## 11. Checklist manuelle

1. Modifier nom, bio, avatar, pays et ville, puis rouvrir le profil.
2. Confirmer qu’un e-mail vérifié ne fait pas apparaître de badge public.
3. Taper une recherche sociale : aucun appel avant deux caractères, puis un délai court.
4. Tester follow/unfollow hors ligne : la valeur doit revenir en arrière après l’erreur.
5. Tester light puis dark sur Profil, Collections, Followers, Following, Sécurité et Confidentialité.
6. Vérifier les listes de sessions, puis révoquer une session non courante.
7. Vérifier qu’aucun écran n’affiche `(tabs)` dans ses headers sociaux.
