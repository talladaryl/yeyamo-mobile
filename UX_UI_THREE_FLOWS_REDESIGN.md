# Yeyamo Mobile — refonte de trois parcours

## A. Fichiers modifiés

- `src/app/(create)/_layout.tsx`
- `src/app/(create)/event.tsx`
- `src/app/(create)/event-location.tsx`
- `src/app/(create)/event-organization.tsx`
- `src/app/(create)/event-settings.tsx`
- `src/app/(create)/event-review.tsx`
- `src/app/(create)/suggest-place-step1.tsx`
- `src/app/(create)/suggest-place-step2.tsx`
- `src/app/(create)/suggest-place-details.tsx`
- `src/app/(create)/suggest-place-review.tsx`
- `src/app/(create)/culture-contribution.tsx`
- `src/components/forms/YeyamoFormFooter.tsx`
- `src/components/ui/SearchSelect.tsx`
- `src/components/ui/index.ts`
- `src/features/create/types.ts`
- `src/features/places/placeReferences.hooks.ts`

Les assistants réutilisent également les fondations déjà introduites :
`YeyamoFormScreen`, `YeyamoFormProgress`, `YeyamoFormStep`, `Input`,
`FormSelect`, `DateTimeField`, `Button` et `Toggle`.

## B. Architecture des nouveaux parcours

### Créer une sortie

1. **Activité** — titre, description, image facultative.
2. **Lieu et horaire** — recherche d’un lieu Yeyamo ou lieu personnalisé
   limité à cette sortie, carte, date et heures.
3. **Organisation** — capacité et accès aux personnes non invitées.
4. **Visibilité** — public ou sur invitation, préférences réellement prises
   en charge par `CreateEventInput`.
5. **Récapitulatif** — sections modifiables, soumission unique et écran de
   succès avec route réelle vers la sortie ou Explorer.

### Suggérer un lieu

1. **Le lieu** — nom, catégorie obtenue de `GET /categories`, type facultatif.
2. **Localisation** — pays de profil, région `GET /regions`, ville dépendante
   `GET /cities/region/{id}`, adresse et position sur carte.
3. **Détails** — description facultative et information transparente sur les
   médias non pris en charge.
4. **Vérification** — récapitulatif, envoi à `POST /place-suggestions` et
   confirmation de modération.

### Transmettre un savoir

1. **Type de savoir** — uniquement les enums existants : récit, tradition,
   proverbe, expression, recette et chant.
2. **Origine** — pays de profil, langue réelle et communauté facultative.
3. **Contenu** — titre, résumé, corps de la contribution.
4. **Détails** — ingrédients et étapes pour une recette ; sens, traduction et
   audio pour un proverbe ; aucun champ artificiel pour les autres types.
5. **Consentement et vérification** — récapitulatif, confirmation locale,
   création puis soumission éditoriale existantes.

Les valeurs sont conservées dans le store de création pour les sorties et les
suggestions, et dans une instance stable de React Hook Form pour la culture.
Les composants de champs ne sont pas déclarés à l’intérieur de l’écran parent,
ce qui évite leur remount pendant la frappe.

## C. Champs déplacés ou retirés visuellement

- `latitude` et `longitude` ne sont plus jamais des champs de saisie publique.
  Elles viennent exclusivement d’un toucher/déplacement de repère sur la carte
  pour un lieu personnalisé ou une suggestion publique.
- L’identifiant UUID d’un lieu Yeyamo n’est plus demandé : la recherche
  `SearchSelect` retourne un lieu réel.
- Les identifiants techniques d’utilisateurs ne sont plus demandés pour
  l’invitation. Il n’existe pas de sélecteur de membres prouvé pour les
  remplacer.
- Les coordonnées ne figurent pas dans les récapitulatifs.
- Le choix de catégorie de lieu utilise les références backend, sans liste
  locale inventée.

## D. BACKEND_REQUIRED

