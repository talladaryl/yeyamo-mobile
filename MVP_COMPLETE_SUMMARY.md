# YeYamo Mobile — état réel du MVP

> Audit technique du 1er août 2026  
> Objectif annoncé : publication Android et iOS au plus tard le 25 août 2026  
> Verdict actuel : **NON PRÊT POUR SOUMISSION STORE**

## 1. Règles de lecture

Ce document ne confond pas présence de code et fonctionnalité validée.

- **CONNECTÉ** : l'écran appelle un adaptateur HTTP réel et un contrat backend correspondant existe.
- **PARTIEL** : une partie du parcours utilise encore des mocks, un `TODO`, un `console.log` ou une action non branchée.
- **BLOQUÉ CONFIG** : le code existe, mais un secret, un fournisseur, un build natif ou une ressource externe manque.
- **À VALIDER E2E** : contrat et services présents, mais aucun test réel appareil → Gateway → service → base/provider n'a été exécuté pendant cet audit.
- **DÉMO** : données fictives volontairement réservées au mode `demo-user` ou `demo-partner`; elles ne prouvent pas le fonctionnement du backend.

## 2. Correctifs de stabilité appliqués

### Déconnexion spontanée du compte démo

Cause confirmée : une requête métier faite avec le faux token de démonstration recevait `401`. L'intercepteur Axios tentait alors un refresh inexistant, supprimait la session et déclenchait la navigation vers le login.

Correction :

- les sessions `demo-user` et `demo-partner` ne passent plus dans le refresh JWT backend;
- un `401` métier en démo est remonté à l'écran sans déconnecter la démonstration;
- le refresh reste limité à une tentative pour les vraies sessions backend.

### Session supprimée lors d'une panne réseau

Cause confirmée : l'hydratation appelait `/auth/me` puis effaçait la session pour toute exception, y compris timeout, Gateway indisponible ou absence de réseau.

Correction :

- seule une réponse d'authentification `401` invalide la session;
- les erreurs réseau et `5xx` conservent les tokens et l'état local;
- l'utilisateur n'est plus déconnecté seulement parce qu'un microservice est temporairement indisponible.

### Expo Go et modules natifs

Cause confirmée : `expo-notifications` était importé statiquement au chargement de l'application. Expo Go SDK 54 ne contient pas le support Android remote push requis. Le même risque existait avec Google Sign-In natif.

Correction :

- chargement dynamique de `expo-notifications` uniquement dans un Development Build/standalone;
- notifications désactivées proprement dans Expo Go sans casser les routes;
- chargement différé de Google Sign-In;
- aucun import statique restant de `expo-notifications` ou `RNGoogleSignin` dans l'arbre initial;
- handlers foreground, channels Android, listeners, cold start et changement de token conservés pour le build natif.

### Identifiant appareil instable

Correction : la déconnexion efface uniquement la session d'authentification. Elle ne supprime plus le `deviceId`, l'onboarding et les préférences nécessaires. Le même identifiant d'installation peut donc être réutilisé pour le push.

## 3. État du build mobile

- Expo SDK : `54.0.x`.
- React Native : `0.81.5`.
- React : `19.1.0`.
- Routes `.tsx` détectées : **115**; ce nombre inclut layouts et routes techniques, pas 115 parcours finalisés.
- TypeScript strict : **PASS** avec `npx tsc --noEmit` le 1er août 2026.
- Routes sans export par défaut : **aucune détectée** lors du contrôle.
- `expo-doctor` : **non exécuté jusqu'au bout dans le sandbox**, car npm devait accéder au registre et le cache local ne contenait pas `expo-doctor`.
- Le projet ne possède actuellement aucun script `lint` ni `test` dans `package.json`.
- Le profil EAS `development` produit un client interne; le profil `production` produit un Android App Bundle.

## 4. APIs réellement consommées par le mobile

Les chemins ci-dessous sont relevés dans les adaptateurs TypeScript. Ils sont préfixés par l'URL Gateway configurée dans `EXPO_PUBLIC_API_BASE_URL`.

### Authentification et compte

