# Audit avant migration Expo SDK 57

Date : 2026-09-04.

## Versions constatées

| Package | Expo 54 actuelle | Cible SDK 57 | Action |
|---|---:|---:|---|
| expo | ~54.0.0 | ^57.0.0 | migration via Expo CLI |
| react | 19.1.0 | 19.2.3 | alignement CLI |
| react-native | 0.81.5 | 0.86 | alignement CLI |
| react-native-web | 0.21.0 | 0.21.0 | vérifier via CLI |
| expo-router | ~6.0.24 | version SDK 57 | alignement CLI |

Node 22.23.0 et npm 10.9.8 satisfont le minimum Node 22.13.x publié pour SDK 57.

## État Expo Doctor avant migration

17 contrôles sur 18 réussissent. Seul écart : Expo 54.0.36 attendu 54.0.37 et expo-constants 18.0.13 attendu 18.0.14.

## Configuration

- CNG : aucun dossier `android/` ou `ios/` présent ; `app.json` + `app.config.ts` définissent la configuration native.
- New Architecture : `newArchEnabled: true`.
- Router, NativeWind Metro, Reanimated Babel et les plugins Google Sign-In/DateTimePicker sont présents.
- Packages natifs à réaligner : maps, webview, reanimated/worklets, gesture handler, screens, safe-area-context, SVG, caméra, notifications, image picker.

## Risques

- SDK 57 cible React Native 0.86 / React 19.2.3 ; tout paquet natif doit être validé par `expo install --fix` puis Expo Doctor.
- L’absence de projets natifs rend un prebuild futur possible, mais aucun clean prebuild ne sera lancé sans nécessité.
- Android/iOS nécessitent une validation séparée après migration.
