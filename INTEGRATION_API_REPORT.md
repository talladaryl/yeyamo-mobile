# Rapport d’intégration API — YeYamo Mobile

Date : 13 août 2026  
Portée : audit des écrans Culture, Artisanat, Africa-ready, Feed, Recommendations, Notifications et des parcours historiques directement concernés.

## Résultat

Les interfaces qui disposent d’un contrat backend utilisable sont maintenant reliées à des clients typés, React Query et des états d’erreur. Aucune nouvelle route ni aucun nouvel onglet principal n’a été dupliqué. Les faux succès de l’ancienne inscription partenaire ont été retirés.

## Interfaces connectées à une API

| Interface | Route mobile | API consommée | Remarque |
|---|---|---|---|
| Inscription | `/(auth)/register` | `POST /auth/register`, `GET /countries*`, villes | pays, ville, langue, timezone et E.164 |
| Préférences territoriales | `/(profile)/preferences` | `GET /users/me`, PATCH location/language/discovery | source de vérité backend |
| Explorer Culture | `/(explore)/culture*` | `/culture/contents`, traductions, langues, défis, mot du jour | états loading/erreur/retry |
| Recherche | `/(explore)/search` | `GET /discovery/search` | pays et langue transmis quand connus |
| Recommandations | rail Explorer « Pour vous » | `GET /recommendations` | langue + contexte contractuels |
| Œuvres / artisans | `/(explore)/artworks*`, `artisans*` | catalog + partner | offres et détails réels |
| Création œuvre | `/(create)/artwork/*` | artworks, artwork-offers, media | garde-fous pays/devise |
| Contribution culturelle | `/(create)/culture-contribution` | contributions + submit | blocage si feature inactive |
| Devenir artisan | `/(profile)/become-artisan` | `GET/POST /partners/me`, `POST /partners`, profil artisan | crée le partenaire avant le profil |
| Commandes œuvre | Profil et dashboard | artwork-orders / artisan orders | montants avec devise |
| Notifications | `/(profile)/notifications` | notification-service | deep links allow-list |

## Interfaces sans API exploitable ou contrat suffisant

| Interface | Situation | Décision actuelle |
|---|---|---|
| Feed « abonnements » | Feed Service ne distingue pas les suivis | message explicite, sans faux feed |
| Feed LOCAL / COUNTRY / AFRICA / TRAVEL | `GET /feed` accepte seulement `page` et `size` | préférences enregistrées, mix bloqué côté contrat |
| Feed polymorphe Culture/Artwork/Challenge | le DTO Feed ne contient que des posts | aucun renderer fictif ajouté |
| Contacter un artisan | l’œuvre expose un `partnerId`, la messagerie exige un `userId` destinataire | bouton explique le blocage |
| Commande personnalisée / devis | aucun contrat de demande/réponse publié | offre affichée sans faux checkout |
| Statistiques artisan détaillées | pas de métriques dédiées vues/favoris/revenus | dashboard conserve un écran sans chiffres inventés |
| Ancien flow suggestion de lieu | parcours historique encore basé sur données démo et régions fixes | documenté pour migration territoriale, non étendu dans cette tranche |

## APIs disponibles sans interface dédiée complète

| API | Écart UI restant |
|---|---|
| `GET /countries/{code}/administrative-areas`, localités | seules les villes sont sélectionnables aujourd’hui |
| `GET /partners/onboarding/requirements` | requirements KYC à afficher dans l’onboarding artisan |
| `POST /partners/me/documents` multipart | sélection et upload de documents KYC à relier |
| `POST /partners/me/submit` | soumission KYC finale à ajouter après upload |
| Culture Graph langue, lieu et discover | seule la relation Culture → explore est affichée |
| `GET /culture/daily`, `/trending`, `/categories` | le mot du jour et les listes filtrées sont utilisés; ces variantes n’ont pas de surface dédiée |
| endpoints de configuration pays unitaires langue/devise/timezone | la route agrégée `/configuration` est utilisée pour éviter les appels N+1 |

## Contrats contrôlés avec attention

- Tous les montants utilisateur passent avec leur `currencyCode`; il n’y a pas de conversion locale.
- Le client Recommendation n’envoie pas `countryCode` et `cityId` car le contrôleur actuel ne les accepte pas. Les préférences de pays sont appliquées dans le profil côté serveur.
- Le client Country n’envoie pas `contentLanguages` au PATCH discovery : ce champ ne fait pas partie du DTO backend de cette route; les langues passent par le PATCH dédié.
- Les identifiants des routes sont encodés avant navigation et les notifications ne peuvent générer aucune URL arbitraire.

## Mocks

Les mocks Culture, Artwork, Artisan et Feed ne sont accessibles que dans les sessions `demo-*`. Une session backend ne bascule pas sur un mock si le serveur est indisponible. Les anciens écrans partenaire pré-authentification qui simulaient une soumission ont été remplacés par une redirection vers l’inscription réelle.

## Vérifications exécutées

| Commande | Résultat |
|---|---|
| `npx tsc --noEmit` | succès |
| `npm run lint` | succès, 0 erreur; avertissements historiques non bloquants |
| `npx expo export --platform web` | succès, sortie dans `dist/` |

L’export a initialement révélé l’absence de `react-native-web` et l’import direct de `react-native-maps`. `react-native-web` a été ajouté avec Expo et les écrans carte utilisent désormais un adaptateur `.web.tsx`; les cartes natives restent inchangées sur iOS/Android.

## À tester avec une stack réelle

1. Pays LIVE, COMING_SOON, DISABLED et configuration indisponible.
2. Ville hors pays, téléphone E.164 et timezone à l’inscription.
3. Création de partenaire, profil artisan puis documents KYC.
4. Offre dans devise non-Cameroun, commande et annulation.
5. Deep link de chaque nouveau type de notification.
6. Feed multi-pays dès que son contrat versionné est disponible.
