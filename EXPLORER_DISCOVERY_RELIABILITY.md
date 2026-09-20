# YEYAMO MOBILE — Explorer, préférences et fiabilité

## Périmètre

Cette passe ne modifie aucun backend, aucun contrat existant et ne crée ni recommandation, ni XP, ni billet, ni réservation fictifs. Aucun build Android n'a été lancé.

### Mise à jour de navigation

Les préférences de découverte sont maintenant accessibles depuis la zone de localisation sous le titre **Explorer**. La page Profil/Paramètres n'expose plus « Langue & Préférences » : elle ouvre uniquement **Langue**, avec Français et English. Le thème reste dans son écran Paramètres dédié et n'est pas dupliqué dans les préférences Explorer.

## 1. Explorer et `GET /regions`

### Cause de l'ancien blocage

`src/app/(tabs)/explore.tsx` prenait automatiquement `regions[0]` comme région active. Tant que `GET /regions` n'avait pas répondu, `selectedRegion` était vide et l'écran entier retournait uniquement « Préparation de vos découvertes… ». Avec le timeout réseau de 15 secondes et deux retries globaux, ce faux chargement pouvait durer environ 45 secondes, puis ne montrait pas le reste d'Explorer.

### Correction

- La sélection initiale est maintenant **Tout le pays** : aucune région arbitraire n'est choisie.
- Les rails, la recherche, la carte et les catégories restent utilisables sans région.
- Le sélecteur propose explicitement « Tout le pays » puis les régions retournées par l'API.
- Une erreur `/regions` est locale au sélecteur, explique que le reste d'Explorer reste disponible et fournit « Réessayer ».
- `useRegions` a un seul retry. Il ne peut plus bloquer l'écran principal.
- Les catégories et chaque rail ont leurs états de chargement, erreur/retry et vide indépendants. Une section indisponible ne masque plus les autres.

### Localisation

Le filtre « Près de vous » passe par `useLocation` uniquement après action de l'utilisateur. En cas de refus ou d'indisponibilité, la recherche concernée affiche une explication et un retry ; Explorer, les autres filtres et le mode national restent accessibles. Aucune latitude/longitude n'est inventée.

## 2. Préférences Explorer

| Préférence | UI | Persistée | Envoyée API | Influence résultats | Statut |
|---|---|---:|---|---|---|
| Pays du compte | Lecture seule dans Préférences ; modification renvoyée vers le profil | Oui | `/users/me` / `/users/me/location` existants | Pays par défaut utilisé par Explorer | `API_USED` |
| Région | Sélecteur Explorer avec « Tout le pays » | Non, choix d'écran | `regionCode` dans recherche/trending quand choisie | Oui, pour les requêtes qui acceptent `regionCode` | `API_USED` |
| Villes de découverte | Message explicite, aucun faux sélecteur multi-ville | Non | Aucun champ de préférence multi-ville | Non | `BACKEND_CONTRACT_INCOMPLETE` |
| Rayon local | Champ entier 1–500 km | Oui | `PATCH /users/me/discovery-preferences` | Non sur l'accueil Explorer : aucun rayon/coordonnée n'y est transmis | `BACKEND_REQUIRED` |
| Intérêts | Hors de cet écran ; store d'onboarding existant | Local existant | Non vérifié dans cette passe | Non démontré pour Explorer | `NOT_USED` |
| Catégories préférées | Ancien toggle local retiré de cet écran | Non | Aucun contrat vérifié | Non | `BACKEND_CONTRACT_INCOMPLETE` |
| Langues de contenu | Chips à partir de la configuration pays | Oui | `PATCH /users/me/language` | Langue préférée transmise aux recommandations ; effet des langues multiples non démontré | `API_USED` / `NOT_USED` partiel |
| Mode de découverte | Ancien mode SecureStore retiré de l'UI | Local historique seulement | Aucun | Non | `NOT_USED` |
| Contenu culturel africain | Toggle clairement étiqueté | Oui | `PATCH /users/me/discovery-preferences` | L'API Explorer ne reçoit pas ce critère explicitement | `BACKEND_REQUIRED` |
| Contenu sensible | Ancien toggle local retiré | Non | Aucun contrat vérifié | Non | `BACKEND_CONTRACT_INCOMPLETE` |
| Devise | Sélecteur issu de la configuration pays | Oui | `PATCH /users/me/discovery-preferences` | Affichage/prix Explorer non vérifié | `API_USED` pour la préférence ; `NOT_USED` pour le ranking |

