# Guide de Test - Dashboard Partenaire

## 🧪 Tests Rapides

### 1. Vérification des Imports
```bash
npm start
# Vérifier qu'il n'y a pas d'erreurs de compilation
```

### 2. Test du Bouton Dashboard

#### Option A : Forcer l'affichage (pour test)
Modifier temporairement `src/app/(tabs)/profile.tsx` :
```typescript
// Ligne 50 - Remplacer la condition
{(user.user_type === 'partner' || true) && (
  <TouchableOpacity
    onPress={() => router.push('/(partner-dashboard)/dashboard')}
    // ...
  >
```

#### Option B : Modifier le type d'utilisateur en BDD
```sql
UPDATE users SET user_type = 'partner' WHERE id = YOUR_USER_ID;
```

### 3. Navigation Manuelle
Tester chaque route dans l'ordre :

```typescript
// Dans n'importe quel écran, ajouter temporairement
import { useRouter } from 'expo-router';

const router = useRouter();

// Test 1 - Dashboard
router.push('/(partner-dashboard)/dashboard');

// Test 2 - Établissements
router.push('/(partner-dashboard)/establishments');

// Test 3 - Événements
router.push('/(partner-dashboard)/events');

// Test 4 - Réservations
router.push('/(partner-dashboard)/reservations');

// Test 5 - Avis
router.push('/(partner-dashboard)/reviews');

// Test 6 - Statistiques
router.push('/(partner-dashboard)/statistics');

// Test 7 - Notifications
router.push('/(partner-dashboard)/notifications');

// Test 8 - Paramètres
router.push('/(partner-dashboard)/settings');
```

---

## ✅ Checklist de Test par Écran

### ÉCRAN 1 - Dashboard
- [ ] Les 3 cartes métriques s'affichent (1248, 368, 24)
- [ ] Les 3 activités récentes sont visibles
- [ ] Les 4 boutons de navigation fonctionnent
- [ ] Le bouton notifications en header est présent
- [ ] Le scroll fonctionne correctement

### ÉCRAN 2 - Établissements
- [ ] Les 3 établissements s'affichent avec images
- [ ] Les notes et avis sont visibles
- [ ] Le bouton "+" ouvre add-place-step1
- [ ] Le bouton retour fonctionne
- [ ] Le bouton "Voir tous" est présent

### ÉCRAN 3 - Événements
- [ ] Les 3 événements s'affichent
- [ ] Les badges de date (rouge) sont corrects
- [ ] Les statuts (Publié/Brouillon) sont colorés
- [ ] Le bouton "+" ouvre add-event-step1
- [ ] Les participants sont affichés

### ÉCRAN 4 - Réservations
- [ ] Les 3 réservations s'affichent
- [ ] Les avatars sont visibles
- [ ] Les montants (FCFA) sont affichés
- [ ] Les badges statut sont colorés
- [ ] Les icônes (date, heure, personnes) sont présentes

### ÉCRAN 5 - Avis Clients
- [ ] Les 3 avis s'affichent
- [ ] Les étoiles (1-5) sont visibles
- [ ] Les boutons "Répondre" sont présents
- [ ] Les commentaires sont tronqués à 3 lignes
- [ ] Les établissements associés sont affichés

### ÉCRAN 6 - Statistiques
- [ ] Les 2 cartes métriques rouges s'affichent
- [ ] Les changements (+13.8%, +1.6%) sont visibles
- [ ] Le graphique placeholder est présent
- [ ] Le donut chart et la légende s'affichent
- [ ] Les 4 sources de trafic sont listées

### ÉCRAN 7 - Notifications
- [ ] Les 5 notifications s'affichent
- [ ] Les icônes colorées sont correctes
- [ ] Le point rouge (non lu) est visible sur 2 notifs
- [ ] Le bouton "Tout marquer comme lu" est présent
- [ ] Les timestamps sont affichés

### ÉCRAN 8 - Paramètres
- [ ] Les 3 sections (Compte, Préférences, Support) sont visibles
- [ ] Tous les items (8 au total) sont listés
- [ ] Les icônes sont présentes
- [ ] Les valeurs (Français, 7843) sont affichées
- [ ] Les flèches de navigation sont visibles

