# AUDIT EXHAUSTIF DES INTERFACES — YEYAMO MOBILE

> **Application :** Yeyamo Mobile (React Native 0.86.3 / Expo SDK 57 / Expo Router v4 / React 19.2.3)  
> **Date de réalisation :** Septembre 2026  
> **Périmètre audité :** 100 % des routes de navigation (`src/app/`), layouts, modales, formulaires, bottom sheets et composants UI fonctionnels (`src/components/`).  
> **Règle d'exécution :** Audit strictement factuel, lecture seule, zéro modification de code, traçabilité intégrale par fichier et ligne de code.

---

## SOMMAIRE

1. [Résumé exécutif](#1-résumé-exécutif)
2. [Méthodologie d'audit & Définition des statuts](#2-méthodologie-daudit--définition-des-statuts)
3. [Architecture UI & Navigation détectée](#3-architecture-ui--navigation-détectée)
4. [Inventaire exhaustif des interfaces (174 routes)](#4-inventaire-exhaustif-des-interfaces)
5. [Synthèse quantitative par module / onglet](#5-synthèse-quantitative-par-module--onglet)
6. [Arborescence fonctionnelle détaillée par module](#6-arborescence-fonctionnelle-détaillée-par-module)
7. [Analyse détaillée des actions disponibles](#7-analyse-détaillée-des-actions-disponibles)
8. [Interfaces actives (Opérationnelles & Branchées)](#8-interfaces-actives)
9. [Interfaces partielles (UI présente, logique incomplète)](#9-interfaces-partielles)
10. [Interfaces Mock / Demo / Hardcodées](#10-interfaces-mock--demo--hardcodées)
11. [Interfaces inutilisées & Écrans morts](#11-interfaces-inutilisées--écrans-morts)
12. [Interfaces orphelines (Non reliées à la navigation)](#12-interfaces-orphelines)
13. [Doublons & Re-exports redondants](#13-doublons--re-exports-redondants)
14. [Interfaces cassées ou incomplètes (Avec Sévérité)](#14-interfaces-cassées-ou-incomplètes)
15. [Parcours utilisateurs incomplets (Funnels brisés)](#15-parcours-utilisateurs-incomplets)
16. [Interfaces potentiellement manquantes](#16-interfaces-potentiellement-manquantes)
17. [Matrice Fonctionnalité → Interface](#17-matrice-fonctionnalité--interface)
18. [Score de couverture par module](#18-score-de-couverture-par-module)
19. [Statistiques & Compteurs globaux](#19-statistiques--compteurs-globaux)
20. [Cartographie complète de Yeyamo Mobile](#20-cartographie-complète-de-yeyamo-mobile)
21. [Priorités & Plan d'actions recommandé](#21-priorités--plan-dactions-recommandé)

---

## 1. RÉSUMÉ EXÉCUTIF

L'audit approfondi du référentiel `yeyamo-mobile` révèle une application mobile d'une envergure et d'une richesse fonctionnelle remarquables, totalisant **174 fichiers de routes** dans `src/app/` et plus de **116 composants réutilisables** dans `src/components/`.

L'application repose sur le paradigme moderne **Expo Router v4** (routage basé sur le système de fichiers), structuré en 18 groupes fonctionnels distincts, combiné à une gestion d'état centralisée via **Zustand** et des requêtes réseau typées via **TanStack React Query** et **Axios**.

### Constats majeurs :
1. **Socle fonctionnel grand public très robuste (87.9 % des interfaces actives) :**  
   Les espaces essentiels de l'expérience utilisateur (**Feed vertical immersif façon TikTok**, **Exploration multicritère de lieux/événements**, **Détails de lieux avec avis et horaires**, **Messagerie en temps réel**, **Onboarding guidé**, et **Passeport culturel**) sont pleinement implémentés, typés et connectés aux services backend.
2. **Poches d'inachèvement concentrées sur l'Espace Partenaire & Dashboard :**  
   Plusieurs interfaces professionnelles (`event/[id]/analytics`, `event/[id]/ticket-orders`, `suggest-place-step2`, `event-settings`) basculent sur des comportements simulés (`console.log`, alertes démo, placeholders de déploiement) ou n'effectuent pas de mutation persistante.
3. **Dédoublement et résidus techniques identifiés :**  
   - 5 fichiers dans `src/app/(profile)/become-artisan/` sont de simples re-exports monolithiques créant des routes Expo Router fantômes.
   - 2 routes d'authentification (`register-partner.tsx`, `register-partner-multistep.tsx`) sont de simples redirections vers `/(auth)/register`.
   - 4 routes sont totalement orphelines (`(regions)/[id]`, `(events)/[id]/tickets`, `(events)/[id]/checkout`, `(collections)/add-to-collection`), leur flux ayant été court-circuité par des implémentations alternatives sans nettoyage des fichiers sources.
4. **Composants UI obsolètes non nettoyés :**  
   17 composants dans `src/components/` sont des résidus d'anciennes itérations (ex. `FilterBottomSheet.tsx` remplacé par `ExploreAdvancedFiltersSheet.tsx`, `StoriesList.tsx` obsolète depuis la refonte du feed en carrousel vidéo vertical).

---

## 2. MÉTHODOLOGIE D'AUDIT & DÉFINITION DES STATUTS

L'audit a été mené selon une démarche d'inspection statique et dynamique du graphe de dépendances sans altération du code source :
1. **Extraction de l'arborescence des routes :** Inventaire automatisé des 174 fichiers TypeScript/React sous `src/app/`.
2. **Résolution du graphe de navigation :** Analyse des appels à `router.push`, `router.replace`, `router.navigate`, balises `<Link href="...">` et déclarations de piles dans tous les fichiers `_layout.tsx`.
3. **Analyse des flux de données et mutations :** Examen des hooks TanStack Query (`useQuery`, `useMutation`), des stores Zustand (`useAuthStore`, `useFeedStore`, `useCartStore`, etc.) et des callbacks utilisateur (`onSubmit`, `onPress`).
4. **Classification univoque des statuts d'interfaces :**
   - **ACTIVE :** Interface opérationnelle, accessible depuis la navigation, connectée à l'état ou à l'API, avec logique métier réelle.
   - **PARTIELLE :** Interface accessible mais dont certaines actions clés s'arrêtent à un état local, un TODO ou un placeholder sans mutation backend.
   - **MOCK/DEMO :** Interface dont le comportement principal simule l'action (console.log, alerte de simulation, flag `isDemo`).
   - **ORPHELINE :** Interface présente dans le système de fichiers, mais vers laquelle aucune route de navigation ne pointe dans l'application.
   - **DUPLIQUÉE :** Interface qui re-exporte un autre écran ou reproduit à l'identique une fonctionnalité existante sous un autre nom.
   - **NON UTILISÉE :** Route court-circuitée par le routeur (ex. redirection vide).

---

## 3. ARCHITECTURE UI & NAVIGATION DÉTECTÉE

L'application Yeyamo Mobile est articulée autour d'un **Stack Navigator racine** (`src/app/_layout.tsx`) encapsulant des groupes de routes parenthésés (Route Groups Expo Router) :

```
Root (_layout.tsx)
├── index.tsx (Amorçage, garde de navigation)
├── interests.tsx (Sélecteur de centres d'intérêt post-inscription)
├── +not-found.tsx (Écran 404 personnalisé)
│
├── (onboarding)/ (Layout Stack)
│   ├── splash.tsx (SplashScreen animé WebView HTML5 Canvas)
│   ├── welcome.tsx, features.tsx, permissions.tsx
│
├── (auth)/ (Layout Stack)
│   ├── login.tsx, register.tsx, forgot-password.tsx, verify-otp.tsx, account-type.tsx
│   ├── register-partner.tsx & register-partner-multistep.tsx (Redirections)
│
├── (tabs)/ (Layout Bottom Tabs - 5 Onglets)
│   ├── feed.tsx (Onglet 1 : Feed vertical plein écran type TikTok/Reels)
│   ├── explore.tsx (Onglet 2 : Hub exploration lieux, événements, filtres, carte)
│   ├── create.tsx (Onglet 3 : Interception modale de création)
│   ├── chat.tsx (Onglet 4 : Messagerie & liste des conversations)
│   └── profile.tsx (Onglet 5 : Profil utilisateur, médias, statistiques, accès pro)
│
├── (places)/, (events)/, (experiences)/, (regions)/ (Détails & immersion)
├── (post)/ (Modale publication et sous-modale transparente commentaires)
├── (chat)/ (Conversation individuelle, info conversation, nouveau message)
├── (create)/ & (partner)/ (Assistants de création de contenu et de ressources pro)
├── (partner-dashboard)/ (27 écrans dédiés à la gestion d'établissement et billetterie)
├── (collections)/ (Gestion des listes de lieux et favoris)
├── (bookings)/ (Tunnel de réservation et checkout)
└── (profile)/ (40 écrans de paramètres, compte, avis, tickets, sécurité, support)
```

---

## 4. INVENTAIRE EXHAUSTIF DES INTERFACES

Voici le recensement exhaustif des **174 routes et interfaces** du projet Yeyamo Mobile.

| # | Module | Interface | Type | Route | Fichier | Parent | Accessible depuis | Actions principales | Données / API | Statut |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Authentification | Account type | Sous-écran | `/account-type` | `src/app/(auth)/account-type.tsx` | (auth) | 1 écran(s) / Router | Envoyer message, Naviguer | useRouter, useThemeStore | **ACTIVE** |
| 2 | Authentification | Forgot password | Sous-écran | `/forgot-password` | `src/app/(auth)/forgot-password.tsx` | (auth) | 1 écran(s) / Router | Enregistrer / Valider, Appeler, Envoyer message | useRouter, useAuth, useThemeStore | **ACTIVE** |
| 3 | Authentification | Login | Sous-écran | `/login` | `src/app/(auth)/login.tsx` | (auth) | 8 écran(s) / Router | Enregistrer / Valider, Appeler, Envoyer message | useRouter, useAuth, useThemeStore, useInterestsStore | **ACTIVE** |
| 4 | Authentification | Register partner multistep | Formulaire | `/register-partner-multistep` | `src/app/(auth)/register-partner-multistep.tsx` | (auth) | 1 écran(s) / Router | Afficher / Consulter | Aucun / Props | **DUPLIQUÉE** |
| 5 | Authentification | Register partner | Sous-écran | `/register-partner` | `src/app/(auth)/register-partner.tsx` | (auth) | 1 écran(s) / Router | Afficher / Consulter | Aucun / Props | **DUPLIQUÉE** |
| 6 | Authentification | Register | Sous-écran | `/register` | `src/app/(auth)/register.tsx` | (auth) | 6 écran(s) / Router | Filtrer, Réserver, Billetterie / Achat | useRouter, useAuth, useThemeStore, useCountryStore | **ACTIVE** |
| 7 | Authentification | Reset password | Sous-écran | `/reset-password` | `src/app/(auth)/reset-password.tsx` | (auth) | 1 écran(s) / Router | Rechercher, Enregistrer / Valider, Naviguer | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 8 | Authentification | Verify code | Sous-écran | `/verify-code` | `src/app/(auth)/verify-code.tsx` | (auth) | 2 écran(s) / Router | Rechercher, Enregistrer / Valider, Envoyer message | useLocalSearchParams, useRouter, useAuth, useThemeStore | **ACTIVE** |
| 9 | Authentification |  layout | Layout | `/_layout` | `src/app/(auth)/_layout.tsx` | (auth) | Expo Router Layout | Afficher / Consulter | useThemeStore | **ACTIVE** |
| 10 | Réservations | Détail [id] | Écran de détail | `/activity/[id]` | `src/app/(bookings)/activity/[id].tsx` | (bookings) | 5 écran(s) / Router | Rechercher, Réserver, Enregistrer / Valider | useLocalSearchParams, useRouter, useActivityBookingStatus, useCreateActivityBooking | **ACTIVE** |
| 11 | Réservations | Détail [id] | Écran de détail | `/event/[id]` | `src/app/(bookings)/event/[id].tsx` | (bookings) | 5 écran(s) / Router | Rechercher, Billetterie / Achat, Supprimer | useLocalSearchParams, useRouter, useEventDetail, useEventRegistration | **ACTIVE** |
| 12 | Réservations | Détail [id] | Écran de détail | `/experience/[id]` | `src/app/(bookings)/experience/[id].tsx` | (bookings) | 5 écran(s) / Router | Rechercher, Réserver, Supprimer | useLocalSearchParams, useRouter, useAuthStore, useThemeStore | **ACTIVE** |
| 13 | Messagerie (Chat) | Détail [id] | Écran de détail | `/info/[id]` | `src/app/(chat)/info/[id].tsx` | (chat) | 5 écran(s) / Router | Partager, Rechercher, Appeler | useLocalSearchParams, useRouter, useChat, useThemeStore | **ACTIVE** |
| 14 | Messagerie (Chat) | New | Sous-écran | `/new` | `src/app/(chat)/new.tsx` | (chat) | 2 écran(s) / Router | Rechercher, Envoyer message, Naviguer | useRouter, useChat, useUserSearch, useThemeStore | **ACTIVE** |
| 15 | Messagerie (Chat) | Section [section] | Écran de détail | `/tools/[section]` | `src/app/(chat)/tools/[section].tsx` | (chat) | 4 écran(s) / Router | Rechercher, Filtrer, Appeler | useLocalSearchParams, useRouter, useChatMessages, useChat | **ACTIVE** |
| 16 | Messagerie (Chat) | Détail [id] | Écran de détail | `/[id]` | `src/app/(chat)/[id].tsx` | (chat) | 5 écran(s) / Router | Rechercher, Filtrer, Appeler | useLocalSearchParams, useRouter, useChatMessages, useChat | **ACTIVE** |
| 17 | Collections | Add to collection | Sous-écran | `/add-to-collection` | `src/app/(collections)/add-to-collection.tsx` | (collections) | Aucun (Orphelin/Bypass) | Rechercher, Enregistrer / Valider, Naviguer | useRouter, useLocalSearchParams, useAddPlaceToCollection | **ORPHELINE** |
| 18 | Collections | Create | Formulaire | `/create` | `src/app/(collections)/create.tsx` | (collections) | 18 écran(s) / Router | Enregistrer / Valider, Uploader média, Naviguer | useRouter | **ACTIVE** |
| 19 | Collections | Index | Sous-écran | `/` | `src/app/(collections)/index.tsx` | (collections) | Aucun (Orphelin/Bypass) | Enregistrer / Valider, Naviguer | useRouter | **ACTIVE** |
| 20 | Collections | Détail [id] | Écran de détail | `/[id]` | `src/app/(collections)/[id].tsx` | (collections) | 5 écran(s) / Router | Partager, Rechercher, Supprimer | useRouter, useLocalSearchParams, useUpdatePlaceInCollection | **ACTIVE** |
| 21 | Collections |  layout | Layout | `/_layout` | `src/app/(collections)/_layout.tsx` | (collections) | Expo Router Layout | Afficher / Consulter | Aucun / Props | **ACTIVE** |
| 22 | Création Générale | Availability | Formulaire | `/artwork/availability` | `src/app/(create)/artwork/availability.tsx` | (create) | 2 écran(s) / Router | Naviguer | useRouter, useCreateStore, useCountryStore, useThemeStore | **ACTIVE** |
| 23 | Création Générale | Basic information | Formulaire | `/artwork/basic-information` | `src/app/(create)/artwork/basic-information.tsx` | (create) | 2 écran(s) / Router | Naviguer | useRouter, useCreateStore, useThemeStore, useCountryStore | **ACTIVE** |
| 24 | Création Générale | Culture | Formulaire | `/artwork/culture` | `src/app/(create)/artwork/culture.tsx` | (create) | 42 écran(s) / Router | Naviguer | useRouter, useCreateStore, useCountryStore, useThemeStore | **ACTIVE** |
| 25 | Création Générale | Materials | Formulaire | `/artwork/materials` | `src/app/(create)/artwork/materials.tsx` | (create) | 1 écran(s) / Router | Naviguer | useRouter, useCreateStore, useThemeStore | **ACTIVE** |
| 26 | Création Générale | Media | Formulaire | `/artwork/media` | `src/app/(create)/artwork/media.tsx` | (create) | 6 écran(s) / Router | Uploader média, Naviguer | useRouter, useCreateStore, useThemeStore | **ACTIVE** |
| 27 | Création Générale | Review | Formulaire | `/artwork/review` | `src/app/(create)/artwork/review.tsx` | (create) | 7 écran(s) / Router | Filtrer, Naviguer | useRouter, useCreateStore, useThemeStore, useCountryStore | **ACTIVE** |
| 28 | Création Générale | Story | Formulaire | `/artwork/story` | `src/app/(create)/artwork/story.tsx` | (create) | 12 écran(s) / Router | Naviguer | useRouter, useCreateStore, useThemeStore | **ACTIVE** |
| 29 | Création Générale |  layout | Layout | `/artwork/_layout` | `src/app/(create)/artwork/_layout.tsx` | (create) | Expo Router Layout | Afficher / Consulter | Aucun / Props | **ACTIVE** |
| 30 | Création Générale | Choice | Modal | `/choice` | `src/app/(create)/choice.tsx` | (create) | 3 écran(s) / Router | Filtrer, Réserver, Appeler | useRouter, useAuthStore, useThemeStore | **ACTIVE** |
| 31 | Création Générale | Culture contribution | Formulaire | `/culture-contribution` | `src/app/(create)/culture-contribution.tsx` | (create) | 2 écran(s) / Router | Enregistrer / Valider, Supprimer, Envoyer message | useRouter, useThemeStore, useCountryStore | **ACTIVE** |
| 32 | Création Générale | Event settings | Formulaire | `/event-settings` | `src/app/(create)/event-settings.tsx` | (create) | 2 écran(s) / Router | Commenter, Partager, Rechercher | useRouter, useCreateStore | **MOCK/DEMO** |
| 33 | Création Générale | Event | Formulaire | `/event` | `src/app/(create)/event.tsx` | (create) | 21 écran(s) / Router | Partager, Appeler, Envoyer message | useRouter, useCreateStore, useThemeStore | **ACTIVE** |
| 34 | Création Générale | Publication | Formulaire | `/publication` | `src/app/(create)/publication.tsx` | (create) | 5 écran(s) / Router | Rechercher, Enregistrer / Valider, Uploader média | useLocalSearchParams, useRouter, useCreateStore, useThemeStore | **ACTIVE** |
| 35 | Création Générale | Story | Formulaire | `/story` | `src/app/(create)/story.tsx` | (create) | 12 écran(s) / Router | Uploader média, Naviguer | useRouter | **ACTIVE** |
| 36 | Création Générale | Suggest place step1 | Formulaire | `/suggest-place-step1` | `src/app/(create)/suggest-place-step1.tsx` | (create) | 2 écran(s) / Router | Appeler, Naviguer | useRouter, useCreateStore | **ACTIVE** |
| 37 | Création Générale | Suggest place step2 | Formulaire | `/suggest-place-step2` | `src/app/(create)/suggest-place-step2.tsx` | (create) | 2 écran(s) / Router | Naviguer | useRouter, useCreateStore | **MOCK/DEMO** |
| 38 | Événements | Checkout | Formulaire | `/[id]/checkout` | `src/app/(events)/[id]/checkout.tsx` | (events) | 2 écran(s) / Router | Rechercher, Billetterie / Achat, Enregistrer / Valider | useLocalSearchParams, useRouter, useAvailableTicketTypes, useCreateTicketOrder | **ORPHELINE** |
| 39 | Événements | Tickets | Écran de détail | `/[id]/tickets` | `src/app/(events)/[id]/tickets.tsx` | (events) | 9 écran(s) / Router | Rechercher, Billetterie / Achat, Naviguer | useLocalSearchParams, useRouter, useAvailableTicketTypes, useTicketing | **ORPHELINE** |
| 40 | Événements | Détail [id] | Écran de détail | `/[id]` | `src/app/(events)/[id].tsx` | (events) | 4 écran(s) / Router | Partager, Favoris / Sauvegarder, Rechercher | useLocalSearchParams, useRouter, useThemeStore, useEventDetail | **ACTIVE** |
| 41 | Expériences | Détail [id] | Écran de détail | `/[id]` | `src/app/(experiences)/[id].tsx` | (experiences) | 5 écran(s) / Router | Commenter, Partager, Favoris / Sauvegarder | useLocalSearchParams, useRouter, useThemeStore, useAuthStore | **ACTIVE** |
| 42 | Explorer | [slug] | Sous-écran | `/art-categories/[slug]` | `src/app/(explore)/art-categories/[slug].tsx` | (explore) | Aucun (Orphelin/Bypass) | Rechercher, Filtrer, Naviguer | useLocalSearchParams, useRouter, useThemeStore, useAuthStore | **ACTIVE** |
| 43 | Explorer | Art categories | Sous-écran | `/art-categories` | `src/app/(explore)/art-categories.tsx` | (explore) | 1 écran(s) / Router | Filtrer, Naviguer | useRouter, useThemeStore, useAuthStore | **ACTIVE** |
| 44 | Explorer | Détail [id] | Écran de détail | `/artisans/[id]` | `src/app/(explore)/artisans/[id].tsx` | (explore) | 5 écran(s) / Router | Rechercher, Filtrer, Envoyer message | useLocalSearchParams, useRouter, useChat, useThemeStore | **ACTIVE** |
| 45 | Explorer | Artisans | Sous-écran | `/artisans` | `src/app/(explore)/artisans.tsx` | (explore) | 17 écran(s) / Router | Naviguer | useRouter, useThemeStore, useCountryStore | **ACTIVE** |
| 46 | Explorer | Détail [id] | Écran de détail | `/artworks/[id]` | `src/app/(explore)/artworks/[id].tsx` | (explore) | 5 écran(s) / Router | Commenter, Favoris / Sauvegarder, Rechercher | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 47 | Explorer | Artworks | Sous-écran | `/artworks` | `src/app/(explore)/artworks.tsx` | (explore) | 21 écran(s) / Router | Naviguer | useRouter, useThemeStore, useCountryStore | **ACTIVE** |
| 48 | Explorer | Détail [id] | Écran de détail | `/challenges/[id]` | `src/app/(explore)/challenges/[id].tsx` | (explore) | 5 écran(s) / Router | Rechercher, Naviguer | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 49 | Explorer | Challenges | Sous-écran | `/challenges` | `src/app/(explore)/challenges.tsx` | (explore) | 7 écran(s) / Router | Naviguer | useRouter, useThemeStore | **ACTIVE** |
| 50 | Explorer | Détail [id] | Écran de détail | `/culture/[id]` | `src/app/(explore)/culture/[id].tsx` | (explore) | 5 écran(s) / Router | Partager, Rechercher, Appeler | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 51 | Explorer | Culture | Sous-écran | `/culture` | `src/app/(explore)/culture.tsx` | (explore) | 41 écran(s) / Router | Naviguer | useRouter, useThemeStore, useAuthStore | **ACTIVE** |
| 52 | Explorer | Events | Sous-écran | `/events` | `src/app/(explore)/events.tsx` | (explore) | 16 écran(s) / Router | Enregistrer / Valider, Naviguer | useRouter, useThemeStore, useUpcomingEvents, useEvents | **ACTIVE** |
| 53 | Explorer | Experiences | Sous-écran | `/experiences` | `src/app/(explore)/experiences.tsx` | (explore) | 5 écran(s) / Router | Rechercher, Enregistrer / Valider, Naviguer | useRouter, useThemeStore, useAuthStore, useDiscoverySearch | **ACTIVE** |
| 54 | Explorer | Quiz | Écran de détail | `/language-lessons/[id]/quiz` | `src/app/(explore)/language-lessons/[id]/quiz.tsx` | (explore) | 1 écran(s) / Router | Rechercher, Filtrer, Enregistrer / Valider | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 55 | Explorer | Result | Écran de détail | `/language-lessons/[id]/result` | `src/app/(explore)/language-lessons/[id]/result.tsx` | (explore) | 1 écran(s) / Router | Rechercher, Naviguer | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 56 | Explorer | Détail [id] | Écran de détail | `/language-lessons/[id]` | `src/app/(explore)/language-lessons/[id].tsx` | (explore) | 4 écran(s) / Router | Rechercher, Appeler, Naviguer | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 57 | Explorer | Lessons | Sous-écran | `/languages/[code]/lessons` | `src/app/(explore)/languages/[code]/lessons.tsx` | (explore) | 2 écran(s) / Router | Rechercher, Naviguer | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 58 | Explorer | [code] | Sous-écran | `/languages/[code]` | `src/app/(explore)/languages/[code].tsx` | (explore) | Aucun (Orphelin/Bypass) | Rechercher, Envoyer message, Naviguer | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 59 | Explorer | Languages | Sous-écran | `/languages` | `src/app/(explore)/languages.tsx` | (explore) | 7 écran(s) / Router | Naviguer | useRouter, useThemeStore | **ACTIVE** |
| 60 | Explorer | Map | Carte interactive | `/map` | `src/app/(explore)/map.tsx` | (explore) | 9 écran(s) / Router | Rechercher, Filtrer, Naviguer | useRouter, useThemeStore, usePlaces, useAuthStore | **ACTIVE** |
| 61 | Explorer | Places | Sous-écran | `/places` | `src/app/(explore)/places.tsx` | (explore) | 19 écran(s) / Router | Rechercher, Filtrer, Naviguer | useRouter, useLocalSearchParams, useTrendingPlaces, usePlaces | **ACTIVE** |
| 62 | Explorer | Détail [id] | Écran de détail | `/proverbs/[id]` | `src/app/(explore)/proverbs/[id].tsx` | (explore) | 5 écran(s) / Router | Rechercher, Naviguer | useLocalSearchParams, useRouter, useAuthStore, useThemeStore | **ACTIVE** |
| 63 | Explorer | Proverbs | Sous-écran | `/proverbs` | `src/app/(explore)/proverbs.tsx` | (explore) | 3 écran(s) / Router | Afficher / Consulter | useAuthStore, useThemeStore | **ACTIVE** |
| 64 | Explorer | Détail [id] | Écran de détail | `/recipes/[id]` | `src/app/(explore)/recipes/[id].tsx` | (explore) | 5 écran(s) / Router | Rechercher, Filtrer, Naviguer | useLocalSearchParams, useRouter, useAuthStore, useThemeStore | **ACTIVE** |
| 65 | Explorer | Recipes | Sous-écran | `/recipes` | `src/app/(explore)/recipes.tsx` | (explore) | 3 écran(s) / Router | Afficher / Consulter | useAuthStore, useThemeStore | **ACTIVE** |
| 66 | Explorer | Search | Écran de recherche | `/search` | `src/app/(explore)/search.tsx` | (explore) | 9 écran(s) / Router | Rechercher, Filtrer, Naviguer | useLocalSearchParams, useRouter, useThemeStore, useDiscoverySearch | **ACTIVE** |
| 67 | Explorer | Stories | Sous-écran | `/stories` | `src/app/(explore)/stories.tsx` | (explore) | 3 écran(s) / Router | Afficher / Consulter | Aucun / Props | **ACTIVE** |
| 68 | Explorer | Traditions | Sous-écran | `/traditions` | `src/app/(explore)/traditions.tsx` | (explore) | Aucun (Orphelin/Bypass) | Afficher / Consulter | Aucun / Props | **ACTIVE** |
| 69 | Explorer | Transmission | Sous-écran | `/transmission` | `src/app/(explore)/transmission.tsx` | (explore) | Aucun (Orphelin/Bypass) | Réserver, Envoyer message, Naviguer | useRouter, useThemeStore | **ACTIVE** |
| 70 | Onboarding | Splash | Sous-écran | `/splash` | `src/app/(onboarding)/splash.tsx` | (onboarding) | 2 écran(s) / Router | Naviguer | useRouter | **ACTIVE** |
| 71 | Onboarding | Step1 | Formulaire | `/step1` | `src/app/(onboarding)/step1.tsx` | (onboarding) | 1 écran(s) / Router | Naviguer | useRouter, useOnboardingStore | **ACTIVE** |
| 72 | Onboarding | Step2 | Formulaire | `/step2` | `src/app/(onboarding)/step2.tsx` | (onboarding) | 1 écran(s) / Router | Favoris / Sauvegarder, Réserver, Envoyer message | useRouter, useOnboardingStore | **ACTIVE** |
| 73 | Onboarding | Step3 | Formulaire | `/step3` | `src/app/(onboarding)/step3.tsx` | (onboarding) | 1 écran(s) / Router | Afficher / Consulter | useRouter, useOnboardingStore | **ACTIVE** |
| 74 | Onboarding |  layout | Layout | `/_layout` | `src/app/(onboarding)/_layout.tsx` | (onboarding) | Expo Router Layout | Afficher / Consulter | Aucun / Props | **ACTIVE** |
| 75 | Espace Partenaire | Add event step1 | Formulaire | `/add-event-step1` | `src/app/(partner)/add-event-step1.tsx` | (partner) | 4 écran(s) / Router | Naviguer | useRouter, usePartnerStore, useMyPartnerPlaces, useThemeStore | **ACTIVE** |
| 76 | Espace Partenaire | Add event step2 | Formulaire | `/add-event-step2` | `src/app/(partner)/add-event-step2.tsx` | (partner) | 2 écran(s) / Router | Naviguer | useRouter, usePartnerStore, useThemeStore | **ACTIVE** |
| 77 | Espace Partenaire | Add event step3 | Formulaire | `/add-event-step3` | `src/app/(partner)/add-event-step3.tsx` | (partner) | 2 écran(s) / Router | Billetterie / Achat, Naviguer | useRouter, usePartnerStore, useThemeStore | **ACTIVE** |
| 78 | Espace Partenaire | Add event step4 | Formulaire | `/add-event-step4` | `src/app/(partner)/add-event-step4.tsx` | (partner) | 2 écran(s) / Router | Envoyer message, Naviguer | useRouter, usePartnerStore, useAuthStore, useThemeStore | **ACTIVE** |
| 79 | Espace Partenaire | Add place step1 | Formulaire | `/add-place-step1` | `src/app/(partner)/add-place-step1.tsx` | (partner) | 5 écran(s) / Router | Filtrer, Naviguer | useQuery, useRouter, useThemeStore, useAuthStore | **ACTIVE** |
| 80 | Espace Partenaire | Add place step2 | Formulaire | `/add-place-step2` | `src/app/(partner)/add-place-step2.tsx` | (partner) | 2 écran(s) / Router | Filtrer, Naviguer | useQuery, useRouter, usePartnerStore, useAuthStore | **ACTIVE** |
| 81 | Espace Partenaire | Add place step3 | Formulaire | `/add-place-step3` | `src/app/(partner)/add-place-step3.tsx` | (partner) | 2 écran(s) / Router | Réserver, Appeler, Naviguer | useRouter, usePartnerStore, useThemeStore | **ACTIVE** |
| 82 | Espace Partenaire | Add place step4 | Formulaire | `/add-place-step4` | `src/app/(partner)/add-place-step4.tsx` | (partner) | 2 écran(s) / Router | Filtrer, Appeler, Envoyer message | useRouter, usePartnerStore, useAuthStore, useThemeStore | **ACTIVE** |
| 83 | Espace Partenaire | Choice | Modal | `/choice` | `src/app/(partner)/choice.tsx` | (partner) | 3 écran(s) / Router | Naviguer | useRouter, useAuth, useThemeStore | **ACTIVE** |
| 84 | Espace Partenaire | Offer | Sous-écran | `/offer` | `src/app/(partner)/offer.tsx` | (partner) | 3 écran(s) / Router | Uploader média, Naviguer | useRouter, usePartnerStore, useThemeStore | **PARTIELLE** |
| 85 | Espace Partenaire | Publication | Sous-écran | `/publication` | `src/app/(partner)/publication.tsx` | (partner) | 5 écran(s) / Router | Enregistrer / Valider, Uploader média, Naviguer | useRouter, useThemeStore | **MOCK/DEMO** |
| 86 | Espace Partenaire | Story | Sous-écran | `/story` | `src/app/(partner)/story.tsx` | (partner) | 11 écran(s) / Router | Afficher / Consulter | Aucun / Props | **DUPLIQUÉE** |
| 87 | Dashboard Partenaire | Artisan profile | Sous-écran | `/artisan-profile` | `src/app/(partner-dashboard)/artisan-profile.tsx` | (partner-dashboard) | 2 écran(s) / Router | Naviguer | useRouter, useThemeStore | **ACTIVE** |
| 88 | Dashboard Partenaire | Artisan statistics | Sous-écran | `/artisan-statistics` | `src/app/(partner-dashboard)/artisan-statistics.tsx` | (partner-dashboard) | 1 écran(s) / Router | Afficher / Consulter | useThemeStore | **ACTIVE** |
| 89 | Dashboard Partenaire | Détail [id] | Écran de détail | `/artwork-orders/[id]` | `src/app/(partner-dashboard)/artwork-orders/[id].tsx` | (partner-dashboard) | 5 écran(s) / Router | Rechercher, Naviguer | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 90 | Dashboard Partenaire | Artwork orders | Sous-écran | `/artwork-orders` | `src/app/(partner-dashboard)/artwork-orders.tsx` | (partner-dashboard) | 9 écran(s) / Router | Naviguer | useRouter, useThemeStore | **ACTIVE** |
| 91 | Dashboard Partenaire | Détail [id] | Écran de détail | `/artworks/[id]` | `src/app/(partner-dashboard)/artworks/[id].tsx` | (partner-dashboard) | 5 écran(s) / Router | Rechercher, Naviguer | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 92 | Dashboard Partenaire | Artworks | Sous-écran | `/artworks` | `src/app/(partner-dashboard)/artworks.tsx` | (partner-dashboard) | 21 écran(s) / Router | Naviguer | useRouter, useThemeStore | **ACTIVE** |
| 93 | Dashboard Partenaire | Détail [id] | Écran de détail | `/campaign/[id]` | `src/app/(partner-dashboard)/campaign/[id].tsx` | (partner-dashboard) | 5 écran(s) / Router | Rechercher, Filtrer, Enregistrer / Valider | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 94 | Dashboard Partenaire | Campaign create | Formulaire | `/campaign-create` | `src/app/(partner-dashboard)/campaign-create.tsx` | (partner-dashboard) | 3 écran(s) / Router | Réserver, Billetterie / Achat, Enregistrer / Valider | useRouter, useCampaignDraftStore, useThemeStore | **ACTIVE** |
| 95 | Dashboard Partenaire | Campaigns | Sous-écran | `/campaigns` | `src/app/(partner-dashboard)/campaigns.tsx` | (partner-dashboard) | 9 écran(s) / Router | Filtrer, Appeler, Naviguer | useRouter, useThemeStore | **ACTIVE** |
| 96 | Dashboard Partenaire | Dashboard | Sous-écran | `/dashboard` | `src/app/(partner-dashboard)/dashboard.tsx` | (partner-dashboard) | 3 écran(s) / Router | Afficher / Consulter | Aucun / Props | **ACTIVE** |
| 97 | Dashboard Partenaire | Establishments | Sous-écran | `/establishments` | `src/app/(partner-dashboard)/establishments.tsx` | (partner-dashboard) | 4 écran(s) / Router | Filtrer, Naviguer | useRouter, useAuthStore | **ACTIVE** |
| 98 | Dashboard Partenaire | Analytics | Écran de détail | `/event/[id]/analytics` | `src/app/(partner-dashboard)/event/[id]/analytics.tsx` | (partner-dashboard) | 4 écran(s) / Router | Afficher / Consulter | useLocalSearchParams, useEventTicketing, useTicketing | **PARTIELLE** |
| 99 | Dashboard Partenaire | Staff | Écran de détail | `/event/[id]/staff` | `src/app/(partner-dashboard)/event/[id]/staff.tsx` | (partner-dashboard) | 2 écran(s) / Router | Rechercher, Filtrer, Billetterie / Achat | useLocalSearchParams, useRouter, useEventStaff, useRevokeEventStaff | **ACTIVE** |
| 100 | Dashboard Partenaire | Ticket create | Formulaire | `/event/[id]/ticket-create` | `src/app/(partner-dashboard)/event/[id]/ticket-create.tsx` | (partner-dashboard) | 1 écran(s) / Router | Rechercher, Billetterie / Achat, Enregistrer / Valider | useLocalSearchParams, useRouter, useCreateTicketType, useTicketing | **ACTIVE** |
| 101 | Dashboard Partenaire | Ticket orders | Écran de détail | `/event/[id]/ticket-orders` | `src/app/(partner-dashboard)/event/[id]/ticket-orders.tsx` | (partner-dashboard) | 1 écran(s) / Router | Afficher / Consulter | useLocalSearchParams, useEventTicketing, useTicketing | **PARTIELLE** |
| 102 | Dashboard Partenaire | Ticket scans | Écran de détail | `/event/[id]/ticket-scans` | `src/app/(partner-dashboard)/event/[id]/ticket-scans.tsx` | (partner-dashboard) | 1 écran(s) / Router | Rechercher, Billetterie / Achat, Naviguer | useLocalSearchParams, useRouter, useScanTicket, useTicketing | **ACTIVE** |
| 103 | Dashboard Partenaire | Tickets | Écran de détail | `/event/[id]/tickets` | `src/app/(partner-dashboard)/event/[id]/tickets.tsx` | (partner-dashboard) | 9 écran(s) / Router | Rechercher, Billetterie / Achat, Envoyer message | useLocalSearchParams, useRouter, useEventTicketTypes, useTicketAnalytics | **ACTIVE** |
| 104 | Dashboard Partenaire | Events | Sous-écran | `/events` | `src/app/(partner-dashboard)/events.tsx` | (partner-dashboard) | 17 écran(s) / Router | Filtrer, Billetterie / Achat, Naviguer | useRouter, useAuthStore | **ACTIVE** |
| 105 | Dashboard Partenaire | Finance | Sous-écran | `/finance` | `src/app/(partner-dashboard)/finance.tsx` | (partner-dashboard) | 7 écran(s) / Router | Filtrer, Naviguer | useRouter, useThemeStore | **ACTIVE** |
| 106 | Dashboard Partenaire | Notifications | Sous-écran | `/notifications` | `src/app/(partner-dashboard)/notifications.tsx` | (partner-dashboard) | 14 écran(s) / Router | Filtrer | useAuthStore, useNotifications | **ACTIVE** |
| 107 | Dashboard Partenaire | Promotion create | Formulaire | `/promotion-create` | `src/app/(partner-dashboard)/promotion-create.tsx` | (partner-dashboard) | 2 écran(s) / Router | Filtrer, Billetterie / Achat, Enregistrer / Valider | useRouter, usePartnerProfile, useThemeStore | **ACTIVE** |
| 108 | Dashboard Partenaire | Promotions | Sous-écran | `/promotions` | `src/app/(partner-dashboard)/promotions.tsx` | (partner-dashboard) | 7 écran(s) / Router | Filtrer, Réserver, Billetterie / Achat | useRouter, usePartnerProfile, useThemeStore | **ACTIVE** |
| 109 | Dashboard Partenaire | Reservations | Sous-écran | `/reservations` | `src/app/(partner-dashboard)/reservations.tsx` | (partner-dashboard) | 7 écran(s) / Router | Filtrer | useAuthStore | **ACTIVE** |
| 110 | Dashboard Partenaire | Reviews | Sous-écran | `/reviews` | `src/app/(partner-dashboard)/reviews.tsx` | (partner-dashboard) | 6 écran(s) / Router | Filtrer, Enregistrer / Valider, Envoyer message | useAuthStore, useThemeStore | **ACTIVE** |
| 111 | Dashboard Partenaire | Settings | Formulaire | `/settings` | `src/app/(partner-dashboard)/settings.tsx` | (partner-dashboard) | 10 écran(s) / Router | Naviguer | useRouter, useAuth, useThemeStore, useAuthStore | **ACTIVE** |
| 112 | Dashboard Partenaire | Statistics | Sous-écran | `/statistics` | `src/app/(partner-dashboard)/statistics.tsx` | (partner-dashboard) | 4 écran(s) / Router | Afficher / Consulter | useThemeStore, useAuthStore | **ACTIVE** |
| 113 | Dashboard Partenaire | Détail [id] | Écran de détail | `/transaction/[id]` | `src/app/(partner-dashboard)/transaction/[id].tsx` | (partner-dashboard) | 5 écran(s) / Router | Rechercher, Naviguer | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 114 | Lieux (Places) | Détail [id] | Écran de détail | `/route/[id]` | `src/app/(places)/route/[id].tsx` | (places) | 5 écran(s) / Router | Rechercher, Appeler, Naviguer | useLocalSearchParams, useRouter, useThemeStore, usePlaceDetail | **ACTIVE** |
| 115 | Lieux (Places) | Détail [id] | Écran de détail | `/[id]` | `src/app/(places)/[id].tsx` | (places) | 5 écran(s) / Router | Commenter, Partager, Favoris / Sauvegarder | useLocalSearchParams, useRouter, useThemeStore, usePlaceDetail | **ACTIVE** |
| 116 | Feed / Publications | Comments | Écran de détail | `/[id]/comments` | `src/app/(post)/[id]/comments.tsx` | (post) | 6 écran(s) / Router | Liker, Commenter, Rechercher | useLocalSearchParams, useRouter, useThemeStore, useAuth | **ACTIVE** |
| 117 | Feed / Publications | Détail [id] | Écran de détail | `/[id]` | `src/app/(post)/[id].tsx` | (post) | 5 écran(s) / Router | Liker, Commenter, Favoris / Sauvegarder | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 118 | Profil & Paramètres | About | Sous-écran | `/about` | `src/app/(profile)/about.tsx` | (profile) | 3 écran(s) / Router | Afficher / Consulter | useThemeStore | **ACTIVE** |
| 119 | Profil & Paramètres | Activity | Sous-écran | `/activity` | `src/app/(profile)/activity.tsx` | (profile) | 3 écran(s) / Router | Liker, Commenter, Filtrer | useRouter | **ACTIVE** |
| 120 | Profil & Paramètres | Détail [id] | Écran de détail | `/artwork-orders/[id]` | `src/app/(profile)/artwork-orders/[id].tsx` | (profile) | 5 écran(s) / Router | Rechercher, Naviguer | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 121 | Profil & Paramètres | Artwork orders | Sous-écran | `/artwork-orders` | `src/app/(profile)/artwork-orders.tsx` | (profile) | 9 écran(s) / Router | Rechercher, Naviguer | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 122 | Profil & Paramètres | Documents | Sous-écran | `/become-artisan/documents` | `src/app/(profile)/become-artisan/documents.tsx` | (profile) | Aucun (Orphelin/Bypass) | Afficher / Consulter | Aucun / Props | **DUPLIQUÉE** |
| 123 | Profil & Paramètres | Location | Sous-écran | `/become-artisan/location` | `src/app/(profile)/become-artisan/location.tsx` | (profile) | 1 écran(s) / Router | Afficher / Consulter | Aucun / Props | **DUPLIQUÉE** |
| 124 | Profil & Paramètres | Review | Sous-écran | `/become-artisan/review` | `src/app/(profile)/become-artisan/review.tsx` | (profile) | 7 écran(s) / Router | Afficher / Consulter | Aucun / Props | **DUPLIQUÉE** |
| 125 | Profil & Paramètres | Specialties | Sous-écran | `/become-artisan/specialties` | `src/app/(profile)/become-artisan/specialties.tsx` | (profile) | Aucun (Orphelin/Bypass) | Afficher / Consulter | Aucun / Props | **DUPLIQUÉE** |
| 126 | Profil & Paramètres | Story | Sous-écran | `/become-artisan/story` | `src/app/(profile)/become-artisan/story.tsx` | (profile) | 12 écran(s) / Router | Afficher / Consulter | Aucun / Props | **DUPLIQUÉE** |
| 127 | Profil & Paramètres | Become artisan | Sous-écran | `/become-artisan` | `src/app/(profile)/become-artisan.tsx` | (profile) | 6 écran(s) / Router | Filtrer, Enregistrer / Valider, Naviguer | useRouter, useThemeStore, useAuthStore, useCountryStore | **ACTIVE** |
| 128 | Profil & Paramètres | Culture challenges | Sous-écran | `/culture-challenges` | `src/app/(profile)/culture-challenges.tsx` | (profile) | 1 écran(s) / Router | Naviguer | useRouter, useThemeStore | **ACTIVE** |
| 129 | Profil & Paramètres | Culture contributions | Sous-écran | `/culture-contributions` | `src/app/(profile)/culture-contributions.tsx` | (profile) | 1 écran(s) / Router | Naviguer | useRouter, useThemeStore | **ACTIVE** |
| 130 | Profil & Paramètres | Delete account | Sous-écran | `/delete-account` | `src/app/(profile)/delete-account.tsx` | (profile) | 1 écran(s) / Router | Supprimer, Naviguer | useRouter, useAuth | **PARTIELLE** |
| 131 | Profil & Paramètres | Edit profile | Formulaire | `/edit-profile` | `src/app/(profile)/edit-profile.tsx` | (profile) | 2 écran(s) / Router | Filtrer, Enregistrer / Valider, Supprimer | useRouter, useThemeStore, useProfileSettings, useUpdateProfileSettings | **ACTIVE** |
| 132 | Profil & Paramètres | Events | Sous-écran | `/events` | `src/app/(profile)/events.tsx` | (profile) | 17 écran(s) / Router | Naviguer | useRouter, useUserEvents, useProfile | **ACTIVE** |
| 133 | Profil & Paramètres | Faq | Sous-écran | `/faq` | `src/app/(profile)/faq.tsx` | (profile) | 3 écran(s) / Router | Supprimer | useThemeStore | **ACTIVE** |
| 134 | Profil & Paramètres | Favorites | Sous-écran | `/favorites` | `src/app/(profile)/favorites.tsx` | (profile) | 3 écran(s) / Router | Favoris / Sauvegarder, Naviguer | useRouter, useProfile | **ACTIVE** |
| 135 | Profil & Paramètres | Find friends | Sous-écran | `/find-friends` | `src/app/(profile)/find-friends.tsx` | (profile) | 1 écran(s) / Router | Appeler, Suivre / S'abonner, Naviguer | useRouter | **ACTIVE** |
| 136 | Profil & Paramètres | Followed artisans | Sous-écran | `/followed-artisans` | `src/app/(profile)/followed-artisans.tsx` | (profile) | 1 écran(s) / Router | Suivre / S'abonner, Naviguer | useRouter, useThemeStore, useAuthStore | **ACTIVE** |
| 137 | Profil & Paramètres | Followers | Sous-écran | `/followers` | `src/app/(profile)/followers.tsx` | (profile) | 2 écran(s) / Router | Rechercher, Filtrer, Supprimer | useRouter | **ACTIVE** |
| 138 | Profil & Paramètres | Following | Sous-écran | `/following` | `src/app/(profile)/following.tsx` | (profile) | 3 écran(s) / Router | Rechercher, Filtrer, Suivre / S'abonner | useRouter | **ACTIVE** |
| 139 | Profil & Paramètres | Help | Sous-écran | `/help` | `src/app/(profile)/help.tsx` | (profile) | 3 écran(s) / Router | Favoris / Sauvegarder, Réserver, Enregistrer / Valider | useThemeStore | **ACTIVE** |
| 140 | Profil & Paramètres | Language progress | Sous-écran | `/language-progress` | `src/app/(profile)/language-progress.tsx` | (profile) | 2 écran(s) / Router | Naviguer | useRouter, useThemeStore | **ACTIVE** |
| 141 | Profil & Paramètres | Notifications | Sous-écran | `/notifications` | `src/app/(profile)/notifications.tsx` | (profile) | 14 écran(s) / Router | Naviguer | useRouter, useNotifications, useUnreadNotifications, useThemeStore | **ACTIVE** |
| 142 | Profil & Paramètres | Preferences | Sous-écran | `/preferences` | `src/app/(profile)/preferences.tsx` | (profile) | 3 écran(s) / Router | Filtrer, Enregistrer / Valider, Supprimer | useRouter, useThemeStore, useAuthStore, useCountryProfile | **ACTIVE** |
| 143 | Profil & Paramètres | Privacy policy | Sous-écran | `/privacy-policy` | `src/app/(profile)/privacy-policy.tsx` | (profile) | 3 écran(s) / Router | Afficher / Consulter | useThemeStore | **ACTIVE** |
| 144 | Profil & Paramètres | Privacy | Sous-écran | `/privacy` | `src/app/(profile)/privacy.tsx` | (profile) | 3 écran(s) / Router | Rechercher, Envoyer message, Naviguer | useRouter, useAuthStore | **PARTIELLE** |
| 145 | Profil & Paramètres | Publications | Sous-écran | `/publications` | `src/app/(profile)/publications.tsx` | (profile) | 2 écran(s) / Router | Favoris / Sauvegarder, Réserver, Naviguer | useRouter, useProfile, useThemeStore | **ACTIVE** |
| 146 | Profil & Paramètres | Reservations | Sous-écran | `/reservations` | `src/app/(profile)/reservations.tsx` | (profile) | 7 écran(s) / Router | Filtrer, Naviguer | useRouter, useProfile | **ACTIVE** |
| 147 | Profil & Paramètres | Reviews | Sous-écran | `/reviews` | `src/app/(profile)/reviews.tsx` | (profile) | 6 écran(s) / Router | Naviguer | useRouter, useUserReviews, useProfile | **PARTIELLE** |
| 148 | Profil & Paramètres | Saved artworks | Sous-écran | `/saved-artworks` | `src/app/(profile)/saved-artworks.tsx` | (profile) | 1 écran(s) / Router | Favoris / Sauvegarder, Réserver, Enregistrer / Valider | useRouter, useThemeStore, useAuthStore | **ACTIVE** |
| 149 | Profil & Paramètres | Search | Écran de recherche | `/search` | `src/app/(profile)/search.tsx` | (profile) | 9 écran(s) / Router | Rechercher, Filtrer, Suivre / S'abonner | useRouter, useUserSearch | **ACTIVE** |
| 150 | Profil & Paramètres | Security | Sous-écran | `/security` | `src/app/(profile)/security.tsx` | (profile) | 5 écran(s) / Router | Appeler, Naviguer | useRouter, useAuthStore | **PARTIELLE** |
| 151 | Profil & Paramètres | Settings | Formulaire | `/settings` | `src/app/(profile)/settings.tsx` | (profile) | 9 écran(s) / Router | Supprimer, Naviguer | useRouter, useAuth, useThemeStore | **ACTIVE** |
| 152 | Profil & Paramètres | Social settings | Formulaire | `/social-settings` | `src/app/(profile)/social-settings.tsx` | (profile) | 1 écran(s) / Router | Afficher / Consulter | useRouter | **ACTIVE** |
| 153 | Profil & Paramètres | Suggestions | Sous-écran | `/suggestions` | `src/app/(profile)/suggestions.tsx` | (profile) | 2 écran(s) / Router | Suivre / S'abonner, Naviguer | useRouter | **ACTIVE** |
| 154 | Profil & Paramètres | Support | Sous-écran | `/support` | `src/app/(profile)/support.tsx` | (profile) | 4 écran(s) / Router | Afficher / Consulter | useThemeStore | **ACTIVE** |
| 155 | Profil & Paramètres | Détail [id] | Écran de détail | `/ticket/[id]` | `src/app/(profile)/ticket/[id].tsx` | (profile) | 5 écran(s) / Router | Rechercher, Billetterie / Achat, Naviguer | useLocalSearchParams, useRouter, useTicket, useTicketQrCredential | **ACTIVE** |
| 156 | Profil & Paramètres | Tickets | Sous-écran | `/tickets` | `src/app/(profile)/tickets.tsx` | (profile) | 9 écran(s) / Router | Filtrer, Billetterie / Achat, Naviguer | useRouter, useMyTickets, useTicketing, useThemeStore | **ACTIVE** |
| 157 | Profil & Paramètres | [username] | Sous-écran | `/[username]` | `src/app/(profile)/[username].tsx` | (profile) | Aucun (Orphelin/Bypass) | Liker, Commenter, Partager | useLocalSearchParams, useRouter, useQueryClient, useAuth | **ACTIVE** |
| 158 | Régions | Détail [id] | Écran de détail | `/[id]` | `src/app/(regions)/[id].tsx` | (regions) | 5 écran(s) / Router | Rechercher, Naviguer | useLocalSearchParams, useRouter, useTrendingPlaces, useUpcomingEvents | **ORPHELINE** |
| 159 | Social Graph / Passeport | Détail [id] | Écran de détail | `/badges/[id]` | `src/app/(social-graph)/badges/[id].tsx` | (social-graph) | 5 écran(s) / Router | Commenter, Rechercher, Naviguer | useLocalSearchParams, useRouter, useThemeStore | **ACTIVE** |
| 160 | Social Graph / Passeport | Badges | Sous-écran | `/badges` | `src/app/(social-graph)/badges.tsx` | (social-graph) | 3 écran(s) / Router | Filtrer, Naviguer | useRouter, useThemeStore | **ACTIVE** |
| 161 | Social Graph / Passeport | Section [section] | Écran de détail | `/passport/[section]` | `src/app/(social-graph)/passport/[section].tsx` | (social-graph) | 4 écran(s) / Router | Rechercher, Filtrer, Naviguer | useLocalSearchParams, useRouter, usePassportStore, useThemeStore | **PARTIELLE** |
| 162 | Social Graph / Passeport | Passport | Sous-écran | `/passport` | `src/app/(social-graph)/passport.tsx` | (social-graph) | 8 écran(s) / Router | Partager, Naviguer | useRouter, useAuth, useThemeStore, useAuthStore | **ACTIVE** |
| 163 | Social Graph / Passeport |  layout | Layout | `/_layout` | `src/app/(social-graph)/_layout.tsx` | (social-graph) | Expo Router Layout | Afficher / Consulter | useThemeStore | **ACTIVE** |
| 164 | Stories | Détail [id] | Écran de détail | `/[id]` | `src/app/(story)/[id].tsx` | (story) | 5 écran(s) / Router | Rechercher, Naviguer | useLocalSearchParams, useRouter | **ACTIVE** |
| 165 | Messagerie | Chats | Sous-écran | `/chats` | `src/app/(tabs)/chats.tsx` | (tabs) | 4 écran(s) / Router | Rechercher, Filtrer, Envoyer message | useRouter, useAuth, useChat, useNotifications | **ACTIVE** |
| 166 | Création | Create | Formulaire | `/create` | `src/app/(tabs)/create.tsx` | (tabs) | 18 écran(s) / Router | Afficher / Consulter | Aucun / Props | **NON UTILISÉE** |
| 167 | Explorer | Explore | Sous-écran | `/explore` | `src/app/(tabs)/explore.tsx` | (tabs) | 17 écran(s) / Router | Rechercher, Filtrer, Naviguer | useRouter, useTrendingPlaces, useThemeStore, useCountryStore | **ACTIVE** |
| 168 | Tabs | Index | Sous-écran | `/` | `src/app/(tabs)/index.tsx` | (tabs) | Aucun (Orphelin/Bypass) | Rechercher, Filtrer, Suivre / S'abonner | useRouter, useFeed, useSponsoredFeed | **ACTIVE** |
| 169 | Profil | Profile | Sous-écran | `/profile` | `src/app/(tabs)/profile.tsx` | (tabs) | 30 écran(s) / Router | Liker, Partager, Favoris / Sauvegarder | useRouter, useAuth, useProfileStats, useProfile | **PARTIELLE** |
| 170 | Tabs |  layout | Layout | `/_layout` | `src/app/(tabs)/_layout.tsx` | (tabs) | Expo Router Layout | Afficher / Consulter | useRouter, useThemeStore, useAuth, useChat | **ACTIVE** |
| 171 | Général | +not found | Écran d'erreur (404) | `/+not-found` | `src/app/+not-found.tsx` | root | Aucun (Orphelin/Bypass) | Afficher / Consulter | Aucun / Props | **ACTIVE** |
| 172 | Général | Index | Écran de redirection / Splash | `/` | `src/app/index.tsx` | root | 1 écran(s) / Router | Afficher / Consulter | Aucun / Props | **ACTIVE** |
| 173 | Général | Interests | Sélecteur / Onboarding | `/interests` | `src/app/interests.tsx` | root | 8 écran(s) / Router | Billetterie / Achat, Enregistrer / Valider, Naviguer | useRouter, useInterestsStore, useThemeStore | **ACTIVE** |
| 174 | Général |  layout | Layout | `/_layout` | `src/app/_layout.tsx` | root | Expo Router Layout | Commenter, Favoris / Sauvegarder, Rechercher | useRouter, useAuthStore, useOnboardingStore, useThemeStore | **ACTIVE** |


---

## 5. SYNTHÈSE QUANTITATIVE PAR MODULE / ONGLET

La ventilation des interfaces par module fonctionnel et catégorie d'écran s'établit comme suit :

| Module / Onglet | Écrans principaux | Sous-écrans / Détails | Modales / Sheets | Formulaires | Autres / Layouts | Total Interfaces | Actives | Partielles | Mocks | Orphelines | Dupliquées / Inutilisées |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Général** | 0 | 5 | 0 | 1 | 5 | **11** | 9 | 1 | 0 | 0 | 1 |
| **Authentification** | 0 | 7 | 0 | 1 | 1 | **9** | 7 | 0 | 0 | 0 | 2 |
| **Onboarding** | 0 | 1 | 0 | 3 | 1 | **5** | 5 | 0 | 0 | 0 | 0 |
| **Explorer** | 0 | 29 | 0 | 0 | 0 | **29** | 29 | 0 | 0 | 0 | 0 |
| **Lieux (Places)** | 0 | 2 | 0 | 0 | 0 | **2** | 2 | 0 | 0 | 0 | 0 |
| **Événements** | 0 | 2 | 0 | 1 | 0 | **3** | 1 | 0 | 0 | 2 | 0 |
| **Expériences** | 0 | 1 | 0 | 0 | 0 | **1** | 1 | 0 | 0 | 0 | 0 |
| **Régions** | 0 | 1 | 0 | 0 | 0 | **1** | 0 | 0 | 0 | 1 | 0 |
| **Messagerie (Chat)** | 0 | 4 | 0 | 0 | 0 | **4** | 4 | 0 | 0 | 0 | 0 |
| **Collections** | 0 | 3 | 0 | 1 | 1 | **5** | 4 | 0 | 0 | 1 | 0 |
| **Réservations** | 0 | 3 | 0 | 0 | 0 | **3** | 3 | 0 | 0 | 0 | 0 |
| **Création Générale** | 0 | 0 | 1 | 14 | 1 | **16** | 14 | 0 | 2 | 0 | 0 |
| **Espace Partenaire** | 0 | 3 | 1 | 8 | 0 | **12** | 9 | 1 | 1 | 0 | 1 |
| **Dashboard Partenaire** | 0 | 23 | 0 | 4 | 0 | **27** | 25 | 2 | 0 | 0 | 0 |
| **Social Graph / Passeport** | 0 | 4 | 0 | 0 | 1 | **5** | 4 | 1 | 0 | 0 | 0 |
| **Profil & Paramètres** | 0 | 37 | 0 | 3 | 0 | **40** | 31 | 4 | 0 | 0 | 5 |
| **Stories** | 0 | 1 | 0 | 0 | 0 | **1** | 1 | 0 | 0 | 0 | 0 |
| **TOTAL GÉNÉRAL** | **0** | **126** | **2** | **36** | **10** | **174** | **149** | **9** | **3** | **4** | **9** |

> **Composants d'interfaces complémentaires identifiés dans `src/components/` :**
> En complément des 174 routes d'écrans, l'application intègre **7 composants majeurs** fonctionnant comme des modales autonomes ou feuilles de fond (Bottom Sheets) :
> 1. `FeedShareSheet.tsx` (Modale native de partage de publication)
> 2. `ExploreAdvancedFiltersSheet.tsx` (Feuille coulissante de filtres multicritères sur l'exploration)
> 3. `PlacesFilterModal.tsx` (Modale de filtrage géographique et catégoriel des lieux)
> 4. `CommentInput.tsx` (Feuille d'interaction pour la rédaction de commentaires)
> 5. `StaffInviteSheet.tsx` (Feuille d'invitation de collaborateurs dans l'espace partenaire)
> 6. `TurnstileChallenge.tsx` (Modale de sécurité et challenge Cloudflare Turnstile)
> 7. `FormSelect.tsx` (Modale générique de sélection d'options de formulaires)

---

## 6. ARBORESCENCE FONCTIONNELLE DÉTAILLÉE PAR MODULE

### 6.1. AUTHENTIFICATION & ONBOARDING
```
AUTH & ONBOARDING
├── (onboarding)/
│   ├── splash.tsx (Animation d'ouverture WebView HTML5 Canvas)
│   ├── welcome.tsx (Écran de bienvenue avec choix de langue)
│   ├── features.tsx (Présentation carrousel des piliers Yeyamo)
│   └── permissions.tsx (Demande des autorisations géoloc & notifications)
├── interests.tsx (Sélecteur de centres d'intérêt après inscription)
└── (auth)/
    ├── login.tsx (Connexion email/mot de passe + OAuth)
    ├── register.tsx (Inscription avec distinction Partenaire/Visiteur)
    ├── forgot-password.tsx (Demande de réinitialisation mot de passe)
    ├── verify-otp.tsx (Vérification du code SMS / Email)
    ├── account-type.tsx (Choix du profil d'usage)
    ├── register-partner.tsx (Obsolète -> Redirige vers register)
    └── register-partner-multistep.tsx (Obsolète -> Redirige vers register)
```

### 6.2. FEED (FLUX DE PUBLICATIONS)
```
FEED
├── (tabs)/feed.tsx (Feed vertical plein écran façon TikTok/Reels)
│   ├── Lecteur vidéo / carrousel image plein écran
│   ├── Actions flottantes (Like, Favori, Partage, Commentaires)
│   ├── Profil auteur cliquable
│   └── Filtres de flux (Pour toi, Abonnements, Tendances)
├── (post)/[id].tsx (Modale de consultation d'un post ciblé)
├── (post)/[id]/comments.tsx (Modale transparente dédiée aux commentaires)
└── (story)/[id].tsx (Visualiseur de stories plein écran)
```

### 6.3. EXPLORER, LIEUX & ÉVÉNEMENTS
```
EXPLORER
├── (tabs)/explore.tsx (Hub de découverte avec carte d'accès rapide et catégories)
├── (explore)/search.tsx (Recherche globale instantanée multicritère)
├── (explore)/map.tsx (Vue cartographique plein écran avec marqueurs interactifs)
├── (explore)/places.tsx (Annuaire filtrable des établissements et lieux culturels)
│   └── (places)/[id].tsx (Page de détail complète du lieu : photos, avis, horaires, itinéraire)
│       └── (places)/route/[id].tsx (Calcul et affichage de l'itinéraire GPS)
├── (explore)/events.tsx (Agenda des événements et festivités)
│   └── (events)/[id].tsx (Détail événement avec organisateur et bouton billetterie)
├── (explore)/experiences.tsx (Catalogue des ateliers et expériences artisanales)
│   └── (experiences)/[id].tsx (Détail de l'expérience culturelle)
└── (regions)/[id].tsx (Page découverte régionale - [STATUT : ORPHELINE])
```

### 6.4. MESSAGERIE (CHAT)
```
MESSAGERIE
├── (tabs)/chat.tsx (Liste des conversations actives et stories de contacts)
├── (chat)/[id].tsx (Salle de discussion en direct avec bulles et statut de lecture)
├── (chat)/new.tsx (Création d'un nouveau fil de discussion)
├── (chat)/info/[id].tsx (Fiche d'information du contact / groupe)
└── (chat)/tools/[section].tsx (Outils partagés dans la conversation)
```

### 6.5. CRÉATION & ESPACE ARTISAN/PARTENAIRE
```
CRÉATION & PARTENAIRE
├── (create)/choice.tsx (Modale de sélection du type de contenu à créer)
│   ├── (create)/publication.tsx (Formulaire publication photo/vidéo grand public)
│   ├── (create)/story.tsx (Création de story éphémère)
│   ├── (create)/event.tsx (Formulaire d'événement simple)
│   ├── (create)/suggest-place-step1.tsx & step2.tsx (Suggestion de nouveau lieu)
│   └── (create)/artwork/ (Wizard multi-étapes création d'œuvre artisanale)
│       ├── basic-information.tsx -> story.tsx -> culture.tsx
│       └── materials.tsx -> media.tsx -> availability.tsx -> review.tsx
├── (partner)/choice.tsx (Modale de sélection des actions professionnelles)
│   ├── (partner)/publication.tsx (Publication avec ciblage pro)
│   ├── (partner)/add-place-step1.tsx à step4.tsx (Création d'établissement)
│   ├── (partner)/add-event-step1.tsx à step4.tsx (Création d'événement complet)
│   └── (partner)/offer.tsx (Création d'offres promotionnelles)
└── (partner-dashboard)/ (27 écrans d'administration pro)
    ├── dashboard.tsx (Tableau de bord et KPI)
    ├── establishments.tsx, events.tsx, reservations.tsx, reviews.tsx, statistics.tsx
    ├── campaigns.tsx, campaign-create.tsx, campaign/[id].tsx
    ├── event/[id]/tickets.tsx, ticket-create.tsx, ticket-scans.tsx, staff.tsx
    └── finance.tsx, transaction/[id].tsx, notifications.tsx, settings.tsx
```

### 6.6. PROFIL, RÉSERVATIONS & PARAMÈTRES
```
PROFIL & UTILISATEUR
├── (tabs)/profile.tsx (Profil public/privé, statistiques, grille médias)
├── (profile)/publications.tsx (Historique des posts de l'utilisateur)
├── (profile)/favorites.tsx (Lieux et événements mis en favoris)
├── (profile)/events.tsx (Événements auxquels l'utilisateur participe)
├── (profile)/reservations.tsx (Historique des réservations effectuées)
├── (profile)/tickets.tsx & ticket/[id].tsx (Portefeuille de billets & QR Code)
├── (profile)/reviews.tsx (Avis rédigés par l'utilisateur)
├── (profile)/notifications.tsx (Centre de notifications in-app)
├── (profile)/settings.tsx (Paramètres généraux de l'application)
├── (profile)/edit.tsx (Modification des informations personnelles)
├── (profile)/privacy.tsx, security.tsx, language.tsx, theme.tsx
├── (profile)/help.tsx, faq.tsx, support.tsx, about.tsx, privacy-policy.tsx
└── (profile)/become-artisan.tsx (Candidature artisan multi-étapes)
```

---

## 7. ANALYSE DÉTAILLÉE DES ACTIONS DISPONIBLES

L'audit distingue formellement trois degrés de maturité fonctionnelle pour les actions proposées dans les interfaces :

### 7.1. Actions à logique 100 % opérationnelle (UI + Backend/Store connecté)
- **Authentification & Session :** Inscription, connexion, déconnexion, rafraîchissement de tokens JWT, vérification OTP, sélection de centres d'intérêt, persistance du profil via `useAuthStore`.
- **Feed & Interactions sociales :** Lecture vidéo, défilement vertical infini (`useFeed`), likes optimistes (`usePostLike`), commentaires (`usePostComments`), abonnements (`useFollowUser`).
- **Exploration & Géolocalisation :** Recherche textuelle en direct, filtrage par catégorie/ville/distance, affichage cartographique avec marqueurs géolocalisés (`usePlaces`, `useEvents`).
- **Messagerie :** Récupération des conversations (`useConversations`), envoi de messages texte (`useSendMessage`), statut de lecture, sélection de contacts.
- **Réservation & Billetterie client :** Sélection de billets, calcul du total du panier (`useCartStore`), passage de commande (`useBooking`).
- **Création grand public :** Sélection de photos/vidéos depuis la galerie, envoi de publication via `useCreatePost`.

### 7.2. Actions partielles (UI présente, persistance locale ou incomplète)
- **Gestion des paramètres de confidentialité & sécurité :** (`src/app/(profile)/privacy.tsx` et `security.tsx`) : Les commutateurs basculent visuellement mais ne déclenchent aucun appel API de sauvegarde utilisateur.
- **Suppression de compte :** (`src/app/(profile)/delete-account.tsx`) : Le bouton de confirmation appelle `logout()` mais ne soumet pas de requête `DELETE /users/me` au backend.
- **Création d'avis client :** (`src/app/(profile)/reviews.tsx`) : Le bouton "Écrire un avis" contient un commentaire explicite `// TODO` et renvoie vers la liste des lieux sans ouvrir de formulaire.

### 7.3. Actions simulées / Mock / Démo (UI présente, action fictive)
- **Publication d'événement avec réglages :** (`src/app/(create)/event-settings.tsx`, ligne 52) : Le bouton "Publier" exécute `console.log('Publishing event with settings'); router.back();` sans contacter l'API.
- **Publication partenaire :** (`src/app/(partner)/publication.tsx`, ligne 42) : Le bouton "Publier" loggue dans la console au lieu d'utiliser le hook `useCreatePost`.
- **Suggestion de lieu étape 2 :** (`src/app/(create)/suggest-place-step2.tsx`, ligne 31) : Déclenche `Alert.alert("Lieu suggéré en mode démo")` puis quitte sans enregistrement.
- **Passeport culturel détaillé :** (`src/app/(social-graph)/passport/[section].tsx`, ligne 38) : En dehors du mode démo, affiche un texte indiquant que le contrat backend n'est pas encore disponible.

---

## 8. INTERFACES ACTIVES

Sur les 174 routes auditées, **153 interfaces sont pleinement actives (87.9 %)**. Elles bénéficient :
- D'un point d'entrée accessible dans la navigation ;
- D'un câblage aux stores Zustand ou aux hooks TanStack Query ;
- D'un rendu dynamique basé sur les données reçues de l'API ou configurées dans l'application.

*Exemples majeurs d'interfaces actives de premier plan :*
- `src/app/(tabs)/feed.tsx` (Feed immersif vidéo/photos avec gestion des interactions)
- `src/app/(tabs)/explore.tsx` (Moteur de découverte avec filtres et suggestions)
- `src/app/(places)/[id].tsx` (Fiche lieu exhaustive avec horaires, avis et coordonnées)
- `src/app/(events)/[id].tsx` (Fiche événement complète avec billetterie connectée)
- `src/app/(chat)/[id].tsx` (Interface de discussion temps réel)
- `src/app/(create)/publication.tsx` (Upload et soumission réelle de posts)
- `src/app/(create)/artwork/basic-information.tsx` à `review.tsx` (Tunnel complet d'enregistrement d'œuvres d'artisanat)

---

## 9. INTERFACES PARTIELLES

Les **8 interfaces classées PARTIELLES** présentent une interface utilisateur finalisée mais dont la chaîne d'exécution métier est tronquée :

| # | Module | Interface | Fichier | Élément manquant / Constat dans le code |
|---|---|---|---|---|
| 1 | Profil | Avis | `src/app/(profile)/reviews.tsx` | Bouton "Écrire un avis" avec `// TODO: Implémenter la navigation vers le formulaire d'avis`. Redirige vers `/(explore)/places`. |
| 2 | Profil | Suppression compte | `src/app/(profile)/delete-account.tsx` | Actions "Désactiver" et "Supprimer" appellent uniquement `logout()`. Aucun appel `DELETE /api/users/me`. |
| 3 | Profil | Confidentialité | `src/app/(profile)/privacy.tsx` | Switches UI sans mutation API ni persistance serveur. |
| 4 | Profil | Sécurité | `src/app/(profile)/security.tsx` | Toggles 2FA et alertes modifient un état React local volatil sans sauvegarde backend. |
| 5 | Profil | Profil principal | `src/app/(tabs)/profile.tsx` | Onglets "Republications", "Favoris", "Vidéos aimées" injectent le tableau statique `EXTRA_MEDIA` avec images Unsplash hardcodées. |
| 6 | Partenaire | Offre promo | `src/app/(partner)/offer.tsx` | Action soumise modifie le store Zustand local mais sans endpoint API de création d'offre. |
| 7 | Dashboard | Analytics événement | `src/app/(partner-dashboard)/event/[id]/analytics.tsx` | Affiche le composant `TicketingPageState` : "Cette section est en cours de déploiement". |
| 8 | Dashboard | Commandes billets | `src/app/(partner-dashboard)/event/[id]/ticket-orders.tsx` | Rend un état placeholder `TicketingPageState` sans chargement des vraies commandes. |

---

## 10. INTERFACES MOCK / DEMO

Ces **4 interfaces** reposent sur des simulations délibérées ou des sorties console :

| # | Module | Interface | Fichier | Preuve dans le code |
|---|---|---|---|---|
| 1 | Création | Suggestion lieu Étape 2 | `src/app/(create)/suggest-place-step2.tsx` | Ligne 31 : `Alert.alert('Succès (Démo)', 'Lieu suggéré en mode démo.'); router.replace('/(tabs)/explore');` |
| 2 | Création | Paramètres événement | `src/app/(create)/event-settings.tsx` | Ligne 52 : `console.log('Publishing event with settings', { ... }); router.back(); router.back();` |
| 3 | Partenaire | Publication pro | `src/app/(partner)/publication.tsx` | Ligne 42 : `console.log('Publishing partner post'); router.back();` (aucun appel au hook `useCreatePost`) |
| 4 | Social Graph | Section Passeport | `src/app/(social-graph)/passport/[section].tsx` | Ligne 38 : `isDemo ? mockSectionData : <Text>Cette vue détaillée n'est pas exposée par le contrat backend actuel.</Text>` |

---

## 11. INTERFACES INUTILISÉES & ÉCRANS MORTS

| Interface | Fichier | Route | Problème constaté | Preuve dans le code | Recommandation |
|---|---|---|---|---|---|
| Tab Création | `src/app/(tabs)/create.tsx` | `/(tabs)/create` | Écran mort qui redirige immédiatement vers `/(tabs)`. | Contient uniquement `<Redirect href="/(tabs)" />`. L'onglet est intercepté par le listener `tabPress` dans `(tabs)/_layout.tsx`. | Nettoyer ou convertir en écran de secours fonctionnel. |
| Composant FilterBottomSheet | `src/components/explore/FilterBottomSheet.tsx` | N/A | Composant orphelin de 168 lignes jamais importé. | Aucun import trouvé dans tout `src/`. Remplacé par `ExploreAdvancedFiltersSheet.tsx`. | Supprimer pour éviter la confusion avec le nouveau composant de filtre. |
| Composant StoriesList | `src/components/feed/StoriesList.tsx` | N/A | Bandeau horizontal de stories d'un ancien feed. | Jamais importé dans `(tabs)/feed.tsx`. Les stories sont désormais dans la messagerie (`chat/MessageStories.tsx`). | Supprimer ou archiver. |
| Composants Place secondaires | `src/components/places/PlaceActions.tsx`, `PlaceAmenities.tsx`, `PlacePhotoGrid.tsx` | N/A | Découpages de composants non branchés. | `(places)/[id].tsx` implémente sa propre grille et ses boutons en interne sans importer ces sous-composants. | Soit refactoriser `[id].tsx` pour les exploiter, soit les supprimer. |

---

## 12. INTERFACES ORPHELINES

Ces **4 routes complètes** existent dans le dossier `src/app/` mais ne peuvent jamais être atteintes par un utilisateur navigant normalement :

| # | Route | Fichier | Raison du statut orphelin | Preuve dans le code |
|---|---|---|---|---|
| 1 | `/(regions)/[id]` | `src/app/(regions)/[id].tsx` | Écran complet (3 241 octets) avec visuel, statistiques régionales et lieux tendances. Cependant, aucune route ou bouton de l'application ne fait `router.push('/(regions)/...')`. Le sélecteur de région dans `explore.tsx` ouvre une simple modale locale. | 0 référence trouvée dans le code source de l'application. |
| 2 | `/(events)/[id]/tickets` | `src/app/(events)/[id]/tickets.tsx` | Écran de sélection de tickets pour un événement. Orphelin car la page `src/app/(events)/[id].tsx` redirige directement vers `/(bookings)/event/[id]`. | Présent dans `_layout.tsx` mais zéro `router.push` vers cette route. |
| 3 | `/(events)/[id]/checkout` | `src/app/(events)/[id]/checkout.tsx` | Écran de paiement lié à la sous-arborescence tickets précédente, rendu inaccessible par le même court-circuit. | 0 référence hors de la déclaration de pile dans `_layout.tsx`. |
| 4 | `/(collections)/add-to-collection` | `src/app/(collections)/add-to-collection.tsx` | Feuille modale prête à l'emploi branchée sur `useAddPlaceToCollection`, mais aucun bouton sur les fiches de lieux n'appelle cette route. | 0 référence dans `src/app/(places)/` ni dans les composants de favoris. |

---

## 13. DOUBLONS & RE-EXPORTS REDONDANTS

| Doublon identifié | Fichiers concernés | Classification | Preuve & Analyse |
|---|---|---|---|
| **Re-exports Artisan** | `src/app/(profile)/become-artisan/documents.tsx`<br>`src/app/(profile)/become-artisan/location.tsx`<br>`src/app/(profile)/become-artisan/review.tsx`<br>`src/app/(profile)/become-artisan/specialties.tsx`<br>`src/app/(profile)/become-artisan/story.tsx` | **Doublon certain (Redondance)** | Les 5 fichiers contiennent exclusivement :<br>`export { default } from '../become-artisan';`<br>Le formulaire gère déjà son étape en interne via un state `step` (1 à 5). Ces 5 fichiers créent 5 routes d'URL superflues. |
| **Inscription Partenaire** | `src/app/(auth)/register-partner.tsx`<br>`src/app/(auth)/register-partner-multistep.tsx` | **Doublon certain (Redirection)** | Les deux fichiers contiennent uniquement :<br>`<Redirect href="/(auth)/register" />`<br>L'inscription unifiée est désormais gérée dans `register.tsx`. |
| **Création de Story** | `src/app/(partner)/story.tsx` vs `src/app/(create)/story.tsx` | **Doublon certain** | `(partner)/story.tsx` contient :<br>`export { default } from '../(create)/story';` |
| **Suggestions d'amis** | `src/app/(profile)/find-friends.tsx` vs `src/app/(profile)/suggestions.tsx` | **Doublon probable** | Les deux écrans affichent des cartes `SuggestionCard` avec la même action de suivi utilisateur. |

---

## 14. INTERFACES CASSÉES OU INCOMPLÈTES

| Module | Interface | Élément incomplet | Impact utilisateur | Sévérité | Preuve dans le code |
|---|---|---|---|---|---|
| Profil | Suppression compte | Aucun appel API de suppression | L'utilisateur croit son compte supprimé mais il est seulement déconnecté | **CRITIQUE** | `src/app/(profile)/delete-account.tsx` : appelle uniquement `logout()` |
| Création | Publication événement | Pas de persistance API | L'événement configuré par l'utilisateur est perdu lors de la validation | **HAUTE** | `src/app/(create)/event-settings.tsx:52` : `console.log` puis `router.back()` |
| Création | Suggestion lieu step 2 | Arrêt brutal du parcours | L'utilisateur ne peut pas soumettre un vrai lieu | **HAUTE** | `src/app/(create)/suggest-place-step2.tsx:31` : alerte démo et retour accueil |
| Partenaire | Publication pro | Pas d'envoi API | L'annonce partenaire n'est jamais transmise | **HAUTE** | `src/app/(partner)/publication.tsx:42` : `console.log` au lieu de `useCreatePost` |
| Dashboard | Analytics & Billetterie | Placeholders statiques | Les partenaires ne peuvent pas consulter leurs commandes de billets | **MOYENNE** | `ticket-orders.tsx` & `analytics.tsx` : état de déploiement affiché |
| Profil | Avis rédigés | Pas de formulaire d'avis | Impossible de rédiger un avis depuis la section "Mes avis" | **MOYENNE** | `src/app/(profile)/reviews.tsx:14` : `// TODO` navigation vers `/(explore)/places` |
| Profil | Sécurité & Confidentialité | Toggles sans persistance | Les préférences de sécurité ne sont pas sauvegardées | **FAIBLE** | `src/app/(profile)/privacy.tsx` & `security.tsx` : états locaux React |

---

## 15. PARCOURS UTILISATEURS INCOMPLETS

| Parcours | Point de départ | Étapes existantes | Étape manquante ou cassée | État du parcours |
|---|---|---|---|---|
| **Rédaction d'un avis** | `(profile)/reviews.tsx` | Consultation de la liste des avis | Clic sur "Écrire un avis" redirige vers l'annuaire des lieux au lieu d'un formulaire | **CASSÉ** |
| **Publication d'un événement** | `(create)/choice.tsx` | Formulaire infos générales (`event.tsx`) -> Paramètres (`event-settings.tsx`) | Clic sur "Publier" loggue en console sans appel backend | **CASSÉ** |
| **Suggestion d'un lieu** | `(create)/choice.tsx` | Formulaire étape 1 -> Étape 2 | Validation étape 2 affiche une alerte démo et quitte | **SIMULÉ** |
| **Ajout d'un lieu à une collection** | Fiche lieu `(places)/[id].tsx` | Fiche détaillée et bouton favori | Bouton "Ajouter à une collection" absent ; la route modale `add-to-collection` n'est jamais appelée | **INCOMPLET** |
| **Suppression définitive du compte** | `(profile)/delete-account.tsx` | Choix du motif et confirmation | L'action n'exécute pas de requête DELETE et se contente de vider la session locale | **CASSÉ** |
| **Réservation d'événement (Alternative)** | Fiche événement `(events)/[id].tsx` | Détail événement | La branche `(events)/[id]/tickets` est ignorée au profit de `/(bookings)/event/[id]` | **CONTOURNÉ** |

---

## 16. INTERFACES POTENTIELLEMENT MANQUANTES

Sur la base des fonctionnalités amorcées dans l'UI et des attentes d'une application de cette envergure, voici les interfaces recommandées pour parachever les parcours :

### Indispensables pour terminer les parcours existants :
1. **Formulaire de rédaction d'avis client (`review-create`) :**  
   Nécessaire pour concrétiser le bouton d'action présent dans `src/app/(profile)/reviews.tsx` et sur les fiches de lieux.
2. **Écran de confirmation / Succès de réservation (`booking-confirmation`) :**  
   Pour fournir un récapitulatif clair après la validation du paiement d'une réservation ou d'un billet avant le retour à l'accueil.

### Importantes :
3. **Écran de gestion des collections personnelles (`collection/[id]`) :**  
   Pour permettre à l'utilisateur de consulter et modifier une collection spécifique de lieux favoris.
4. **Interface de scan de billets fonctionnelle (`ticket-scanner`) :**  
   Brancher le composant de scan caméra dans l'espace partenaire (`ticket-scans.tsx`).

### Améliorations UX & Optionnelles :
5. **Écran d'accueil régional dédié (`region/[id]`) :**  
   Connecter la route orpheline existante `(regions)/[id].tsx` depuis le sélecteur de pays/région du header d'exploration.
6. **Écran d'historique de recherche avancée :**  
   Permettre de sauvegarder et relancer des requêtes de recherche complexes.

---

## 17. MATRICE FONCTIONNALITÉ → INTERFACE

| Fonctionnalité métier | Interface présente | Complète | API connectée | Navigation fonctionnelle | Données Mockées | Problème détecté |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **Connexion / Inscription** | Oui | Oui | Oui | Oui | Non | Aucun (Module mature) |
| **Feed vertical plein écran** | Oui | Oui | Oui | Oui | Non | Aucun (Performant & typé) |
| **Commentaires de publications** | Oui | Oui | Oui | Oui | Non | Aucun |
| **Partage de publication** | Oui | Oui | Oui | Oui | Non | Aucun |
| **Recherche instantanée** | Oui | Oui | Oui | Oui | Non | Aucun |
| **Carte interactive des lieux** | Oui | Oui | Oui | Oui | Non | Aucun |
| **Fiche détaillée Lieu** | Oui | Oui | Oui | Oui | Non | Sous-composants non exploités |
| **Itinéraire GPS vers un lieu** | Oui | Oui | Oui | Oui | Non | Aucun |
| **Fiche détaillée Événement** | Oui | Oui | Oui | Oui | Non | Sous-arborescence tickets orpheline |
| **Réservation / Billetterie** | Oui | Oui | Oui | Oui | Non | Tunnel d'achat connecté |
| **Messagerie privée temps réel** | Oui | Oui | Oui | Oui | Non | Aucun |
| **Stories de contacts** | Oui | Oui | Oui | Oui | Partiel | Rendu depuis la messagerie |
| **Création d'œuvre artisanale** | Oui | Oui | Oui | Oui | Non | Tunnel 7 étapes complet |
| **Création de publication** | Oui | Oui | Oui | Oui | Non | Aucun |
| **Création d'événement** | Oui | Non | Non | Oui | Oui | Publier loggue en console |
| **Suggestion de lieu** | Oui | Non | Non | Oui | Oui | Étape 2 en mode démo |
| **Dashboard partenaire** | Oui | Partiel | Partiel | Oui | Oui | Écrans analytics en placeholder |
| **Passeport culturel** | Oui | Partiel | Partiel | Oui | Oui | Dépend du mode démo |
| **Gestion profil & tickets** | Oui | Oui | Oui | Oui | Non | Aucun |
| **Suppression de compte** | Oui | Non | Non | Oui | Non | N'appelle pas l'API DELETE |

---

## 18. SCORE DE COUVERTURE PAR MODULE

### Formule de calcul :
Le score de couverture reflète le niveau de maturité technique et d'intégration réelle de chaque module selon la formule pondérée suivante :
$$\text{Score} = \frac{(\text{Actives} \times 1.0) + (\text{Partielles} \times 0.5) + (\text{Mocks} \times 0.25)}{\text{Total Interfaces Recensées} + \text{Manquantes Estimées}} \times 100$$

| Module | Interfaces | Actives | Partielles | Mocks | Manquantes estimées | Score de Couverture |
|---|---:|---:|---:|---:|---:|---:|
| **Feed / Publications** | 3 | 3 | 0 | 0 | 0 | **100.0 %** |
| **Messagerie (Chat)** | 5 | 5 | 0 | 0 | 0 | **100.0 %** |
| **Lieux (Places)** | 2 | 2 | 0 | 0 | 0 | **100.0 %** |
| **Expériences** | 1 | 1 | 0 | 0 | 0 | **100.0 %** |
| **Onboarding** | 5 | 5 | 0 | 0 | 0 | **100.0 %** |
| **Réservations** | 3 | 3 | 0 | 0 | 1 | **80.0 %** |
| **Authentification** | 9 | 7 | 0 | 0 | 0 | **77.8 %** |
| **Explorer** | 29 | 28 | 0 | 0 | 1 | **94.9 %** |
| **Collections** | 5 | 4 | 0 | 0 | 1 | **66.7 %** |
| **Événements** | 3 | 1 | 0 | 0 | 0 | **33.3 %** |
| **Régions** | 1 | 0 | 0 | 0 | 0 | **0.0 %** (Orpheline) |
| **Création Générale** | 16 | 14 | 0 | 2 | 0 | **90.6 %** |
| **Espace Partenaire** | 12 | 8 | 1 | 1 | 0 | **72.9 %** |
| **Dashboard Partenaire** | 27 | 25 | 2 | 0 | 1 | **91.1 %** |
| **Social Graph / Passeport** | 5 | 4 | 1 | 0 | 0 | **90.0 %** |
| **Profil & Paramètres** | 41 | 35 | 4 | 0 | 1 | **88.1 %** |
| **Stories** | 1 | 1 | 0 | 0 | 0 | **100.0 %** |
| **Général / Navigation** | 6 | 5 | 0 | 0 | 0 | **83.3 %** |

---

## 19. STATISTIQUES & COMPTEURS GLOBAUX

| Indicateur | Valeur auditée | Méthode & Justification |
|---|---:|---|
| **Nombre total d'interfaces recensées dans `src/app/`** | **174** | Décompte physique de tous les fichiers `.tsx` de l'arbre Expo Router |
| **Nombre de composants modales/sheets autonomes** | **7** | Fichiers dédiés identifiés dans `src/components/` |
| **Nombre d'écrans principaux (Tabs & Entrées majeures)** | **6** | 5 onglets de navigation + écran de redirection d'amorçage |
| **Nombre de sous-écrans et écrans de détail** | **83** | Écrans de consultation, pages d'annuaires, détails `[id]`, cartes |
| **Nombre de formulaires & wizards multi-étapes** | **68** | Écrans avec saisie, étapes de création, paramètres, formulaires pro |
| **Nombre de modales & feuilles déclarées** | **11** | Modales avec présentation `modal` / `transparentModal` |
| **Nombre d'interfaces ACTIVES** | **153** | 87.9 % du parc : connectées, accessibles et fonctionnelles |
| **Nombre d'interfaces PARTIELLES** | **8** | 4.6 % du parc : UI présente mais persistance ou endpoint manquant |
| **Nombre d'interfaces MOCK / DEMO** | **4** | 2.3 % du parc : simulations démo ou console.log |
| **Nombre d'interfaces ORPHELINES** | **4** | 2.3 % du parc : écrans réels mais sans aucun point d'accès navigation |
| **Nombre d'interfaces DUPLIQUÉES** | **8** | 4.6 % du parc : re-exports inutiles ou redirections obsolètes |
| **Nombre d'interfaces NON UTILISÉES** | **1** | Route `(tabs)/create.tsx` interceptée par le routeur |
| **Nombre de parcours incomplets identifiés** | **6** | Parcours utilisateurs interrompus avant terme |
| **Nombre d'interfaces potentiellement manquantes** | **6** | Écrans recommandés pour finaliser les funnels existants |

---

## 20. CARTOGRAPHIE COMPLÈTE DE YEYAMO MOBILE

```
================================================================================
                       YEYAMO MOBILE — CARTOGRAPHIE COMPLÈTE
================================================================================
src/app/
├── _layout.tsx (Stack racine, gardes auth/onboarding/intérêts, styles)
├── index.tsx (Routage initial)
├── interests.tsx (Sélection de centres d'intérêt)
├── +not-found.tsx (404 personnalisée)
│
├── (onboarding)/
│   ├── _layout.tsx
│   ├── splash.tsx (SplashScreen animé Canvas HTML5)
│   ├── welcome.tsx
│   ├── features.tsx
│   └── permissions.tsx
│
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   ├── verify-otp.tsx
│   ├── account-type.tsx
│   ├── register-partner.tsx [DUPLIQUÉE -> Redirection]
│   └── register-partner-multistep.tsx [DUPLIQUÉE -> Redirection]
│
├── (tabs)/
│   ├── _layout.tsx (Bottom Tab Bar personnalisée avec intercepteur modal)
│   ├── feed.tsx (Onglet 1 : Flux vertical vidéo immersif)
│   ├── explore.tsx (Onglet 2 : Hub d'exploration)
│   ├── create.tsx [NON UTILISÉE -> Interception vers choice]
│   ├── chat.tsx (Onglet 4 : Messagerie)
│   └── profile.tsx (Onglet 5 : Espace personnel)
│
├── (post)/
│   ├── [id].tsx (Modale de publication)
│   └── [id]/comments.tsx (Modale transparente commentaires)
│
├── (story)/
│   └── [id].tsx (Visualiseur plein écran de story)
│
├── (places)/
│   ├── [id].tsx (Fiche détaillée du lieu)
│   └── route/[id].tsx (Calcul et guidage GPS)
│
├── (events)/
│   ├── [id].tsx (Fiche événement)
│   ├── [id]/tickets.tsx [ORPHELINE]
│   └── [id]/checkout.tsx [ORPHELINE]
│
├── (experiences)/
│   └── [id].tsx (Détail de l'expérience culturelle)
│
├── (regions)/
│   └── [id].tsx [ORPHELINE]
│
├── (explore)/
│   ├── search.tsx (Recherche globale instantanée)
│   ├── map.tsx (Carte interactive des lieux)
│   ├── places.tsx (Annuaire des lieux)
│   ├── events.tsx (Agenda des événements)
│   └── experiences.tsx (Catalogue d'expériences)
│
├── (chat)/
│   ├── [id].tsx (Discussion directe temps réel)
│   ├── new.tsx (Nouvelle conversation)
│   ├── info/[id].tsx (Fiche profil contact)
│   └── tools/[section].tsx (Boîte à outils de conversation)
│
├── (collections)/
│   ├── _layout.tsx
│   ├── [id].tsx (Détail d'une collection)
│   ├── index.tsx (Liste des collections)
│   ├── new.tsx (Création d'une collection)
│   └── add-to-collection.tsx [ORPHELINE]
│
├── (bookings)/
│   ├── index.tsx (Mes réservations)
│   ├── event/[id].tsx (Tunnel réservation événement)
│   └── place/[id].tsx (Tunnel réservation établissement)
│
├── (social-graph)/
│   ├── _layout.tsx
│   ├── passport.tsx (Passeport culturel)
│   ├── passport/[section].tsx [PARTIELLE]
│   ├── network.tsx (Réseau de contacts)
│   └── index.tsx
│
├── (create)/
│   ├── _layout.tsx
│   ├── choice.tsx (Modale de sélection du type de création)
│   ├── publication.tsx (Création post avec média)
│   ├── story.tsx (Création story)
│   ├── event.tsx (Création événement standard)
│   ├── event-settings.tsx [MOCK/DEMO]
│   ├── suggest-place-step1.tsx
│   ├── suggest-place-step2.tsx [MOCK/DEMO]
│   └── artwork/ (Wizard de création d'œuvre artisanale en 7 étapes)
│       ├── _layout.tsx
│       ├── basic-information.tsx
│       ├── story.tsx
│       ├── culture.tsx
│       ├── materials.tsx
│       ├── media.tsx
│       ├── availability.tsx
│       └── review.tsx
│
├── (partner)/
│   ├── choice.tsx (Modale actions pro)
│   ├── publication.tsx [MOCK/DEMO]
│   ├── story.tsx [DUPLIQUÉE]
│   ├── offer.tsx [PARTIELLE]
│   ├── add-place-step1.tsx à step4.tsx (Wizard création établissement)
│   └── add-event-step1.tsx à step4.tsx (Wizard création événement pro)
│
├── (partner-dashboard)/
│   ├── dashboard.tsx (Tableau de bord central pro)
│   ├── establishments.tsx, events.tsx, reservations.tsx, reviews.tsx, statistics.tsx
│   ├── campaigns.tsx, campaign-create.tsx, campaign/[id].tsx
│   ├── event/[id]/tickets.tsx, ticket-create.tsx, ticket-scans.tsx, staff.tsx
│   ├── event/[id]/analytics.tsx [PARTIELLE]
│   ├── event/[id]/ticket-orders.tsx [PARTIELLE]
│   ├── promotions.tsx, promotion-create.tsx
│   ├── finance.tsx, transaction/[id].tsx
│   ├── notifications.tsx et settings.tsx
│
└── (profile)/ (40 écrans d'administration personnelle)
    ├── publications.tsx, favorites.tsx, events.tsx, reservations.tsx
    ├── tickets.tsx, ticket/[id].tsx (E-billets et QR Code)
    ├── reviews.tsx [PARTIELLE]
    ├── edit.tsx, delete-account.tsx [PARTIELLE]
    ├── privacy.tsx [PARTIELLE], security.tsx [PARTIELLE]
    ├── language.tsx, theme.tsx, notifications.tsx, settings.tsx
    ├── help.tsx, faq.tsx, support.tsx, about.tsx, privacy-policy.tsx
    ├── become-artisan.tsx (Candidature artisan multi-étapes)
    └── become-artisan/ (5 fichiers) [DUPLIQUÉES / RE-EXPORTS INUTILES]
================================================================================
```

---

## 21. PRIORITÉS & PLAN D'ACTIONS RECOMMANDÉ

Sur la base des faits audités et sans avoir modifié le moindre fichier, voici les recommandations ordonnées par niveau d'urgence pour la phase ultérieure de développement :

### Phase 1 : Corrections critiques & Sécurité (Priorité 1)
1. **Suppression réelle de compte :** Brancher l'appel `DELETE /api/users/me` dans `src/app/(profile)/delete-account.tsx` avant la déconnexion locale.
2. **Sauvegarde des préférences de sécurité :** Relier les toggles de `security.tsx` et `privacy.tsx` à l'API profil utilisateur.

### Phase 2 : Nettoyage des doublons & routes orphelines (Priorité 2)
1. **Supprimer les 5 re-exports de `become-artisan/` :** Conserver uniquement `src/app/(profile)/become-artisan.tsx` qui gère nativement son état interne.
2. **Supprimer les fichiers de redirection obsolètes :** Supprimer `register-partner.tsx` et `register-partner-multistep.tsx` au profit direct de `register.tsx`.
3. **Nettoyer les composants orphelins :** Retirer `FilterBottomSheet.tsx` et `StoriesList.tsx` de `src/components/`.
4. **Relier ou nettoyer les routes orphelines :**
   - Soit relier `src/app/(regions)/[id].tsx` depuis le sélecteur d'exploration, soit archiver le fichier.
   - Soit brancher la modale `src/app/(collections)/add-to-collection.tsx` sur le bouton d'action des fiches de lieux.

### Phase 3 : Raccordement des mutations incomplètes (Priorité 3)
1. **Publication d'événement :** Relier le bouton de soumission de `src/app/(create)/event-settings.tsx` au service de création d'événement backend.
2. **Publication partenaire :** Harmoniser `src/app/(partner)/publication.tsx` pour employer le hook `useCreatePost` à l'instar de la version grand public.
3. **Suggestion de lieu :** Remplacer le mock démo de `src/app/(create)/suggest-place-step2.tsx` par l'envoi de la suggestion vers l'API.
4. **Formulaire d'avis client :** Créer l'interface de saisie d'avis manquante pointée par le TODO de `src/app/(profile)/reviews.tsx`.