Après une mutation réelle de préférence, seuls les caches concernés sont invalidés : profil pays, Explorer, discovery et recommandations.

## 3. Billets

| Problème | Cause frontend | Correction | Backend à vérifier |
|---|---|---|---|
| Liste vide confondue avec erreur | `ListEmptyComponent` mélangeait les deux | `LoadingState`, `ErrorState` avec retry et `EmptyState` distincts | Non |
| Attente excessive en erreur | Retry global de React Query | Un retry maximal, sans retry pour 400/401/403/404 | Non |
| Faux nom d'événement | `GET /tickets/my-tickets` ne renvoie que `eventId`, pas le titre | La liste affiche référence et `eventId`; le détail ne montre un titre que si l'endpoint événement le fournit | DTO enrichi si le titre doit être affiché sans requête séparée |
| QR simulé | Risque d'afficher un QR local | Le QR est rendu uniquement à partir de `GET /tickets/{id}/qr` pour un billet `VALID` | Non |

Les statuts affichés sont ceux du contrat ticket : `PENDING_PAYMENT`, `VALID`, `USED`, `CANCELLED`, `REFUNDED`, `EXPIRED`, `REVOKED`.

## 4. Réservations

`GET /bookings/me` fournit réellement : référence, `activityId`, quantité, montants/devise, statuts, paiement, dates, motif d'annulation et indicateur de remboursement automatique. Les cartes affichent ces données disponibles, sans navigation vers un faux lieu.

Le contrat ne fournit pas le nom, les photos, l'adresse ou les horaires de l'activité/du lieu. La carte affiche donc la référence d'activité ; aucun lieu, créneau ou type d'expérience n'est inventé.

L'annulation est désormais reliée à `POST /bookings/{id}/cancel` avec un motif saisi par l'utilisateur et une clé `Idempotency-Key`. Après succès, la query `['profile', 'backend', 'reservations']` est invalidée. La disponibilité réelle d'un remboursement est seulement présentée lorsque le backend retourne `automaticRefundAvailable`.

Les chargements, erreurs récupérables et états vides sont séparés.

## 5. Notifications

- Liste : `GET /notifications` ; non lues : `GET /notifications/unread` ; compteur : `GET /notifications/unread/count`.
- Le compteur provient du backend : aucune valeur `0` n'est forcée.
- `mark read`, `mark all` et suppression appliquent une mise à jour optimiste des caches liste/non-lues/compteur, prennent un snapshot et le restaurent en cas d'échec ; les données sont ensuite réinvalidées depuis le serveur.
- La page distingue chargement, erreur avec retry et liste réellement vide.
- Les notifications push système restent séparées des notifications in-app.

## 6. Passport, XP et missions

| Élément | Source | Frontend | Backend | Alignement requis |
|---|---|---|---|---|
| XP actuel / niveau | `GET /me/passport/summary` | Affiche la valeur serveur uniquement | Fourni | Non |
| Progression de niveau | `currentLevelThreshold`, `nextLevelThreshold`, `currentLevelXp` | Calcul borné 0–100 | Fourni | Non |
| Seuil Passport 4000 XP | Aucun champ serveur identifié | Non codé localement | Non fourni | `BACKEND_REQUIRED` |
| Bonus d'inscription | Aucun événement/contrat identifié | Non crédité | Non démontré | `BACKEND_REQUIRED` si souhaité |
| Historique XP | `GET /me/xp/history` | Affiche points et raison serveur, signe réel | Fourni | Non |
| Missions permanentes | `GET /me/missions` | Affiche seulement les missions retournées | Le type « permanente » n'est pas fourni | `BACKEND_CONTRACT_INCOMPLETE` si une distinction visuelle est requise |
| Missions spéciales / dates | `GET /me/missions` | Affiche objectifs, état, récompense et `endsAt` quand fourni | Fourni partiellement | Type spécial non fourni |
| Badges, tampons, récompenses, classement | Endpoints Passport existants | Pas de valeur/faux nom inventés ; invalide tout Passport après claim | Fourni sans détails destination/utilisateur | DTO enrichi pour noms lisibles |

Les queries Passport sont limitées à une session backend, ont un retry maximum et sont supprimées au logout. Aucune attribution locale d'XP n'existe.

