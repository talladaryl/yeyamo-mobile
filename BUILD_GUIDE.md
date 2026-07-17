# 📱 GUIDE DE BUILD - YEYAMO MOBILE

> Comment builder l'app avec Expo 56 et EAS

---

## 🎯 PROBLÈME

L'app Expo Go sur l'App Store est en version 54, mais votre projet utilise Expo 56.

**Solution** : Utiliser **EAS Build** avec **expo-dev-client** (Development Build custom).

---

## 📦 PRÉREQUIS

### 1. Installer EAS CLI

```bash
npm install -g eas-cli
```

### 2. Se connecter à Expo

```bash
eas login
```

Utilisez votre compte Expo (créez-en un sur expo.dev si besoin).

### 3. Vérifier expo-dev-client

Votre projet a déjà `expo-dev-client` dans package.json ✅

---

## 🔨 BUILDS DISPONIBLES

### 1. Development Build (Recommandé pour dev)

**Pour qui** : Développement avec hot reload

**iOS** :
```bash
eas build --profile development --platform ios
```

**Android** :
```bash
eas build --profile development --platform android
```

**Résultat** : Une app custom qui remplace Expo Go

### 2. Preview Build (Test interne)

**Pour qui** : Tests internes avant production

**Android APK** :
```bash
eas build --profile preview --platform android
```

**iOS** :
```bash
eas build --profile preview --platform ios
```

### 3. Production Build (Store)

**Pour qui** : Publication sur App Store / Play Store

**Android** :
```bash
eas build --profile production --platform android
```

**iOS** :
```bash
eas build --profile production --platform ios
```

---

## 📱 INSTALLER SUR VOTRE iPhone

### Étape 1 : Lancer le build

```bash
eas build --profile development --platform ios
```

### Étape 2 : Attendre

Le build prend ~15-20 minutes. EAS vous montrera la progression.

### Étape 3 : Télécharger

Une fois terminé, EAS vous donne un lien. Ouvrez-le sur votre iPhone.

### Étape 4 : Installer

1. Appuyez sur "Install"
2. Allez dans Réglages > Général > Gestion des appareils
3. Approuvez le certificat de développement
4. Lancez l'app

### Étape 5 : Connecter au serveur

```bash
npx expo start --dev-client
```

Scannez le QR code avec votre app custom (pas Expo Go).

---

## 🤖 INSTALLER SUR Android

### Option 1 : Development Build

```bash
eas build --profile development --platform android
```

Téléchargez l'APK et installez-le.

### Option 2 : Build local

```bash
eas build --profile development --platform android --local
```

Nécessite Android Studio installé.

---

## ⚙️ CONFIGURATION

### app.json

Vérifiez que votre `app.json` contient :

```json
{
  "expo": {
    "name": "Yeyamo",
    "slug": "yeyamo-mobile",
    "version": "1.0.0",
    "scheme": "yeyamo",
    "ios": {
      "bundleIdentifier": "com.yeyamo.mobile"
    },
    "android": {
      "package": "com.yeyamo.mobile"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

### eas.json

Déjà configuré avec 3 profils :
- `development` - Dev avec hot reload
- `preview` - Tests internes
- `production` - Production stores

---

## 🔐 CERTIFICATS iOS

### Pour Development Build

EAS gère automatiquement les certificats.

### Pour Production

Vous aurez besoin d'un **compte Apple Developer** ($99/an).

```bash
eas credentials
```

EAS vous guidera pour créer les certificats.

---

## 📦 WORKFLOW RECOMMANDÉ

### Développement

1. Lancer le serveur :
```bash
npx expo start --dev-client
```

2. Scanner le QR avec votre Development Build

3. L'app se met à jour automatiquement (hot reload)

### Tests

1. Builder une preview :
```bash
eas build --profile preview --platform all
```

2. Installer sur plusieurs devices pour tester

### Production

1. Builder pour les stores :
```bash
eas build --profile production --platform all
```

2. Soumettre :
```bash
eas submit --platform ios
eas submit --platform android
```

---

## 🐛 TROUBLESHOOTING

### "Build failed"

Vérifiez :
- Les dépendances dans package.json
- La configuration dans app.json
- Les logs sur le dashboard EAS

### "Cannot install on iPhone"

1. Allez dans Réglages > Général > Gestion des appareils
2. Approuvez le certificat
3. Réessayez

### "Metro bundler error"

```bash
# Nettoyer le cache
npx expo start --dev-client --clear
```

### "Build too slow"

Utilisez `--local` pour builder localement (nécessite Xcode/Android Studio).

---

## 💡 ASTUCES

### Build plus rapide

```bash
# Build seulement ce qui a changé
eas build --profile development --platform ios --no-wait
```

### Builds simultanés

```bash
# iOS et Android en même temps
eas build --profile development --platform all
```

### Logs en temps réel

```bash
# Suivre les logs
eas build:view
```

### Télécharger un ancien build

```bash
# Lister les builds
eas build:list

# Télécharger un build spécifique
eas build:download --id <BUILD_ID>
```

---

## 📊 COMPARAISON

| Feature | Expo Go | Development Build | Production |
|---------|---------|-------------------|------------|
| Setup | Aucun | 1 build initial | Build + certificats |
| Hot reload | ✅ | ✅ | ❌ |
| Native modules | ❌ | ✅ | ✅ |
| Custom code | ❌ | ✅ | ✅ |
| SDK mismatch | ⚠️ | ✅ | ✅ |
| Distribution | N/A | Interne | Stores |

---

## 🎯 COMMANDES ESSENTIELLES

```bash
# Se connecter
eas login

# Configurer le projet
eas build:configure

# Build development iOS
eas build --profile development --platform ios

# Build development Android
eas build --profile development --platform android

# Build production
eas build --profile production --platform all

# Lister les builds
eas build:list

# Soumettre aux stores
eas submit

# Voir les credentials
eas credentials
```

---

## 📝 NEXT STEPS

1. ✅ Installer EAS CLI
2. ✅ Login avec `eas login`
3. ✅ Builder development : `eas build --profile development --platform ios`
4. ✅ Installer l'app sur votre iPhone
5. ✅ Lancer le serveur : `npx expo start --dev-client`
6. ✅ Développer normalement !

---

## 🌐 RESSOURCES

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Expo SDK 56 Changelog](https://docs.expo.dev/versions/v56.0.0/)

---

## ✅ CONCLUSION

Avec **EAS Build**, vous pouvez :
- ✅ Utiliser Expo 56 sans problème de compatibilité
- ✅ Tester sur votre iPhone avec hot reload
- ✅ Builder pour production facilement
- ✅ Gérer les certificats automatiquement

**→ Votre workflow de développement reste fluide !**
