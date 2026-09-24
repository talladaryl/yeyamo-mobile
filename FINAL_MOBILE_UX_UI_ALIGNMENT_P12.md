# YEYAMO MOBILE — FINAL UX/UI ALIGNMENT PASS (P12)

## Portée et garde-fous

P12 a été traité comme une passe de validation ciblée. Les clients API, DTO, hooks React Query, query keys, routes et mutations P4/P10/P11 ont été conservés. Le worktree contenait déjà des changements de passes précédentes ; ils ont été inspectés, mais ne sont pas attribués à P12.

## Matrice before

| Surface | Problème historique | État actuel | Preuve code | Action |
| --- | --- | --- | --- | --- |
| Explorer principal | rails/feedback masqués ou superposés | FIXED | `src/app/(tabs)/explore.tsx` : rails distincts, `DiscoveryTrendCard`, feedback et annulation | KEEP / DEVICE_TEST_REQUIRED |
| Carte | fond de carte, fallback et localisation confondus | CANNOT_VERIFY_STATICALLY | `src/app/(explore)/map.tsx` : `FALLBACK_REGION` ne déclenche aucune requête proche, coordonnées nulles filtrées, état natif explicite | DEVICE_TEST_REQUIRED |
| Adventure | CTA sous le clavier ou progression distincte | FIXED | `adventure.tsx` utilise `YeyamoFormScreen`, `YeyamoFormFooter`, `YeyamoFormProgress` | KEEP / DEVICE_TEST_REQUIRED |
| Adventure Plan | CTA final dans la zone home-indicator | STILL_PRESENT | `adventure-plan.tsx` ne réservait que `edges={['top']}` alors que le CTA est sous le scroll | FIX |
| Suggest Place | perte de focus/clavier fermé pendant la saisie | FIXED | quatre écrans sur `YeyamoFormScreen`; aucune navigation dans `onChangeText`, aucun `Keyboard.dismiss`, aucune key d’input dynamique | KEEP / DEVICE_TEST_REQUIRED |
| Create Event | perte de focus/clavier fermé pendant la saisie | FIXED | cinq écrans sur `YeyamoFormScreen`; états locaux, transition uniquement par CTA | KEEP / DEVICE_TEST_REQUIRED |
| Form selectors / sheet de signalement | champ de signalement recouvert par le clavier / bas de sheet non sûr | STILL_PRESENT | `ProfileSafetySheet` fournit un `Input` à `YeyamoModal`; la modal était ancrée sans `KeyboardAvoidingView` ni inset bas | FIX |
| Place Detail | erreur réseau confondue avec un spinner infini | STILL_PRESENT | `isLoading || !place` affichait le même spinner | FIX |
| Event Detail | erreur réseau confondue avec un spinner infini | STILL_PRESENT | `isLoading || !event` affichait le même spinner | FIX |
| Headers de groupes | label technique `(tabs)` à côté du retour | FIXED | `src/app/(tabs)/_layout.tsx`, `(profile)/_layout.tsx`, `(create)/_layout.tsx` définissent titres et masquent le back title technique | KEEP / DEVICE_TEST_REQUIRED |
| Profil Explorer | favoris, plannings, réservations et notifications ne distinguent pas leurs états | FIXED | `LoadingState`, `ErrorState`, `EmptyState`, retry et pagination dans les surfaces profil | KEEP |
| Profil public / sécurité | modal locale dupliquée ou double overlay | FIXED | `ProfileSafetySheet` réutilise `YeyamoModal`, `FormSelect`, `Input`, `Button` | KEEP, avec correction clavier de la primitive |
| Booking / payment | données embellies inventées | FIXED dans la limite du contrat | flux P11 conserve les statuts réels et ne crée pas de résumé fictif | KEEP |
| Dark mode Explorer | couleurs de surface hors thème | FIXED | surfaces contrôlées s’appuient sur `useThemeStore().colors`; couleurs fixes restantes sont branding/contraste sur médias ou états métier | KEEP / DEVICE_TEST_REQUIRED |

