# Downgrade Expo SDK 56 vers SDK 54

Date : 18 juillet 2026

## Pourquoi

Le projet a été réaligné sur Expo SDK 54 afin d'utiliser un runtime et un client Expo cohérents. Le downgrade a été réalisé avec `npx expo install expo@~54.0.0 --fix`, puis `npx expo install --fix`. Aucun numéro de module natif n'a été choisi manuellement.

## Diagnostic avant migration

`expo-doctor@latest` passait 20 contrôles sur 21 sous SDK 56. Le seul contrôle en échec signalait huit patchs Expo en retard : `expo`, `expo-constants`, `expo-dev-client`, `expo-image-picker`, `expo-location`, `expo-notifications`, `expo-router` et `expo-splash-screen`.

L'audit de `src/` n'a trouvé aucun import direct `@react-navigation/*`, aucune Native Tab, aucun composant `@expo/ui`, aucun usage de `expo-file-system` et aucune API Reanimated/Worklets directe. Le routeur est uniformément placé sous `src/app`; il n'existe pas de second dossier `/app` à la racine. Le projet est managed, sans dossiers natifs `android/` ou `ios/` suivis.

## Versions directes avant et après

Les valeurs « avant » proviennent du manifeste SDK 56 sauvegardé. Les valeurs « après » indiquent la contrainte du manifeste, puis la version effectivement verrouillée entre parenthèses lorsqu'elle diffère.

| Package | Avant | Après SDK 54 |
| --- | --- | --- |
| `expo` | `~56.0.14` | `~54.0.0` (`54.0.36`) |
| `expo-camera` | `~56.0.8` | `~17.0.10` (`17.0.10`) |
| `expo-constants` | `~56.0.20` | `~18.0.13` (`18.0.13`) |
| `expo-dev-client` | `~56.0.22` | `~6.0.21` (`6.0.21`) |
| `expo-font` | `~56.0.7` | `~14.0.12` (`14.0.12`) |
| `expo-image` | `~56.0.11` | `~3.0.11` (`3.0.11`) |
| `expo-image-picker` | `~56.0.19` | `~17.0.11` (`17.0.11`) |
| `expo-linear-gradient` | `~56.0.4` | `~15.0.8` (`15.0.8`) |
| `expo-linking` | `~56.0.15` | `~8.0.12` (`8.0.12`) |
| `expo-location` | `~56.0.19` | `~19.0.8` (`19.0.8`) |
| `expo-notifications` | `~56.0.19` | `~0.32.17` (`0.32.17`) |
| `expo-router` | `~56.2.13` | `~6.0.24` (`6.0.24`) |
| `expo-secure-store` | `~56.0.4` | `~15.0.8` (`15.0.8`) |
| `expo-splash-screen` | `~56.0.12` | `~31.0.13` (`31.0.13`) |
| `expo-status-bar` | `~56.0.4` | `~3.0.9` (`3.0.9`) |
| `expo-video` | `~56.1.4` | `~3.0.16` (`3.0.16`) |
| `react` | `19.2.3` | `19.1.0` |
| `react-dom` | `19.2.3` | `19.1.0` |
| `react-native` | `0.85.3` | `0.81.5` |
| `react-native-gesture-handler` | `~2.31.1` | `~2.28.0` (`2.28.0`) |
| `react-native-maps` | `1.27.2` | `1.20.1` |
| `react-native-reanimated` | `4.3.1` | `~4.1.1` (`4.1.7`) |
| `react-native-safe-area-context` | `~5.7.0` | `~5.6.0` (`5.6.2`) |
| `react-native-worklets` | `0.8.3` | `0.5.1` |
| `react-native-screens` | absent | `~4.16.0` (`4.16.0`) |
| `@types/react` | `~19.2.2` | `~19.1.10` (`19.1.17`) |
| `babel-preset-expo` | `^56.0.15` | `~54.0.10` (`54.0.12`) |
| `typescript` | `~6.0.3` | `~5.9.2` (`5.9.3`) |

Les autres dépendances directes n'ont pas été changées. `react-native-screens` a été ajouté via `npx expo install react-native-screens`, car il s'agit d'un peer natif requis par Expo Router et React Navigation.

## NativeWind, Reanimated et New Architecture

NativeWind 4.2.5 ne déclare aucun peer dependency vers Reanimated; son seul peer installé est `tailwindcss >3.3.0`. L'équipe NativeWind confirme que NativeWind v4 supporte Reanimated v4. Expo SDK 54 recommande officiellement Reanimated `~4.1.1` avec `react-native-worklets`. Le choix retenu est donc Reanimated v4, et Worklets reste installé.

La New Architecture n'a jamais été désactivée. `app.json` contient désormais explicitement `"newArchEnabled": true`.

## Adaptations de configuration et de code

- Ajout explicite de `newArchEnabled: true`.
- Ajout automatique du config plugin `expo-video` par Expo Install.
- Aucun changement de code applicatif n'a été nécessaire : aucune API réservée aux SDK 55/56 n'était utilisée.
- Aucun prebuild n'a été exécuté, car le dépôt ne contient aucun dossier natif généré.

## Particularité npm

En juillet 2026, le peer optionnel `react-server-dom-webpack` d'`expo-router@6.0.24` peut être résolu par npm vers un patch exigeant une version de React supérieure à la version exacte `19.1.0` imposée par SDK 54. L'installation a donc été finalisée avec `npm_config_legacy_peer_deps=true` pour ignorer uniquement ce peer optionnel non utilisé par l'application mobile. Les versions installées restent celles résolues par Expo.

## Environnement natif requis

Expo SDK 54 requiert Node.js 20.19 minimum, Android `compileSdkVersion`/`targetSdkVersion` 36, iOS 15.1 minimum et Xcode 16.1 minimum. Node 22.23 est compatible. Xcode ne peut pas être contrôlé sur l'hôte Windows.

Après le downgrade, un nouveau development build doit être généré. Un ancien development build SDK 56 est incompatible avec le bundle SDK 54.

## Validation

- `npx expo-doctor@latest --verbose` : 18/18 contrôles réussis, aucun problème détecté.
- `npx expo install --check` : dépendances à jour.
- `npx tsc --noEmit` : aucune erreur.
- `npm ls --depth=0` : arbre direct cohérent, aucune dépendance manquante ou invalide.
- `npx expo config --type public` : configuration résolue en SDK 54.0.0 avec `newArchEnabled: true`.
- Metro : endpoint de statut accessible et bundle Android de développement généré avec succès (1428 modules).

Les tests manuels sur appareil, la mesure mémoire réelle Hermes et un build iOS nécessitent un appareil/simulateur ou un runner macOS et restent à réaliser sur le nouveau development build.
