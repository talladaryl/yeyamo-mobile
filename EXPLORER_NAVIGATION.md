# 🧭 Navigation Explorer - Guide Complet

## 📍 Routes Créées

### Tab Navigation
```
(tabs)/explore.tsx      → Écran d'accueil Explorer
```

### Stack Navigation
```
(explore)/search.tsx    → Recherche avancée
(explore)/map.tsx       → Carte interactive
(explore)/places.tsx    → Liste des lieux
(regions)/[id].tsx      → Détail d'une région
```

---

## 🔗 Liens de Navigation

### Depuis Explorer Home `(tabs)/explore`

```tsx
// Vers Search
router.push('/(explore)/search')

// Vers Places List (avec filtre catégorie)
router.push({
  pathname: '/(explore)/places',
  params: { category: 'attractions' }
})

// Vers Détail Lieu
router.push(`/(places)/${placeId}`)
```

---

### Depuis Search `(explore)/search`

```tsx
// Retour
router.back()

// Vers Détail Lieu
router.push(`/(places)/${placeId}`)

// Ouvrir filtres (ref)
filterSheetRef.current?.open()
```

---

### Depuis Map `(explore)/map`

```tsx
// Retour
router.back()

// Vers Search
router.push('/(explore)/search')

// Vers Détail Lieu (clic preview)
router.push(`/(places)/${placeId}`)
```

---

### Depuis Region `(regions)/[id]`

```tsx
// Retour
router.back()

// Vers Lieu
router.push(`/(places)/${placeId}`)

// Vers Événement
router.push(`/(events)/${eventId}`)

// Vers Places List filtrée
router.push({
  pathname: '/(explore)/places',
  params: { region: regionId }
})
```

---

### Depuis Places List `(explore)/places`

```tsx
// Retour
router.back()

// Vers Lieu
router.push(`/(places)/${placeId}`)

// Vers Map (FAB button)
router.push('/(explore)/map')
```

---

## 🎯 Paramètres de Navigation

### Places List avec filtres

```tsx
// Par catégorie
router.push({
  pathname: '/(explore)/places',
  params: { category: 'restaurants' }
})

// Par région
router.push({
  pathname: '/(explore)/places',
  params: { region: 1 }
})

// Multiples filtres
router.push({
  pathname: '/(explore)/places',
  params: { 
    category: 'hotels',
    region: 2,
    sort: 'rating'
  }
})
```

### Récupérer les params

```tsx
const params = useLocalSearchParams<{
  category?: string;
  region?: string;
  sort?: string;
}>();

// Utiliser
const category = params.category || 'all';
const regionId = params.region ? Number(params.region) : null;
```

---

## 🗺️ Flow de Navigation Complet

### Flow 1 : Recherche Simple
```
Explorer Home → Search → Lieu Détail
```

### Flow 2 : Navigation par Catégorie
```
Explorer Home → Clic Catégorie → Places List → Lieu Détail
```

### Flow 3 : Exploration Carte
```
Explorer Home → Map → Clic Pin → Preview → Lieu Détail
```

### Flow 4 : Découverte Région
```
Explorer Home → Région → Détail Région → Lieu/Événement
```

### Flow 5 : Tendances
```
Explorer Home → Clic Tendance → Lieu Détail
```

---

## 🔄 Navigation Croisée avec Autres Écrans

### Vers Feed Social (déjà implémenté)

```tsx
// Depuis Place Detail → Posts du lieu
router.push({
  pathname: '/(tabs)/index',
  params: { place_id: placeId }
})
```

### Vers Profil Partenaire

```tsx
// Depuis Place Detail → Profil créateur
router.push(`/(profile)/${username}`)
```

### Vers Événement Détail

```tsx
// Depuis Région → Événement
router.push(`/(events)/${eventId}`)
```

---

## 🎨 Bottom Navigation (Tabs)

Les écrans Explorer sont accessibles via le tab bar :

```tsx
// Tab Explore (icône 🔍)
<Tabs.Screen
  name="explore"
  options={{
    title: 'Explore',
    tabBarIcon: ({ focused }) => <Icon emoji="🔍" focused={focused} />,
  }}
/>
```

Navigation entre tabs :

```tsx
// Aller au Feed
router.push('/(tabs)/index')

// Aller à Create
router.push('/(tabs)/create')

// Aller à Profile
router.push('/(tabs)/profile')
```

---

## 📱 Gestures de Navigation

### Swipe Back (iOS)
- Automatique avec Stack navigation
- Fonctionne sur tous les écrans Explorer

### Boutons Hardware
- Back button Android : `router.back()`
- Géré automatiquement par Expo Router

---

## 🧩 Intégration avec Filtres

### Bottom Sheet (Search)

```tsx
// Référence
const filterSheetRef = useRef<FilterBottomSheetHandle>(null);

// Ouvrir
filterSheetRef.current?.open()

// Fermer
filterSheetRef.current?.close()

// État filtres
const [filters, setFilters] = useState<SearchFilters>({...});

// Appliquer
<FilterBottomSheet
  ref={filterSheetRef}
  filters={filters}
  onFiltersChange={setFilters}
  onApply={() => {
    // Fetch filtered results
    fetchPlaces(filters);
  }}
/>
```

---

## 🚀 Deep Linking

Configuration pour deep links :

```json
// app.json
{
  "expo": {
    "scheme": "yeyamo",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "yeyamo.cm",
              "pathPrefix": "/explore"
            }
          ]
        }
      ]
    }
  }
}
```

Liens deep :

```
yeyamo://explore              → Explorer Home
yeyamo://explore/search       → Search
yeyamo://explore/map          → Map
yeyamo://regions/1            → Region Detail
yeyamo://explore/places       → Places List
```

---

## 🎯 Navigation Programmatique Avancée

### Replace (pas de retour)

```tsx
router.replace('/(explore)/places')
```

### Push Multiple

```tsx
router.push('/(regions)/1')
router.push('/(places)/5')
// Stack: Home > Region > Place
```

### Reset Stack

```tsx
router.navigate('/(tabs)/explore')
// Efface toute la stack
```

---

## 📝 Best Practices

1. **Toujours utiliser `router.back()`** pour le retour
2. **Passer les IDs en params** : `/(places)/${id}`
3. **Filtres en query params** : `?category=hotels&region=1`
4. **Loading states** pendant navigation
5. **Error boundaries** pour catch navigation errors

---

## ✅ Checklist Navigation

- ✅ Tous les écrans ont back button
- ✅ Bottom nav accessible partout
- ✅ Deep links configurés
- ✅ Params passés correctement
- ✅ No circular navigation
- ✅ Stack reset où nécessaire

**Navigation Explorer : COMPLETE & FUNCTIONAL** 🎉