## Corrections P12

| Issue | Before P12 | Action | After P12 | Validation |
| --- | --- | --- | --- | --- |
| Sheet clavier | la sheet partagée restait au bas de la `Modal` lorsqu’un `Input` recevait le focus | `KeyboardAvoidingView` et `SafeAreaView` dans la primitive existante | la sheet remonte au-dessus du clavier et respecte l’inset bas iOS/Android | TypeScript, lint; device requis |
| Planning CTA | le bouton « Enregistrer le planning » n’avait pas d’inset bas | ajout de `bottom` aux trois `SafeAreaView` de l’écran | CTA et états loading/empty restent hors home-indicator | TypeScript, lint; device requis |
| Détail lieu | absence de donnée = loading infini | séparation loading/erreur avec `LoadingState` / `ErrorState` et retry existant | une erreur est maintenant lisible et retryable | TypeScript, lint |
| Détail sortie | absence de donnée = loading infini | séparation loading/erreur avec `LoadingState` / `ErrorState` et `eventQuery.refetch` | une erreur est maintenant lisible et retryable | TypeScript, lint |
| Suggest Place keyboard | suspicion historique | aucune réécriture : architecture déjà stable | conservé | analyse statique; device requis |
| Create Event keyboard | suspicion historique | aucune réécriture : architecture déjà stable | conservé | analyse statique; device requis |
| Header/tabs | suspicion historique | aucune réécriture : layouts déjà explicites | conservé | analyse statique; device requis |

## Audit clavier

### Suggest Place

Les quatre étapes `suggest-place-step1`, `suggest-place-step2`, `suggest-place-details` et `suggest-place-review` utilisent `YeyamoFormScreen` et la progression commune. Les valeurs de texte sont locales aux étapes et ne synchronisent le store ni ne naviguent qu’au clic sur le CTA. La recherche n’a trouvé aucun `Keyboard.dismiss()`, `blur()`, `useLocalSearchParams`, `router.setParams`, `key` dynamique sur les `TextInput` ou composant de champ déclaré dans le render de ces écrans. Les seules keys trouvées concernent les médias et les lignes de doublons, pas les champs.

Conclusion code : le mécanisme historique de remount/perte de focus ne subsiste pas dans ce flow.

### Create Event

Les cinq écrans `event`, `event-location`, `event-organization`, `event-settings` et `event-review` utilisent la même fondation. Les entrées texte de `event`, `event-location` et `event-organization` gardent un state local; chaque `router.push` est limité au handler Continuer. Aucun `Keyboard.dismiss()`, blur programmatique, changement de paramètres d’URL ni key d’input variable n’a été trouvé.

Conclusion code : le mécanisme historique de remount/perte de focus ne subsiste pas dans ce flow.

`src/app/(create)/story.tsx` contient le seul `Keyboard.dismiss()` trouvé dans `src`; il est déclenché exclusivement par le bouton accessible « Fermer le clavier » de la story et n’affecte pas les formulaires audités.

## Header et tabs

Les groupes Expo Router restent techniques :

- `(tabs)/_layout.tsx` définit `headerShown: false` et les titres utilisateurs des onglets.
- `(profile)/_layout.tsx` associe explicitement `search`, `suggestions`, `find-friends`, `activity`, `social-settings`, `followers`, `following` et `place-suggestions` à un titre et masque `headerBackTitle`.
- `(create)/_layout.tsx` fait de même pour tous les steps de suggestion et de création de sortie.
- Les écrans Adventure utilisent un seul header custom dans une `SafeAreaView` haute; `YeyamoFormScreen` ne gère que l’inset inférieur. Il n’y a donc pas de double header dans ce flow.