### Sources XP visibles dans le frontend

La seule source affichée est l'historique backend (`reason`, `points`, `sourceId`). Aucune règle de gain locale, bonus d'inscription, mission locale, scan ou paiement n'est déduite ni créditée par le frontend.

## 7. Caches privés

Le logout supprime désormais notamment les namespaces `ticketing`, `passport`, `notifications`, `countries/profile` et `recommendations`, en plus des caches privés déjà présents. Cela empêche la fuite de données entre comptes.

## 8. BACKEND_REQUIRED / BACKEND_CONTRACT_INCOMPLETE prouvés

1. Préférence de découverte multi-villes.
2. Transmission/apprentissage côté API Explorer des pays de découverte, du rayon et de `discoverAfricanContent`.
3. Filtrage de contenu sensible et catégories de recommandation correspondant à de vraies préférences utilisateur.
4. DTO Explorer/Discovery si le backend doit appliquer le rayon enregistré hors recherche géolocalisée.
5. Détails d'activité/lieu dans le DTO de réservation (nom, lieu, horaires, image).
6. Titre d'événement dans le résumé d'un billet si une seule requête de liste doit suffire.
7. Seuil global de complétion Passport à 4000 XP.
8. Typage explicite des missions permanentes et spéciales, si le produit doit les distinguer.
9. Libellés de destination et de participant pour les tampons/classement, si ces noms doivent être affichés.

Le compteur de notifications non lues et l'annulation de réservation ne sont pas dans cette liste : les endpoints vérifiés existent déjà.

## 9. Fichiers modifiés

- `src/app/_layout.tsx`
- `src/app/(tabs)/explore.tsx`
- `src/app/(profile)/preferences.tsx`
- `src/app/(profile)/tickets.tsx`
- `src/app/(profile)/ticket/[id].tsx`
- `src/app/(profile)/reservations.tsx`
- `src/app/(profile)/notifications.tsx`
- `src/app/(social-graph)/passport.tsx`
- `src/app/(social-graph)/passport/[section].tsx`
- `src/components/profile/TicketCard.tsx`
- `src/components/profile/ReservationCard.tsx`
- `src/features/explore/useExplore.ts`
- `src/features/country/country.hooks.ts`
- `src/features/ticketing/useTicketing.ts`
- `src/features/notifications/useNotifications.ts`
- `src/features/profile/profile.api.ts`
- `src/features/profile/types.ts`
- `src/features/profile/useProfile.ts`
- `src/features/social-graph/passport.api.ts`

## 10. Validation

- `npx tsc --noEmit` : réussi.
- ESLint ciblé sur tous les fichiers modifiés : réussi, sans erreur.
- `npm run lint` : non finalisable car ESLint ne peut pas écrire son cache existant `.expo/cache/eslint/.cache_uy4utm` (`EPERM`). Le cache n'a pas été supprimé ; le lint ciblé sans cache a validé les fichiers modifiés.
- `git diff --check` : réussi.
- Aucun script de tests unitaires n'est défini dans `package.json`.
- Aucun test backend, build Android, appareil physique ni vérification de réponses déployées n'a été exécuté.

## 11. Tests manuels à effectuer

1. Ouvrir Explorer avec `/regions` indisponible : le contenu national doit rester accessible et le sélecteur doit proposer Retry.
2. Refuser la permission de position puis tester « Près de vous » : aucun autre parcours Explorer ne doit être bloqué.
3. Modifier chaque préférence réelle, se déconnecter/reconnecter, puis vérifier la persistance serveur.
4. Vérifier Billets : réseau coupé, compte sans billet, billet `VALID`, billet remboursé/annulé et QR valide.
5. Vérifier Réservations : liste, erreur, une annulation avec motif, état et remboursement retournés par le serveur.
6. Vérifier Notifications : compteur, lecture d'une notification, tout lire, échec réseau et rollback du cache.
7. Vérifier Passport : summary, historique, missions vides/remplies, expiration, erreur et logout/login avec un autre compte.

## 12. Bugs hors périmètre relevés

- Le store conserve encore `discoveryScope` pour compatibilité, mais il n'a aucun effet API ; l'UI ne l'expose plus.
- Le détail de billet utilise un appel événement séparé pour obtenir un titre ; sans cette donnée il affiche la référence `eventId` réelle.
- Les données réelles des réservations n'identifient pas l'activité par un nom lisible.
