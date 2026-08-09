# Audit initial mobile Culture, Artisanat et Africa-ready

> Ce document décrit l’état observé avant la tranche d’implémentation. L’état final est documenté dans `CULTURE_ARTISAN_AFRICA_MOBILE_FINAL_AUDIT.md`.

Date : 4 août 2026  
Périmètre audité : `src/app`, `src/features`, `src/components`, `src/services`, `src/hooks`, configuration Expo/TypeScript et usages de mocks.

## 1. Résumé exécutif

Le projet est une application Expo Router feature-first de 115 fichiers de routes et 29 modules métier. La bottom navigation respecte déjà la contrainte produit : Feed (`index`), Explorer, Créer, Messages (`chats`) et Profil. Aucun nouvel onglet principal n'est nécessaire.

L'intégration demandée doit étendre les groupes existants `(explore)`, `(create)`, `(profile)` et `(partner-dashboard)`. Les modules Culture, Country, Artworks et Artisans n'existent pas encore.

Deux blocages empêchent une implémentation fiable immédiate :

1. `package.json` utilise Expo `~54.0.0`, Expo Router `~6.0.24`, React Native `0.81.5` et React `19.1.0`, alors que la cible demandée est Expo SDK 56. La documentation Expo 56 indique React Native 0.85, React 19.2.3 et Node 20.19.x minimum. Une migration versionnée et testée doit précéder tout code dépendant de SDK 56.
2. Le dépôt ne contient ni code backend Spring Boot, ni OpenAPI, ni fixtures de contrats. Les endpoints fournis dans le brief ne suffisent pas à vérifier les DTO, enums, nullables, formats monétaires, pagination et erreurs. Aucun client Culture/Artisan/Country ne doit être inventé avant obtention du contrat.

État de départ :

| Domaine | Front | Client API | Connecté | Testé | État |
|---|---:|---:|---:|---:|---|
| Africa-ready / pays | non | non | non | non | BLOCKED_CONTRACT |
| Culture | non | non | non | non | BLOCKED_CONTRACT |
| Langues / leçons | non | non | non | non | BLOCKED_CONTRACT |
| Œuvres | non | non | non | non | BLOCKED_CONTRACT |
| Artisans | non | non | non | non | BLOCKED_CONTRACT |
| Commandes artisanales | non | non | non | non | BLOCKED_CONTRACT |
| Feed polymorphe culturel | non | non | non | non | BLOCKED_CONTRACT |
| Navigation à cinq onglets | oui | sans objet | oui | non | FRONT_COMPLETE |

## 2. Architecture actuelle

### Socle

- Expo Router avec racine `src/app/_layout.tsx`.
- Cinq tabs déclarées dans `src/app/(tabs)/_layout.tsx`.
- TypeScript strict activé dans `tsconfig.json`.
- React Query v5, avec un `QueryClient` global, `retry: 2`, `staleTime: 2 min`, `gcTime: 10 min`.
- Zustand pour auth, onboarding, intérêts, création, chat, partenaire, thème, passeport et campagnes.
- Axios centralisé dans `src/services/api/client.ts`; préfixe global `/api/v1`, JWT Bearer, refresh token sérialisé et normalisation d'erreurs.
- Jetons et session dans Expo SecureStore.
- Zod et React Hook Form disponibles.
- i18n initialisé depuis `@/i18n`; ressources françaises et anglaises existantes, mais beaucoup de libellés restent codés directement en français.

### Navigation principale

| Espace | Route actuelle | Extension cible |
|---|---|---|
| Feed | `/(tabs)` | Renderer polymorphe et recommandations |
| Explorer | `/(tabs)/explore` | Culture, langues, œuvres, artisans, défis |
| Créer | `/(create)/choice` ou `/(partner)/choice` | Œuvre, contribution culturelle, réponse à un défi |
| Messages | `/(tabs)/chats`, `/(chat)/[id]` | Contact artisan avec contexte |
| Profil | `/(tabs)/profile` et `(profile)` | Progression, favoris, commandes, préférences pays |

Le comportement actuel redirige le bouton Créer vers un flow différent pour un partenaire. Il faudra harmoniser les options et permissions sans dupliquer davantage les deux systèmes.

### Modules existants pertinents

- Découverte : `explore`, `places`, `events`, `experiences`, `maps`.
- Publication et médias : `create`, `post`, `story`, composants `create`, `feed`, `story`.
- Social : `social`, `social-graph`, `collections`, commentaires, favoris et abonnements.
- Profil et partenaire : `profile`, `settings`, `partner`, `partner-dashboard`, `partner-staff`, `finance`, `ticketing`.
- Infrastructure : `auth`, `notifications`, `chat`, `feed`, `interests`, `theme`.