Le code ne permet plus à Expo Router d’exposer `(tabs)` comme libellé de retour. La position réelle sur petit Android et iOS reste à valider sur appareil.

## Inventaire des progressions de formulaires

| Formulaire | Fichiers | Steps | Progression avant P12 | Implémentation finale | Changée ? |
| --- | --- | ---: | --- | --- | --- |
| Suggest Place | `suggest-place-step1`, `step2`, `details`, `review` | 4 | `YeyamoFormProgress` | `YeyamoFormProgress` | Non |
| Create Event | `event`, `event-location`, `event-organization`, `event-settings`, `event-review` | 5 | `YeyamoFormProgress` | `YeyamoFormProgress` | Non |
| Transmettre un savoir | `culture-contribution` | 5 | `YeyamoFormProgress` | `YeyamoFormProgress` | Non |
| Créer une aventure | `(explore)/adventure` | 4 | `YeyamoFormProgress` | `YeyamoFormProgress` | Non |
| Créer une œuvre | `artwork/basic-information`, `story`, `culture`, `materials`, `media`, `availability`, `review` | 7 | direct + `Stepper` historique | `Stepper` délègue directement à `YeyamoFormProgress` | Non |
| Ajouter un lieu partenaire | `add-place-step1` à `add-place-step4` | 4 | `Stepper` | `Stepper` → `YeyamoFormProgress` | Non |
| Ajouter une sortie partenaire | `add-event-step1` à `add-event-step4` | 4 | `Stepper` | `Stepper` → `YeyamoFormProgress` | Non |
| Campagne partenaire | `campaign-create` | 6 | `Stepper` | `Stepper` → `YeyamoFormProgress` | Non |

`Stepper` n’est pas une seconde barre : il est un adaptateur déprécié dont le rendu est exactement `YeyamoFormProgress`. Le calcul partagé borne l’étape entre 1 et le total et atteint 100 % sur la dernière étape. Les progressions Story, quiz et Passport/XP sont volontairement exclues : elles représentent respectivement du temps, des questions ou un objectif métier, et non un formulaire multi-step.

## Duplication

| Concern | Existing implementations | Decision | Files |
| --- | --- | --- |
| Progression | `YeyamoFormProgress`; `Stepper` adaptateur | KEEP : une seule implémentation visuelle réelle | `components/forms/YeyamoFormProgress.tsx`, `components/ui/Stepper.tsx` |
| Wrapper clavier | `YeyamoFormScreen` pour les formulaires; `YeyamoModal` pour les sheets | KEEP et corriger la primitive modal existante, sans nouveau wrapper | `components/forms/YeyamoFormScreen.tsx`, `components/ui/YeyamoModal.tsx` |
| Header | layouts Expo Router + headers custom de flows plein écran | KEEP : aucune couche de header ajoutée | `app/(tabs)/_layout.tsx`, `app/(profile)/_layout.tsx`, `app/(create)/_layout.tsx` |
| Loading/error/empty | `LoadingState`, `ErrorState`, `EmptyState` | Réutilisation dans les détails lieu/sortie | `components/ui/ViewStates.tsx`, détails |
| Bottom sheet | `YeyamoModal` | KEEP, réutilisé par les selects et la sécurité profil | `YeyamoModal.tsx`, `FormSelect.tsx`, `MultiSelect.tsx`, `ProfileSafetySheet.tsx` |
| Form fields | `Input`, `FormSelect`, `SearchSelect`, `MultiSelect` | KEEP; aucune primitive ajoutée | `components/ui/*` |

## Fichiers modifiés par P12

| File | Problème démontré | Modification |
| --- | --- | --- |
| `src/components/ui/YeyamoModal.tsx` | le champ de signalement pouvait être recouvert par le clavier et la sheet n’avait pas d’inset bas | ajout de l’évitement clavier et de la safe-area à la primitive partagée |
| `src/app/(explore)/adventure-plan.tsx` | CTA hors du scroll dans une safe-area top-only | réservation de l’inset bas |
| `src/app/(places)/[id].tsx` | une erreur de détail restait un loading infini | réutilisation de `LoadingState`/`ErrorState` et retry |
| `src/app/(events)/[id].tsx` | une erreur de détail restait un loading infini | réutilisation de `LoadingState`/`ErrorState` et retry |

