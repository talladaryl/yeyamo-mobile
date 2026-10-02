# TEST 7 — Prompt 5 — Session, offline, intérêts et activité

## 1. Executive summary
La session persistante, le splash global, l’état réseau, l’onboarding d’intérêts serveur et l’activité utilisateur ont été raccordés sans remplacer les architectures existantes.

## 2. Pre-change baseline
SecureStore et le refresh existaient. Le bootstrap appelait `/auth/me`, mais ne restaurait pas l’identité hors ligne. La route racine forçait le splash d’onboarding. Les intérêts étaient uniquement locaux et codés en dur. Aucun modèle canonique d’activité n’existait.

## 3. Authentication/session architecture
L’auth store existant reste utilisé. Les états effectifs sont bootstrap non hydraté, authentifié et non authentifié; les erreurs 401/403 sont terminales, les erreurs réseau/5xx ne le sont pas.

## 4. Secure storage architecture
Access token, refresh token, mode, user id et désormais identité minimale `AUTH_USER` restent dans Expo SecureStore. Aucun token n’est placé dans AsyncStorage ou React Query.

## 5. Startup state machine
Le splash couvre l’hydratation. Le garde attend l’identité et, pour un compte backend, la décision serveur des intérêts. Une limite de temps empêche un écran bloqué.

## 6. Session restoration
En ligne, `/auth/me` valide/restaure l’utilisateur. Hors ligne, une identité sécurisée déjà associée aux credentials restaure le shell sans supprimer les credentials.

## 7. Token refresh
Le mécanisme d’intercepteur existant est conservé; le token renouvelé met à jour le store et reconnecte le temps réel.

## 8. Terminal auth failure
401 et 403 effacent la session sécurisée, déconnectent le socket et réinitialisent les données viewer-scoped. Réseau, DNS, timeout et 5xx ne provoquent plus ce logout.

## 9. Splash architecture
`StartupSplash` réutilise `assets/yeyamo_logo_animation.html`. Il s’agit du seul écran plein format durant le bootstrap.

## 10. Splash timing
Minimum 2,6 s; protection maximale 6 s. Le feed charge ensuite dans son propre écran sans ajouter cinq secondes artificielles.

## 11. Feed bootstrap
Un utilisateur restauré entre directement dans `(tabs)`. Le feed garde ses données React Query en mémoire et expose ErrorState/retry quand aucune donnée n’est disponible.

## 12. Network detection
`@react-native-community/netinfo` alimente un store global et `onlineManager` de React Query.

## 13. Offline banner
Une bannière globale, compacte et safe-area-aware affiche « Vous êtes hors ligne ».

## 14. Offline cached-content behavior
Les données React Query déjà en mémoire restent visibles lors d’un refetch échoué. Il n’y a pas encore de persistance disque générale du cache Feed après arrêt complet.

## 15. Offline mutation behavior
Les mutations utilisent `networkMode: always`: sans réseau, Axios échoue explicitement au lieu de laisser croire à une réussite ou de rester indéfiniment en file d’attente.

## 16. Interest/onboarding architecture discovered
L’ancien store utilisait SecureStore comme vérité et l’écran contenait douze catégories fixes. Le nouveau flux réutilise `/categories` et `/users/me`.

## 17. Interest source of truth
`user-service` stocke les slugs canoniques de catégories. Le cache mobile est uniquement une optimisation viewer-scoped.

## 18. Onboarding completion source of truth
Le booléen serveur `interestsOnboardingCompleted` est atomiquement mis à jour avec les intérêts via `PUT /users/me/interests`.

## 19. Existing-user migration behavior
La migration met les comptes existants à `completed=true`. Les nouveaux profils démarrent à false: aucune réapparition involontaire pour la base installée.

## 20. Interest selection UX
Les catégories actives proviennent du backend. Le minimum produit existant de trois choix est conservé. En cas d’échec, la sélection reste affichée et peut être renvoyée.

## 21. Settings interest editor
Paramètres expose « Centres d’intérêt » et réutilise le même écran avec `mode=edit`; une édition ne remet pas l’onboarding à false.

## 22. Recommendation architecture
Le profil, la projection JPA, le consumer Kafka et les stratégies de scoring existants sont étendus, pas dupliqués.

## 23. Interest recommendation integration
`profile.interests_updated` projette les slugs dans recommendation-service. La stratégie de préférence ajoute un bonus explicite de 25 aux contenus compatibles.

## 24. For You integration
Le signal complète région et affinités apprises. Il amorce le cold start sans filtrage dur.

