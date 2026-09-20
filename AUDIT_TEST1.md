# AUDIT TEST 1 — Contrats backend, Feed et interfaces orphelines

Date : 16 septembre 2026  
Périmètre : application mobile Yeyamo, onglets **Créer**, **Explorer**, **Profil** et Feed associé.

## 1. Méthode et statuts

Cet audit confronte :

- les écrans et clients API réellement présents dans `src/app`, `src/features` et `src/components` du mobile ;
- les contrôleurs Spring Boot réellement présents dans `yeyamo-api` ;
- les routes du gateway configurées ;
- deux contrôles HTTP de production non authentifiés.

Aucun backend n'a été modifié pendant cet audit.

| Statut | Signification |
|---|---|
| `EXISTANTE` | Contrôleur backend et appel mobile présents. |
| `CONTRAT_INCOMPLET` | La route existe mais ne transporte pas les données nécessaires au comportement affiché. |
| `APPEL_MOBILE_INCOMPLET` | La route existe, mais l'écran ne l'appelle pas ou n'envoie pas les données nécessaires. |
| `ROUTE_A_CREER` | Aucun contrat correspondant n'a été trouvé. |
| `INTERFACE_ORPHELINE` | Une action est affichée mais ne produit pas d'effet serveur durable. |
| `A_VERIFIER_EN_PRODUCTION` | Le code est présent mais une réponse authentifiée ou une chaîne asynchrone doit être vérifiée après déploiement. |

## 2. Résumé exécutif — priorités backend

1. **Feed :** `GET /api/v1/feed` est bien publié par le gateway ; sans Bearer token il répond `401`, ce qui est attendu. Il faut maintenant tester la réponse avec un vrai compte et vérifier la projection Kafka `content-service -> feed-service`. Le symptôme Feed vide ne peut pas être attribué à une route absente sans ce test authentifié.
2. **Sortie sociale :** créer une sortie ne crée actuellement ni publication Feed, ni Story. Le champ mobile `share_to_feed` reste seulement dans le brouillon. Il faut un contrat d'orchestration backend, pas trois appels mobiles indépendants.
3. **Planning d'aventure :** le planning est aujourd'hui stocké localement dans SecureStore. Pour qu'il appartienne réellement à l'utilisateur et soit retrouvé sur un autre appareil, les routes de prévisualisation, sauvegarde et lecture doivent être créées.
4. **Feed :** les routes Likes/Commentaires/Partages existent. En revanche, les actions rapides Enregistrer, Ça m'intéresse, Pas intéressé et Signaler ne sont pas toutes reliées à un comportement serveur durable.
5. **Suggestion de lieu :** la route existe et son DTO accepte `countryCode`, mais le mobile ne l'envoie pas. Les photos de suggestion ne sont ni transmises ni supportées par le contrat.

## 3. Audit du Feed

### 3.1 Routes et infrastructure constatées

| Fonction | Mobile | Backend/gateway | Statut | Observation |
|---|---|---|---|---|
| Feed personnalisé | `GET /feed?page&size` | `FeedController`, gateway `/api/v1/feed/**` | `EXISTANTE` | Un appel production sans token répond `401` : la route atteint bien le gateway. |
| Feed public | non utilisé par le mobile | `PublicFeedController` expose `/api/v1/public/feed` | `CONTRAT_INCOMPLET` | Appel production `GET /api/v1/public/feed?page=0&size=1` : `404`. Le contrôleur existe dans le service, mais le gateway ne route que `/api/v1/feed/**`. |
| Publication | `POST /media`, `POST /posts`, `POST /posts/{id}/publish` | content-service | `EXISTANTE` | La publication est créée comme brouillon puis publiée. |
| Like / unlike | `PUT` / `DELETE /interactions/posts/{id}/like` | interaction-service | `EXISTANTE` | Clé d'idempotence envoyée par le mobile. |
| Commentaires | lecture et création via `/interactions/posts/{id}/comments` | interaction-service | `EXISTANTE` | La page de commentaires dédiée utilise bien la route. |
| Compteurs / état du lecteur | `/interactions/posts/{id}/summary` | interaction-service | `EXISTANTE`, mais non utilisé dans la liste | La page détail le lit ; la liste Feed ne reçoit pas les états utilisateur. |
| Partage enregistré | `POST /interactions/posts/{id}/shares` | interaction-service | `EXISTANTE`, mais non appelé par le partage rapide | Voir §3.4. |
| Sauvegarde / favori d'un post | `PUT` / `DELETE /interactions/posts/{id}/favorite` | interaction-service | `EXISTANTE`, mais non appelé par le Feed vertical | Voir §3.4. |

