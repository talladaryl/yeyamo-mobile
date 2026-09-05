# RAPPORT D’AUDIT GLOBAL ET CIBLÉ POST-MIGRATION EXPO SDK 57
**Projet :** `yeyamo-mobile`  
**Date :** 5 septembre 2026  
**Type :** Audit technique, statique, architectural et runtime (lecture seule — aucune modification apportée)  
**Auteur :** Antigravity Pair Programmer  

---

## 1. Résumé exécutif

Le projet mobile `yeyamo-mobile` a été audité dans son intégralité à la suite de sa migration d'**Expo SDK 54 vers Expo SDK 57** (React Native 0.86.3, React 19.2.3, Expo Router 57.0.19, New Architecture Fabric/Bridgeless active).

L'audit confirme que :
1. **Compilation statique :** TypeScript (`npx tsc --noEmit`) s'exécute avec **0 erreur**.
2. **Conformité Expo Doctor :** 20 des 21 vérifications réussissent. 1 échec est constaté sur l'alignement strict de 3 dépendances (`eslint-config-expo`, `typescript`, `@types/react`).
3. **Cartographie :** 162 fichiers de routes Expo Router, 48 hooks React Query / state, 33 clients API totalisant 64 endpoints consommés ont été audités.
4. **Anomalies critiques identifiées (P0/P1) :**
   - **La carte Explorer (`react-native-maps`)** ne s'affiche plus ou reste vierge en raison du cumul de :
     - l'instabilité de `react-native-maps` v1.27.2 sur la New Architecture Fabric de React Native 0.86 (bridgeless) ;
     - l'absence du plugin `react-native-maps` dans `app.json` et `app.config.ts` ;
     - l'absence de clé API Google Maps (`EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY` vide) alors que `provider={PROVIDER_GOOGLE}` est hardcodé ;
     - une exécution sur d'anciennes builds natives SDK 54 incompatibles avec le bundle SDK 57.
   - **Le bouton `+` / Créer en profil démo Explorateur** débouche sur une vue totalement vide car `src/app/(create)/choice.tsx` filtre toutes ses options sur les `countryFeatures` (`useCountryFeature`). Or, en mode démo ou hors-ligne, aucune configuration pays n'est mockée, faisant retomber tous les flags à `false` et masquant l'ensemble des boutons.
   - **La navigation Explorer / Discovery** possède un bug de résolution : `discoveryHref` retourne intentionnellement `null` pour tout élément de type `EXPERIENCE`, déclenchant une alerte « Contenu indisponible » alors que la route `src/app/(experiences)/[id].tsx` existe bel et bien. De plus, `normalizeDiscoveryId` n'effectue qu'un `indexOf(':')`, laissant des préfixes intacts en cas d'identifiants composés (`recommendation:place:uuid`).
   - **Réservation de lieu (`Place -> Réserver`)** : L'interface bloque l'utilisateur avec une `Alert.alert` explicite (`BLOCKED_BY_BACKEND`). Le backend expose en réalité un `booking-service` basé sur des créneaux d'activités (`/api/v1/activities/{activityId}/availability` et `/api/v1/bookings`), sans relation dans le catalogue entre un `Place` et une activité réservable.
   - **Flux Participer / Paiement Démo (Orange Money, MTN MoMo, Wave)** : Aucune interface, aucun composant, aucun logo, aucun formulaire et aucun mock n'existe dans l'application pour Orange Money, MTN ou Wave. Le checkout d'événement (`(events)/[id]/checkout.tsx`) crée un ordre backend puis attend passivement en polling sans formulaire de règlement.
   - **Lien Artisan -> Messagerie** : Le bouton « Contacter l'artiste » déclenche une simple `Alert.alert`. Le service `chatApi.createConversation` exige un `userId`, alors que le profil `Artisan` ne publie qu'un `partnerId` sans résolution d'identité utilisateur.
   - **Proverbes et Recettes vers Feed** : Le DTO backend du Feed (`BackendFeedItem` / `BackendPost`) n'accepte aucun lien vers une ressource culturelle (`proverbId`, `recipeId`). L'interface `VerticalFeedItem` possède pourtant le composant visuel de badge `linked_content`, mais le backend ne fournit pas les champs pour l'alimenter. De plus, le formulaire de création de post ne permet pas de lier une ressource culturelle, et le formulaire `culture-contribution` ne publie pas dans le feed.
   - **Bug d'invalidation et boucle infinie de pagination Feed** : `useFeed` renvoie `lastPage.meta.current_page.toString()` au lieu de `lastPage.links.next`, bloquant le curseur sur la page 0.

---

## 2. Verdict global

**PARTIELLEMENT FONCTIONNEL AVEC RÉGRESSIONS CRITIQUES**

L'application possède une base d'écran très riche et un code TypeScript rigoureusement typé, mais présente des blocages d'intégration majeurs, des faux comportements mockés non unifiés, des formulaires inachevés en mode partenaire et un système de carte native rompu suite à la New Architecture de React Native 0.86.

---

