# ✅ TODO - FINALISER LE MVP YEYAMO

> Ce qui reste à faire pour atteindre 100%

---

## 🔴 PRIORITÉ CRITIQUE (Blockers MVP)

### 1. Upload Média & Images
**Temps estimé: 3-4 jours**

- [ ] Configurer `expo-image-picker` dans app.json
- [ ] Implémenter sélection galerie dans `create/publication.tsx`
- [ ] Implémenter sélection galerie dans `create/story.tsx`
- [ ] Implémenter capture caméra dans `create/story.tsx`
- [ ] Créer service `src/services/upload/media.service.ts`
- [ ] Endpoint API `POST /api/media/upload` (multipart)
- [ ] Compression images avant upload
- [ ] Progress bar pendant upload
- [ ] Preview avant publication
- [ ] Gestion erreurs upload (retry, timeout)

**Fichiers à modifier:**
- `src/app/(create)/publication.tsx`
- `src/app/(create)/story.tsx`
- `src/app/(partner)/publication.tsx`
- `src/app/(partner)/story.tsx`
- `src/app/(profile)/edit-profile.tsx` (photo profil)

---

### 2. Création Contenu - API Integration
**Temps estimé: 2-3 jours**

- [ ] Connecter `POST /api/posts` dans `create/publication.tsx`
- [ ] Connecter `POST /api/stories` dans `create/story.tsx`
- [ ] Connecter `POST /api/events` dans `create/event.tsx`
- [ ] Connecter `POST /api/places/suggest` dans `create/suggest-place`
- [ ] Validation Zod complète pour tous formulaires
- [ ] Tag utilisateurs (recherche + sélection)
- [ ] Localisation GPS automatique
- [ ] Sauvegarde brouillons (AsyncStorage)

**Fichiers à modifier:**
- `src/features/create/create.api.ts` (à créer)
- `src/app/(create)/publication.tsx`
- `src/app/(create)/story.tsx`
- `src/app/(create)/event.tsx`
- `src/app/(create)/suggest-place-step1.tsx`

---

### 3. Explorer - Filtres & Recherche
**Temps estimé: 2 jours**

- [ ] Connecter filtres dans `FilterBottomSheet`
- [ ] Recherche temps réel dans `explore/search.tsx`
- [ ] Filtres catégorie, prix, distance
- [ ] Tri (popularité, note, distance)
- [ ] Géolocalisation permissions
- [ ] Map markers cliquables
- [ ] Bottom sheet détail depuis map

**Fichiers à modifier:**
- `src/components/explore/FilterBottomSheet.tsx`
- `src/app/(explore)/search.tsx`
- `src/app/(explore)/map.tsx`
- `src/features/explore/explore.api.ts` (à créer)

---

## 🟡 PRIORITÉ HAUTE (Polish MVP)

### 4. Feed - UX Polish
**Temps estimé: 1-2 jours**

- [ ] Autoplay vidéos au scroll
- [ ] Mute/unmute bouton
- [ ] Double-tap to like animation
- [ ] Pull-to-refresh
- [ ] Infinite scroll optimisé
- [ ] Pause vidéo hors viewport

**Fichiers à modifier:**
- `src/components/feed/VideoCard.tsx`
- `src/components/feed/VerticalFeedList.tsx`
- `src/app/(tabs)/index.tsx`

---

### 5. Messagerie - Pièces Jointes
**Temps estimé: 1-2 jours**

- [ ] Upload image dans chat
- [ ] Upload vidéo dans chat
- [ ] Preview média avant envoi
- [ ] Typing indicator WebSocket
- [ ] Accusés de lecture
- [ ] Recherche conversations

**Fichiers à modifier:**
- `src/app/(chat)/[id].tsx`
- `src/features/chat/chat.api.ts`
- `src/features/chat/chat.socket.ts`
- `src/components/chat/MessageAttachment.tsx`

---

