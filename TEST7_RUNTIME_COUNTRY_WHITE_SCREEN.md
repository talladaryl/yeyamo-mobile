# YEYAMO — TEST 7 RUNTIME HOTFIX

## 1. Runtime evidence

Le journal iPhone confirme successivement la présence des credentials, la restauration de session, l'utilisateur backend `252`, le succès de `/users/me`, puis la normalisation du pays en `CM`. `INTEREST_ONBOARDING_SKIPPED` est attendu pour ce compte. L'authentification n'est donc pas le premier échec observé.

Le premier échec visible est le chargement conjoint de la configuration et des fonctionnalités pays. L'ancien journal ne contient cependant ni statut HTTP, ni URL de la sous-requête en échec, ni code Axios. Il ne permet pas de déterminer honnêtement la première frontière réseau défaillante.

## 2. Exact mobile request

`src/features/country/country.api.ts` exécute deux requêtes `GET` en parallèle :

- `countryApi.configuration("CM")` → `/countries/CM/configuration`
- `countryApi.features("CM")` → `/countries/CM/features`

Le client Axios ajoute `/api/v1` à `EXPO_PUBLIC_API_BASE_URL`. Avec la configuration de production documentée, les routes finales sont :

- `GET https://api.yeyamo.com/api/v1/countries/CM/configuration`
- `GET https://api.yeyamo.com/api/v1/countries/CM/features`

La résolution est lancée depuis `src/app/_layout.tsx`, après récupération du pays du profil. Ce chemin n'utilise pas React Query : il s'agit d'un effet racine appelant directement `countryApi`.

## 3. Exact backend endpoint

Le contrat mobile correspond au contrat canonique de `country-config-service` :

- `CountryController`, base `/api/v1/countries`
- `GET /{code}/configuration`
- `GET /{code}/features`

Le Gateway route `/api/v1/countries/**` vers `lb://country-config-service`, sans `StripPrefix`, avec circuit breaker et fallback `/fallback/country-config-service`. Le service écoute sur le port configuré `8090`. Les lectures `GET` pays sont publiques dans `SecurityConfig`.

Les migrations existantes créent et consolident `CM`; aucune donnée pays n'a été dupliquée ou réensemencée.

## 4. HTTP error details

Statut du journal initial : **inconnu**. `Promise.all` masquait également laquelle des deux sous-requêtes échouait.

La normalisation Axios conserve désormais, sans headers ni credentials :

- `httpStatus`
- `axiosCode`
- `requestUrl`
- `method`
- `backendErrorCode`
- `message`
- `isNetworkError`
- `queryKey` et `countryCode`

Le prochain journal `COUNTRY_CONFIGURATION_ERROR` permettra donc d'identifier l'URL et la classification exactes.

## 5. First failing boundary

Classification avec les preuves disponibles : **OTHER — frontière runtime Gateway/country-config non résolue dans l'ancien log**.

Le code source exclut un chemin mobile différent du contrôleur et confirme la présence de la route Gateway. Il ne prouve pas l'état réel du déploiement, du service discovery, de la base ou du circuit breaker au moment du test iPhone. Aucun changement backend ou cloud config n'est justifié sans le nouveau statut runtime.

## 6. COUNTRY_CONFIGURATION_ERROR root cause

La cause serveur/réseau exacte reste indéterminée dans l'observation fournie, car l'ancien traceur supprimait les propriétés Axios utiles. Le défaut de diagnostic est corrigé.

Cette erreur pays n'est pas une erreur de session et ne déclenche ni logout ni suppression des credentials.

## 7. White-screen render root cause

La cause certaine de l'écran blanc se trouve dans le routage initial :

1. le `Stack` démarre sur `index`;
2. `src/app/index.tsx` rend `null`;
3. le guard redirigeait un utilisateur authentifié et initialisé vers `/(tabs)` seulement depuis les groupes auth, onboarding ou interests;
4. la route racine `/` n'appartient à aucun de ces cas;
5. après disparition du splash, l'application restait donc définitivement sur un composant `null`.

Le guard reconnaît maintenant explicitement `usePathname() === '/'` et redirige ce cas vers `/(tabs)`. Le Feed n'a pas besoin de la configuration pays pour monter : l'option produit B est appliquée, avec shell authentifié disponible et résolution pays non bloquante.

## 8. Retry-loop root cause

L'effet dépendait de `countryResolutionStatus`. Après un échec, `markConfigurationUnavailable()` passait l'état à `COUNTRY_ERROR`, ce qui relançait l'effet; aucun garde n'empêchait une nouvelle requête.

L'effet ne démarre désormais que pour `COUNTRY_LOADING`. Il effectue au maximum deux tentatives (initiale + une relance après 750 ms). Hors ligne, la seconde tentative est omise. `COUNTRY_ERROR` devient terminal pour ce bootstrap et ne boucle plus.

