# 📊 Social Graph - Documentation d'Implémentation

## 🎯 Vue d'ensemble

Le **Social Graph** (Réseau Social) est un système complet de gestion des relations sociales dans Yeyamo Mobile. Il comprend 8 interfaces principales permettant aux utilisateurs de découvrir, suivre, et interagir avec d'autres utilisateurs.

## 📱 Les 8 Interfaces Implémentées

### ÉCRAN 1 - Recherche Utilisateurs
**Route** : `/(profile)/search`
**Fonctionnalités** :
- Recherche par nom d'utilisateur ou nom affiché
- Filtres avancés (localisation, centres d'intérêt)
- Affichage des amis en commun
- Bouton Suivre/Abonné

**Composants utilisés** :
- `UserSearchCard` : Carte utilisateur avec avatar, bio, stats

### ÉCRAN 2 - Profil Utilisateur
**Route** : `/(profile)/[username]` (déjà existant)
**Améliorations** :
- Stats cliquables (Posts, Followers, Following)
- Navigation vers les listes d'abonnés/abonnements

### ÉCRAN 3 - Liste des Abonnements (Following)
**Route** : `/(profile)/following`
**Fonctionnalités** :
- Liste complète des personnes suivies
- Recherche dans la liste
- Bouton Abonné (pour se désabonner)
- Navigation vers les profils

**Composants utilisés** :
- `UserListItem` : Item de liste réutilisable

### ÉCRAN 4 - Liste des Abonnés (Followers)
**Route** : `/(profile)/followers`
**Fonctionnalités** :
- Liste complète des abonnés
- Recherche dans la liste
- Bouton Suivre (si pas encore suivi)
- Bouton Retirer (pour supprimer un abonné)

### ÉCRAN 5 - Suggestions à Suivre
**Route** : `/(profile)/suggestions`
**Fonctionnalités** :
- Suggestions personnalisées basées sur les centres d'intérêt
- Raison de la suggestion affichée
- Bouton Suivre
- Bouton Ignorer

**Composants utilisés** :
- `SuggestionCard` : Carte enrichie avec raison de suggestion

### ÉCRAN 6 - Trouver des Amis
**Route** : `/(profile)/find-friends`
**Fonctionnalités** :
- Synchronisation des contacts (bouton CTA)
- Suggestions basées sur amis en commun
- Affichage du nombre d'amis communs

### ÉCRAN 7 - Activité du Réseau
**Route** : `/(profile)/activity`
**Fonctionnalités** :
- Feed d'activités des personnes suivies
- Filtres : Tout, Likes, Commentaires, Abonnements, Publications
- Timestamp relatif (Il y a 2h, etc.)
- Navigation vers posts/profils

**Composants utilisés** :
- `ActivityItem` : Item d'activité avec icône contextuelle

**Types d'activités** :
- `like` : A aimé une publication
- `comment` : A commenté une publication
- `follow` : A commencé à suivre quelqu'un
- `post` : A publié une nouvelle photo
- `event` : Participe à un événement

### ÉCRAN 8 - Paramètres Social Graph
**Route** : `/(profile)/social-settings`
**Fonctionnalités** :

**Confidentialité** :
- Visibilité du profil (Public/Abonnés/Privé)
- Afficher mon activité
- Afficher mes abonnés
- Afficher mes abonnements

**Notifications** :
- Nouveaux abonnés
- Demandes d'abonnement
- Mentions
- Mises à jour d'activité

**Préférences** :
- Autoriser les suggestions
- Messages des inconnus

**Comptes bloqués** :
- Accès à la liste des utilisateurs bloqués

## 🗂️ Structure des Fichiers

```
src/
├── app/
│   └── (profile)/
│       ├── [username].tsx          # ÉCRAN 2 (existant, amélioré)
│       ├── search.tsx              # ÉCRAN 1
│       ├── following.tsx           # ÉCRAN 3
│       ├── followers.tsx           # ÉCRAN 4
│       ├── suggestions.tsx         # ÉCRAN 5
│       ├── find-friends.tsx        # ÉCRAN 6
│       ├── activity.tsx            # ÉCRAN 7
│       └── social-settings.tsx     # ÉCRAN 8
│
├── components/
│   └── social/
│       ├── UserSearchCard.tsx
│       ├── UserListItem.tsx
│       ├── SuggestionCard.tsx
│       └── ActivityItem.tsx
│
└── features/
    └── social/
        ├── types.ts                # Types TypeScript
        ├── social.api.ts           # Endpoints API
        └── mockData.ts             # Données de test
```

## 📊 Types de Données

### UserSearchResult
```typescript
interface UserSearchResult extends UserSummary {
  bio?: string;
  city?: string;
  followers_count: number;
  is_following: boolean;
  mutual_friends_count: number;
}
```

### FollowUser
```typescript
interface FollowUser extends UserSummary {
  bio?: string;
  city?: string;
  followers_count: number;
  is_following: boolean;
  is_followed_by: boolean;
}
```

### SuggestionUser
```typescript
interface SuggestionUser extends UserSummary {
  bio?: string;
  city?: string;
  followers_count: number;
  mutual_friends_count: number;
  reason: string; // Raison de la suggestion
}
```

### ActivityItem
```typescript
interface ActivityItem {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'post' | 'event';
  user: UserSummary;
  target_user?: UserSummary;
  post?: { id: number; thumbnail_url: string };
  event?: { id: number; title: string };
  content?: string;
  created_at: string;
}
```

### SocialSettings
```typescript
interface SocialSettings {
  privacy: {
    profile_visibility: 'public' | 'followers' | 'private';
    show_activity: boolean;
    show_followers: boolean;
    show_following: boolean;
  };
  notifications: {
    new_followers: boolean;
    follow_requests: boolean;
    mentions: boolean;
    activity_updates: boolean;
  };
  preferences: {
    allow_suggestions: boolean;
    allow_messages_from_strangers: boolean;
  };
}
```

## 🔌 API Endpoints

```typescript
// Recherche
GET /social/search?query=...&location=...&interests=...

// Listes
GET /social/following
GET /social/followers
GET /social/users/:userId/following
GET /social/users/:userId/followers

// Suggestions
GET /social/suggestions
GET /social/friend-suggestions

// Activité
GET /social/activity

// Actions
POST /social/users/:userId/follow
DELETE /social/users/:userId/follow
DELETE /social/followers/:userId

// Paramètres
GET /social/settings
PUT /social/settings
```

## 🎨 Design System

### Couleurs
- Fond principal : `#0A0A0A`
- Fond secondaire : `#161616`
- Accent : `#EF4444` (Rouge Yeyamo)
- Texte : `#FFFFFF`, `#A1A1AA`, `#52525B`
- Bordures : `#27272A`

### Composants Réutilisables
- **Avatar** : 48-56px pour listes
- **Badge vérifié** : Checkmark rouge 16px
- **Boutons Suivre** : Arrondis, rouge (#EF4444)
- **Boutons Abonné** : Gris (#27272A)

## 🔄 Flux de Navigation

### Depuis le Profil Principal
```
(tabs)/profile
├── Stats cliquables
│   ├── Followers → (profile)/followers
│   └── Following → (profile)/following
└── Section Réseau social
    ├── Rechercher → (profile)/search
    ├── Suggestions → (profile)/suggestions
    ├── Trouver amis → (profile)/find-friends
    ├── Activité → (profile)/activity
    └── Paramètres → (profile)/social-settings
```

### Navigation Inter-Écrans
- Clic sur utilisateur → `(profile)/[username]`
- Clic sur post (activité) → `(post)/[id]`
- Clic sur événement → `(events)/[id]`

## ✅ Fonctionnalités Implémentées

- [x] Recherche utilisateurs avec filtres
- [x] Liste des abonnements avec recherche
- [x] Liste des abonnés avec recherche
- [x] Suggestions personnalisées
- [x] Trouver des amis (UI)
- [x] Feed d'activité du réseau
- [x] Paramètres de confidentialité
- [x] Paramètres de notifications
- [x] Boutons Suivre/Ne plus suivre
- [x] Navigation complète
- [x] Mock data pour tests

## 🚀 Prochaines Étapes (Backend)

1. **Intégration API réelle** :
   - Remplacer mockData par appels API
   - Connecter socialApi aux endpoints Laravel

2. **React Query hooks** :
   ```typescript
   useSocialSearch(filters)
   useFollowers(userId)
   useFollowing(userId)
   useSuggestions()
   useNetworkActivity()
   ```

3. **Mutations** :
   ```typescript
   useFollowUser()
   useUnfollowUser()
   useRemoveFollower()
   useUpdateSocialSettings()
   ```

4. **Optimistic Updates** :
   - Like instantané avec rollback si erreur
   - Mise à jour UI immédiate sur follow/unfollow

5. **WebSocket** :
   - Notifications temps réel des nouveaux abonnés
   - Activité du réseau en temps réel

6. **Synchronisation contacts** :
   - Permission contacts
   - Upload et matching côté serveur

## 📝 Notes d'Implémentation

### Accessibilité
- Tous les composants utilisent `activeOpacity={0.7}` pour feedback tactile
- Textes avec contraste suffisant (WCAG AA)
- Boutons avec taille minimale 44x44

### Performance
- FlatList pour listes longues
- Pagination sur toutes les listes
- Cache React Query avec staleTime 2min

### UX
- Recherche locale pour filtrage rapide
- Pull-to-refresh sur toutes les listes
- Skeleton loaders (à ajouter)
- Empty states avec illustrations

### Sécurité
- Respect des paramètres de confidentialité
- Vérification côté serveur des permissions
- Protection contre spam de follow/unfollow

## 🎯 Cohérence avec l'Architecture

Le Social Graph suit les mêmes patterns que le reste de l'app :
- ✅ Expo Router avec groupes de routes
- ✅ NativeWind pour le styling
- ✅ Composants UI réutilisables
- ✅ Types TypeScript stricts
- ✅ Mock data pour développement
- ✅ Structure modulaire par feature

## 📚 Références

- Image de design : Schéma Social Graph fourni
- Architecture : `ARCHITECTURE.md`
- Types API : `src/types/api.types.ts`
- Theme : `src/constants/theme.ts`
