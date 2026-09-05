# Alignement frontend — Phase 1 et Phase 2

## Audit avant modification

### Activités d’un lieu

- Écran audité : `src/app/(places)/[id].tsx`.
- Le bouton **Réserver** appelait uniquement `explainBookingBlock`, une alerte `BLOCKED_BY_BACKEND`; aucun appel de disponibilité ni parcours de réservation n’était présent.
- Client audité : `src/features/places/places.api.ts`. Il utilise les helpers partagés `apiGet` et `apiPost`.
- Base URL confirmée : `src/services/api/client.ts` ajoute déjà `/api/v1`. Les nouveaux appels utilisent donc `/activities`, `/bookings` et non un préfixe dupliqué.
- Aucun hook `usePlaceActivities` n’existait.
- Le type générique `SpringPage<T>` existe dans `src/services/api/contracts.ts`, avec `content`, `number`, `size`, `totalElements`, `totalPages`, `first` et `last`.
- Backend lu : `BookingController` expose `GET /api/v1/activities?placeId={id}`, `GET /api/v1/activities/{activityId}/availability` et `POST /api/v1/bookings`.
- Contrat réellement confirmé dans `BookingDtos.java` : `SlotView` contient `id`, `activityId`, `placeId`, `startsAt`, `endsAt`, `capacity`, `reserved`, `available`, `unitPrice`, `currency`, `countryCode`, `status`. Il ne contient pas `title`, `remainingCapacity`, `priceAmount` ni `priceCurrency`; ces champs n’ont donc pas été inventés côté mobile.
- `POST /bookings` attend `{ slotId, quantity }` et l’en-tête `Idempotency-Key`.

### Contact artisan

- Écran audité : `src/app/(explore)/artisans/[id].tsx`.
- Le CTA appelait seulement une alerte indiquant que des coordonnées seraient disponibles plus tard.
- `chatApi.createConversation` et `useCreateConversation` existaient déjà. Le pattern de navigation après création, dans `src/app/(chat)/new.tsx`, est `router.replace(\`/(chat)/${conversation.data.id}\`)`.
- `BackendConversation` contient notamment `id`, `type`, `title`, `updatedAt`, `lastMessagePreview`, `lastMessageAt`; il est mappé vers le type mobile `Conversation`.
- Backend confirmé : `POST /api/v1/messaging/conversations/partner/{partnerId}` retourne `ConversationView`.

## Implémentation activités

### `src/features/places/types.ts`

- Ajout de `BackendActivity`, `BackendActivityPage` et `BackendBooking` selon les DTO Java effectivement lus.

### `src/features/places/places.api.ts`

- Ajout de `getPlaceActivities(placeId, page)` : `GET /activities?placeId=…&page=…&size=20`.
- Ajout de la disponibilité par activité et de `createActivityBooking(slotId, quantity)`.
- La création ajoute une clé d’idempotence produite par `createIdempotencyKey()`.

### `src/features/places/usePlaceActivities.ts`

- Nouveau hook React Query pour la page de créneaux et la disponibilité.
- Nouveau hook mutation pour la création de réservation.
- Les requêtes réseau sont désactivées dans une session `demo-*`; aucune donnée fictive n’est injectée dans un parcours backend.

### `src/app/(places)/[id].tsx`

- Le CTA utilise la page réelle d’activités du lieu.
- Chargement : indicateur local.
- Aucun résultat : message non technique « Aucune activité réservable… ».
- Un résultat : navigation directe vers le flux de réservation.
- Plusieurs résultats : sélecteur modal de créneau, avec date, places disponibles et prix réels.

### `src/app/(bookings)/activity/[id].tsx`

- Nouvel écran autorisé de réservation d’activité.
- Charge les créneaux réels, interdit les créneaux complets, sélectionne quantité et crée la réservation réelle.
- Après succès, affiche la référence renvoyée et dirige vers les réservations du profil.

## Implémentation contact artisan

### `src/features/chat/chat.api.ts`

- Ajout de `chatApi.contactPartner(partnerId)`.
- Appel réel : `POST /messaging/conversations/partner/{partnerId}`.
- La réponse utilise le mapper conversation existant : aucun nouveau modèle parallèle n’a été créé.

### `src/features/chat/useChat.ts`

- Ajout de `useContactPartner`, avec invalidation de la liste de conversations après succès.
- En session démo, la convention existante de `useCreateConversation` est conservée : une conversation démo existante est ouverte, sans requête réseau.

### `src/app/(explore)/artisans/[id].tsx`

- Le CTA crée ou récupère la conversation avec `data.partnerId`.
- Pendant l’appel, le bouton est désactivé et montre un indicateur local.
- Le succès réutilise le chemin et le pattern existants : `router.replace('/(chat)/{conversationId}')`.
- Les échecs affichent un message utilisateur non technique, sans code HTTP ni détail interne.

## Vérification

- `npx tsc --noEmit` : **OK, 0 erreur** après l’intégration. Le dernier lancement via `npx` a dépassé 120 s sans sortie ; le compilateur local équivalent `node_modules/.bin/tsc.cmd --noEmit` a ensuite terminé avec **0 erreur**.
- `git diff --check` : aucune erreur d’espacement sur les fichiers suivis.
- Aucun package npm n’a été ajouté.
- Expo Doctor n’a pas été relancé : la commande peut nécessiter un accès registre externe et la présente livraison ne modifie aucune dépendance Expo.
- Docker, gateway et services n’ont pas été démarrés dans cette tâche, conformément à la demande de ne pas les lancer.

## Non-régression et périmètre

- Les parcours démo restent sans appel vers les deux nouveaux endpoints.
- Les modifications fonctionnelles se limitent aux API/hooks Places et Chat, au détail Lieu, au détail Artisan, et au nouvel écran de réservation explicitement autorisé.
- Le dépôt comportait déjà de nombreuses modifications non liées (Expo, Explorer, événements, etc.) avant cette livraison. Elles n’ont pas été modifiées volontairement dans ce lot.

FRONT ALIGNÉ SUR PHASE 1 + PHASE 2