### 6. Infrastructure
**Temps estimé: 2-3 jours**

**Push Notifications:**
- [ ] Configurer Expo Notifications
- [ ] Token registration API
- [ ] Handler notifications reçues
- [ ] Deep link depuis notification

**Analytics:**
- [ ] Tracker vues posts
- [ ] Tracker clics
- [ ] Tracker temps session
- [ ] Events personnalisés

**Error Handling:**
- [ ] Error boundaries globaux
- [ ] Toast messages erreurs
- [ ] Retry automatique
- [ ] Logs erreurs (Sentry)

**Deep Linking:**
- [ ] Configuration app.json
- [ ] Handlers par type (post, event, place, user)
- [ ] Partage externe

**Fichiers à créer:**
- `src/services/notifications/push.service.ts`
- `src/services/analytics/tracker.ts`
- `src/components/ErrorBoundary.tsx`
- `src/services/linking/deeplink.ts`

---

## 🟢 PRIORITÉ MOYENNE (Post-MVP)

### 7. Optimisations Performance
**Temps estimé: 2 jours**

- [ ] Image lazy loading optimisé
- [ ] Optimistic updates généralisés
- [ ] Cache AsyncStorage (offline mode)
- [ ] Loading skeletons partout
- [ ] Memoization composants lourds
- [ ] Pagination optimisée

---

### 8. Tests
**Temps estimé: 5-7 jours**

**Tests Unitaires:**
- [ ] Hooks (useAuth, useFeed, useChat)
- [ ] Services (auth.service, feed.service)
- [ ] Stores (auth.store, chat.store)

**Tests Intégration:**
- [ ] Flow authentification complet
- [ ] Flow création post
- [ ] Flow messagerie

**Tests E2E:**
- [ ] Onboarding → Login → Feed
- [ ] Création contenu → Publication
- [ ] Chat temps réel

---

### 9. Accessibilité
**Temps estimé: 3-5 jours**

- [ ] Labels accessibilité sur tous boutons
- [ ] Support screen readers
- [ ] Contraste couleurs WCAG
- [ ] Touch targets 44x44px minimum
- [ ] Navigation clavier (web)

---

### 10. Internationalisation (i18n)
**Temps estimé: 2-3 jours**

- [ ] Installer i18next
- [ ] Fichiers FR/EN
- [ ] Traduire toutes strings
- [ ] Détection langue système
- [ ] Switch langue dans paramètres

---

## 📊 RÉCAPITULATIF

| Priorité | Nombre de tâches | Temps |
|----------|------------------|-------|
| 🔴 CRITIQUE | 30 tâches | 7-9 jours |
| 🟡 HAUTE | 25 tâches | 4-7 jours |
| 🟢 MOYENNE | 20 tâches | 12-17 jours |
| **TOTAL** | **75 tâches** | **23-33 jours** |

### Pour MVP Release Candidate
**Focus sur CRITIQUE + HAUTE = 13-16 jours**

### Pour MVP Complet
**Tout inclus = 23-33 jours**

---

## 🎯 PLAN D'ACTION RECOMMANDÉ

### Semaine 1-2: MVP Release Candidate
1. Upload média (3-4j)
2. Création contenu API (2-3j)
3. Explorer filtres (2j)
4. Feed polish (1-2j)
5. Messagerie (1-2j)

### Semaine 3: Infrastructure
6. Push notifications (2j)
7. Analytics (1j)
8. Error boundaries (1j)
9. Deep linking (1j)

### Semaine 4+: Polish & Tests
10. Optimisations (2j)
11. Tests unitaires (3j)
12. Tests E2E (2j)
13. Accessibilité (3j)
14. i18n (2j)

---

## ✅ SUCCÈS = MVP PRODUCTION-READY

**Après 2 semaines:**
- Upload fonctionnel
- Création contenu complète
- Filtres & recherche OK
- Feed optimisé
- Infrastructure de base

**→ Application utilisable en production**