| Méthode | Endpoint | Usage | État |
|---|---|---|---|
| POST | `/auth/login` | connexion email/téléphone | CONNECTÉ, E2E requis |
| POST | `/auth/register` | création utilisateur | CONNECTÉ, E2E requis |
| POST | `/auth/logout` | déconnexion | CONNECTÉ |
| GET | `/auth/me` | restauration de session | CONNECTÉ |
| POST | `/auth/refresh` | rotation de session | CONNECTÉ |
| POST | `/auth/email/verification/request` | envoi OTP email | CONNECTÉ, BLOQUÉ CONFIG SMTP par défaut |
| POST | `/auth/email/verification/confirm` | validation OTP | CONNECTÉ |
| POST | `/auth/password/forgot` | demande de récupération | CONNECTÉ, BLOQUÉ CONFIG SMTP par défaut |
| POST | `/auth/password/reset` | nouveau mot de passe | CONNECTÉ |
| PUT | `/auth/password` | changement mot de passe connecté | CONNECTÉ |
| POST | `/auth/oauth/{provider}` | Google/Apple côté backend | CONNECTÉ, build natif et E2E requis |

Le backend contient un service SMTP réel, mais `docker-compose.yml` active par défaut `MAIL_DELIVERY_ENABLED=false`. La récupération de mot de passe et l'OTP ne sont donc **pas déclarés fonctionnels en environnement local/production** tant qu'un SMTP valide n'est pas injecté et testé de bout en bout.
 
### Profil, social et contenus personnels

- `GET /users/me`, `PUT /users/me`, `PATCH /users/me/preferences`, `DELETE /users/me`.
- `GET /posts/me`, `GET /events/me`, `GET /bookings/me`.
- `GET /users/{id}/reviews`, `GET /users/social/stats`.
- `GET /users/social/suggestions`, `GET /users/social/activity`, `GET|PUT /users/social/settings`.
- `POST|DELETE /users/social/{userId}/follow`, `DELETE /users/social/followers/{userId}`.

État : **CONNECTÉ/PARTIEL**. Les appels réels existent, mais plusieurs écrans profil utilisent encore les données démo lorsque la session est en mode démonstration. La création d'un avis depuis le profil est encore un `TODO`.

### Feed, publications, stories et interactions

- `GET /feed?page={page}&size=20`, `GET /feed/sponsored`.
- `GET /posts/{id}`, `POST /posts`, `POST /posts/{id}/publish`, `DELETE /posts/{id}`.
- `POST /media`.
- `GET /stories`, `GET /stories/{id}`, `POST /stories`, `POST /stories/{id}/view`.
- `PUT|DELETE /interactions/posts/{id}/like`.
- `PUT|DELETE /interactions/posts/{id}/favorite`.
- `GET /interactions/posts/{id}/summary`, `GET|POST /interactions/posts/{id}/comments`.

État : **CONNECTÉ/PARTIEL**. Le mode backend utilise les APIs; le mode démo utilise explicitement des mocks. Les écrans de publication/story partenaire et certains écrans de création ne déclenchent encore qu'un `console.log`.

### Exploration, lieux et cartes

- `GET /regions`, `GET /categories`.
- `GET /discovery/trending?type=PLACE&limit=20`, `GET /discovery/search`.
- `GET /places/nearby`, `GET /places/{id}`.
- `GET /maps/geocode`, `GET /maps/reverse-geocode`, `POST /maps/route`.

État : **CONNECTÉ/PARTIEL**. Les listes lieux et la carte possèdent des adaptateurs réels. Les expériences restent alimentées par `mockExperiences`. Les créations de lieu partenaire se terminent encore par un `TODO` au dernier écran.

### Événements et réservations

- `GET /events/upcoming`, `GET /events/{id}`, `GET /events/me`.
- `POST /events/{id}/register`, `DELETE /events/{id}/unregister`.
- `GET /bookings/me` pour l'historique du profil.

État : **PARTIEL**. Consultation/inscription événement sont connectées. La création partenaire d'événement n'envoie pas encore la dernière étape au backend. Aucun parcours mobile complet réservation → paiement → confirmation n'a été validé pendant cet audit.

### Billetterie

- gestion partenaire : `/partners/{partnerId}/tickets/events/{eventId}/types`, `/partners/{partnerId}/tickets/configuration`, staff et commandes;
- achat : `GET /tickets/events/{eventId}/types`, création de hold et commande;
- utilisateur : `GET /tickets/my-tickets`, `GET /tickets/{id}`, `GET /tickets/{id}/qr`;
- scan : endpoint de scan défini dans `ticketing.api.ts`.

État : **BLOQUÉ CONFIG / NON VALIDÉ**. `ticket-service` est défini dans Compose, mais les variables `TICKET_QR_KEY_ID`, `TICKET_QR_PRIVATE_KEY_BASE64` et `TICKET_QR_PUBLIC_KEY_BASE64` ne sont pas configurées. Le QR, le scan et l'anti-rejeu ne doivent pas être annoncés fonctionnels avant démarrage du service et test sur appareil.

### Paiement et finance partenaire