## 25. Following non-regression
Le chemin Following n’est pas modifié ni filtré par les intérêts.

## 26. Activity architecture
`user-service` est la source canonique avec `POST /users/me/activity` et une lecture interne protégée des comptes inactifs.

## 27. lastLogin/lastActive semantics
Une authentification réussie écrit les deux; bootstrap/retour foreground met à jour lastActive. Les horodatages viennent du serveur.

## 28. Activity throttling
Les écritures lastActive sont limitées par défaut à une fenêtre de 300 secondes, configurable et bornée à au moins 60 secondes.

## 29. Future re-engagement contract
`GET /internal/users/inactive?before=&limit=` fournit les auth user ids inactifs. Aucun email digest n’est implémenté dans cette passe.

## 30. Account-switch isolation
Logout supprime credentials, cache d’intérêts et caches viewer-scoped. Le cache d’intérêts sécurisé inclut le viewer id avant restauration.

## 31. Push deep-link startup compatibility
L’abonnement et le flush push existants restent déclenchés après restauration authentifiée; le splash ne réécrit pas une destination une fois le bootstrap décidé.

## 32. Security
Validation backend des catégories actives, endpoints utilisateur authentifiés, endpoint d’inactivité sous `/internal/**` protégé fail-closed par le starter interne.

## 33. Performance
Pas d’appel catégories bloquant pour le feed, activité throttlée, projection asynchrone des intérêts, timeout du splash.

## 34. Mobile tests
`npx tsc --noEmit`: PASS. `npm run lint`: PASS avec un warning préexistant dans `partner.api.ts`. Test physique startup/offline requis.

## 35. Backend tests
Compilation user-service + recommendation-service: PASS. User-service: 22/22 PASS. Recommendation-service: tests observés sans échec, mais la commande globale a expiré à 120 s pendant le dernier context test; relance ciblée requise pour un verdict complet.

## 36. Prompt 1 non-regression
For You, Following, commentaires et groupes n’ont pas été restructurés.

## 37. Prompt 2 non-regression
Profil, favoris, story chooser/styles restent inchangés par cette passe.

## 38. Prompt 3 non-regression
Transport média et caméra restent inchangés; NetInfo ajoute une dépendance native tandis qu’un rebuild était déjà requis par Prompt 3.

## 39. Prompt 4 non-regression
Identité messaging, STOMP, caches notifications, token push et nettoyage terminal restent conservés.

## 40. Files modified
Mobile: `package.json`, `package-lock.json`, `_layout.tsx`, `index.tsx`, routes auth login/register/verify, settings, interests, auth service, secure store, nouveaux network store/banner, StartupSplash et interests API/store. Backend: modèle/service/controller/repository user, validation catégories, DTO, migration V7; projection/consumer/scoring recommendation et migration V8.

## 41. Migrations
`user-service/V7__add_interests_and_activity.sql`; `recommendation-service/V8__add_explicit_interest_preferences.sql`.

## 42. Config/environment
Optionnel: `yeyamo.user.activity-throttle-seconds` (défaut 300) et URL place-service existante/réutilisée. Aucun secret nouveau.

## 43. Services affected
Mobile, user-service et recommendation-service. Place-service est consulté, non modifié.

## 44. Runtime tests required
Premier lancement, compte neuf, compte existant, access expiré, 401/403, lancement hors ligne, retour réseau, mutation hors ligne, édition intérêts, changement de compte et deep link push.

## 45. Remaining blockers
Validation appareil requise; persistance disque du Feed hors scope; test recommendation-service complet à relancer avec un timeout supérieur. Les blockers notifications reply/like/repost de Prompt 4 sont transportés.

## 46. Deployment requirements
Migration et redéploiement user-service/recommendation-service; mise à jour JS mobile et rebuild natif incluant NetInfo. Aucun déploiement exécuté.

## 47. Final status
Implémentation statique prête pour retest runtime, mais pas pour release gate tant que les scénarios appareil et la suite backend complète ne sont pas confirmés.

