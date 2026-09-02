# Audit mobile — Culture, Artisanat et Africa-ready

Date : 13 août 2026  
Périmètre : `src/app`, `src/features`, `src/components`, `src/services`, routes Expo Router et contrats Spring Boot du même dépôt.

## Décision d’architecture

La navigation principale reste strictement composée de cinq onglets : Feed, Explorer, Créer, Messages et Profil. Aucun onglet Culture, Artisan ou Marketplace n’a été créé. Les parcours Culture et Artisan utilisent les groupes secondaires existants `(explore)`, `(create)`, `(profile)` et `(partner-dashboard)`.

## Inventaire vérifié

| Domaine | Routes ou écrans réutilisés | Client / store | État après audit |
|---|---|---|---|
| Pays | inscription, `/(profile)/preferences` | `features/country`, SecureStore, React Query | connecté au country-config-service et au profil |
| Explorer culturel | `culture`, `languages`, `traditions`, `stories`, `challenges` | `features/culture`, `features/discovery` | connecté |
| Langues | détail, leçons, quiz, résultat, progression Profil | `features/culture` | connecté |
| Œuvres / artisans | listes et détails Explorer | `features/artworks`, `features/artisans` | connecté |
| Création | choix existant, contribution, flow œuvre à sept étapes | `features/create`, `features/media` | connecté selon feature flags |
| Commandes | Profil et Partner Dashboard | `features/artwork-orders` | connecté |
| Partenaire artisan | `/(profile)/become-artisan` et dashboard existant | `features/partner`, `features/artisans` | partenaire créé avant profil artisan |
| Recommandations | rail « Pour vous » dans Explorer | `features/recommendations` | connecté |
| Notifications | écran existant + allow-list de deep links | `features/notifications` | connecté |

Les deux anciens écrans pré-authentification partenaire avaient un faux délai et n’appelaient aucun serveur. Ils sont maintenant des alias de l’inscription utilisateur réelle. Le partenaire est créé après authentification, comme l’exige `POST /api/v1/partners`.

## Routes retenues

- Explorer : `culture`, `culture/[id]`, `languages`, `languages/[code]`, `languages/[code]/lessons`, `language-lessons/[id]`, quiz et résultat, `traditions`, `stories`, `challenges`, `artworks`, `artisans` et détails.
- Créer : `culture-contribution` et les sept routes `artwork/*` existantes. Elles réutilisent le `Stepper` et les drafts existants.
- Profil : `language-progress`, `culture-contributions`, `culture-challenges`, `saved-artworks`, `followed-artisans`, `artwork-orders` et `become-artisan`.
- Tableau partenaire : `artworks`, `artwork-orders`, `artisan-profile`, `artisan-statistics` sous `(partner-dashboard)`.

## Contrats réellement comparés

- Country Config : pays, disponibilité, configuration, flags, langues, devises, fuseaux et villes.
- User : profil courant et les trois PATCH de localisation, langue et préférences de découverte.
- Culture : contenus, traductions, langues, leçons, progression, mot du jour, défis, contributions et graphe culturel.
- Catalog / Partner / Commerce : œuvres, offres, artisans, profils artisans et commandes.
- Discovery / Recommendation / Notification : recherche, tendances, recommandations et deep links.

Le préfixe Axios est déjà `/api/v1`; les clients utilisent donc des chemins relatifs (`/countries`, `/culture/...`) afin de ne jamais doubler ce segment.

## Choix de non-duplication

- Les alias `become-artisan/*` pointent tous vers l’unique écran fonctionnel existant, plutôt que de copier six formulaires inconsistants.
- Les cartes Explorer réutilisent les composants Culture, Artwork et Artisan existants.
- La messagerie reste celle de `(chat)`; aucun canal commercial parallèle n’est créé.
- Les comptes démo restent explicitement isolés. Une session backend ne retombe pas silencieusement sur des données Culture, Artwork, Artisan ou Recommendation fictives.

## Risques et dépendances suivis

1. Le contrat Feed actuellement exposé ne retourne que des posts paginés. Il ne permet pas encore un renderer polymorphe ni les paramètres local/pays/Afrique/voyage.
2. Le contrat Recommendation filtre les préférences de pays côté profil serveur, mais ne publie pas `countryCode` ni `cityId` dans la réponse ou les query params.
3. La messagerie ne reçoit qu’un identifiant utilisateur destinataire alors que les œuvres et artisans exposent un `partnerId`.
4. Les exigences KYC et l’upload de documents existent côté Partner Service, mais l’interface de documents artisan doit encore être reliée à ce contrat multipart.
5. Le projet reste sur Expo SDK 54. Aucune migration vers SDK 56 n’a été forcée dans cette tranche afin de ne pas introduire une rupture de dépendances.

## Validation statique

- `npx tsc --noEmit` : réussi.
- `npm run lint` : réussi avec avertissements historiques, sans erreur.
- `npx expo export --platform web` : réussi après ajout de `react-native-web` et d’un fallback web pour les écrans qui utilisent `react-native-maps`.