- le mobile consomme le résumé finance, la liste ledger/transactions et le détail via `/commerce/partners/{partnerId}/ledger/...`;
- les écrans tickets déclenchent le workflow d'achat prévu par ticketing/booking/payment.

État : **NON PRÊT PRODUCTION**. `payment-service` est fonctionnel techniquement avec idempotence, remboursements et webhooks, mais le fournisseur actif par défaut est `SimulatedPaymentProvider` (`payment.provider.name=simulated`). Aucun fournisseur réel Mobile Money/carte n'est branché dans le code audité. Un paiement simulé n'est pas un paiement de production.

### Messagerie

- `GET /messaging/conversations`.
- lecture paginée des messages d'une conversation.
- envoi de message, marquage lu et création de conversation.
- WebSocket configuré via `EXPO_PUBLIC_MESSAGING_WS_URL`.

État : **CONNECTÉ, E2E requis**. Les mocks restent réservés au mode démo.

### Notifications

- `GET /notifications`, `GET /notifications/unread`, `GET /notifications/unread/count`.
- `POST /notifications/{id}/read`, `POST /notifications/read-all`, `DELETE /notifications/{id}`.
- `POST /notifications/devices/push-token`, `DELETE /notifications/devices/push-token/{deviceId}`.

Le backend implémente l'envoi Expo, les Push Tickets, les Push Receipts et l'invalidation `DeviceNotRegistered`. État : **CONTRAT PRÊT, E2E APPAREIL REQUIS**. Les push Android ne sont pas testables avec Expo Go; un Development Build est obligatoire.

### Collections, badges et gamification

- CRUD `/collections`, collections publiques, résumés et association de lieux.
- `GET /me/badges`, `GET /me/xp`.

État : **CONNECTÉ/PARTIEL**. Les écrans Passport, missions, classement et récompenses utilisent encore `MOCK_PASSPORT`; seuls badges/XP ont un adaptateur backend identifié.

### Partenaire, campagnes, promotions et publicité

- partenaire : `GET /partners/me`, `POST /partners`, `PUT /partners/me`, `POST /partners/me/submit`.
- analytics partenaire : `GET /analytics/partners/{partnerId}/dashboard`.
- campagnes : liste, détail, création, modification, soumission, pause, reprise, annulation, métriques sous `/campaigns`.
- promotions : endpoints partenaire/admin définis dans `promotions.api.ts`.
- publicité : `POST /ads/impressions`, `/ads/clicks`, `/ads/conversions`.
- staff : invitations, affectations ticket et suppression d'affectation.

État : **PARTIEL**. Les adaptateurs existent, mais les écrans partner dashboard `statistics`, `settings`, `reviews`, `reservations`, `notifications`, `events` et `establishments` utilisent encore des fichiers `mockData`. L'inscription partenaire est encore simulée dans deux écrans.

## 5. Écrans réellement incomplets

### P0 — bloque le MVP principal

- création de compte partenaire : action finale non branchée;
- suggestion/création de lieu : dernière étape non branchée;
- création d'événement partenaire : dernière étape non branchée;
- parcours achat réel : fournisseur de paiement simulé;
- QR ticket : clés de signature absentes et service à valider;
- récupération mot de passe/OTP : SMTP désactivé par défaut et aucun test réel confirmé;
- Google Sign-In et push : Development Build requis, pas Expo Go;
- page Turnstile `https://yeyamo.com/turnstile` et validation hostname à vérifier en ligne;
- tests automatisés mobile absents.

### P1 — forte dette fonctionnelle

- expériences : liste et détail mockés;
- Partner Dashboard : majorité des vues métier mockées;
- Passport/gamification avancée : données mockées;
- publication et story partenaire : actions simulées;
- filtres/sauvegarde de certains écrans Explore : `console.log`;
- formulaire de création d'avis absent;
- paramètres sécurité/confidentialité/préférences partiellement locaux.

## 6. Infrastructure backend observée

Le contrôle Docker du 1er août confirme l'état `healthy` de Gateway, registry, config, auth, user, partner, place, event, booking, payment, notification, messaging, content, feed, interaction, discovery, analytics, catalog, campaign, moderation, media, mission/reward, ainsi que PostgreSQL, Redis, Kafka, Cassandra et OpenSearch.

La reconstruction globale a révélé que le Dockerfile de `support-service` ne pouvait pas résoudre le starter sécurité partagé dans un contexte Docker isolé. Le contexte de build et le Dockerfile ont été corrigés; la reconstruction ciblée de `support-service` passe désormais. Les avertissements Compose confirment toujours l'absence des trois variables QR ticket.

## 7. Sécurité des secrets

