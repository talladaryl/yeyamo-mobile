# 🚀 Guide de Démarrage - 7 Écrans Yeyamo

## ✅ Ce qui a été implémenté

Les **7 écrans** ont été implémentés selon le design fourni :

1. ✅ **Feed Vertical** - Scroll type TikTok avec stories
2. ✅ **Stories** - Intégré dans le feed
3. ✅ **Détail Publication** - Vue complète d'un post
4. ✅ **Commentaires** - Liste et ajout de commentaires
5. ✅ **Profil Créateur/Partenaire** - Profil complet avec grille
6. ✅ **Détail Lieu** - Informations lieu + équipements
7. ✅ **Détail Événement** - Informations événement + participants

## 📦 Dépendances Installées

- ✅ `@expo/vector-icons` - Icônes (plus d'emojis)
- ✅ `expo-linear-gradient` - Gradients pour stories

## 🎯 Comment Tester

### 1. Démarrer le serveur de développement

```bash
npm start
```

ou

```bash
npx expo start
```

### 2. Scanner le QR code avec Expo Go

- **iOS:** Scanner avec l'app Caméra
- **Android:** Scanner avec l'app Expo Go

### 3. Navigation entre les écrans

#### Feed Principal
- **Route:** `/(tabs)/index`
- Accessible via la tab bar (icône Home)
- Affiche le feed vertical avec stories en haut

#### Tester la Navigation

**Vers Profil:**
```tsx
// Depuis n'importe où
router.push('/(profile)/explore.cameroon');
```

**Vers Post:**
```tsx
// Depuis le feed ou profil
router.push('/(post)/123');
```

**Vers Commentaires:**
```tsx
// Depuis un post
router.push('/(post)/123/comments');
```

**Vers Lieu:**
```tsx
// Depuis le feed ou explore
router.push('/(places)/456');
```

**Vers Événement:**
```tsx
// Depuis le feed ou profil
router.push('/(events)/789');
```

## 🔧 Configuration Requise

### Backend API

Les écrans utilisent des **données mockées** pour l'instant. Pour connecter au backend :

1. Implémenter les endpoints API (voir `IMPLEMENTATION_SUMMARY.md`)
2. Créer les hooks React Query dans chaque feature
3. Remplacer les mock data par les vrais appels API

### Exemple de Hooks à Créer

**Comments:**
```tsx
// src/features/comments/useComments.ts
export function useComments(postId: number) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentsApi.getComments(postId),
  });
}

export function useAddComment() {
  return useMutation({
    mutationFn: (data: { postId: number; content: string }) =>
      commentsApi.addComment(data),
  });
}
```

**Profile:**
```tsx
// src/features/profile/useProfile.ts
export function useUserProfile(username: string) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => profileApi.getProfile(username),
  });
}

export function useFollowUser() {
  return useMutation({
    mutationFn: (username: string) => profileApi.follow(username),
  });
}
```

**Events:**
```tsx
// src/features/events/useEvents.ts
export function useEventDetail(eventId: number) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getEvent(eventId),
  });
}
```

## 🎨 Design System

### Couleurs Principales
```tsx
#EF4444  // Primary Red (Yeyamo)
#0A0A0A  // Background Black
#161616  // Card Dark Gray
#27272A  // Border Gray
#FFFFFF  // Text White
#A1A1AA  // Text Secondary
#3B82F6  // Verified Blue
```

### Utilisation des Icônes

```tsx
import { Icon } from '@/components/ui';

// Ionicons (par défaut)
<Icon name="heart" size={24} color="#EF4444" />

// Material Icons
<Icon library="material" name="verified" size={20} />

// Material Community
<Icon library="material-community" name="weather-sunny" size={24} />

// Feather
<Icon library="feather" name="check" size={20} />
```

## 📱 Écrans Disponibles

### Tab Navigation (Bottom Bar)

1. **Home** 🏠 - Feed vertical
2. **Explore** 🔍 - Explorer lieux
3. **Create** ➕ - Créer post
4. **Chats** 💬 - Messagerie
5. **Profile** 👤 - Mon profil

### Stack Navigation (Modal/Push)

- `/(post)/[id]` - Détail publication
- `/(post)/[id]/comments` - Commentaires
- `/(profile)/[username]` - Profil utilisateur
- `/(places)/[id]` - Détail lieu
- `/(events)/[id]` - Détail événement
- `/(story)/[id]` - Story fullscreen

## 🐛 Debugging

### Erreurs Communes

**1. Icon not found**
```
Solution: Vérifier que @expo/vector-icons est installé
```

**2. Linear gradient error**
```
Solution: npx expo install expo-linear-gradient
```

**3. Navigation error**
```
Solution: Vérifier que les routes existent dans src/app/
```

### Logs Utiles

```tsx
// Dans les composants
console.log('[FeedScreen] Posts loaded:', posts.length);
console.log('[CommentInput] Submitting:', text);
```

## 📝 Prochaines Étapes

1. **Connecter les APIs Backend**
   - Créer les API clients
   - Implémenter les hooks React Query
   - Remplacer les mock data

2. **Ajouter les Fonctionnalités Manquantes**
   - Upload média (stories, posts)
   - Partage natif
   - Deep linking
   - Push notifications

3. **Optimisations**
   - Image caching
   - Video optimization
   - Infinite scroll optimization
   - Animation transitions

4. **Tests**
   - Tests unitaires (composants)
   - Tests d'intégration (navigation)
   - Tests E2E (user flows)

## 📚 Documentation

- `IMPLEMENTATION_SUMMARY.md` - Résumé technique complet
- `SCREENS_GUIDE.md` - Guide d'utilisation des écrans
- `DEMARRAGE.md` - Ce fichier

## 🆘 Support

En cas de problème :

1. Vérifier que toutes les dépendances sont installées : `npm install`
2. Nettoyer le cache : `npx expo start -c`
3. Vérifier les logs dans la console
4. Consulter la documentation Expo v56: https://docs.expo.dev/versions/v56.0.0/

---

**Bon développement ! 🚀**
