# Yeyamo Mobile

Application mobile Expo Router basée sur Expo SDK 54, React Native 0.81 et React 19.1.

## Prérequis

- Node.js 20.19 ou plus récent
- npm
- Expo Go compatible SDK 54 ou un development build SDK 54

## Démarrage

```bash
npm install
npx expo start
```

La New Architecture est explicitement activée dans `app.json`. Après tout changement de SDK ou de dépendance native, reconstruisez le development build : un binaire SDK 56 n'est pas compatible avec ce projet SDK 54.

Consultez [docs/EXPO_DOWNGRADE_54.md](docs/EXPO_DOWNGRADE_54.md) pour le rapport de migration et [BUILD_GUIDE.md](BUILD_GUIDE.md) pour les profils EAS.