Un problème critique a été trouvé : le fichier racine `.env.example` contenait des valeurs SMTP, Maps, OAuth et Turnstile réelles ou réalistes. Elles ont été remplacées par `CHANGE_ME` et les services sensibles sont désactivés par défaut.

Actions humaines obligatoires :

1. considérer toute valeur précédemment partagée/versionnée comme compromise;
2. révoquer et régénérer SMTP, Turnstile secret, clés serveur, token R2 et clés d'accès concernées;
3. conserver les nouvelles valeurs uniquement dans EAS Secrets, CI/CD et variables serveur;
4. contrôler l'historique Git, car nettoyer le fichier courant ne retire pas un secret d'anciens commits;
5. ne jamais publier de build signé avec les anciennes valeurs.

## 8. Niveau de préparation au 1er août

| Domaine | Niveau honnête |
|---|---|
| Navigation/UI générale | avancée, mais plusieurs écrans sont des coquilles ou démos |
| Auth email/password | contrat connecté; E2E et résilience à valider |
| Stabilité session | correctif principal appliqué; test longue durée requis |
| Email/OTP/password reset | BLOQUÉ CONFIG jusqu'au test SMTP réel |
| Feed/social/messaging | contrat largement connecté; E2E multi-utilisateur requis |
| Lieux/discovery/maps | partiellement connecté; expériences et créations incomplètes |
| Partenaire | PARTIEL, trop de vues mockées pour production |
| Réservation/ticket | PARTIEL/BLOQUÉ QR |
| Paiement | NON PRÊT, fournisseur simulé |
| Push | code complet côté application/backend; build natif et test appareil manquants |
| Google Login | code/config présents; build natif et E2E manquants |
| Qualité automatisée | insuffisante : aucun script test/lint mobile |
| Sécurité secrets | incident détecté; rotation obligatoire |

Il serait trompeur de maintenir l'ancienne estimation de 95 %. Le projet possède une surface UI importante, mais la préparation **exploitation/store** reste nettement derrière la préparation visuelle.

## 9. Plan impératif jusqu'au 25 août

### 1–5 août — sécuriser et rendre les parcours P0 testables

- rotation de tous les secrets exposés;
- configurer SMTP réel et tester register, OTP, forgot/reset;
- choisir/intégrer un fournisseur de paiement réel et son sandbox;
- générer les clés QR et démarrer `ticket-service`;
- brancher les créations partenaire, lieu et événement;
- publier/valider la page Turnstile;
- créer un Development Build Android puis iOS.

### 6–12 août — tests E2E métier

- auth + refresh + reprise hors ligne;
- utilisateur → lieu → événement → réservation → paiement → billet;
- partenaire → KYC → lieu → événement → ticket → scan;
- messagerie entre deux comptes;
- push foreground/background/cold start;
- remboursement et annulation;
- tests de permissions et comptes suspendus.

### 13–18 août — qualité release candidate

- supprimer ou masquer les fonctionnalités P1 non terminées;
- ajouter tests auth/session/API critiques;
- corriger performance bundle et erreurs runtime;
- tests sur plusieurs Android réels et au moins un iPhone réel;
- politique de confidentialité, suppression de compte, support, données collectées;
- crash reporting et monitoring production.

### 19–20 août — soumission

- build production signé Android AAB et archive iOS;
- captures, textes Store, classification, privacy/data safety;
- soumettre avant le 20 août pour garder une marge de revue.

### 21–25 août — marge de correction

- répondre aux rejets Store;
- corriger uniquement les problèmes bloquants;
- publier progressivement et surveiller erreurs, paiements, emails et push.

## 10. Critères GO / NO-GO

La soumission reste **NO-GO** tant qu'un seul de ces points est vrai :

- paiement réel non disponible;
- OTP/reset email non reçu sur une adresse réelle;
- ticket QR non signé ou non scannable;
- session qui se perd après expiration/access token ou coupure réseau;
- secrets non renouvelés;
- aucun test appareil Android/iOS du build de production;
- création partenaire/lieu/événement encore simulée;
- Turnstile obligatoire mais page challenge indisponible;
- absence de parcours de suppression de compte vérifié.

## 11. Commandes de validation

```bash
cd yeyamo-mobile
npx tsc --noEmit
npx expo-doctor
eas build --platform android --profile development
eas build --platform ios --profile development
```

Après validation E2E et remplacement des credentials :

```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

Ces commandes de build EAS ne prouvent pas à elles seules les parcours métier. La preuve finale doit être une matrice de tests datée, exécutée sur appareils réels, avec comptes utilisateur et partenaire non démo.