### 3.2 Pourquoi le Feed peut ne rien afficher

Le décodeur mobile accepte désormais les lignes sponsorisées injectées par le backend : une ligne `itemType = SPONSORED` n'est plus décodée comme un post organique sans `postId` ou `mediaIds`. Cette incompatibilité ne doit donc plus faire échouer toute la liste.

Le Feed dépend toutefois d'une projection asynchrone : `feed-service` consomme les événements `content.events` émis par `content-service`. Il ne lit pas directement la table des posts. Une publication publique ne peut apparaître que si toute la chaîne suivante fonctionne :

```text
POST /posts/{id}/publish
  -> outbox content-service
  -> topic Kafka content.events
  -> FeedEventConsumer
  -> projection feed_posts disponible
  -> GET /feed
```

Le code de `FeedEventConsumer` existe et ne garde qu'un post dont le statut est `PUBLISHED`, la visibilité `PUBLIC` et la date de publication sont renseignés. Ainsi, un Feed vide avec des posts publiés est probablement un problème de données/projection/outbox/Kafka/deployment, pas une absence de `GET /feed`.

Il n'a pas été possible de lire le Feed de production avec une session valide pendant cet audit. Il faut donc exécuter le test authentifié suivant depuis un environnement autorisé :

```text
GET /api/v1/feed?page=0&size=20
Authorization: Bearer <access-token-utilisateur>
```

Puis vérifier dans la réponse : `items`, `itemType`, `postId`, `mediaIds`, et les compteurs. Si `items` est vide malgré un post public, inspecter les outbox non publiées et le consumer group `feed-service`.

### 3.3 Contrat Feed à compléter

La réponse actuelle contient `page`, `size`, `items` et des lignes organiques/sponsorisées. Elle ne fournit pas un contrat suffisant pour afficher un Feed personnalisé de façon fiable sans appels supplémentaires.

Le backend devrait compléter **la route existante** `GET /feed` avec :

```json
{
  "page": 0,
  "size": 20,
  "hasNext": true,
  "total": 125,
  "items": [
    {
      "itemType": "ORGANIC",
      "postId": "uuid",
      "author": {
        "id": "uuid",
        "username": "daryl",
        "displayName": "Daryl",
        "avatarUrl": "https://...",
        "verified": false,
        "followingByViewer": true
      },
      "caption": "...",
      "mediaIds": ["uuid"],
      "publishedAt": "2026-09-16T10:00:00Z",
      "interactions": {
        "likes": 12,
        "comments": 2,
        "shares": 1,
        "likedByViewer": false,
        "savedByViewer": true
      }
    }
  ]
}
```

Conséquences :

- pas de faux nom `Utilisateur <id>` ni de faux `username` produit par le mobile ;
- le coeur, le bookmark et le bouton Suivre correspondent à l'état serveur dès le premier rendu ;
- `hasNext` devient fiable même si une publicité est injectée dans une page ;
- le mobile ne doit pas calculer la pagination depuis `items.length === size`.

### 3.4 Actions Feed : ce qui fonctionne et ce qui est orphelin