Il n'existe pas de module séparé `media`; les sélections de médias sont dispersées dans les écrans et composants d'authentification/création. Il n'existe pas non plus de module `gamification`; la fonctionnalité correspondante est répartie entre `social-graph`, badges et passeport.

## 3. Écrans existants à réutiliser ou étendre

### Explorer

- `src/app/(tabs)/explore.tsx` : point d'entrée à étendre par sections compactes.
- `src/app/(explore)/search.tsx` : à connecter à Discovery Service et aux nouveaux types.
- `src/app/(explore)/map.tsx` : à rendre dépendant de la configuration pays; utilise actuellement `CAMEROON_CENTER`.
- `src/components/explore/FilterBottomSheet.tsx` et `FilterButton.tsx` : base des filtres étendus.
- `CategoryCard`, `EventCard`, `PlaceListItem`, `TrendingPlaceCard`, `ExperienceCard` : patrons de cartes.

### Créer

- `src/app/(create)/choice.tsx` et `src/components/create/CreationOptionCard.tsx` : liste de choix à étendre.
- `src/features/create/create.store.ts` : store central à étendre avec drafts typés et persistance.
- `src/components/ui/Stepper.tsx` : composant réutilisable pour les flows multi-étapes.
- `publication.tsx` : à réutiliser pour les réponses aux défis.
- Les flows lieu/événement existants montrent le patron de navigation, mais leur nombre d'étapes est incohérent dans certains écrans (`totalSteps` 2, 4 ou 5).

### Profil

- `src/app/(profile)/activity.tsx` : progression culturelle et linguistique.
- `favorites.tsx` et groupe `(collections)` : œuvres sauvegardées.
- `following.tsx` : artisans suivis via le système social existant.
- `preferences.tsx` : pays, ville, langues, devise et mode de découverte.
- `settings.tsx` : accès aux préférences sans nouvelle entrée principale.
- `src/app/(tabs)/profile.tsx` : seulement des raccourcis compacts.

### Partner Dashboard

- `dashboard.tsx`, `statistics.tsx`, `finance.tsx`, `settings.tsx` et composants `partner-dashboard/StatCard.tsx`, `PartnerPage.tsx`, `PartnerProfileDashboard.tsx`.
- Les pages œuvres, commandes et profil artisan doivent rester des sous-pages conditionnelles de ce dashboard.

### Messages, interactions et notifications

- `src/features/chat` et `src/app/(chat)/[id].tsx` : conversation artisan; aucun second système.
- `src/features/social`, `post`, `collections` : like, follow, commentaires et sauvegardes.
- `src/features/notifications` : ajouter les types et un résolveur de deep links validé.
- `src/components/ui/AccessibleButton.tsx`, `AccessibleImage.tsx`, `AccessibleTouchable.tsx` : bases d'accessibilité.

## 4. Écrans réellement nouveaux

Ils restent secondaires; aucun n'appartient à `(tabs)`.

### Explorer

- `(explore)/culture/index`, `(explore)/culture/[id]`
- `(explore)/languages/index`, `(explore)/languages/[code]`
- `(explore)/languages/[code]/lessons`
- `(explore)/language-lessons/[id]`, `/quiz`, `/result`
- `(explore)/traditions/index`, `(explore)/traditions/[id]`
- `(explore)/stories/index`, `(explore)/stories/[id]`
- `(explore)/challenges/index`, `(explore)/challenges/[id]`
- `(explore)/artworks/index`, `(explore)/artworks/[id]`, `/history`, `/gallery`
- `(explore)/artisans/index`, `(explore)/artisans/[id]`
- `(explore)/artisan-specialties/[id]`

### Créer

- Sept écrans sous `(create)/artwork`.
- Sept écrans sous `(create)/culture`.

Le défi ne nécessite pas un flow complet distinct : il doit injecter une référence de challenge dans le flow de publication existant.

### Profil

- Pages de progression, contributions, défis, œuvres sauvegardées, artisans suivis et commandes décrites dans le brief.
- Flow `become-artisan` en six étapes.

### Partner Dashboard

- `artworks`, `artworks/[id]`, `artwork-orders`, `artwork-orders/[id]`, `artisan-profile`, `artisan-statistics`.

## 5. Modules feature à créer

Après validation OpenAPI/DTO :