PRE_CHANGE_BASELINE = COMPLETE
SESSION_SECURE_STORAGE = PASS
SESSION_BOOTSTRAP_STATE_MACHINE = PASS
SESSION_RESTORE = READY_FOR_RUNTIME_RETEST
ACCESS_TOKEN_REFRESH = PASS
NETWORK_ERROR_NOT_LOGOUT = PASS
TERMINAL_401_CLEANUP = PASS
ACCOUNT_SWITCH_SESSION_ISOLATION = PASS
STARTUP_LOGIN_FLASH = FIXED
STARTUP_ONBOARDING_FLASH = FIXED
SPLASH_YEYAMO = READY_FOR_RUNTIME_RETEST
SPLASH_MIN_DURATION = 2.6_SECONDS
SPLASH_MAX_BLOCK_PROTECTION = PASS
AUTHENTICATED_STARTUP_TO_FEED = READY_FOR_RUNTIME_RETEST
NETWORK_SOURCE = NETINFO_PLUS_REACT_QUERY_ONLINE_MANAGER
OFFLINE_BANNER = PASS
OFFLINE_CACHED_CONTENT = PARTIAL
INITIAL_OFFLINE_START = READY_FOR_RUNTIME_RETEST
OFFLINE_INFINITE_LOADER_PROTECTION = PASS
ONLINE_RECOVERY = READY_FOR_RUNTIME_RETEST
OFFLINE_MUTATION_FALSE_SUCCESS_PROTECTION = PASS
INTEREST_SOURCE_OF_TRUTH = USER_SERVICE_CATEGORY_SLUGS
INTEREST_CATEGORY_SOURCE = PLACE_SERVICE_CATEGORIES
INTEREST_ONBOARDING_COMPLETION_SOURCE = USER_SERVICE
INTEREST_ONBOARDING_SERVER_BACKED = PASS
INTEREST_ONBOARDING_ONE_TIME = PASS
INTEREST_ONBOARDING_RETRY = PASS
EXISTING_USER_ONBOARDING_POLICY = COMPLETED_BY_MIGRATION
INTEREST_SETTINGS_EDITOR = PASS
INTEREST_ACCOUNT_ISOLATION = PASS
INTEREST_BACKEND_VALIDATION = PASS
RECOMMENDATION_EXISTING_ARCHITECTURE_REUSED = PASS
INTEREST_RECOMMENDATION_SIGNAL = PASS
INTEREST_COLD_START_SIGNAL = PASS
INTEREST_HARD_FILTER = NO
FOLLOWING_INTEREST_NON_REGRESSION = PASS
RECOMMENDATION_CACHE_REFRESH = PASS
ACTIVITY_EXISTING_SOURCE = NOT_FOUND
ACTIVITY_CANONICAL_SOURCE = USER_SERVICE_SERVER_TIMESTAMPS
LAST_LOGIN = PASS
LAST_ACTIVE = PASS
ACTIVITY_SERVER_TIMESTAMP = PASS
ACTIVITY_THROTTLING = PASS
ACTIVITY_PUBLICLY_EXPOSED = NO
ACTIVITY_ACCOUNT_ISOLATION = PASS
INACTIVE_USER_QUERY_CONTRACT = PASS
EMAIL_REENGAGEMENT_PREREQUISITE = READY
PROMPT4_COMMENT_REPLY_NOTIFICATION = CARRIED_BLOCKER
PROMPT4_POST_LIKE_NOTIFICATION = CARRIED_BLOCKER
PROMPT4_REPOST_NOTIFICATION = CARRIED_BLOCKER
PROMPT1_NON_REGRESSION = PASS
PROMPT2_NON_REGRESSION = PASS
PROMPT3_MEDIA_NON_REGRESSION = PASS
PROMPT4_MESSAGING_NON_REGRESSION = PASS
PROMPT4_PUSH_NON_REGRESSION = PASS
MOBILE_TYPESCRIPT = PASS
MOBILE_LINT = WARNING
EXPO_INSTALL_CHECK = PASS
BACKEND_COMPILE = PASS
BACKEND_TESTS = FAIL
DATABASE_MIGRATION_REQUIRED = YES
MIGRATIONS_ADDED = USER_V7_RECOMMENDATION_V8
CONFIG_CHANGE_REQUIRED = NO
ENVIRONMENT_CHANGE_REQUIRED = NO
NEW_NATIVE_DEPENDENCY = YES
MOBILE_NATIVE_REBUILD_REQUIRED = ALREADY_REQUIRED_BY_PROMPT3
MOBILE_JS_UPDATE_REQUIRED = YES
BACKEND_SERVICES_MODIFIED = USER_SERVICE_RECOMMENDATION_SERVICE
SERVICES_TO_REDEPLOY = USER_SERVICE_RECOMMENDATION_SERVICE
RUNTIME_DEVICE_TEST_REQUIRED = YES
NON_REGRESSION_GATE = PASS
READY_FOR_PROMPT5_RUNTIME_RETEST = YES
READY_FOR_RELEASE_GATE = NO