| Action visible | Effet actuel | Besoin |
|---|---|---|
| Like | Mise à jour optimiste puis `PUT/DELETE /interactions/posts/{id}/like`. | Vérifier avec un vrai post. Route existante. |
| Commenter | Ouvre l'écran commentaires ; création réelle via `POST /interactions/posts/{id}/comments`. | Route existante. Prévoir pagination des commentaires à terme. |
| Partager depuis le détail | Ouvre le partage natif et appelle `POST /interactions/posts/{id}/shares`. | Route existante. |
| Partager depuis le Feed vertical | Ouvre la feuille de partage, mais ne déclenche pas `recordShare`. | `APPEL_MOBILE_INCOMPLET` : appeler la route existante une seule fois après succès du partage natif ou envoi à un ami. |
| Enregistrer depuis le Feed vertical | Change seulement un `Set` React local. Après refresh, l'état est perdu. | `INTERFACE_ORPHELINE` : relier à la route favorite existante et invalider le cache. |
| Ça m'intéresse | Change seulement un état React local. | `ROUTE_A_CREER` : `POST /feed/items/{postId}/feedback` avec `{"type":"INTERESTED"}`. |
| Pas intéressé | Masque seulement le post durant cette session. | `ROUTE_A_CREER` : même route avec `{"type":"NOT_INTERESTED"}` ; le ranking ne doit plus reproposer ce post. |
| Signaler une publication | Affiche seulement un message. | `ROUTE_A_CREER` : `POST /reports` avec `targetType=POST`, `targetId`, `reason`, commentaire facultatif. Le serveur crée un dossier de modération et retourne un accusé. |
| Suivre depuis le Feed | Appelle les routes Social existantes, mais l'état initial n'est pas fourni par le DTO Feed. | Compléter le DTO Feed avec `followingByViewer`. |

Les feedbacks `INTERESTED` et `NOT_INTERESTED` doivent être idempotents, liés à l'utilisateur connecté, auditables, et consommés par le ranking. Une réponse minimale doit retourner l'état mémorisé et éventuellement un `feedVersion` pour invalider le cache personnalisé.

### 3.5 Sorties, Stories et Feed

Une sortie créée par `POST /events` est aujourd'hui une ressource événementielle seulement. Le `feed-service` ne consomme que les événements de contenu ; il ne consomme pas les événements du `event-service`. La sortie n'est donc pas ajoutée automatiquement au Feed. Elle ne crée pas non plus de Story.

Le comportement à implémenter côté backend doit être centralisé :

```text
Créer une sortie publique
  -> événement publié/visible dans Explorer et son détail
  -> publication Feed de type EVENT liée à eventId
  -> Story d'événement seulement si la règle produit le demande et qu'un coverMediaId existe
```

Contrat recommandé : enrichir `POST /events` avec une intention de diffusion explicite :

```json
{
  "title": "Randonnée",
  "...": "champs EventRequest existants",
  "socialDistribution": {
    "publishToFeed": true,
    "publishToStory": true
  }
}
```

Le service événement doit écrire l'événement puis publier un événement outbox. Un orchestrateur/service de contenu crée alors :

- un post `PUBLIC`, `referenceType = EVENT`, `referenceId = eventId`, avec le cover media ;
- une Story uniquement quand `publishToStory=true` **et** qu'un média légalement publiable existe ; sinon retourner `storyStatus = SKIPPED_NO_MEDIA`, sans Story factice.

La réponse de création doit indiquer l'état réel de chaque effet (`eventId`, `feedPostId`, `storyId`, `PENDING` / `PUBLISHED` / `SKIPPED` / `FAILED`). Le mobile ne doit pas effectuer trois écritures indépendantes, car il ne pourrait pas compenser une réussite partielle.

## 4. Onglet Créer