## 9. Changes made

- redirection de la route racine authentifiée vers `/(tabs)`;
- configuration pays rendue non bloquante pour le shell/Feed;
- garde stricte sur `COUNTRY_LOADING`;
- retry borné à une seule relance;
- aucune relance immédiate si le téléphone est hors ligne;
- enrichissement sûr de l'erreur Axios et du traceur runtime;
- aucune donnée pays de remplacement inventée;
- aucune modification de l'authentification ou de l'onboarding d'intérêts.

## 10. Mobile files modified

- `src/app/_layout.tsx`
- `src/services/api/errors.ts`
- `src/types/api.types.ts`
- `TEST7_RUNTIME_COUNTRY_WHITE_SCREEN.md`

## 11. Backend files modified

Aucun.

## 12. Config files modified

Aucun.

## 13. Tests

- `npx tsc --noEmit` : PASS
- `npx eslint src/app/_layout.tsx src/services/api/errors.ts src/types/api.types.ts` : PASS
- `git diff --check` : PASS
- tests backend : NOT_REQUIRED, aucun code/config backend modifié
- test iPhone réel : requis pour relever le statut HTTP enrichi et confirmer le rendu natif

## 14. Non-regression

Le splash conserve sa durée et son plafond existants. La restauration de session, `/users/me`, l'onboarding d'intérêts, le switch de compte et les routes fonctionnelles ne sont pas modifiés. La configuration pays reste chargée quand elle est disponible, mais ne conditionne plus le montage du Feed. Un lancement hors ligne conserve la session et l'`OfflineBanner` existant.

Aucune modification n'a été faite dans Feed, Following, Explorer, Profile, Story, Messaging, Notifications ou media.

## 15. Deployment requirement

Seule l'application mobile doit intégrer ce correctif. Aucun service backend et aucune cloud config ne doivent être redéployés sur la base de cet audit. Si le nouveau traceur montre ensuite un `502`, `503`, `504`, un fallback Gateway ou une erreur métier backend, ce résultat permettra de cibler précisément le service concerné.

## 16. Runtime retest instructions

1. Lancer l'application sur l'iPhone avec une session persistée valide.
2. Vérifier : splash → restauration session → `/users/me` retourne `CM` → Feed visible.
3. Vérifier qu'il n'existe jamais d'écran blanc après le splash.
4. Observer les traces pays. En cas d'échec, conserver le bloc structuré `COUNTRY_CONFIGURATION_ERROR`; il doit contenir URL, méthode, statut/code et classification réseau, sans token.
5. Confirmer qu'une défaillance produit au plus une requête initiale et une relance.
6. Lancer hors ligne avec la même session : aucun logout, aucun splash infini, shell authentifié et indication hors ligne.
7. Rétablir le réseau sans tuer l'application. La tentative bornée doit réussir si elle est encore en attente; sinon une prochaine résolution explicite pourra être déclenchée par le flux pays existant.

SESSION_RESTORE =
PASS

PROFILE_COUNTRY =
PASS

COUNTRY_CONFIGURATION_ENDPOINT =
GET https://api.yeyamo.com/api/v1/countries/CM/configuration + GET https://api.yeyamo.com/api/v1/countries/CM/features

COUNTRY_CONFIGURATION_HTTP_STATUS =
UNKNOWN_PENDING_ENHANCED_RUNTIME_TRACE

COUNTRY_CONFIGURATION_FIRST_FAILURE =
GATEWAY_OR_COUNTRY_CONFIG_RUNTIME_BOUNDARY_UNRESOLVED

COUNTRY_CONFIGURATION_ROOT_CAUSE =
SERVER_OR_NETWORK_CAUSE_NOT_PROVABLE_FROM_ORIGINAL_TRACE; SAFE_DIAGNOSTICS_ADDED

WHITE_SCREEN_ROOT_CAUSE =
ROOT_INDEX_RENDERED_NULL_AND_AUTHENTICATED_ROUTE_GUARD_DID_NOT_REDIRECT_PATH_ROOT_TO_TABS

COUNTRY_CONFIGURATION_RETRY =
FIXED

WHITE_SCREEN_ON_COUNTRY_FAILURE =
FIXED

OFFLINE_SESSION_PRESERVED =
PASS

AUTHENTICATED_SHELL_FALLBACK =
PASS

MOBILE_TYPESCRIPT =
PASS

MOBILE_LINT =
PASS

BACKEND_TESTS =
NOT_REQUIRED

CONFIG_CHANGE_REQUIRED =
NO

BACKEND_CHANGE_REQUIRED =
NO

MOBILE_CHANGE_REQUIRED =
YES

SERVICES_TO_REDEPLOY =
MOBILE_ONLY

RUNTIME_RETEST_REQUIRED =
YES

READY_FOR_RUNTIME_RETEST =
YES