---

## 🐛 Tests de Régression

### Navigation
- [ ] Retour depuis chaque écran vers dashboard
- [ ] Navigation rapide depuis dashboard vers sous-pages
- [ ] Fermeture et réouverture de l'app (état conservé)

### Design
- [ ] Couleurs respectées (#0A0A0A, #161616, #EF4444)
- [ ] Icônes Ionicons correctes
- [ ] Rounded corners (rounded-xl)
- [ ] Spacing cohérent (p-4, mb-3)

### Responsiveness
- [ ] Safe area insets (top) respectée sur tous les écrans
- [ ] Scroll fonctionne sur listes longues
- [ ] Boutons accessibles sans scroll

### Performance
- [ ] Pas de lag au scroll
- [ ] Images chargées correctement (expo-image)
- [ ] Transitions fluides entre écrans

---

## 📝 Logs de Test

### Console Logs Attendus

```javascript
// Quand on clique sur un établissement
"View establishment: 1"

// Quand on clique sur un événement
"View event: 1"

// Quand on clique sur une réservation
"View reservation: 1"

// Quand on clique sur "Répondre" à un avis
"Reply to review: 1"

// Quand on clique sur une notification
"Open notification: 1"

// Quand on clique sur un item de paramètres
"Settings item pressed: business-info"
```

---

## 🔧 Dépannage

### Erreur : Cannot read property 'user_type'
**Solution** : L'utilisateur n'est pas chargé. Vérifier :
```typescript
if (!user) return null;
```

### Erreur : Route not found
**Solution** : Vérifier que les routes sont dans `_layout.tsx` :
```typescript
<Stack.Screen name="(partner-dashboard)/dashboard" />
```

### Bouton Dashboard invisible
**Solution** : Vérifier le type d'utilisateur :
```typescript
console.log('User type:', user.user_type); // Doit être 'partner'
```

### Images ne chargent pas
**Solution** : Vérifier que `expo-image` est installé :
```bash
npm install expo-image
```

### Icônes manquantes
**Solution** : Vérifier que le composant Icon supporte Ionicons :
```typescript
<Icon library="ionicons" name="business" size={24} color="#EF4444" />
```

---

## 🎯 Scénarios de Test Complets

### Scénario 1 : Partenaire découvre son dashboard
1. Se connecter en tant que partenaire
2. Aller sur Profile
3. Cliquer sur "Tableau de bord"
4. Observer les métriques (1248, 368, 24)
5. Cliquer sur "Établissements"
6. Voir les 3 établissements
7. Retour au dashboard

### Scénario 2 : Ajout d'un établissement
1. Depuis dashboard → Établissements
2. Cliquer sur le bouton "+"
3. Vérifier que add-place-step1 s'ouvre
4. Retour

### Scénario 3 : Répondre à un avis
1. Depuis dashboard → Avis clients
2. Voir les 3 avis
3. Cliquer sur "Répondre" (premier avis)
4. Vérifier le console.log

### Scénario 4 : Voir les statistiques
1. Depuis dashboard → Statistiques
2. Observer les 2 cartes métriques
3. Observer le graphique
4. Observer le donut chart
5. Cliquer sur "Voir rapport complet"

### Scénario 5 : Marquer notifications comme lues
1. Depuis dashboard → Notifications
2. Observer les 2 points rouges
3. Cliquer sur "Tout marquer comme lu"
4. Vérifier le console.log

---

## 📊 Critères de Succès

- ✅ Tous les 8 écrans s'affichent sans erreur
- ✅ Navigation fluide entre les écrans
- ✅ Design conforme à 100% à l'image
- ✅ Données mockées affichées correctement
- ✅ Boutons et interactions fonctionnels
- ✅ 0 erreur dans la console
- ✅ Performance fluide (60 FPS)

---

## 🚀 Prêt pour la Production

Une fois tous les tests validés :
1. Remplacer les données mockées par des appels API
2. Implémenter les actions (répondre avis, marquer comme lu)
3. Ajouter les écrans de détails
4. Implémenter les graphiques réels
5. Ajouter les animations et transitions
6. Tests end-to-end avec Detox/Maestro

---

**Happy Testing!** 🎉