| Flow | Route(s) actuelle(s) | État | Manque ou comportement attendu |
|---|---|---|---|
| Publication | `POST /media`, `POST /posts`, `POST /posts/{id}/publish` | `EXISTANTE` | La publication doit être projetée dans le Feed via Kafka. Si elle ne l'est pas, corriger outbox/consumer, pas l'interface. Le post devrait aussi porter pays/ville/langue quand ces critères alimentent le Feed. |
| Story | `POST /media`, `POST /stories`, `GET /stories`, `POST /stories/{id}/view` | `EXISTANTE` | Le DTO Story contient durée et géographie, mais pas d'audience/visibilité ni de liaison à un événement. Créer ces champs seulement si le produit veut réellement des Stories privées ou des Stories d'événement. |
| Créer une sortie | `POST /events` | `EXISTANTE` pour le coeur | Le mobile transmet titre, lieu/coordonnées, capacité, visibilité et règles de participation. L'absence concerne la diffusion Feed/Story, les groupes, les critères d'âge et les tickets dans ce flow. |
| Inscription à une sortie | `POST /events/{id}/register`, `DELETE /events/{id}/unregister` | `EXISTANTE` | Vérifier la gestion capacité, doublon, liste d'attente et réponse 409 au complet. Une liste d'attente n'est pas encore un contrat mobile. |
| Invitations à une sortie | `POST/GET/DELETE /events/{id}/invitations...` | `EXISTANTE` | Le modèle existe ; l'UI de création ne sélectionne pas encore les invités du brouillon. |
| Suggérer un lieu | `POST /place-suggestions`, `GET /place-suggestions/me` | `APPEL_MOBILE_INCOMPLET` | Le backend accepte `countryCode`, mais le mobile ne l'envoie pas. Le champ doit être obligatoire côté produit si une suggestion appartient à un pays. |
| Photos d'une suggestion de lieu | aucune | `ROUTE_A_CREER` | Étendre la suggestion avec `mediaIds` ou créer `POST /place-suggestions/{id}/media`, avec autorisation, ordre, droits et modération. Aucun média ne doit être affiché avant validation. |
| Suivi de mes suggestions de lieux | `GET /place-suggestions/me` | `EXISTANTE`, mais peu exposée | Ajouter une entrée Profil ou un écran de suivi montrant `PENDING/APPROVED/REJECTED`, `canonicalPlaceId`, motif de modération et date. |
| Transmettre un savoir | `POST /culture/contributions`, `POST /culture/contributions/{id}/submit`, `GET /culture/contributions/me` | `EXISTANTE` | La modération existe. Le choix audio utilise actuellement une URL externe ; si l'app doit gérer du son, ajouter `mediaIds` uploadés et vérifiés plutôt qu'une URL arbitraire. |
| Contribution culturelle publiée dans Feed | aucune création automatique trouvée | `ROUTE_A_CREER` ou événement métier à ajouter | Après approbation, publier un événement culture vers content/feed ou créer un post de référence `CULTURE_CONTENT`. Ne pas mettre au Feed une contribution encore en modération. |
| Créer une oeuvre / offre | routes catalogue et commerce présentes | `EXISTANTE` avec ergonomie à corriger | L'UI demande encore manuellement un UUID partenaire/artisan. Le backend fournit déjà `GET /partners/me/artisan-profile` ; le mobile doit en déduire l'identifiant au lieu de le demander. |

### 4.1 Contrat minimal pour les suggestions de lieu avec médias

```text
POST /place-suggestions
POST /place-suggestions/{suggestionId}/media
GET  /place-suggestions/me?page=0&size=20
```

`POST /place-suggestions` doit au minimum recevoir :

```json
{
  "name": "...",
  "address": "...",
  "countryCode": "CM",
  "region": "...",
  "city": "...",
  "latitude": 3.86,
  "longitude": 11.52,
  "description": "..."
}
```

La réponse doit inclure `status`, `canonicalPlaceId`, `moderationReason`, `createdAt` et la liste de médias autorisés. Une suggestion rejetée doit rester visible à son auteur avec son motif ; elle ne doit jamais alimenter Explorer avant approbation.

## 5. Onglet Explorer