| Fonction | Frontend préparé | Backend actuel constaté | Statut |
|---|---|---|---|
| Groupe automatique de sortie | Non simulé | `CreateEventInput` ne porte ni groupe ni relation événement-groupe | BACKEND_REQUIRED |
| Association à un événement | Non affichée comme action active | Aucune propriété `eventId` dans `CreateEventInput`, ni recherche d’événements liée à un lieu | BACKEND_REQUIRED |
| Lieu temporaire réutilisable | Lieu libre envoyé avec la sortie, clairement distinct d’une suggestion publique | Le contrat permet `locationName/address/lat/lng`, pas une entité privée réutilisable | BACKEND_REQUIRED |
| Partage Feed de sortie | Préférence visible avec message transparent | `share_to_feed` n’est pas envoyé par `eventsApi.createEvent` et aucun post n’est créé | BACKEND_REQUIRED |
| Story automatique | Non simulée | Aucun contrat Story avec référence/CTA vers une sortie ou un groupe | BACKEND_REQUIRED |
| Invitations par recherche de membre | Identifiants techniques retirés de l’UX | L’invitation existe avec `userId`, sans sélecteur de membre confirmé | BACKEND_REQUIRED |
| Tickets / membres de groupe | Non simulés | Aucun champ de création de sortie ni contrat de groupe correspondant | BACKEND_REQUIRED |
| Photos de suggestion de lieu | Information explicite à l’étape Détails | `PlaceSuggestionInput` ne contient pas de média | MEDIA_BACKEND_REQUIRED |
| Pays / ville distincts d’une suggestion | Pays visible, ville choisie selon la région et ajoutée à l’adresse envoyée | `PlaceSuggestionInput` ne possède ni `countryCode`, ni `cityId` | BACKEND_REQUIRED |
| Publication Feed après modération d’un lieu | Non simulée | Aucun événement de modération / metadata Feed constaté dans le contrat mobile | BACKEND_REQUIRED |
| Consentement culturel persisté | Confirmation accessible à la dernière étape | `CultureContributionInput` ne comporte pas de champ de consentement | BACKEND_REQUIRED |

## E. Bugs et limites révélés

- L’ancien formulaire de sortie demandait directement un UUID ou une latitude
  et longitude et mélangeait toutes les données dans un même écran.
- `share_to_feed` existait dans le brouillon frontend mais n’était pas consommé
  par la requête de création d’événement.
- Les anciennes invitations exigeaient la saisie d’un `userId` technique,
  inutilisable sans recherche de membres.
- L’ancien flux de suggestion ne recevait aucune référence réelle de catégorie,
  région ou ville et finissait par une soumission depuis la carte.
- L’API de suggestion ne permet pas l’upload de photo ; aucun upload n’est donc
  proposé.
- Le lint Expo et ESLint direct ne terminent pas dans la fenêtre de 60 secondes
  de cet environnement, sans émettre de diagnostic de règles.

## F. Validation

- `npx tsc --noEmit` : **PASS**.
- `git diff --check` : **PASS** (seuls les avertissements CRLF Git existent).
- `npm run lint` : non concluant, expiration après 60 secondes pendant le
  démarrage `expo lint`, sans erreur de règle.
- ESLint ciblé sur tous les fichiers de cette passe : non concluant, même
  expiration sans sortie de règle.
- Tests unitaires : aucun script de test n’est défini dans `package.json`.
- Export/build Android : non exécuté, conformément à la demande.

## Checklist manuelle recommandée

1. Créer une sortie avec un lieu Yeyamo, puis avec un lieu personnalisé ; taper
   une phrase entière dans tous les `Input` sans perte de focus.
2. Revenir à chaque étape d’une sortie et confirmer que titre, image, lieu,
   horaire, capacité et visibilité sont préservés.
3. Vérifier l’erreur de création réseau : le récapitulatif et les données ne
   doivent pas disparaître.
4. Suggérer un lieu, sélectionner région puis ville, toucher la carte, revenir
   et vérifier que la position est conservée.
5. Confirmer qu’aucune suggestion ne prétend être déjà publiée et qu’aucun
   écran de photos ne simule un upload.
6. Tester chaque type culturel, notamment recette et proverbe, avec les retours
   d’étape et la confirmation finale.
7. Répéter ces trois parcours en thème clair et sombre, avec le clavier Android
   et iOS ouvert.