```text
src/features/country/
src/features/culture/
src/features/artworks/
src/features/artisans/
src/features/artwork-orders/
src/features/recommendations/
```

Convention recommandée, alignée sur les modules les plus récents :

- `*.types.ts` : modèles domaine et DTO distincts.
- `*.schemas.ts` : validation Zod aux frontières réseau/formulaire.
- `*.mappers.ts` : DTO vers domaine, notamment dates et montants.
- `*.api.ts` : uniquement HTTP, routes relatives à `/api/v1`.
- `*.query-keys.ts` : factories stables, incluant pays/langue/filtres.
- `*.hooks.ts` : React Query, états d'autorisation et invalidations.
- `components/` : cartes et états propres à la feature.

`media` devrait devenir un module partagé si le backend possède réellement un Media Service : sélection, compression, upload, progression, annulation et retry doivent être centralisés avant les deux nouveaux flows.

## 6. Composants partagés à créer ou consolider

- `AsyncScreenState` : loading, skeleton, empty, error/retry, offline, unauthorized, feature disabled, country unavailable.
- `CountryAvailabilityGuard` : visibilité et navigation, sans remplacer l'autorisation serveur.
- `MoneyText` utilisant `formatMoney`.
- `RemoteAudioPlayer` accessible : play/pause, vitesse, loading et transcript.
- `VerificationBadge` basé sur `VerifiedBadge`.
- `MediaGallery` et `UploadQueue`.
- `OrderTimeline`.
- `FeedItemRenderer`.

Les composants culturels et artisanaux du brief doivent rester fins. Les listes doivent utiliser `FlatList`/`FlashList`; aucun appel réseau par carte.

## 7. Endpoints backend associés et statut

Tous les endpoints Culture, Country, Artworks, Artisans, Orders, Recommendations et Culture Graph listés dans le brief sont **non vérifiables dans ce dépôt**. Ils sont donc `BACKEND_ENDPOINT_AVAILABLE = UNKNOWN`, et non disponibles par présomption.

Avant connexion, fournir au minimum :

- OpenAPI versionné du gateway ou des microservices;
- schémas de pagination (cursor et/ou page Spring);
- enveloppe de réponse et format d'erreur;
- enums pays, disponibilité, offre, vérification, contenu sensible et notification;
- représentation des `BigDecimal` (chaîne recommandée), ISO 4217, dates/instants et timezones;
- stratégie d'upload (multipart direct, URL signée, reprise);
- règles d'autorisation/KYC et codes d'erreur;
- contrat de deep link et identifiants opaques.

Attention : `apiClient` préfixe déjà `/api/v1`. Les nouveaux fichiers API doivent appeler `/countries`, `/culture/...`, etc., pas `/api/v1/...`, sinon le chemin serait dupliqué.

## 8. Mocks et hypothèses Cameroun à traiter

Les mocks ne sont pas limités aux tests. Ils sont utilisés en mode démo et parfois directement par des écrans de production :

- passeport et badges (`social-graph`);
- dashboard partenaire (statistiques, paramètres, avis, réservations, notifications, événements, établissements);
- expériences et détail expérience;
- paramètres profil;
- carte Explorer;
- participants de création d'événement;
- feed, stories, events, places, collections et autres modules via mode démo.

Le brief autorise les mocks de test, mais demande la suppression des mocks de production liés aux nouveaux domaines. Aucun mock Culture/Artwork/Artisan n'existe encore; il ne faut pas en ajouter.

Hypothèses locales repérées :

- `XAF` dans ticketing, events, finance, checkout et campagnes;
- `+237` dans inscription utilisateur/partenaire et formulaire partenaire;
- textes Cameroun dans onboarding, recherche, carte, expériences, passeport et profils;
- centre géographique camerounais importé par la carte;
- rangs/régions camerounais dans le passeport.

Ces usages doivent migrer progressivement vers une `CountryConfiguration` backend. Les valeurs de compatibilité pour un ancien utilisateur sans `countryCode` doivent être définies par le backend ou une migration produit explicite, pas cachées dans les composants.

## 9. Stores et persistance

Stores existants utiles :

- `auth.store.ts` : utilisateur, session backend/démo et hydratation.
- `onboarding.store.ts` : uniquement progression du splash/onboarding actuel.
- `interests.store.ts` : intérêts persistés.
- `create.store.ts` : drafts non persistés d'événement, lieu, story, publication.
- `partner.store.ts`, `chat.store.ts`, `passport.store.ts`, `campaign-draft.store.ts`, `theme.store.ts`.

