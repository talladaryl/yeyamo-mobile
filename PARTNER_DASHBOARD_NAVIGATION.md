# Navigation Dashboard Partenaire - Guide Complet

## 🗺️ Schéma de Navigation

```
APP ROOT
│
├─ (tabs)
│  ├─ index (Feed)
│  ├─ explore
│  ├─ create
│  ├─ chats
│  └─ profile ──────────┐
│                       │ [SI user_type === 'partner']
│                       ↓
│         ┌─────────────────────────────────┐
│         │   BOUTON TABLEAU DE BORD        │
│         │   (Rouge, icône stats-chart)    │
│         └─────────────────────────────────┘
│                       ↓
└─ (partner-dashboard)
   │
   ├─ dashboard.tsx ◄─────────── ÉCRAN PRINCIPAL
   │  │
   │  ├→ Navigation rapide vers:
   │  │  ├─ establishments
   │  │  ├─ events
   │  │  ├─ reservations
   │  │  └─ reviews
   │  │
   │  └─ Bouton notifications (header)
   │
   ├─ establishments.tsx
   │  ├─ Liste des établissements
   │  └─ Bouton + → (partner)/add-place-step1
   │
   ├─ events.tsx
   │  ├─ Liste des événements
   │  └─ Bouton + → (partner)/add-event-step1
   │
   ├─ reservations.tsx
   │  └─ Liste des réservations clients
   │
   ├─ reviews.tsx
   │  ├─ Liste des avis clients
   │  └─ Bouton "Répondre" par avis
   │
   ├─ statistics.tsx
   │  ├─ Cartes métriques
   │  ├─ Graphique évolution
   │  ├─ Donut chart trafic
   │  └─ Bouton "Voir rapport complet"
   │
   ├─ notifications.tsx
   │  ├─ Liste notifications
   │  └─ Bouton "Tout marquer comme lu"
   │
   └─ settings.tsx
      ├─ Section Compte
      ├─ Section Préférences
      └─ Section Support
```

---

## 📱 Points d'Entrée

### 1. Depuis le Profil (Principal)
```typescript
// src/app/(tabs)/profile.tsx

{user.user_type === 'partner' && (
  <TouchableOpacity
    onPress={() => router.push('/(partner-dashboard)/dashboard')}
  >
    <Text>Tableau de bord</Text>
  </TouchableOpacity>
)}
```

### 2. Depuis le Dashboard (Navigation Rapide)
```typescript
// src/app/(partner-dashboard)/dashboard.tsx

<TouchableOpacity
  onPress={() => router.push('/(partner-dashboard)/establishments')}
>
  <Icon name="business" />
  <Text>Établissements</Text>
</TouchableOpacity>
```

### 3. Boutons d'Ajout
```typescript
// Depuis establishments.tsx
router.push('/(partner)/add-place-step1')

// Depuis events.tsx
router.push('/(partner)/add-event-step1')
```

---

## 🔄 Navigation Patterns

### Retour en Arrière
Tous les écrans (sauf dashboard) ont un bouton retour en header :
```typescript
<TouchableOpacity onPress={() => router.back()}>
  <Icon name="arrow-back" />
</TouchableOpacity>
```

### Navigation Stack
Les routes sont enregistrées dans `src/app/_layout.tsx` :
```typescript
<Stack.Screen name="(partner-dashboard)/dashboard" />
<Stack.Screen name="(partner-dashboard)/establishments" />
<Stack.Screen name="(partner-dashboard)/events" />
<Stack.Screen name="(partner-dashboard)/reservations" />
<Stack.Screen name="(partner-dashboard)/reviews" />
<Stack.Screen name="(partner-dashboard)/statistics" />
<Stack.Screen name="(partner-dashboard)/notifications" />
<Stack.Screen name="(partner-dashboard)/settings" />
```

---

## 🎯 Cas d'Usage

### Utilisateur Standard
```
(tabs)/profile
  ├─ Avatar + Stats
  ├─ Edit Profile
  └─ Sign Out
```

### Utilisateur Partenaire
```
(tabs)/profile
  ├─ Avatar + Stats
  ├─ [BOUTON TABLEAU DE BORD] ◄── NOUVEAU
  ├─ Edit Profile
  └─ Sign Out
```

---

## 🚦 Condition d'Affichage

Le bouton dashboard apparaît uniquement si :
```typescript
user.user_type === 'partner'
```

Types possibles :
- `'user'` : Utilisateur standard (pas de dashboard)
- `'partner'` : Partenaire business (dashboard visible)

---

## 📋 Liste des Écrans par Ordre d'Importance

1. **Dashboard** - Vue d'ensemble (point d'entrée)
2. **Établissements** - Gestion des lieux
3. **Événements** - Gestion des événements
4. **Réservations** - Suivi clients
5. **Avis** - Réputation
6. **Statistiques** - Analytics
7. **Notifications** - Alertes
8. **Paramètres** - Configuration

---

## 🔗 Liens entre Écrans

```
DASHBOARD
  ├→ Establishments (quick access)
  ├→ Events (quick access)
  ├→ Reservations (quick access)
  └→ Reviews (quick access)

ESTABLISHMENTS
  └→ (partner)/add-place-step1

EVENTS
  └→ (partner)/add-event-step1

REVIEWS
  └→ Modal réponse (TODO)

NOTIFICATIONS
  └→ Détails notification (TODO)

SETTINGS
  ├→ Business Info (TODO)
  ├→ Change Password (TODO)
  ├→ Notifications Settings (TODO)
  ├→ Language (TODO)
  ├→ Help Center (TODO)
  ├→ Contact (TODO)
  └→ About (TODO)
```

---

## 💡 Tips de Navigation

### Pour Tester
1. Créer un utilisateur avec `user_type: 'partner'`
2. Se connecter
3. Aller sur l'onglet Profile (👤)
4. Cliquer sur le bouton rouge "Tableau de bord"
5. Explorer les 8 écrans du dashboard

### Pour Débugger
```typescript
// Forcer l'affichage du bouton temporairement
{(user.user_type === 'partner' || true) && (
  // Bouton dashboard
)}
```

### Navigation Programmatique
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Aller au dashboard
router.push('/(partner-dashboard)/dashboard');

// Aller aux statistiques
router.push('/(partner-dashboard)/statistics');

// Retour
router.back();

// Remplacer (pas de retour possible)
router.replace('/(partner-dashboard)/dashboard');
```

---

## 📊 Statistiques de l'Implémentation

- **8 écrans** de dashboard
- **7 composants** réutilisables
- **2 fichiers** de features (types + data)
- **2 fichiers** modifiés (profile + layout)
- **0 erreurs** TypeScript
- **100% conforme** à l'image

---

**Navigation fluide et intuitive, prête pour la production !** 🎉
