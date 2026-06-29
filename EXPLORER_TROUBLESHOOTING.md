# 🔧 Explorer - Troubleshooting Guide

## ⚠️ Problèmes Courants

### 1. Maps ne s'affiche pas

**Symptôme** : Écran blanc ou erreur sur `(explore)/map`

**Solutions** :

#### Android
```bash
# Obtenir une Google Maps API Key
# https://console.cloud.google.com/apis/credentials

# Ajouter dans android/app/src/main/AndroidManifest.xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_API_KEY_HERE"/>
</application>

# Rebuild
npx expo run:android
```

#### iOS
```bash
# Apple Maps fonctionne nativement
# Vérifier permissions Location dans Info.plist

# Rebuild
npx expo run:ios
```

---

### 2. Bottom Sheet ne fonctionne pas

**Symptôme** : Sheet ne s'ouvre pas ou crash

**Solutions** :

```bash
# Vérifier que Reanimated est configuré
# babel.config.js doit avoir :
plugins: ['react-native-reanimated/plugin']

# Clear cache
npx expo start -c

# Rebuild
rm -rf node_modules
npm install
npx expo start
```

---

### 3. Gesture Handler Warning

**Symptôme** : Warning "GestureHandlerRootView"

**Solution** :

```tsx
// Wrapper app/_layout.tsx avec GestureHandlerRootView
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Your app */}
    </GestureHandlerRootView>
  );
}
```

---

### 4. Images ne chargent pas

**Symptôme** : Placeholders visibles, images ne s'affichent pas

**Solutions** :

```tsx
// Vérifier URLs mock data
// src/features/explore/mockData.ts

// Remplacer par vraies URLs ou images locales
image_url: require('../../../assets/place.jpg')

// Ou utiliser un service d'images de test
image_url: 'https://picsum.photos/400/300'
```

---

### 5. Navigation Type Errors

**Symptôme** : TypeScript erreurs sur `router.push()`

**Solution** :

```bash
# Regenerate types
npx expo customize tsconfig.json

# Ou ignorer temporairement
router.push('/(explore)/places' as any)

# Les types seront auto-générés au prochain build
```

---

### 6. Bottom Sheet reste ouvert

**Symptôme** : Sheet ne se ferme pas après apply

**Solution** :

```tsx
// Vérifier que close() est appelé
<CTAButton
  onPress={() => {
    onApply();
    bottomSheetRef.current?.close(); // ← Important
  }}
/>

// Ou forcer la fermeture
bottomSheetRef.current?.snapToIndex(-1);
```

---

### 7. Map Performance Issues

**Symptôme** : Map lag, scroll lent

**Solutions** :

```tsx
// Réduire nombre de markers
const visiblePlaces = places.slice(0, 20);

// Ajouter clustering
import { Marker, Cluster } from 'react-native-maps';

// Optimiser rendering
<MapView
  maxZoomLevel={18}
  minZoomLevel={5}
  loadingEnabled
  removeClippedSubviews
/>
```

---

### 8. Filter Pills scroll

**Symptôme** : Pills coupées, scroll ne fonctionne pas

**Solution** :

```tsx
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: 16 }} // ← Ajouter
>
  {filters.map(...)}
</ScrollView>
```

---

## 🐛 Debug Mode

### Activer Debug Logs

```tsx
// src/app/(explore)/map.tsx
console.log('[Map] Markers:', mapPlaces.length);
console.log('[Map] Selected:', selectedPlace?.name);

// src/app/(explore)/search.tsx
console.log('[Search] Query:', searchQuery);
console.log('[Search] Filters:', filters);
```

### React Query DevTools

```bash
npm install @tanstack/react-query-devtools

# Dans _layout.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/native';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

## 🔍 Diagnostics

### Vérifier Installation

```bash
# Lister packages
npm list | grep "maps\|bottom-sheet\|reanimated"

# Devrait afficher :
# ├── react-native-maps@...
# ├── @gorhom/bottom-sheet@...
# └── react-native-reanimated@...
```

### Tester Navigation

```bash
# Démarrer app
npx expo start

# Tester chaque route manuellement
/(tabs)/explore          → OK
/(explore)/search        → OK
/(explore)/map           → OK
/(regions)/1             → OK
/(explore)/places        → OK
```

### Vérifier Mock Data

```tsx
// src/features/explore/mockData.ts
console.log('Categories:', categories.length);        // 5
console.log('Places:', trendingPlaces.length);        // 5
console.log('Regions:', regions.length);              // 6
console.log('Map Places:', mapPlaces.length);         // 5
console.log('Events:', upcomingEvents.length);        // 3
```

---

## 🚨 Errors Fréquentes

### "Cannot find module 'react-native-maps'"

```bash
npx expo install react-native-maps
npx expo start -c
```

### "Reanimated 2 plugin was not configured"

```bash
# Vérifier babel.config.js
plugins: ['react-native-reanimated/plugin']

# Clear cache
npx expo start -c
```

### "undefined is not an object (reading 'current')"

```tsx
// Vérifier useRef est initialisé
const filterSheetRef = useRef<FilterBottomSheetHandle>(null);

// Vérifier ref est passé
<FilterBottomSheet ref={filterSheetRef} {...props} />
```

### "ExpoLocation permissions error"

```bash
# Ajouter permissions
npx expo install expo-location

# iOS: Info.plist
<key>NSLocationWhenInUseUsageDescription</key>
<string>Yeyamo needs location to show nearby places</string>

# Android: AndroidManifest.xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

---

## 🛠️ Tools Utiles

### React Native Debugger
```bash
# Installer
brew install --cask react-native-debugger

# Lancer
react-native-debugger
```

### Flipper
```bash
# Installer
brew install --cask flipper

# Plugins utiles :
# - Network
# - React DevTools
# - Logs
```

### Expo DevTools
```bash
# Ouvrir
npx expo start

# Appuyer sur :
# m : toggle menu
# r : reload
# d : dev tools
```

---

## 📞 Support

### Logs Importants

Toujours inclure :
- Version Expo : `npx expo --version`
- Version React Native : `npm list react-native`
- Platform : iOS/Android
- Error stack trace complet
- Steps to reproduce

### Resources

- Expo Docs : https://docs.expo.dev/
- React Native Maps : https://github.com/react-native-maps/react-native-maps
- Bottom Sheet : https://gorhom.github.io/react-native-bottom-sheet/
- Reanimated : https://docs.swmansion.com/react-native-reanimated/

---

## ✅ Health Check

```bash
# Tout devrait passer :
✅ Dependencies installed
✅ Babel configured (reanimated plugin)
✅ Maps API key configured (Android)
✅ Navigation works
✅ Bottom sheet opens/closes
✅ Mock data loads
✅ Images display
✅ No console errors
```

**Si tout est ✅, Explorer fonctionne correctement !** 🎉
