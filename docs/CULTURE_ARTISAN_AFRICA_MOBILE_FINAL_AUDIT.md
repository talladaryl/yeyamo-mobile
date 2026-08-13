# Audit final mobile ↔ backend — Culture, Artisanat et Africa-ready

Date : 13 août 2026

## Navigation

La bottom bar est inchangée : **Feed, Explorer, Créer, Messages, Profil**. Les vérifications de routes confirment qu’aucun onglet principal supplémentaire n’a été ajouté.

## Matrice d’alignement

| Fonctionnalité | FRONT_COMPLETE | BACKEND_ENDPOINT_AVAILABLE | CONNECTED | TESTED | Statut |
|---|---:|---:|---:|---:|---|
| Sélection pays, ville, langue, timezone | oui | oui | oui | statique | prêt |
| Préférences pays / devise / découverte | oui | oui | oui | statique | prêt |
| Flags pays et blocage des créations | oui | oui | oui | statique | prêt |
| Inscription E.164 multi-pays | oui | oui | oui | statique | prêt |
| Explorer Culture, détail, traductions, contenu sensible | oui | oui | oui | statique | prêt |
| Langues, leçons, quiz, progression, mot du jour | oui | oui | oui | statique | prêt |
| Défis et contributions culturelles | partiel | oui | oui | statique | contribution avancée à enrichir |
| Graphe culturel relié | partiel | oui | relation de contenu | statique | routes lieu/langue/discover à afficher |
| Œuvres, offres, histoire et artisans | oui | oui | oui | statique | prêt |
| Création d’œuvre et upload média | oui | oui | oui | statique | prêt |
| Création partenaire puis profil artisan | oui | oui | oui | statique | KYC documentaire restant |
| Commandes d’œuvre utilisateur / artisan | oui | oui | oui | statique | prêt |
| Recommandations Explorer | oui | oui | oui | statique | filtre pays géré serveur |
| Notifications Culture / Artisan et deep links | oui | oui | oui | statique | prêt |
| Feed culturel polymorphe | non | non, contrat insuffisant | non | n/a | BLOCKED_CONTRACT |
| Feed local / pays / Afrique / voyage | préférences oui | non, paramètres absents | non | n/a | BLOCKED_CONTRACT |
| Contact direct artisan | bouton explicite | partiel | non | n/a | BLOCKED_CONTRACT |

`TESTED = statique` correspond à TypeScript, ESLint et export Expo. Il ne remplace pas une recette sur appareils et services démarrés.

## Africa-ready

- Le module `features/country` ne contient plus de bootstrap Cameroun codé en dur.
- Le backend fournit les pays, statuts, devises, langues, fuseaux et flags. Le store ne persiste qu’une sélection minimale; le profil backend réécrase celle-ci après connexion.
- L’inscription bloque un pays désactivé ou sans inscription autorisée. Les pays `COMING_SOON` restent gouvernés par le flag backend, sans décision locale.
- Les créations culturelles, commerciales et artisanales sont masquées et bloquées par les flags correspondants. L’indisponibilité de configuration est un blocage strict.
- Les valeurs `CM`, `XAF` et `+237` ne sont plus utilisées comme valeurs de repli dans les parcours ajoutés. Les données de démonstration conservent naturellement leurs valeurs camerounaises.

## Sécurité et intégrité

- JWT et refresh token sont stockés dans SecureStore; Axios injecte aussi un identifiant de corrélation.
- Les routes de notifications passent par `resolveResourceRoute`, une allow-list qui encode les identifiants.
- Les actions commerciales sont subordonnées au pays, aux flags, au statut d’offre et à la réponse serveur.
- Les appels de création n’annoncent jamais de succès avant la réponse backend.
- Les anciennes inscriptions partenaire simulées ont été supprimées; l’espace artisan commence par le partenaire authentifié requis par le backend.

## Dette restante priorisée

1. Étendre le contrat Feed avec les types culturels, les poids locaux/nationaux/panafricains, les modes et les impressions.
2. Exposer un `recipientUserId` de messagerie sur le profil artisan ou l’œuvre.
3. Relier les requirements KYC et l’upload multipart de documents à l’onboarding artisan.
4. Donner une interface aux relations Culture Graph de langue, lieu et découverte globale.
5. Remplacer les anciens flows de lieux/événements encore centrés Cameroun par les villes et zones du country-config-service.
6. Planifier séparément la migration Expo 54 → 56.

## Commandes exécutées

- `npm run lint` : succès, 0 erreur, avertissements historiques.
- `npx tsc --noEmit` : succès.
- `npx expo export --platform web` : succès; sortie `dist/`.