## ALREADY_CORRECT — NO CHANGE

- `YeyamoFormScreen`, `YeyamoFormFooter`, `Input`, `FormSelect`, `SearchSelect`, `MultiSelect`, `Button`, `SafeScreen` et `ViewStates` étaient déjà les primitives canoniques nécessaires.
- Les cinq steps Create Event et les quatre steps Suggest Place étaient déjà stables pendant la frappe : pas de remount ni dismiss global identifié.
- Les layouts `(tabs)`, `(profile)` et `(create)` masquaient déjà le groupe technique et évitaient le double header dans les flows concernés.
- Explorer principal conservait les actions « Intéressé » / « Pas intéressé », le retry et l’annulation P10 sans nouvelle logique API.
- Favorites, plannings, notifications, réservations et suggestions de lieux distinguaient déjà chargement, erreur et vide; aucune hydratation N+1 ni donnée fictive n’a été réintroduite.
- Le détail Map conserve les règles P11 : fallback caméra distinct de la position utilisateur, pas de coordonnées `0,0`, et « aucun lieu » distinct d’une panne de carte.

## Tests et validation

| Test/command | Result |
| --- | --- |
| `npx tsc --noEmit --pretty false` | PASS |
| `npm run lint` dans le sandbox | ENVIRONMENT_BLOCKED : Expo ne pouvait pas écrire son cache ESLint `.expo/cache/eslint` |
| `npm run lint` hors sandbox, uniquement pour le cache ESLint | PASS — 0 erreur, 5 avertissements préexistants hors fichiers P12 |
| Tests ciblés | NOT_RUN : aucun runner ou test ciblé pour ces composants n’est déclaré dans `package.json` |
| `git diff --check` | PASS |
| revue du diff P12 | PASS : aucun client HTTP, DTO, hook, query key, route ou mutation ajouté/modifié |

### Validation device requise

- Suggest Place : saisir continûment nom, adresse et description; changer un sélecteur puis revenir à une zone texte; vérifier que le focus ne se perd jamais.
- Create Event : même vérification sur titre, description, lieu, adresse et capacité; valider le footer au-dessus du clavier.
- Sheet de signalement : ouvrir « Signaler ce profil », saisir les détails, vérifier que les boutons restent accessibles et que le back/overlay ferme la sheet.
- Headers/tabs : vérifier petit Android, grand Android et iOS; aucun `(tabs)` ne doit être affiché et les tabs du profil public doivent rester sous le header.
- Map : valider sur une build native avec clé Google Maps et permission de localisation réelle.

```text
KEYBOARD_CODE_STATUS = ALREADY_FIXED
KEYBOARD_DEVICE_VALIDATION = REQUIRED

HEADER_TABS_CODE_STATUS = ALREADY_FIXED
HEADER_TABS_DEVICE_VALIDATION = REQUIRED

PROGRESS_BARS = ALIGNED

MAP_NATIVE_VALIDATION_PENDING = YES
```

```text
UX_UI_EXPLORER = ALIGNED

KEYBOARD_SUGGEST_PLACE = ALREADY_FIXED
KEYBOARD_CREATE_EVENT = ALREADY_FIXED
HEADER_TABS = ALREADY_FIXED
PROGRESS_BARS_GLOBAL = ALIGNED

DUPLICATE_COMPONENTS_INTRODUCED = NO
DUPLICATE_API_LOGIC_INTRODUCED = NO

MAP_NATIVE_VALIDATION_PENDING = YES

READY_FOR_P13_FINAL_AUDIT = YES
```