| Flow | Route(s) actuelle(s) | État | Manque ou comportement attendu |
|---|---|---|---|
| Pays, villes, configuration pays | `/countries`, `/countries/{code}/cities`, `/countries/{code}/configuration`, `PATCH /users/me/location` | `EXISTANTE` | La liste est réellement backend. Le mobile met seulement CM en premier. |
| Régions et catégories | `/regions`, `/categories` | `EXISTANTE` | Les régions ne doivent pas bloquer Explorer si indisponibles. Les catégories renvoient des références ; leurs codes doivent rester stables pour les futures recommandations. |
| Recherche / tendances | `/discovery/search`, `/discovery/trending` | `EXISTANTE` | Le backend accepte déjà pays, région, ville, géolocalisation, langue et scope. Vérifier que les documents indexés portent réellement ces champs. |
| Carte | `/places/nearby` après permission de localisation | `EXISTANTE` | Un écran noir de carte iOS/Android relève d'abord du provider natif ou des clés Maps, pas d'une route backend. Les étiquettes régionales actuellement dessinées sur la carte sont statiques et ne reflètent pas le backend. |
| Détails lieu / activités / réservation | `/places/{id}`, `/activities`, `/activities/{id}/availability`, `/bookings` | `EXISTANTE` | Les DTO de réservation ne donnent pas assez de contexte pour Profil : voir §6. |
| Recommandations générales | `GET /recommendations` | `EXISTANTE`, mais insuffisante pour une aventure | La route accepte seulement position, langues et contexte libre. Elle ne sait pas garantir dates, horaires, budget, participants et intérêts. |
| Nouvelle aventure / Voir mon planning | aucune route utilisée | `ROUTE_A_CREER` | Le mobile ne crée aujourd'hui qu'un brouillon local puis découpe les jours. |
| Enregistrer / gérer mes plannings | stockage local SecureStore | `INTERFACE_ORPHELINE` côté serveur | Les plannings sont visibles uniquement sur cet appareil et ne sont pas liés au compte backend. |

### 5.1 Contrat à créer — aventure et planning

Le flow voulu est : configurer l'aventure -> **Voir mon planning** -> consulter les jours -> **Enregistrer le planning** -> retrouver le planning dans Profil.

Le backend doit séparer prévisualisation et sauvegarde explicite :

```text
POST   /explore/adventure-plans/preview
POST   /explore/adventure-plans
GET    /explore/adventure-plans?page=0&size=20
GET    /explore/adventure-plans/{planId}
DELETE /explore/adventure-plans/{planId}
POST   /explore/adventure-plans/{planId}/recommendations/{recommendationId}/skip
```

La prévisualisation applique les critères sans l'ajouter à la liste de l'utilisateur. La sauvegarde explicite crée un plan durable, propriétaire de l'utilisateur connecté. Chaque plan doit conserver :

```json
{
  "countryCode": "CM",
  "cityId": null,
  "regionId": null,
  "timezone": "Africa/Douala",
  "startDate": "2026-10-05",
  "endDate": "2026-10-20",
  "startTime": "09:00",
  "endTime": "17:00",
  "partyType": "SOLO",
  "interestCodes": ["culture", "events"],
  "budget": {
    "tier": "STANDARD",
    "minimumAmount": 5000,
    "maximumAmount": 20000,
    "currencyCode": "XAF"
  }
}
```

Règles obligatoires :

- dates inclusives ; début et fin identiques signifient un seul jour ;
- `endTime` est strictement après `startTime` ;
- `partyType` est limité à `SOLO`, `FAMILY`, `FRIENDS`, `COUPLE` ;
- le moteur filtre d'abord pays/zone, dates, disponibilité, horaire, budget et intérêts ; le ranking n'intervient qu'après ;
- une recommandation est toujours une ressource réelle, avec `sourceType`, `sourceId`, prix, créneau et chemin de détail ;
- `skip` ne repropose jamais la même ressource dans le même plan ; s'il n'existe aucune alternative, retourner explicitement `replacement: null`.

Le document existant `EXPLORE.md` contient le DTO détaillé proposé ; cette section le rend prioritaire car le bouton Enregistrer et la page Gérer vos plannings existent désormais dans le mobile.

## 6. Onglet Profil

