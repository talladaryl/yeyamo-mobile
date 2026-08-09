# Audit final mobile — Culture, Artisanat et Africa-ready

Date : 9 août 2026  
Périmètre : `yeyamo-mobile` (Expo Router, React Query, Zustand, TypeScript strict)

## Décision de navigation

La bottom bar n’a pas été modifiée. Elle conserve exactement cinq espaces : Feed, Explorer, Créer, Messages et Profil. Culture, langues, œuvres, artisans, défis et commandes sont des routes secondaires dans ces espaces existants. Le tableau artisan reste une extension de `(partner-dashboard)`.

## Matrice d’alignement

| Fonctionnalité | FRONT_COMPLETE | BACKEND_ENDPOINT_AVAILABLE | CONNECTED | TESTED | État |
|---|---:|---:|---:|---:|---|
| Explorer Culture / contenu / détail | oui | oui (`culture-service`) | oui | non exécuté | prêt intégration |
| Langues, leçons, audio et progression | oui | oui (`culture-service`, `media-service`) | oui | non exécuté | prêt intégration |
| Quiz start / attempts / complete | oui | oui | oui, notation serveur | non exécuté | prêt intégration |
| Défis, participation et soumission post | oui | oui | oui | non exécuté | prêt intégration |
| Contributions culturelles | oui | oui | oui, payload enum corrigé | non exécuté | prêt intégration |
| Culture Graph / related | partiel | oui (`graph-service`) | client présent, affichage related à enrichir | non exécuté | dette UX |
| Catalogue œuvres | oui | oui (`catalog-service`) | oui | non exécuté | prêt intégration |
| Médias œuvres / audio | oui | oui (`media-service`) | oui, multipart réel | non exécuté | prêt intégration |
| Offres et commandes | oui | oui (`commerce-service`) | oui | non exécuté | prêt intégration |
| Profils artisans | oui | oui (`partner-service`) | oui | non exécuté | prêt intégration |
| Dashboard artisan | oui | partiel (analytics dédié absent) | catalogue et commandes oui | non exécuté | statistiques bloquées |
| Recherche Discovery | oui | oui (`discovery-service`) | oui, enveloppe `DiscoveryPage` respectée | non exécuté | prêt intégration |
| Notifications culture/artisan | oui | oui (`notification-service`) | oui, types + deep links allow-list | non exécuté | prêt intégration |
| Pays / configuration Africa-ready | interface locale Cameroun | backend dédié non livré pour ce périmètre | non, volontairement | non exécuté | BLOCKED_BACKEND |
| Feed polymorphe ARTWORK/CULTURE/CHALLENGE | renderer legacy post | flux backend actuel post uniquement | non simulé | non exécuté | BLOCKED_CONTRACT |

`TESTED = non exécuté` signifie qu’aucun test automatisé ou test manuel n’a été lancé à la demande. La vérification statique `npx tsc --noEmit` a été exécutée et réussit.

## Routes ajoutées ou étendues

- Explorer : `culture`, `languages`, `traditions`, `stories`, `challenges`, `artworks`, `artisans`, détails, leçons/quiz/résultat et recherche Discovery.
- Créer : `culture-contribution` et `artwork/basic-information`, `story`, `culture`, `materials`, `media`, `availability`, `review`.
- Profil : progression linguistique, contributions, défis, œuvres enregistrées, artisans suivis, commandes, onboarding artisan et alias de ses étapes.
- Partner Dashboard : catalogue œuvres, détail œuvre, commandes, détail commande, profil artisan et écran de statistiques explicitement non simulées.

## Modules et clients API

- `features/culture` : contenus, traductions, langues, leçons, défis, contributions et invalidations React Query.
- `features/artworks` : catalogue, détail, historique, médias, related, offre et création.
- `features/artisans` : recherche, profil public, spécialités, profil courant et création de profil artisan.
- `features/artwork-orders` : commande utilisateur, annulation, commandes artisan et transition de statut.
- `features/media` : upload multipart réel vers `/media/culture`, sans succès optimiste.
- `features/discovery` : recherche `/discovery/search` avec filtres de type et pagination backend.
- `features/country` : store SecureStore et configuration bootstrap Cameroun uniquement ; aucun endpoint Africa-ready supposé.

Le client Axios ajoute le JWT, renouvelle la session, normalise les erreurs et propage un `X-Correlation-ID` par requête.

## UX, sécurité et performance

- Tous les écrans réseau ont un état loading, erreur/retry ou vide explicite.
- Les prix `ON_REQUEST` n’affichent jamais de montant fictif. Les achats dépendent des feature flags pays, du statut d’offre et de l’authentification backend.
- Les soumissions de quiz et commandes utilisent les endpoints idempotents disponibles; la progression officielle ne peut pas être attribuée localement.
- Les médias sensibles ne sont pas préchargés. L’audio est chargé uniquement après action utilisateur.
- Les deep links de notifications sont limités aux types post, événement, lieu, culture, défi, œuvre, commande et artisan.
- Les mocks `culture/artwork/artisan` sont sélectionnés uniquement pour `demo-user`/`demo-partner`; le chemin `backend` utilise Axios et ne retombe pas sur ces données.

## Dépendances bloquantes restantes

1. Contrat backend Africa-ready (pays disponibles, statut, villes, devise, timezone, feature flags) avant remplacement du bootstrap Cameroun.
2. Contrat de flux Feed polymorphe et impressions pour `ARTWORK`, `CULTURE_CONTENT`, `DAILY_WORD`, `CULTURE_CHALLENGE` et `ARTISAN_SPOTLIGHT`.
3. Endpoint analytics artisan dédié pour vues, favoris et revenus.
4. Endpoint canonique de favoris/suivi ciblant les artisans et œuvres pour hydrater les deux écrans Profil hors démo.
5. Migration Expo SDK 54 vers SDK 56 à planifier séparément : le projet actuel reste en SDK 54 pour ne pas introduire une rupture non vérifiée dans cette tranche.

## Vérification finale demandée

- Aucun nouvel onglet principal ni nouvelle bottom bar n’a été ajouté.
- Les interfaces normales ne consomment pas de mock métier pour Culture, œuvres, artisans, commandes, Discovery ou notifications.
- Les comptes démo conservent un parcours local contrôlé.
- Aucun test n’a été lancé et aucune image Docker n’a été construite.