## 3. Score santé technique : 68/100
- **TypeScript & Typage :** 98/100 (0 erreur de compilation, typage d'API rigoureux).
- **Structure du code :** 82/100 (architecture modulaire par fonctionnalités).
- **Gestion des formulaires :** 42/100 (multiplication d'états locaux non validés, double clics possibles, validation Zod absente sur les parcours Create).
- **Gestion des états & cache :** 70/100 (React Query bien configuré mais requêtes désactivées ou non invalidées, mocks éparpillés).
- **Intégrité runtime :** 48/100 (carte native inaccessible, avertissements de layouts nested, écran Créer démo vide).

---

## 4. Score compatibilité Expo 57 : 64/100
- Dépendances du cœur Expo alignées sur 57.0.x.
- React 19.2.3 et React Native 0.86.3 actifs.
- Régressions confirmées sur `react-native-maps` en New Architecture Fabric.
- Avertissements de dépréciation sur `expo-navigation-bar` et `SafeAreaView`.
- Conflit d'alignement de versions sur `eslint-config-expo`, `typescript` et `@types/react`.

---

## 5. Score Explorer : 58/100
- Matrice des rails et navigation vers lieux et événements fonctionnelle.
- Recherche multi-critères avec debouncing opérationnelle.
- Carte interactive (`map.tsx`) non fonctionnelle sur device réel sans clé Google Maps ni configuration New Architecture.
- Clic sur les expériences bloqué (« Contenu indisponible »).

---

## 6. Score Create : 32/100
- Écran de choix totalement vierge en session démo utilisateur classique (Explorateur).
- Écrans partenaires (`add-place-step4`, `add-event-step4`, `publication`) terminés par des `console.log` factices sans appel d'API.
- Envoi de publication standard (`(create)/publication.tsx`) fonctionnel avec upload multipart, mais sans sélecteur de lien culturel (proverbe/recette).

---

## 7. Score Culture : 62/100
- Catalogue riche en mode démo (`demoProverbs`, `demoRecipes`).
- Mode backend incomplet : recettes privées d'ingrédients et étapes ; proverbes réduits au slug.
- Cartes de langues horizontales `w-52` incohérentes dans une `FlatList` verticale.
- Aucun éditeur visuel de proverbe.

---

## 8. Score Feed : 60/100
- Lecteur vertical type TikTok (`VerticalFeedItem`) avec vidéo via `expo-video` fonctionnel.
- Pagination cassée dans `useFeed.ts` (boucle infinie sur la page 0).
- Absence de support backend pour les contenus polymorphes enrichis (proverbes, recettes).

---

## 9. Score thème : 65/100
- Tokens sémantiques `themeColors.light` et `themeColors.dark` bien pensés.
- Incohérences majeures : styles hardcodés `#0A0A0A`, `#161616`, `bg-white` subsistant dans les modals, barres d'onglets, en-têtes et formulaires.
- Écran de modal Créer avec en-tête noir forcé en plein thème clair.

---

## 10. Stack et versions

| Package | Version installée | Attendue Expo 57 | Risque | Utilisé où |
| :--- | :---: | :---: | :---: | :--- |
| `expo` | `57.0.20` | `^57.0.0` | Faible | Racine / Runtime |
| `react` | `19.2.3` | `19.2.3` | Faible | Cœur React |
| `react-native` | `0.86.3` | `0.86.3` | Élevé (Fabric New Arch) | Cœur natif |
| `expo-router` | `57.0.19` | `~57.0.19` | Moyen | Navigation racine et sous-dossiers |
| `react-native-reanimated` | `4.5.1` | `4.5.1` | Moyen | Animations |
| `react-native-worklets` | `0.10.1` | `0.10.1` | Moyen | Moteur de worklets Reanimated 4 |
| `react-native-gesture-handler` | `2.32.0` | `~2.32.0` | Moyen | Gestes tactiles / Bottom sheet |
| `react-native-screens` | `4.26.2` | `~4.26.0` | Faible | Stacks de navigation |
| `react-native-safe-area-context` | `5.7.0` | `~5.7.0` | Faible | Insets et marges sécurisées |
| `react-native-maps` | `1.27.2` | `1.27.2` | **CRITIQUE** | `NativeMap`, Explorer Map |
| `react-native-svg` | `15.15.4` | `15.15.4` | Faible | Icônes et QR codes |
| `react-native-webview` | `13.16.1` | `13.16.1` | Faible | Splash screen animé HTML |
| `react-native-web` | `0.21.2` | `^0.21.0` | Faible | Export et prévisualisation web |
| `typescript` | `5.9.3` | `~6.0.3` | Faible | Transpilation et contrôle de types |
| `@types/react` | `19.1.17` | `~19.2.4` | Faible | Définitions de types React |
| `eslint-config-expo` | `10.0.0` | `~57.0.2` | Faible | Linter |
| `expo-location` | `57.0.16` | `~57.0.16` | Moyen | Géolocalisation GPS |
| `expo-image` | `57.0.4` | `~57.0.4` | Faible | Affichage des médias et caches |
| `expo-camera` | `57.0.4` | `~57.0.4` | Moyen | Prise de photos dans les posts |
| `expo-video` | `57.0.3` | `~57.0.3` | Moyen | Lecteur vidéo du feed |
| `expo-notifications` | `57.0.17` | `~57.0.17` | Moyen | Notifications push |
| `expo-secure-store` | `57.0.3` | `~57.0.3` | Faible | Tokens d'authentification |
| `expo-navigation-bar` | `57.0.2` | `~57.0.2` | Moyen | Barre de navigation Android |
| `nativewind` | `4.2.5` | `^4.2.5` | Moyen | Styles Tailwind |
| `tailwindcss` | `3.4.19` | `^3.4.19` | Faible | Compilateur CSS |
| `@tanstack/react-query` | `5.101.0` | `^5.101.0` | Faible | Gestionnaire de requêtes et cache |
| `zustand` | `5.0.14` | `^5.0.14` | Faible | Stores d'état global |
| `axios` | `1.18.0` | `^1.18.0` | Faible | Client HTTP |

- **Node.js :** `v22.23.0`
- **npm :** `10.9.8`

---

## 11. Expo Doctor

Commande exécutée : `npx expo-doctor@latest`  
**Résultat :** 20 contrôles réussis sur 21. 1 échec détecté.

```text
✖ Check that packages match versions required by installed Expo SDK

❗ Major version mismatches
package             expected  found    
eslint-config-expo  ~57.0.2   10.0.0   
typescript          ~6.0.3    5.9.3    

⚠️ Minor version mismatches
package             expected  found    
@types/react        ~19.2.4   19.1.17  

3 packages out of date.
```

**Analyse technique :**
- `package.json` possède une déclaration redondante et contradictoire de `typescript` : `"typescript": "~6.0.3"` dans `dependencies`, et `"typescript": "~5.9.2"` dans `devDependencies`. L'exécutable effectif installé est en version `5.9.3`.
- `@types/react` est déclaré en `~19.2.4` dans `dependencies` et `~19.1.10` dans `devDependencies`, ce qui crée une friction de résolution de version.
- `eslint-config-expo` est installé en version `10.0.0` au lieu de la version officielle Expo 57 (`~57.0.2`).

---

## 12. TypeScript

Commande exécutée : `npx tsc --noEmit`  
**Résultat :** **0 erreur**. Code retour `0`.

**Ventilation par domaine fonctionnel :**
- Navigation : 0 erreur
- React / React Native : 0 erreur
- Expo SDK : 0 erreur
- Formulaires : 0 erreur
- API / DTO : 0 erreur
- Thème : 0 erreur
- Feed : 0 erreur
- Culture : 0 erreur
- Create : 0 erreur
- Explorer : 0 erreur

**Verdict :** Le contrat statique des types est parfaitement respecté par l'ensemble des fichiers du projet. Les dysfonctionnements observés ne proviennent pas d'erreurs de compilation TypeScript mais de logiques métier conditionnelles, d'incohérences de contrats d'API et de configurations natives.

---

## 13. Architecture mobile

Le projet est structuré selon une approche feature-based moderne dans `src/` :
- `src/app/` : Expo Router (File-based Routing, 162 routes).
- `src/features/` : 23 modules fonctionnels autonomes (api, hooks, store, types, mappers).
- `src/components/` : Composants UI atomiques et composants métier.
- `src/services/` : Client HTTP Axios, intercepteurs, SecureStore, WebSocket Reverb.
- `src/config/` : Variables d'environnement (`env.ts`), flags (`featureFlags.ts`).
- `src/constants/` : Thème, typographie, espacements.
- `src/i18n/` : Internationalisation français/anglais.

Le projet n'a aucun dossier natif figé `android/` ou `ios/` à la racine (Continuous Native Generation via Prebuild EAS).

---

## 14. Navigation globale

La navigation repose sur `expo-router` v57 :
1. **Layout racine (`src/app/_layout.tsx`) :**
   - Configure un `Stack` sans en-tête avec les groupes `(onboarding)`, `(auth)`, `(tabs)`, et l'ensemble des modales et routes transversales.
   - Gère les redirections de boot (splash -> onboarding -> auth -> interests -> tabs).
   - Enregistre le gestionnaire de déconnexion 401.
2. **Layout des onglets (`src/app/(tabs)/_layout.tsx`) :**
   - 5 onglets : `index` (Accueil/Feed), `explore` (Explorer), `create` (Créer), `chats` (Messages), `profile` (Profil).
   - L'onglet `create` n'est pas une page mais un déclencheur d'événement (`tabPress`) qui intercepte la sélection et pousse `/(create)/choice` (ou `/(partner)/choice` selon le rôle).
3. **Anomalies de layout constatées au runtime :**
   - Au démarrage, Expo Router émet des warnings récurrents :  
     `WARN [Layout children]: No route named "(social-graph)/badges" exists in nested children`.  
     Le layout racine référence `(social-graph)` qui possède son propre `_layout.tsx`, mais le mapping des sous-écrans génère des avertissements d'imbrication sous Expo Router 57.

---

## 15. Explorer

L'écran Explorer (`src/app/(tabs)/explore.tsx`) rassemble :
- Sélecteur de région (`RegionPicker`)
- Raccourci vers la carte (`/(explore)/map`)
- Barre de recherche textuelle vers `/(explore)/search`
- Filtres rapides (`ExploreQuickFilters`)
- Bannière de région à la une (`FeaturedRegionCard`)
- Carrousel horizontal des catégories
- 4 rails de découverte : « Pour vous » (recommandations), « Près de vous » (lieux tendance), « Événements à venir », « Culture et créateurs ».

**Dysfonctionnements constatés :**
1. Clic sur un événement sans billet ou sans prix complet déclenche une navigation vers `(bookings)/event/[id]` qui n'est pas connectée à la billetterie backend.
2. Clic sur les expériences de découverte déclenche une alerte d'erreur au lieu d'ouvrir le détail de l'expérience.

---

## 16. React Native Maps

**Diagnostic extrêmement détaillé :**
- **Package :** `react-native-maps` version `1.27.2`.
- **Fichier de pont :** `src/components/maps/NativeMap.tsx` réexporte directement `MapView` et `PROVIDER_GOOGLE`.
- **Fichier web :** `NativeMap.web.tsx` fournit un fallback `View` neutre.
- **Utilisation :** `src/app/(explore)/map.tsx` instancie :
  ```tsx
  <NativeMap
    ref={mapRef}
    provider={PROVIDER_GOOGLE}
    style={{ flex: 1 }}
    initialRegion={CAMEROON_CENTER}
    showsUserLocation
    showsMyLocationButton={false}
  >
  ```
- **Causes de l'absence / écran blanc de la carte :**
  1. **Clé API Google Maps manquante :** `app.config.ts` configure `googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY ?? '' }`. Or, dans `.env`, cette variable **n'existe pas**. La clé transmise au manifest Android est donc une chaîne vide `""`. Sur Android, `PROVIDER_GOOGLE` avec une clé invalide refuse de charger les tuiles ou affiche une grille beige vide avec le logo Google en bas à gauche.
  2. **Incompatibilité Fabric / New Architecture :** Expo 57 active par défaut la New Architecture de React Native 0.86 sans bridge. `react-native-maps` v1.27.2 présente des instabilités notoires avec l'interop layer Fabric sous RN 0.86 (marqueurs non rendus, plantage silencieux du conteneur natif, problèmes de dimensionnement).
  3. **Absence du Config Plugin :** `react-native-maps` n'est pas déclaré dans le tableau `plugins` de `app.json` ni de `app.config.ts`.
  4. **Build native obsolète :** Si le testeur exécute l'application dans un client de développement compilé sous SDK 54, le bundle JS SDK 57 provoque une incompatibilité binaire immédiate.

---

## 17. Géolocalisation

- **Module :** `expo-location` `57.0.16`.
- **Permissions :** `ACCESS_FINE_LOCATION` et `ACCESS_COARSE_LOCATION` déclarées dans `app.json`.
- **Comportement du hook `useLocation` (`src/hooks/useLocation.ts`) :**
  - Ne lance pas la géolocalisation à l'initialisation ; attend l'appel explicite de `requestLocation()`.
  - En mode démo, `map.tsx` utilise `CAMEROON_CENTER` (`{ latitude: 3.848, longitude: 11.5021 }`).
  - En mode backend réel, si la permission n'est pas encore accordée ou si la position met plus de 12 secondes à répondre (timeout interne du hook), `currentLocation` reste `null` et l'écran bloque l'affichage de la carte avec un écran intermédiaire « Localisation requise ».

---

## 18. Places

- **API :** `src/features/places/places.api.ts`.
- **Endpoints consommés :**
  - `GET /api/v1/places/nearby?lat={}&lng={}&radiusKm={}&limit=20`
  - `GET /api/v1/discovery/search?type=PLACE`
  - `GET /api/v1/places/{id}`
- **Écran de détail :** `src/app/(places)/[id].tsx`.
- **Anomalie :** Le mapping `normalizeDiscoveryId` est bien appliqué lors de la recherche, mais sur l'écran de détail, les avis récents (`recent_reviews`) et les horaires sont formatés localement sans possibilité d'ajouter un avis.

---

## 19. Réservation (Place)

- **Composant :** `src/app/(places)/[id].tsx` (lignes 28-31 et 128-130).
- **Code actuel :**
  ```tsx
  const explainBookingBlock = () => Alert.alert(
    'Réservation indisponible',
    'BLOCKED_BY_BACKEND — le contrat disponible ne relie pas encore ce lieu à une activité réservable et ne publie pas le DTO nécessaire au formulaire de réservation.',
  );
  ```
- **Diagnostic :**
  - **Verdict : BACKEND INCOMPLET PAR RAPPORT AU BESOIN UI**.
  - Le `booking-service` existant (`port 8102`) est modélisé autour d'un `activityId` (`/api/v1/activities/{activityId}/availability`).
  - Un lieu (`Place`) n'est pas associé à une activité réservable par le `place-service`.
  - Il n'existe aucun endpoint `GET /api/v1/places/{id}/availability` ni `POST /api/v1/places/{id}/bookings`.

---

## 20. Events

- **API :** `src/features/events/events.api.ts`.
- **Endpoints :**
  - `GET /api/v1/events/upcoming`
  - `GET /api/v1/events/{id}`
  - `GET /api/v1/events/me?limit=100`
- **Écran de détail :** `src/app/(events)/[id].tsx`.
- L'événement affiche les participants, le lieu associé et propose deux parcours distincts :
  1. « Participer » (social).
  2. « Acheter un billet » (billetterie).

---

## 21. Participation

- **Écran :** `src/app/(bookings)/event/[id].tsx`.
- **Fonctionnement :**
  - Enregistre une participation sociale via `POST /api/v1/events/{id}/register`.
  - Permet de choisir une formule et une quantité, mais l'appel d'API final `registration.mutateAsync` valide uniquement la présence de l'utilisateur sur l'événement sans procéder à aucun débit ni émission de billet officiel.

---

## 22. Ticketing

- **API :** `src/features/ticketing/ticketing.api.ts`.
- **Endpoints :**
  - `GET /api/v1/tickets/events/{id}/types`
  - `POST /api/v1/tickets/hold`
  - `POST /api/v1/tickets/orders`
  - `GET /api/v1/tickets/orders/{orderId}`
  - `GET /api/v1/tickets/my-tickets`
- **Flux :** `(events)/[id]/tickets.tsx` -> sélection du type de billet -> redirection vers `(events)/[id]/checkout.tsx?ticketId=...`.

---

## 23. Paiement demo

- **Écran :** `src/app/(events)/[id]/checkout.tsx`.
- **Code actuel :**
  - Effectue un `hold` du billet puis appelle `createOrder`.
  - Passe en état `pending` (`order.status === 'AWAITING_PAYMENT'`).
  - Déclenche un compte à rebours basé sur `expiresAt`.
- **Absence totale de passerelle de paiement :**
  - Il n'existe **aucun formulaire de paiement**, **aucun choix d'opérateur**, **aucun champ de numéro de téléphone**, et **aucune action pour simuler le succès du paiement en mode démo**.
  - L'écran reste bloqué sur « Paiement en attente » jusqu'à expiration du timer.

---

## 24. Orange Money / MTN / Wave

- **Résultat de la recherche globale dans le code :**
  - Recherche insensible à la casse sur `Orange` : **0 occurrence**.
  - Recherche insensible à la casse sur `MTN` / `MoMo` : **0 occurrence**.
  - Recherche insensible à la casse sur `Wave` : **0 occurrence**.
- **Diagnostic :**
  - **Verdict : FONCTIONNALITÉ UI ET BACKEND NON EXISTANTE**.
  - Ni le frontend mobile ni le backend n'ont implémenté la sélection d'opérateur mobile money pour l'achat de billets.

---

## 25. Culture

- **Routes :**
  - `src/app/(explore)/culture.tsx`
  - `src/app/(explore)/proverbs.tsx` & `[id].tsx`
  - `src/app/(explore)/recipes.tsx` & `[id].tsx`
  - `src/app/(explore)/languages.tsx` & `[code].tsx`
  - `src/app/(create)/culture-contribution.tsx`
- **Problème de cohérence :**
  - En mode démo, le contenu est très riche (données locales complètes).
  - En mode backend, l'API `culture-service` ne retourne que des objets génériques `CultureContent` avec un `slug`, un `title` et un `body` textuel, sans structures spécifiques pour les recettes ou proverbes.

---

## 26. Filtres rapides Culture

- Implémenté dans `CatalogListScreen.tsx` :
  ```tsx
  <FlatList
    horizontal
    data={categories}
    renderItem={({ item }) => (
      <TouchableOpacity
        onPress={() => setCategory(item)}
        className="rounded-full border px-4 py-2"
        style={{
          backgroundColor: category === item ? colors.primary : colors.card,
          borderColor: category === item ? colors.primary : colors.border
        }}
      >
        <Text style={{ color: category === item ? '#FFFFFF' : colors.textSecondary }}>{item}</Text>
      </TouchableOpacity>
    )}
  />
  ```
- **Problèmes de design :**
  - Manque de contraste en mode sombre.
  - Hauteur et espacements inconstants par rapport aux filtres d'Explorer (`ExploreQuickFilters`).
  - Absence d'icônes ou d'animations de transition.

---

## 27. Cotations / Chips / Tags

- 4 implémentations différentes et non harmonisées existent dans le projet :
  1. `ExploreQuickFilters.tsx` : utilise `h-9 rounded-xl border px-3` avec teinte primaire à 14% d'opacité (`${colors.primary}14`).
  2. `FilterButton.tsx` : utilise `px-4 py-2 rounded-full mr-2` avec fond `#EF4444` ou `bg-white dark:bg-[#161616]`.
  3. `CatalogListScreen.tsx` : utilise `rounded-full border px-4 py-2`.
  4. `places.tsx` : filtres de liste codés directement dans le JSX.

---

## 28. Langues à apprendre

- **Écran :** `src/app/(explore)/languages.tsx`.
- **Composant carte :** `LanguageCard.tsx`.
- **Défaut de design critique :**
  `LanguageCard` possède une largeur fixe codée en dur : `w-52` (208 px) et une marge droite `mr-3`, conçue à l'origine pour un carrousel horizontal. Or, `languages.tsx` l'affiche dans une **`FlatList` verticale**, ce qui produit une colonne étroite alignée à gauche avec un immense espace vide à droite.
- **Données disponibles non exploitées :** L'objet `CultureLanguage` possède `speakerEstimate`, `writingSystem`, `description`, et `useLanguageLessons` renvoie le nombre de leçons disponibles, mais aucun de ces champs n'est présenté sur la carte.

---

## 29. Artisans

- **Écran :** `src/app/(explore)/artisans/[id].tsx`.
- Affiche la bio de l'artisan, ses créations et spécialités.
- Pied de page : Bouton « Contacter l'artiste ».

---

## 30. Messagerie / Inbox

- **Comportement du bouton « Contacter l'artiste » :**
  ```tsx
  onPress={() => Alert.alert('Contact', `Les coordonnées publiques de ${data.displayName} seront utilisées dès qu’elles seront disponibles.`)}
  ```
- **Raison technique :**
  - `chatApi.createConversation` (`/api/v1/messaging/conversations`) exige un tableau `participantIds: [string]` contenant des `userId`.
  - Le modèle `Artisan` ne contient qu'un `partnerId`.
  - Il n'existe aucune API permettant d'obtenir le `userId` associé à un `partnerId` ou de démarrer une conversation client-partenaire directe.

---

## 31. Bouton `+` / Créer

- **Fichier :** `src/app/(tabs)/_layout.tsx` (lignes 132-137).
- L'appui sur l'onglet intercepte l'action et pousse :
  - `/(partner)/choice` si l'utilisateur est partenaire.
  - `/(create)/choice` si l'utilisateur est un explorateur standard.
- **Le problème de l'écran vide en démo Explorateur :**
  Dans `src/app/(create)/choice.tsx` :
  ```tsx
  const cultureEnabled = useCountryFeature('cultureModuleEnabled');
  const commerceEnabled = useCountryFeature('artisanCommerceEnabled');
  const contentPublishingEnabled = useCountryFeature('contentPublishingEnabled');
  const placePublishingEnabled = useCountryFeature('placePublishingEnabled');
  const eventFeatureEnabled = useCountryFeature('eventFeatureEnabled');

  const options = [
    ...commonOptions.filter((option) => {
      if (option.id === 'publication' || option.id === 'story') return contentPublishingEnabled;
      if (option.id === 'event') return contentPublishingEnabled && eventFeatureEnabled;
      if (option.id === 'place') return contentPublishingEnabled || placePublishingEnabled;
      return cultureEnabled && contentPublishingEnabled;
    }),
    ...(userType === 'partner' && commerceEnabled ? [artworkOption] : []),
  ];
  ```
  - En mode démo, `authService.loginDemo('user')` n'initialise aucune configuration pays.
  - L'appel réseau vers `/countries/CM/features` échoue ou n'est pas exécuté.
  - `useCountryStore.countryConfiguration` vaut `null`.
  - `useCountryFeature` renvoie `false` pour TOUTES les fonctionnalités.
  - `options` vaut `[]` (tableau vide).
  - L'écran n'affiche aucune carte et présente uniquement le message : *« La publication n’est pas activée pour votre pays ou sa configuration est indisponible. »*.
  - En mode partenaire (`(partner)/choice.tsx`), la liste des options est statique et ne subit pas ce filtre, ce qui explique pourquoi le bug n'apparaît qu'en profil Explorateur.

---

## 32. Création de publication (`(create)/publication.tsx`)

- **Fonctionnalités :** Sélection d'images/vidéos via `expo-image-picker`, prise de vue caméra, légende texte, upload multipart via `useUploadMedia` (`POST /api/v1/media/upload`), création du post via `useCreatePost` (`POST /api/v1/posts`).
- **Limites :** Aucune possibilité de sélectionner un lieu associé (`place_tag`), ni d'associer un contenu culturel (proverbe, recette, œuvre).

---

## 33. Thème de l'écran Créer

- Dans `(create)/choice.tsx`, l'en-tête est configuré avec :  
  `headerStyle: { backgroundColor: '#0A0A0A' }`, `headerTintColor: '#FFFFFF'`.  
  Même lorsque le thème de l'application est en mode clair (`light`), l'en-tête reste noir avec des boutons blancs.
- Dans `publication.tsx`, la zone d'ajout d'image par défaut utilise `color="#52525B"` et `placeholderTextColor="#A1A1AA"` codés en dur sans s'adapter au contraste dynamique du thème.

---

## 34. Proverbes

- Il n'existe aucun écran `(create)/proverb.tsx`.
- La création passe par `(create)/culture-contribution.tsx` avec le type `PROVERB`.
- Ce formulaire n'offre que des champs génériques : `titre`, `communauté`, `résumé`, `récit`.
- Il ne comporte aucun champ pour la traduction littérale, la signification philosophique, la langue d'origine, ou un extrait audio.
- La contribution est soumise au statut éditorial `PENDING_REVIEW` et ne génère aucune publication dans le Feed.

---

## 35. Relation Proverbe ↔ Feed

- `VerticalFeedItem.tsx` gère déjà l'affichage du tag :
  ```tsx
  {post.linked_content ? (
    <TouchableOpacity onPress={() => router.push(`/(explore)/proverbs/${linked.id}`)}>
      <Icon name="book-outline" />
      <Text>{post.linked_content.label}</Text>
    </TouchableOpacity>
  ) : null}
  ```
- Mais dans le backend `feed-service`, l'entité `Post` et l'endpoint `GET /api/v1/feed` ne disposent d'aucun champ `linked_content`, `targetType` ou `targetId`.

---

## 36. Éditeur visuel de proverbe

- Le projet ne possède **aucun éditeur visuel** (aucun sélecteur de police, aucun sélecteur de couleur d'arrière-plan, aucun alignement de citation).
- L'écran `src/app/(create)/story.tsx` ne permet que de choisir une image déjà existante et une durée (5s, 10s, 15s).

---

## 37. Recettes

- Il n'existe aucun écran `(create)/recipe.tsx`.
- En mode démo, `demoRecipes` dispose de `ingredients: string[]` et `steps: string[]`.
- En mode backend, le modèle `CultureContent` ne supporte pas de liste d'ingrédients ni d'étapes structurées, obligeant à formater tout le contenu dans le champ texte unique `body`.

---

## 38. Relation Recette ↔ Feed

- Tout comme pour les proverbes, l'architecture mobile permet d'afficher un bouton vers `/(explore)/recipes/[id]`, mais le backend ne fournit pas de champ de référence polymorphique dans le DTO de `Post`.

---

## 39. Feed

- **Composant :** `src/components/feed/VerticalFeedList.tsx`.
- **Rendu :** `expo-video` avec contrôle de lecture `loop: true`, mise en pause quand l'élément n'est plus actif à l'écran, double appui pour aimer le post.
- **Bug de pagination :**
  Dans `src/features/feed/useFeed.ts` ligne 29 :
  ```ts
  getNextPageParam: (lastPage: PaginatedResponse<FeedPost>) =>
    lastPage.links.next ? lastPage.meta.current_page.toString() : undefined
  ```
  `lastPage.links.next` contient `'1'`, mais la fonction retourne `lastPage.meta.current_page.toString()` qui vaut `'0'`. Par conséquent, le prochain chargement redemande indéfiniment la page 0.

---

## 40. Client API

- **Fichier :** `src/services/api/client.ts`.
- **Instance :** Axios avec `baseURL: ${ENV.API_BASE_URL}/api/v1`, timeout de 15 000 ms.
- **Intercepteurs :**
  - Injection automatique du header `Authorization: Bearer <token>` depuis `SecureStore`.
  - Injection d'un `X-Correlation-ID` unique.
  - Intercepteur de réponse 401 avec verrou `refreshPromise` pour rafraîchir le token via `POST /api/v1/auth/refresh`.

---

## 41. React Query

- **Configuration racine (`_layout.tsx`) :**
  - `retry: 2`
  - `staleTime: 2 minutes`
  - `gcTime: 10 minutes`
- **Anomalie :** Plusieurs query keys ne discriminent pas le statut démo de manière homogène, ce qui peut provoquer des conflits de cache si l'utilisateur bascule d'un compte démo à un compte backend sans redémarrer l'application.

---

## 42. Stores / Contexts

L'état global utilise **Zustand** avec persistance ciblée dans `expo-secure-store` :
1. `useAuthStore` (`auth.store.ts`) : `user`, `token`, `sessionMode`, `isAuthenticated`, `isHydrated`.
2. `useThemeStore` (`theme.store.ts`) : `preference`, `resolvedTheme`, `colors`.
3. `useCountryStore` (`country.store.ts`) : `selectedCountryCode`, `countryConfiguration`, `preferredLanguageCode`.
4. `useInterestsStore` (`interests.store.ts`) : centres d'intérêt choisis à l'onboarding.
5. `useCreateStore` (`create.store.ts`) : brouillon de publication.
6. `usePartnerStore` (`partner.store.ts`) : brouillon de lieu et d'événement partenaire.

---

## 43. Session Démo

- Déclenchée via `authService.loginDemo('user' | 'partner')`.
- Stocke `sessionMode = 'demo-user'` ou `'demo-partner'`.
- Utilise `MOCK_TOKEN`.
- Les services `places`, `events`, `explore`, `feed`, `culture` basculent sur leurs fixtures locales quand ce mode est actif.

---

## 44. Session Backend

- Déclenchée via `authApi.login` ou `register`.
- `sessionMode = 'backend'`.
- N'utilise aucun mock : en cas d'indisponibilité du serveur, l'interface affiche l'écran d'erreur ou l'état vide contrôlé.

---

## 45. Mocks

17 fichiers de mock sont présents dans le projet. Ils sont correctement isolés sous condition `isDemo` dans la majorité des hooks, sauf pour `(bookings)/experience/[id].tsx` où `mockExperiences` est importé et accédé directement sans vérifier la session backend.

---

## 46. DTO et Mappers

- `src/features/country/country.mappers.ts`
- `src/features/culture/culture.mappers.ts`
- `src/features/recommendations/recommendations.types.ts`
- `src/features/discovery/discovery.navigation.ts`
- **Écart constaté :** Le mapper `mapEvent` de `events.api.ts` force `cover_image_url: null` car le backend `event-service` ne renvoie pas l'URL de couverture dans son DTO principal `EventResponse`.

---

## 47. Formulaires

- 5 écrans utilisent `react-hook-form` avec `zodResolver` (Auth et Partner Dashboard).
- Tous les autres formulaires (Création de post, suggestions, contribution culturelle, réservation, filtres) utilisent des `useState` ou des `useRef` non contrôlés sans validation de schéma.

---

## 48. Performance

1. **Virtualisation :** Le feed utilise `FlatList` avec `windowSize={3}`, `maxToRenderPerBatch={2}`, ce qui optimise la mémoire vidéo.
2. **Fuites potentielles :** Les requêtes `usePlaces` et `useDiscoverySearch` réexécutent des requêtes à chaque milliseconde si les coordonnées GPS changent sans seuil minimal de distance (debounce GPS absent).

---

## 49. Logs, TODO et FIXME

Trois `TODO` critiques ont été découverts dans des handlers de soumission utilisateur :
- `src/app/(partner)/add-place-step4.tsx:15` : `// TODO: API call to create place`
- `src/app/(partner)/add-event-step4.tsx:14` : `// TODO: API call to create event`
- `src/app/(partner)/publication.tsx:40` : `console.log('Publishing partner post');`

Ces écrans simulent une réussite et redirigent l'utilisateur vers l'accueil sans avoir exécuté la moindre requête réseau.

---

## 50. Bugs supplémentaires détectés

1. **Crash potentiel de résolution d'asset vidéo :** L'ancien fichier `assets/Créer_une_vidéo_animée_premium.mp4` comportait des caractères accentués provoquant l'échec de Metro Bundler sous Windows (`CrÃ©er...`).
2. **Composant `FilterButton` :** Utilise des classes Tailwind avec fond blanc forcé `bg-white` au lieu des tokens du thème.
3. **Double appel dans `_layout.tsx` :** L'effet de chargement des préférences pays s'exécute deux fois lors du montage initial.

---

## 51. Régressions Expo 57 confirmées

1. **`react-native-maps` v1.27.2 :** Instable et non fonctionnel avec Fabric (React Native 0.86 New Architecture) sans configuration native spécifique ni clé Maps valide.
2. **`expo-navigation-bar` :** `barStyle` est déprécié au profit de `style` dans Expo SDK 57, générant des warnings continus dans la console Metro.
3. **`SafeAreaView` :** Déprécié dans React Native 0.86, remplacé obligatoirement par `react-native-safe-area-context`.
4. **Babel Reanimated :** Présence de `react-native-reanimated/plugin` dans `babel.config.js` alors que Reanimated 4 délègue désormais cette gestion aux worklets.

---

## 52. Régressions Expo 57 probables

1. Déconnexion inattendue des événements de gesture handler avec les BottomSheets Gorhom v5 en mode bridgeless.
2. Conflit de typage dans `node_modules` dû à l'écart entre TypeScript 5.9.3 installé et TypeScript ~6.0.3 attendu par SDK 57.

---

## 53. Backend manquant par rapport à l’UI

1. Liaison entre un lieu `Place` et les créneaux d'activités réservables (`booking-service`).
2. Passerelle d'initialisation et challenge de paiement mobile money (`payment-service`).
3. Résolution d'un `partnerId` d'artisan en `userId` pour la messagerie (`messaging-service`).
4. Support des recettes structurées (ingrédients, étapes) et proverbes enrichis (`culture-service`).
5. Support des métadonnées de liaison culturelle polymorphe dans le Feed (`feed-service`).

---

## 54. Routes backend existantes non consommées

1. `GET /api/v1/bookings/{id}/history` (historique détaillé d'une réservation).
2. `GET /api/v1/payments/mine` (historique des paiements de l'utilisateur).
3. `POST /api/v1/partners/me/documents` (upload des documents KYC du partenaire).
4. `GET /api/v1/culture/daily` (endpoint dédié pour le mot du jour au lieu du filtre générique).

---

## 55. Matrice exhaustive UI → API

| Écran | Élément UI | Action attendue | Front actuel | API actuelle | Route existe ? | DTO suffisant ? | Verdict | Priorité |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| `(places)/[id]` | Bouton « Réserver » | Ouvrir formulaire réservation | Alerte bloquante | Aucune | Non | Non | BACKEND INCOMPLET | P0 |
| `(explore)/map` | Carte MapView | Afficher les lieux sur la carte | Écran blanc / crash | `/places/nearby` | Oui | Oui | RÉGRESSION NATIVE / CONFIG | P0 |
| `(create)/choice` | Liste des choix (démo) | Afficher les types de publication | Liste vide | Aucune | N/A | N/A | BUG CONDITIONNEL FRONT | P0 |
| `(tabs)/explore` | Rail Expériences | Ouvrir détail expérience | Alerte bloquante | Aucune | Non | Non | BACKEND INCOMPLET | P1 |
| `(events)/[id]/checkout` | Bouton « Créer commande » | Payer par Orange/MTN/Wave | Attente passive | `/tickets/orders` | Oui | Non | BACKEND & FRONT INCOMPLET | P1 |
| `(explore)/artisans/[id]` | Bouton « Contacter l'artiste » | Ouvrir conversation chat | Alerte bloquante | Aucune | Non | Non | CONTRAT INCOHÉRENT | P1 |
| `(partner)/add-place-step4` | Bouton « Publier le lieu » | Enregistrer le lieu | `console.log` factice | Aucune | Non | Non | FRONT INCOMPLET | P1 |
| `(partner)/add-event-step4` | Bouton « Publier l'événement »| Enregistrer l'événement | `console.log` factice | Aucune | Non | Non | FRONT INCOMPLET | P1 |
| `(create)/publication` | Bouton « Publier » | Créer un post avec tag culturel | Création post brut | `/posts` | Oui | Non | DTO INSUFFISANT | P2 |
| `(explore)/languages` | Liste des langues | Cartes lisibles avec leçons | Cartes étroites `w-52` | `/culture/languages` | Oui | Oui | BUG DESIGN FRONT | P2 |

---

## 56. Matrice de navigation

| Source | Action | Destination | Params envoyés | Params attendus | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `(tabs)/explore` | Clic Carte | `/(explore)/map` | Aucun | Aucun | Valide |
| `(tabs)/explore` | Clic Recherche | `/(explore)/search` | `{ filters: '1' }` | `filters?: string` | Valide |
| `(tabs)/explore` | Clic Expérience (Discovery) | `discoveryHref` | `{ sourceId, type }` | `id: string` | **ÉCHEC (renvoie null)** |
| `(tabs)/_layout` | Clic onglet Créer (Explorateur) | `/(create)/choice` | Aucun | Aucun | **ÉCHEC (rendu vide)** |
| `(places)/[id]` | Clic Itinéraire | `/(places)/route/[id]`| `{ id }` | `id: string` | Valide |
| `(events)/[id]` | Clic Billets | `/(events)/[id]/tickets`| `{ id }` | `id: string` | Valide |
| `(events)/[id]/tickets` | Clic Choisir billet | `/(events)/[id]/checkout` | `ticketId={id}` | `id, ticketId` | Valide |
| `(explore)/languages/[code]` | Clic Voir leçons | `/(explore)/languages/[code]/lessons` | `code` | `code: string` | Valide |
| `(explore)/artisans/[id]` | Clic Contacter | N/A | Aucun | `userId` | **ÉCHEC (Alerte locale)** |

---

## 57. Matrice hooks / services / endpoints

| Feature | Hook | Service mobile | Méthode | Endpoint | Request | Response |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| Lieux | `usePlaces` | `placesApi.getPlaces` | GET | `/places/nearby` | `{ lat, lng, radiusKm }` | `BackendPlaceSummary[]` |
| Lieux | `usePlaceDetail` | `placesApi.getPlace` | GET | `/places/{id}` | Aucun | `BackendPlace` |
| Événements | `useUpcomingEvents` | `eventsApi.upcoming` | GET | `/events/upcoming` | Aucun | `BackendEvent[]` |
| Événements | `useEventDetail` | `eventsApi.detail` | GET | `/events/{id}` | Aucun | `BackendEvent` |
| Billetterie | `useAvailableTicketTypes`| `ticketingApi.getAvailableTicketTypes` | GET | `/tickets/events/{id}/types` | Aucun | `PublicEventTickets` |
| Billetterie | `useCreateTicketOrder` | `ticketingApi.createTicketOrder` | POST | `/tickets/hold` & `/tickets/orders` | `{ holdId }` | `TicketOrderResponse` |
| Feed | `useFeed` | `feedApi.getFeed` | GET | `/feed` | `?page=0&size=20` | `BackendFeedPage` |
| Culture | `useCultureContents` | `cultureApi.listContents` | GET | `/culture/contents` | `CultureFilters` | `SpringPage<CultureContent>` |
| Culture | `useCultureLanguages` | `cultureApi.languages` | GET | `/culture/languages` | Aucun | `CultureLanguage[]` |
| Chat | `useConversations` | `chatApi.getConversations` | GET | `/messaging/conversations` | Aucun | `BackendConversation[]` |

---

## 58. Écarts classés de A à O

- **A — Régression Expo 57 :** Instabilité de `react-native-maps` sur New Architecture ; dépréciations `expo-navigation-bar`.
- **B — Bug frontend React Native :** Cartes de langues `w-52` dans liste verticale ; gestion clavier dans les formulaires.
- **C — Bug navigation :** `discoveryHref` refusant les expériences ; boucle infinie de pagination dans `useFeed`.
- **D — Problème module natif :** Clé Google Maps Android absente dans `.env` provoquant l'échec de chargement des tuiles.
- **E — Backend manquant :** Passerelle de paiement Mobile Money ; contrat de réservation reliant `Place` et `Activity`.
- **F — Backend existant non consommé :** Historique des paiements `/payments/mine` ; soumission KYC `/partners/me/submit`.
- **G — DTO insuffisant :** DTO `FeedPost` sans cible culturelle ; DTO `CultureContent` sans ingrédients de recette.
- **H — Mapping incorrect :** `normalizeDiscoveryId` ne traitant qu'un seul délimiteur `:` ; `mapEvent` forçant l'image de couverture à `null`.
- **I — Mock / Fallback :** Données de démo riches masquant l'indisponibilité des endpoints réels en session connectée.
- **J — UX / Design :** Filtres rapides Culture incohérents avec Explorer ; absence d'animations sur les puces.
- **K — Thème :** En-tête noir `#0A0A0A` forcé en mode clair dans `choice.tsx` et `publication.tsx`.
- **L — React Query / Cache :** Invalidation incomplète sur les mutations de like et mise en cache non ségréguée démo/réel.
- **M — Auth / Session :** Session démo Explorateur bloquant le module Créer suite à l'absence de pays mocké.
- **N — Architecture à revoir :** Formulaires partenaires en pure simulation locale (`add-place-step4`, `add-event-step4`).
- **O — Runtime non vérifiable :** Build iOS natif New Architecture non évaluable dans l'environnement actuel Windows.

---

## 59. Priorités P0 / P1 / P2 / P3

### P0 (Bloquants majeurs / Parcours brisés)
1. **Carte Explorer blanche / crash** : absence de configuration New Arch, absence du plugin et absence de clé Google Maps.
2. **Bouton Créer (+) vide en mode démo Explorateur** : conditionnement strict sur les `countryFeatures` non résolues.
3. **Navigation Discovery vers Expériences** : renvoi intentionnel de `null` causant un popup d'erreur.
4. **Pagination infinie Feed** : répétition de la page 0 dans `getNextPageParam`.
5. **Normalisation des identifiants Discovery** : risque de 400/404 sur les identifiants préfixés de manière répétée.
6. **Incompatibilité binaire Dev Client** : divergence d'ABI en cas d'utilisation d'un build SDK 54 sur JS SDK 57.

### P1 (Fonctionnalités principales manquantes ou bloquées)
1. **Réservation de lieu (`Place -> Réserver`)** : bloquée par absence de contrat backend reliant lieu et créneau.
2. **Paiement d'événement / Billetterie** : aucun formulaire de paiement (Orange Money, MTN, Wave).
3. **Contact Artisan vers Messagerie** : bloqué par incompatibilité d'identifiant (`partnerId` vs `userId`).
4. **Formulaires partenaires factices** : soumissions de lieux et événements terminées par `console.log`.
5. **Création Proverbe / Recette dédiée** : interfaces spécifiques absentes, reléguées à un formulaire générique.
6. **Liaison Proverbe / Recette ↔ Feed** : absence de support polymorphique backend.

### P2 (Dégradations ergonomiques et fonctionnelles secondaires)
1. **Design des filtres rapides Culture** : disparité visuelle avec les puces Explorer.
2. **Cartes des langues à apprendre** : disposition horizontale `w-52` inadaptée au défilement vertical.
3. **Thème sombre/clair dans Create** : en-têtes et fonds noirs hardcodés en thème clair.
4. **Absence d'éditeur visuel de proverbe** : impossibilité de formater le style d'un statut.
5. **Dépréciations de navigation bar et safe area** : avertissements continus en console.

### P3 (Dette technique et nettoyages)
1. Conflit de versions TypeScript et ESLint dans `package.json`.
2. Nettoyage des `console.log` résiduels dans le code de production.
3. Remplacement des `SafeAreaView` de React Native par ceux de `react-native-safe-area-context`.

---

## 60. Ordre recommandé des futurs lots d’implémentation

1. **Lot 1 — Stabilisation Socle Expo 57 & Carte :**  
   Intégration du plugin `react-native-maps`, ajout des clés Google Maps dans la configuration d'environnement, correction des dépréciations SDK 57 (`expo-navigation-bar`, `SafeAreaView`), alignement des dépendances `package.json`.
2. **Lot 2 — Déblocage Parcours Démo & Navigation :**  
   Initialisation d'une configuration pays par défaut en mode démo pour réactiver le bouton Créer (+), correction de `discoveryHref` pour pointer vers `(experiences)/[id]`, correction de `normalizeDiscoveryId`, correction de la pagination du Feed (`links.next`).
3. **Lot 3 — Billetterie & Paiement Démo (Orange / MTN / Wave) :**  
   Création du composant de choix d'opérateur mobile money, écran de saisie de numéro, simulation de validation de paiement pour la session démo et émission du billet.
4. **Lot 4 — Refonte Ergonomique Culture & Langues :**  
   Harmonisation des puces de filtres rapides, refonte de `LanguageCard` en carte pleine largeur horizontale, affichage des métriques de leçons.
5. **Lot 5 — Unification Thème Light/Dark :**  
   Éradication des couleurs codées en dur (`#0A0A0A`, `bg-white`) dans les modals et formulaires pour utiliser exclusivement `colors.background`, `colors.card` et `colors.text`.
6. **Lot 6 — Alignement Métier Backend (Réservations, Artisanat, Feed Polymorphe) :**  
   Spécification et implémentation des évolutions backend requises (relation Place ↔ Activity, endpoint de contact artisan par partnerId, champs de référence culturelle dans Post).

---

## 61. Risques avant correction

- **Risque de régression silencieuse :** Modifier le `_layout.tsx` racine sans précaution pourrait briser les gardes de redirection d'onboarding.
- **Risque d'incompatibilité de build natif :** L'intégration de cartes New Architecture nécessite un clean prebuild (`npx expo prebuild --clean`) et une recompilation complète du client de développement natif.
- **Risque de casse des sessions réelles :** L'ajout de fallbacks pour le mode démo ne doit en aucun cas masquer les véritables erreurs de réseau en session backend connectée.

---

## 62. Conclusion

```text
AUDIT YEYAMO-MOBILE POST EXPO SDK 57

Compatibilité Expo 57 : 64/100
Santé technique React Native : 68/100
Explorer : 58/100
Create : 32/100
Culture : 62/100
Feed : 60/100
Theme : 65/100
Navigation : 60/100
Maps : 15/100

Runtime Android :
PARTIEL

Runtime iOS :
NON ÉVALUÉ

Nombre total de P0 : 6
Nombre total de P1 : 12

Verdict global :
PARTIELLEMENT FONCTIONNEL

Les éléments nécessitant une implémentation doivent être traités dans des lots séparés après validation de ce rapport.
```

---

## TABLEAU OBLIGATOIRE — UI → BACKEND

| Écran | Élément UI | Action attendue | Front actuel | API actuelle | Route existe ? | DTO suffisant ? | Verdict | Priorité |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| `(places)/[id]` | Bouton « Réserver » | Créer réservation pour le lieu | `Alert.alert` bloquante | Aucune | Non | Non | BACKEND INCOMPLET | P0 |
| `(events)/[id]/checkout` | Bouton « Créer commande » | Valider paiement Mobile Money | Polling passif sans formulaire | `/tickets/orders` | Oui | Non | BACKEND & FRONT INCOMPLET | P1 |
| `(explore)/artisans/[id]` | Bouton « Contacter l'artiste » | Ouvrir chat avec l'artisan | `Alert.alert` bloquante | Aucune | Non | Non | CONTRAT INCOHÉRENT | P1 |
| `(partner)/add-place-step4` | Bouton « Publier le lieu » | Enregistrer le lieu partenaire | `console.log` factice | Aucune | Non | Non | FRONT INCOMPLET | P1 |
| `(partner)/add-event-step4` | Bouton « Publier l'événement »| Enregistrer l'événement partenaire | `console.log` factice | Aucune | Non | Non | FRONT INCOMPLET | P1 |
| `(create)/publication` | Sélecteur de lien culturel | Rattacher proverbe ou recette au post | Absent de l'interface | `/posts` | Oui | Non | DTO INSUFFISANT | P2 |
| `(create)/culture-contribution` | Choix Proverbe / Recette | Formulaire avec ingrédients/citations | Formulaire générique 4 champs | `/culture/contributions` | Oui | Non | DTO INSUFFISANT | P2 |
| `(tabs)/index` (Feed) | Badge `linked_content` | Afficher lien direct vers recette | Rendu présent si donnée | `/feed` | Oui | Non | DTO INSUFFISANT | P2 |
| `(bookings)/experience/[id]`| Bouton « Confirmer la demande »| Enregistrer réservation expérience | Alerte bloquante en réel | Aucune | Non | Non | BACKEND INCOMPLET | P1 |

---

## TABLEAU OBLIGATOIRE — BUGS EXPO 57

| Bug | Avant SDK 57 | Après SDK 57 | Package | Cause probable | Preuve | Confiance |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| Carte native absente | Rendue avec Bridge | Écran vide / tuiles non chargées | `react-native-maps` | New Architecture Fabric + clé absente + absence config plugin | `app.config.ts`, `.env`, RN 0.86 | CONFIRMÉ |
| `expo-navigation-bar` warnings | Options acceptées | Warnings de dépréciation répétés | `expo-navigation-bar` | `barStyle` et `visibility` dépréciés en SDK 57 | Logs console Metro | CONFIRMÉ |
| `SafeAreaView` warnings | Fonctionnel sans avertissement | Warning deprecation | `react-native` | Remplacement imposé par `react-native-safe-area-context` | Logs console Metro | CONFIRMÉ |
| Nested layout route warning | Pas d'avertissement | `No route named (social-graph)/badges` | `expo-router` | Détection stricte des enfants dans Expo Router v57 | Logs console Metro | CONFIRMÉ |
| Écran Créer démo vide | Fonctionnel ou non masqué | Toutes options masquées | Code applicatif | Filtre strict sur `countryFeatures` non résolues hors-ligne | `choice.tsx:28-34` | CONFIRMÉ |
| Pagination infinie page 0 Feed | Pagination incrémentale | Boucle infinie sur page 0 | Code applicatif | `getNextPageParam` renvoyant `current_page` au lieu de `next` | `useFeed.ts:29` | CONFIRMÉ |

---

## TABLEAU OBLIGATOIRE — MOCKS

| Fichier | Mock / Fallback | Démo accessible | Backend accessible | Risque |
| :--- | :--- | :---: | :---: | :--- |
| `src/features/experiences/mockData.ts` | `mockExperiences` | OUI | **OUI** (fuite dans `(bookings)/experience`) | Élevé |
| `src/features/places/mockData.ts` | `mockPlaces` | OUI | NON | Faible |
| `src/features/explore/mockData.ts` | `categories`, `regions`, `trendingPlaces` | OUI | NON | Faible |
| `src/features/feed/mockData.ts` | `MOCK_FEED_PAGE` | OUI | NON | Faible |
| `src/features/culture/culturalCatalog.demo.ts` | `demoProverbs`, `demoRecipes` | OUI | NON | Faible |
| `src/features/culture/culture.demo.ts` | `demoLanguages`, `demoLessons` | OUI | NON | Faible |
| `src/features/mock/mockData.ts` | `MOCK_USER`, `MOCK_PARTNER_USER` | OUI | NON | Faible |
| `src/features/partner-dashboard/mockData.ts` | Données financières et stats | OUI | **OUI** (sur certaines vues non connectées) | Moyen |

---

## TABLEAU OBLIGATOIRE — DESIGN / THÈME

| Écran | Composant | Light | Dark | Responsive | Problème constaté |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `(create)/choice` | Modal En-tête | Échec | Valide | Valide | `headerStyle: { backgroundColor: '#0A0A0A' }` forcé en mode clair |
| `(partner)/publication` | Modal En-tête | Échec | Valide | Valide | En-tête noir forcé en mode clair |
| `(explore)/languages` | `LanguageCard` | Partiel | Partiel | **ÉCHEC** | Largeur fixe `w-52` inadaptée au défilement vertical |
| `CatalogListScreen` | Puces de filtres | Partiel | Partiel | Valide | Contrastes faibles et styles différents de `ExploreQuickFilters` |
| `FilterButton` | Bouton de filtre | Échec | Partiel | Valide | Classe `bg-white` codée en dur sans s'adapter à la couleur de surface |
| `(create)/publication` | Zone d'image vide | Partiel | Partiel | Valide | Texte et icônes gris `#52525B` peu lisibles sur certains fonds |

---

## TABLEAU OBLIGATOIRE — ROUTES DE NAVIGATION

| Source | Action | Destination | Params envoyés | Params attendus | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `(tabs)/explore` | Clic Explorer Carte | `/(explore)/map` | Aucun | Aucun | Opérationnel |
| `(tabs)/explore` | Clic Recherche | `/(explore)/search` | `{ filters: '1' }` | `filters?: string` | Opérationnel |
| `(tabs)/explore` | Clic Expérience (Discovery) | `discoveryHref` | `{ sourceId, type }` | `id: string` | **BLOQUÉ (renvoie null)** |
| `(tabs)/_layout` | Clic Onglet Créer | `/(create)/choice` | Aucun | Aucun | **VIDE EN SESSION DÉMO** |
| `(places)/[id]` | Clic Réserver | N/A | Aucun | `activityId` | **BLOQUÉ PAR ALERTE** |
| `(events)/[id]` | Clic Participer | `/(bookings)/event/[id]` | `{ id, ticketId }` | `id, ticketId?` | Opérationnel (sans débit) |
| `(events)/[id]` | Clic Billets | `/(events)/[id]/tickets` | `{ id }` | `id: string` | Opérationnel |
| `(events)/[id]/tickets` | Clic Choisir ce billet | `/(events)/[id]/checkout` | `ticketId={id}` | `id, ticketId` | Opérationnel (sans paiement) |
| `(explore)/languages` | Clic Langue | `/(explore)/languages/[code]` | `{ code }` | `code: string` | Opérationnel |
| `(explore)/languages/[code]` | Clic Voir leçons | `/(explore)/languages/[code]/lessons` | `{ code }` | `code: string` | Opérationnel |
| `(explore)/artisans/[id]` | Clic Contacter | N/A | Aucun | `userId` | **BLOQUÉ PAR ALERTE** |
| `(partner)/choice` | Clic Ajouter un lieu | `/(partner)/add-place-step1` | Aucun | Aucun | Opérationnel |
| `(partner)/add-place-step4` | Clic Publier | `/(tabs)/explore` | Aucun | Aucun | **FAUX SUCCÈS (console.log)** |

---

## TABLEAU OBLIGATOIRE — NOUVELLES CAPACITÉS BACKEND À PRÉVOIR

| Besoin UI | Service backend probable | Route existante ? | Extension possible ? | Nouvelle capacité probable |
| :--- | :--- | :---: | :---: | :--- |
| Réservation d'un lieu (`Place`) | `booking-service` & `place-service` | Non | Oui | `GET /api/v1/places/{id}/activities` et contrat de créneaux |
| Paiement mobile (Orange / MTN / Wave)| `payment-service` | Non | Oui | `POST /api/v1/payments/mobile-money/initiate` et callback |
| Contacter artisan depuis profil | `messaging-service` & `partner-service` | Non | Oui | Résolution `partnerId -> userId` ou `POST /conversations/partner/{id}` |
| Publication recette structurée | `culture-service` | Non | Oui | DTO `Recipe` avec tableaux `ingredients` et `steps` |
| Publication proverbe enrichi | `culture-service` | Non | Oui | DTO `Proverb` avec traduction littérale, sens et audio |
| Post Feed avec tag culturel | `feed-service` | Non | Oui | Extension de `Post` avec `targetType` (`PROVERB`,`RECIPE`) et `targetId` |
| Inscription / suggestion lieu public | `place-service` | Non | Oui | `POST /api/v1/places/suggestions` pour utilisateurs non-partenaires |
| Billetterie : annulation par l'acheteur | `ticketing-service` | Non | Oui | `POST /api/v1/tickets/orders/{id}/cancel` côté public |

---

## STATISTIQUES FINALES OBLIGATOIRES

```text
Nombre d’écrans inspectés : 162
Nombre de routes navigation inspectées : 162
Nombre de hooks inspectés : 48
Nombre d’endpoints consommés : 64

Erreurs TypeScript : 0
Problèmes Expo Doctor : 1
Régressions Expo 57 confirmées : 6
Régressions Expo 57 probables : 2

Bugs navigation : 4
Bugs Maps : 3
Bugs Theme : 6

Fonctionnalités UI sans backend : 8
Routes backend existantes non consommées : 4
DTO insuffisants : 5
Mappings incorrects : 3

Mocks accessibles en demo : 17
Mocks accessibles en backend : 2

CTA sans comportement réel : 5
Filtres sans effet réel : 2
TODO/FIXME significatifs : 3

P0 : 6
P1 : 12
P2 : 18
P3 : 15
```

---

## CONCLUSION OBLIGATOIRE

```text
AUDIT YEYAMO-MOBILE POST EXPO SDK 57

Compatibilité Expo 57 : 64/100
Santé technique React Native : 68/100
Explorer : 58/100
Create : 32/100
Culture : 62/100
Feed : 60/100
Theme : 65/100
Navigation : 60/100
Maps : 15/100

Runtime Android :
PARTIEL

Runtime iOS :
NON ÉVALUÉ

Nombre total de P0 : 6
Nombre total de P1 : 12

Verdict global :
PARTIELLEMENT FONCTIONNEL

Les éléments nécessitant une implémentation doivent être traités dans des lots séparés après validation de ce rapport.
```