| Flow | Route(s) actuelle(s) | État | Manque ou comportement attendu |
|---|---|---|---|
| Mon profil / modification / localisation | `GET/PUT /users/me`, `PATCH /users/me/location`, `PATCH /users/me/language` | `EXISTANTE` | Les changements réels sont côté serveur. |
| Réseau social | recherche, followers, following, suggestions, activité, settings sous `/users/social/**` | `EXISTANTE` | Les réponses doivent fournir identifiants, noms, avatar et état de suivi, pas seulement des IDs. |
| Bloquer un utilisateur | `POST/DELETE /users/social/{id}/block` existent | `APPEL_MOBILE_INCOMPLET` | Le menu de profil affiche seulement une alerte « Bloquer, masquer ou signaler ». Relier le blocage à la route existante ; définir séparément le signalement. |
| Publications personnelles | `GET /posts/me` | `EXISTANTE`, contrat léger | Le DTO utilisé dans le profil ne contient ni compteurs ni statut viewer ni résumé auteur. Enrichir si ces valeurs sont affichées. |
| Mes sorties | `GET /events/me` | `EXISTANTE` | La liste ne distingue pas clairement sortie créée, inscription, invitation, annulée ou passée. Prévoir un champ `participationStatus` et les informations lieu/cover/organisateur dans le résumé. |
| Mes favoris | construit actuellement depuis les collections | `CONTRAT_INCOMPLET` | « Favoris » et « collections » sont deux concepts différents. Si le produit veut les lieux favoris, créer une lecture dédiée, par exemple `GET /me/favorites?targetType=PLACE`. |
| Mes collections | `/collections/**` | `EXISTANTE` | CRUD et ajout/retrait de lieu existent. |
| Mes réservations | `GET /bookings/me`, annulation | `EXISTANTE`, DTO incomplet | La réponse ne permet pas d'afficher le nom du lieu/de l'activité, image, adresse et créneau. Ajouter un résumé immutable de l'activité/lieu dans chaque réservation. |
| Mes avis | lecture utilisateur et routes reviews | `EXISTANTE`, à harmoniser | Le profil lit `/interactions/users/{id}/reviews`, tandis que l'écran de détail utilise `/reviews/{targetType}/{targetId}`. Harmoniser les DTO pour auteur, cible, éligibilité, statut et pagination. |
| Notifications | `/notifications/**` | `EXISTANTE` | Vérifier qu'une sortie, un commentaire, un like et une modération de suggestion publient réellement les notifications attendues. |
| Plannings | aucune API | `ROUTE_A_CREER` | Utiliser les routes §5.1 ; supprimer progressivement le stockage local comme source de vérité après migration. |
| Passport / XP | `/me/passport/**`, `/me/xp/history`, `/me/missions` | `EXISTANTE`, détails insuffisants | Les valeurs viennent du serveur. Si l'interface doit distinguer les missions permanentes/spéciales ou afficher les noms de destinations, enrichir les DTO. |

## 7. Interfaces orphelines recensées

Ces interfaces doivent soit être reliées à un contrat, soit être conservées avec un message transparent. Elles ne doivent pas simuler une persistance.

| Zone | Interface | État réel | Décision requise |
|---|---|---|---|
| Feed | Enregistrer dans le Feed vertical | état React temporaire | Relier aux favoris de post existants. |
| Feed | Ça m'intéresse / Pas intéressé | état React temporaire et masquage de session | Créer les feedbacks de ranking. |
| Feed | Signaler | alerte sans dossier de modération | Créer `POST /reports`. |
| Feed | Compteur de partage dans le partage rapide | la route existe mais n'est pas appelée | Relier après succès du partage. |
| Sortie | `share_to_feed` | valeur du brouillon seulement | Implémenter l'orchestration événement -> Feed/Story. |
| Sortie | groupes, âge, liste d'attente, tickets de création | explicitement non configurés | Ne pas les afficher comme actifs avant contrats dédiés. |
| Suggestion de lieu | photos | écran informatif, aucun upload | Étendre le contrat de suggestion. |
| Suggestion de lieu | suivi utilisateur | route `/place-suggestions/me` existante mais pas d'accès principal Profil | Ajouter l'écran/entrée après décision produit. |
| Explorer | planning et Gérer vos plannings | SecureStore local seulement | Créer persistance backend §5.1. |
| Explorer carte | libellés Nord, Extrême-Nord, Sud-Ouest, Est | texte statique | Les remplacer par données de région/géographie ou les retirer. |
| Recherche Explorer | certains types conduisent à « page de détail non disponible » | navigation absente | Créer les détails correspondants ou ne pas exposer ces types dans le résultat. |
| Profil public | menu Bloquer/Masquer/Signaler | alerte seulement | Câbler blocage existant ; définir route de masquage et signalement. |
| Profil | Mes favoris | mélange de collections et favoris | Fixer la règle métier puis exposer une lecture dédiée si nécessaire. |

