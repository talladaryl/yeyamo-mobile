# UI/UX — Navigation, commentaires, Explorer et support

## Périmètre

Refonte ciblée du client mobile `yeyamo-mobile`. Les parcours API existants restent utilisés : Discovery pour la recherche, Feed/Interactions pour les commentaires, et les hooks React Query existants pour les écrans métier.

## Navigation flottante

- `src/components/ui/FloatingTabBar.tsx` fournit le fond verre translucide et `ActiveTabBubble`.
- Le navigator Tabs utilise `tabBarBackground`, `BlurView` à faible intensité, une bordure légère et un fond transparent.
- La barre est positionnée en absolu avec marges gauche/droite de 20 px et marge basse calculée avec la safe area.
- L'état compact est piloté par `useFloatingNavigationStore` pendant le défilement : la hauteur et les marges diminuent puis reviennent à l'état normal à l'arrêt réel, inertie comprise.
- L'onglet actif est une bulle translucide animée par Reanimated avec spring ; `useReducedMotion` désactive l'animation lorsque l'accessibilité système le demande.
- Le bouton Créer rouge et les icônes métier existantes sont conservés ; seul le conteneur global et l'indicateur actif ont été refondus.
- `PartnerPage` reprend la même surface BlurView et la même bulle pour les profils partenaires.
- Feed, Explorer, Messages, Profil et dashboard partenaire utilisent la hauteur réelle du tab bar pour leur `paddingBottom`, afin que le dernier élément reste atteignable.

## Commentaires

- `src/app/(post)/[id]/comments.tsx` utilise le `BottomSheet` déjà installé.
- Snap points : 55 % à l'ouverture et 88 % en extension, fermeture par glissement ou bouton.
- Le Feed reste visible sous le backdrop assombri.
- `BottomSheetFlatList` garde la liste virtualisée et affiche loading/empty/error/retry du flux existant.
- `BottomSheetTextInput`, `keyboardBehavior="interactive"` et `android_keyboardInputMode="adjustResize"` maintiennent le champ au-dessus du clavier sur iOS et Android.
- L'envoi reste dans le sheet, vide le champ après succès et conserve le brouillon après échec.
- Les actions reply/like/delete restent dépendantes des endpoints disponibles ; aucun faux endpoint n'a été inventé.

## Explorer et recherche

- `ExploreQuickFilters` remplace les gros filtres par des boutons compacts horizontaux : Tout, À proximité, Lieux, Événements, Culture, Œuvres, Artisans et Filtres.
- `ExploreAdvancedFiltersSheet` expose pays, région, ville, distance, type, langue, catégorie, disponibilité, vérification et vente.
- Le bouton Filtres affiche un compteur des critères actifs et propose Réinitialiser/Appliquer.
- `src/app/(explore)/search.tsx` conserve `useDiscoverySearch` et son debounce de 400 ms ; les suggestions affichées proviennent du résultat Discovery réel.
- Les filtres dont le contrat Discovery ne possède pas encore de champ dédié sont conservés localement dans le sheet sans remplacer les données par des mocks.

## Support User/Explorer et Partner

Routes ajoutées :

- `/(profile)/help`
- `/(profile)/faq`
- `/(profile)/support`
- `/(profile)/privacy-policy`
- `/(profile)/about`

Les liens sont exposés depuis le groupe Support des paramètres utilisateur et depuis les paramètres partenaire. Les mêmes pages natives sont partagées par les deux types de compte.

Les pages utilisent `SupportPageLayout`, Safe Area, thème clair/sombre, retour cohérent, scroll et touch targets accessibles. Les textes éditoriaux sont dans `src/i18n/locales/fr.json` et `en.json` et sont lus via `i18n.t`.

## Fichiers principaux

- `src/app/(tabs)/_layout.tsx`
- `src/components/ui/FloatingTabBar.tsx`
- `src/hooks/useFloatingNavigation.ts`
- `src/components/partner-dashboard/PartnerPage.tsx`
- `src/components/explore/ExploreQuickFilters.tsx`
- `src/components/explore/ExploreAdvancedFiltersSheet.tsx`
- `src/app/(post)/[id]/comments.tsx`
- `src/components/comments/CommentInput.tsx`
- `src/components/profile/SupportPageLayout.tsx`
- routes support sous `src/app/(profile)/`
- `src/i18n/locales/fr.json` et `en.json`

## Vérifications

- JSON i18n parsé avec succès.
- `npx tsc --noEmit --pretty false` validé après correction des imports.
- `npx tsc --noEmit --pretty false` validé.
- `npm run lint -- --no-cache` passe sans erreur bloquante ; le dépôt conserve 93 avertissements ESLint préexistants.
- `npx expo export --platform ios --output-dir export-check-ios2` validé : bundle iOS généré (2 725 modules). Les dossiers de contrôle ont ensuite été supprimés.
- L'export Expo sans plateforme ciblée reste conditionné à `react-native-web`, absent du projet ; aucun build web n'a été ajouté.
- Aucun test automatisé ni build d'image Docker n'est inclus dans cette refonte.

## Points à vérifier sur appareils

- Intensité BlurView sur un appareil iOS et Android réel, notamment sur les appareils bas de gamme.
- Position exacte de la barre avec les safe areas atypiques et la navigation gestuelle Android.
- Disponibilité backend des actions avancées de commentaire (reply, like, suppression) avant de leur ajouter une mutation dédiée.