Le futur `country.store.ts` doit stocker uniquement la sélection/préférence locale minimale. Après authentification, la configuration backend reste la source de vérité et doit être réhydratée/invalidée. SecureStore convient aux petites préférences sensibles; les gros drafts et caches React Query ne doivent pas y être placés.

Avant de persister `artworkDraft` et `cultureContributionDraft`, définir une politique pour les médias locaux, le consentement et les données sensibles. Ne jamais sérialiser un blob média dans SecureStore.

## 10. Risques sécurité

- Les guards UI et feature flags ne remplacent jamais le contrôle serveur.
- Les routes `[id]` doivent traiter 403/404 de manière identique lorsque nécessaire pour limiter l'énumération/IDOR.
- Les deep links de notifications doivent passer par une allow-list de types/routes et valider les identifiants.
- Les médias privés/sensibles ne doivent pas être préchargés ni mis en cache durablement.
- Le consentement culturel doit être envoyé et confirmé par le serveur; pas de succès optimiste.
- L'achat, la commande, le changement de statut et le KYC ne doivent jamais dépendre du seul rôle local.
- Les refresh tokens sont dans SecureStore, ce qui est approprié; vérifier la rotation et la révocation côté backend.

## 11. Performance et UX

Points positifs : pagination infinie du feed, pagination du module finance, images Expo disponibles, React Query global.

Risques :

- `getNextPageParam` du feed dérive une chaîne de page depuis un lien, alors que le brief exige une pagination cursor : contrat à réconcilier.
- plusieurs écrans utilisent des données statiques et ne modélisent pas tous les états UX;
- absence d'un lecteur audio partagé;
- absence de cache/offline explicite;
- risque de N+1 si les détails artisan/culture sont chargés par carte;
- nombreux écrans monolithiques et chaînes codées en dur compliquant i18n et rerenders.

## 12. Dépendances bloquantes

1. Migration officielle Expo 54 vers 56, avec Node compatible et alignement des paquets via `npx expo install`.
2. Contrats OpenAPI/DTO backend.
3. Confirmation de la stratégie d'authentification et des permissions par microservice.
4. Contrat Media Service.
5. Contrat Discovery/Recommendations et événements d'impression.
6. Liste canonique des feature codes et statuts pays.
7. Décision de migration pour les comptes historiques sans pays.
8. Infrastructure de tests : aucun script `test` et aucun script `lint` dans `package.json`.

## 13. Ordre d'implémentation recommandé

1. Stabiliser/migrer Expo SDK 56 et obtenir un baseline lint/typecheck/export vert.
2. Importer les contrats backend ou générer/valider les DTO.
3. Ajouter `country` et les formatters; migrer les hypothèses XAF/+237/Cameroun.
4. Étendre onboarding et préférences, avec compatibilité utilisateurs existants.
5. Créer un socle partagé d'états UX, médias et audio.
6. Créer Culture et Discovery; intégrer Explorer et recherche.
7. Ajouter langues/leçons/progression.
8. Créer Artworks/Artisans; intégrer Explorer, social et messagerie.
9. Étendre Créer avec drafts, validation et upload.
10. Étendre Profil et Partner Dashboard avec commandes.
11. Étendre Feed, recommandations, impressions et notifications.
12. Audit d'alignement final frontend/backend, sécurité, performance et suppression des mocks de production concernés.

## 14. Risques de régression

- Rupture du route guard au démarrage en ajoutant des étapes d'onboarding.
- Duplication des routes `/api/v1` dans les nouveaux clients.
- Cache React Query partagé entre pays si le `countryCode` manque dans les query keys.
- Affichage ou achat dans un pays désactivé après changement de préférence.
- Drafts incompatibles après changement de schéma/version de l'app.
- Double soumission de quiz, contribution ou commande.
- Régression partenaire si Créer reste bifurqué entre `(create)` et `(partner)`.
- Deep links vers des ressources privées ou supprimées.
- Valeurs monétaires arrondies si `BigDecimal` est converti prématurément en `number`.
- Régression des 115 routes existantes lors de la migration Expo Router.

## 15. Changements structurels sûrs autorisés maintenant

À ce stade, le seul changement sûr réalisé est ce document d'audit. La création de modules API vides ou de types supposés donnerait une fausse impression d'intégration et contredirait l'interdiction de simuler une API absente.

La prochaine tranche sûre commence lorsque les deux prérequis sont fournis : baseline Expo 56 validée et contrat backend versionné.