## 8. Routes à prioriser côté backend

### P0 — bloque les nouveaux parcours

1. **Projection Feed en production** : contrôler outbox content, Kafka, consumer `feed-service`, base de projection et cache après une publication réelle.
2. **Contrat Feed enrichi** : `hasNext`, auteur résumé, `likedByViewer`, `savedByViewer`, `followingByViewer`.
3. **Orchestration sortie sociale** : événement public -> post Feed lié ; Story seulement selon règle/média, avec états de traitement.
4. **Plans d'aventure** : preview, sauvegarde explicite, liste « mes plannings », détail, suppression et skip de recommandations.
5. **Suggestion de lieu** : rendre `countryCode` cohérent de bout en bout ; prévoir médias si l'UI photo est souhaitée.

### P1 — cohérence et personnalisation

1. `POST /feed/items/{postId}/feedback` pour `INTERESTED` / `NOT_INTERESTED`.
2. `POST /reports` pour post, story, profil, commentaire et lieu, avec motifs normalisés.
3. Lecture dédiée des favoris par type de cible.
4. DTO réservation enrichi avec activité, lieu et créneau lisibles.
5. DTO sortie « mes sorties » enrichi avec rôle de l'utilisateur et statut de participation.
6. Événements de notification pour inscription sortie, invitation, commentaire, like, partage et modération.

### P2 — exposition publique et finition

1. Ajouter au gateway le chemin `/api/v1/public/feed/**` si le feed public est réellement prévu pour le web/deep-links.
2. Définir audience/visibilité et références événement pour les Stories si elles deviennent une fonction produit.
3. Remplacer les labels statiques de la carte par les données géographiques administrées.
4. Compléter les détails Explorer encore sans destination de navigation.

## 9. Checklist de validation après implémentation backend

### Feed

1. Créer une publication publique avec image puis vérifier qu'elle apparaît via `GET /feed` et dans l'application.
2. Vérifier que le même post porte auteur, avatar, compteurs, `likedByViewer`, `savedByViewer` et un `hasNext` cohérent.
3. Liker, commenter, sauvegarder, partager, marquer intéressé, marquer non intéressé et signaler ; recharger l'application et vérifier la persistance attendue.
4. Créer une sortie publique avec cover : vérifier événement, carte Feed et Story selon la règle choisie ; tester le cas sans cover.

### Explorer et planning

1. Prévisualiser une aventure d'un jour puis une aventure du 5 au 20 octobre ; vérifier le nombre de jours inclusifs.
2. Ne pas cliquer Enregistrer : le plan ne doit pas apparaître dans Profil.
3. Cliquer Enregistrer : le plan doit apparaître dans « Gérer vos plannings » après redémarrage et sur un autre appareil connecté au même compte.
4. Tester budget, intérêts, horaire, activité indisponible et `skip` sans alternative.

### Créer et Profil

1. Soumettre une suggestion de lieu et vérifier que `countryCode`, statut de modération et éventuels médias sont présents.
2. Vérifier les listes Mes sorties, Mes réservations, Mes favoris, Mes avis et Mes suggestions avec des données réelles.
3. Tester blocage, signalement, notifications et droits d'accès sur deux comptes distincts.

## 10. Limites de cet audit

- Aucun accès à un Bearer token de test n'a été utilisé ; la réponse authentifiée du Feed de production reste à capturer.
- Aucun test d'écriture ni aucun déploiement backend n'a été lancé.
- Les constats de routes sont basés sur les contrôleurs et le gateway présents dans le monorepo au moment de l'audit.
- Les noms proposés pour les nouvelles routes sont des contrats recommandés ; ils peuvent être adaptés au découpage de services, à condition de préserver le comportement décrit.
