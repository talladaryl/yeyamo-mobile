# Rapport — Phase 8 : stabilisation mobile

Racine auditée : `E:\Daryl\yeyamo-api\yeyamo-mobile`.

## A — Carte Explorer — RÉSOLU

Constats avant modification :

- `package.json` déclarait `react-native-maps` en version `1.27.2`.
- `src/components/maps/NativeMap.tsx` exportait `PROVIDER_GOOGLE` sans signaler l'absence de clé.
- Les écrans carte utilisent bien ce provider (`(explore)/map.tsx`, suggestion de lieu et ajout de lieu partenaire).
- Ni `app.json` ni `app.config.ts` ne déclaraient le plugin `react-native-maps` ; `.env.example` ne documentait pas la clé Android.

Corrections :

- `app.config.ts` déclare le plugin avec `androidGoogleMapsApiKey` et `iosGoogleMapsApiKey` injectés depuis l'environnement.
- `.env.example` contient désormais `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY=` et une indication de sécurité.
- `NativeMap.tsx` journalise un avertissement uniquement en développement Android si la clé est absente ; aucun secret n'est ajouté au dépôt.

Preuve de configuration locale :

```text
npx expo config --type public --json
... ["react-native-maps",{"androidGoogleMapsApiKey":"","iosGoogleMapsApiKey":""}] ...
```

`npx tsc --noEmit` : code de sortie `0`.

## B — API Expo 57 dépréciées — RÉSOLU

L'API installée indique que `visibility`/`barStyle` sont remplacés par `hidden`/`style`, et que `setVisibilityAsync` est déprécié.

- `app.json` utilise maintenant `{ "hidden": true, "style": "dark" }`.
- `src/app/_layout.tsx` utilise `NavigationBar.NavigationBar.setHidden(true)`.
- La recherche d'import de `SafeAreaView` depuis `react-native` ne retourne aucune occurrence fonctionnelle ; `SafeScreen.tsx` l'importe déjà depuis `react-native-safe-area-context`.

`npx tsc --noEmit` : code de sortie `0`.

## C — Dépendances Expo — PARTIELLEMENT BLOQUÉ PAR LE RÉSEAU EXPO

Avant correction, Expo Doctor signalait ces écarts :

```text
eslint-config-expo  expected ~57.0.2, found 10.0.0
typescript          expected ~6.0.3, found 5.9.3
@types/react        expected ~19.2.4, found 19.1.17
```

`package.json` et `package-lock.json` ont été réalignés : les trois outils sont uniquement en `devDependencies`. Preuve locale :

```text
npm ls @types/react eslint-config-expo typescript --depth=0
@types/react@19.2.18
eslint-config-expo@57.0.2
typescript@6.0.3
```

La première installation a échoué sur `ECONNRESET`; la reprise `npm install --prefer-offline` a réussi :

```text
added 19 packages, changed 4 packages, and audited 1000 packages in 28s
```

La dernière exécution brute de `npx expo-doctor@latest` ne signale plus de versions incompatibles, mais ne peut pas conclure les deux contrôles distants :

```text
19/21 checks passed. 2 checks failed.
✖ Check Expo config (app.json/ app.config.js) schema
✖ Validate packages against React Native Directory package metadata
Directory check failed with unexpected server response
TypeError: fetch failed
ConnectTimeoutError: Connect Timeout Error (attempted address: exp.host:443, timeout: 10000ms)
```

La résolution locale de la configuration Expo a néanmoins réussi (`npx expo config --type public --json`, code `0`). Les 28 vulnérabilités npm signalées ne sont pas modifiées ici : une mise à jour de sécurité nécessite un audit séparé pour éviter une régression métier.

`npx tsc --noEmit` : code de sortie `0`.

## D — Navigation Social Graph — RÉSOLU PAR AUDIT

La route qui avait motivé l'avertissement est valide dans l'état actuel :

- root : `<Stack.Screen name="(social-graph)" />` dans `src/app/_layout.tsx` ;
- enfant : `<Stack.Screen name="badges" />` et `<Stack.Screen name="badges/[id]" />` dans `src/app/(social-graph)/_layout.tsx` ;
- fichiers présents : `badges.tsx` et `badges/[id].tsx`.

Il n'existe aucune déclaration enfant erronée `name="(social-graph)/badges"`. Aucun changement de route n'était justifié. Le fond codé en dur du layout Social Graph a été remplacé par `colors.background` dans la partie E.

`npx tsc --noEmit` : code de sortie `0`.

## E — Thème clair / sombre — RÉSOLU

Le store réel `useThemeStore` expose les tokens `background`, `card`, `elevated`, `text`, `textSecondary`, `textMuted` et `border`.

Fichiers modifiés :

- `src/app/(create)/choice.tsx` : fond, en-tête, textes et bouton de fermeture s'appuient sur les tokens.
- `src/app/(partner)/publication.tsx` : fond, en-tête, zone média, champ légende, rail d'actions et pastilles s'appuient sur les tokens.
- `src/components/ui/FilterButton.tsx` : fond et texte suivent le thème ; l'état actif conserve `colors.primary`.
- `src/app/(social-graph)/_layout.tsx` : le fond de navigation suit `colors.background`.

Preuve : la recherche suivante ne retourne aucune occurrence dans les fichiers ciblés :

```text
rg -n '#0A0A0A|#161616|bg-white' \
  src/app/(create)/choice.tsx src/app/(create)/publication.tsx \
  src/app/(partner)/publication.tsx src/components/ui/FilterButton.tsx \
  src/app/(social-graph)/_layout.tsx
```

`npx tsc --noEmit` : code de sortie `0`.

## Fichiers modifiés

- `.env.example`
- `app.config.ts`, `app.json`
- `package.json`, `package-lock.json`
- `src/app/_layout.tsx`
- `src/components/maps/NativeMap.tsx`
- `src/components/ui/FilterButton.tsx`
- `src/app/(create)/choice.tsx`
- `src/app/(partner)/publication.tsx`
- `src/app/(social-graph)/_layout.tsx`

## Verdict

Le code TypeScript est valide et les configurations locales Expo se résolvent correctement. Le seul point non clôturable dans cet environnement est la validation complète d'Expo Doctor, car les appels vers `exp.host` et React Native Directory expirent réseau.

Points restants : relancer `npx expo-doctor@latest` lorsque l'accès réseau Expo est disponible ; aucun écart de version SDK 57 n'est encore signalé.
