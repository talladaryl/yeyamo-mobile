# Rapport — Phase 9 mobile

## Partie A — Turnstile

### Audit

- `src/app/(auth)/login.tsx` soumettait d'abord l'authentification sans jeton, puis n'ouvrait l'ancien challenge que sur `TURNSTILE_REQUIRED`.
- `src/app/(auth)/register.tsx` obtenait un jeton au clic via `useTurnstileChallenge`.
- `react-native-webview` était déjà présent (`13.16.1`). L'ancien composant `TurnstileChallenge` chargeait une page Yeyamo distante : il ne chargeait pas le script officiel Cloudflare lui-même.
- Le client Axios ajoute déjà `/api/v1` dans `src/services/api/client.ts`; les payloads de connexion et d'inscription utilisent bien le champ backend `turnstileToken`.

### Implémentation

- Ajout de `src/components/security/TurnstileWidget.tsx`. Il charge le script officiel `https://challenges.cloudflare.com/turnstile/v0/api.js` dans une WebView, transmet le token natif via `postMessage`, et gère validation, expiration et erreur.
- Les formulaires `login.tsx` et `register.tsx` stockent le token reçu. Leur bouton réel est désactivé tant que ce token est absent. Les boutons de comptes démo n'ont pas été modifiés.
- En cas de `TURNSTILE_REQUIRED` ou `TURNSTILE_VERIFICATION_FAILED`, le token est retiré, le widget est remonté et l'utilisateur est invité à refaire la vérification.
- `auth.api.ts`, `auth.service.ts` et `useAuth.ts` rendent le token obligatoire pour les parcours normaux de connexion et d'inscription.
- `.env.example` documente `EXPO_PUBLIC_TURNSTILE_SITE_KEY`; aucune site key n'est codée dans le code.

Validation exécutée après cette partie :

```text
> npx tsc --noEmit
Exit code: 0
```

## Partie B — Google Sign-In

### Contrat et audit

Le contrat backend est `POST /api/v1/auth/oauth/google` avec le corps `{ "idToken": "…" }`. Il ne consomme pas de code d'autorisation.

`expo-auth-session` et `expo-crypto` n'étaient pas dans les dépendances. Le client natif historique a été remplacé dans le flux applicatif par `expo-auth-session`.

### Implémentation

- Ajout de `expo-auth-session@~57.0.11`, `expo-crypto@~57.0.2` et `expo-web-browser@~57.0.2`, installés par `expo install` pour Expo SDK 57. `expo-web-browser` finalise le retour OAuth Web.
- Ajout de `src/features/auth/useGoogleIdToken.ts` qui utilise `Google.useIdTokenAuthRequest`, avec les IDs client Web, iOS et Android lus depuis `ENV`; il récupère `response.params.id_token`.
- `authApi.oauthGoogle(idToken)` appelle explicitement `/auth/oauth/google`. Les écrans connexion et inscription envoient ce token uniquement après le succès Google.
- `SocialButton` utilise désormais un marquage Google officiel local, rendu par SVG, et le libellé « Continuer avec Google ».
- `app.config.ts` déclare le plugin `expo-web-browser`; le plugin natif Google Sign-In, devenu inutile à ce flux, n'est plus déclaré.
- `.env.example` contient les trois IDs OAuth publics, sans valeur de secours ni secret.

Validation exécutée après cette partie :

```text
> npx tsc --noEmit
Exit code: 0
```

Le test OAuth de bout en bout est volontairement **non déclaré comme réalisé** : il exige une development/production build et des clients OAuth créés dans Google Cloud Console avec les URI et signatures de l'application.

## Partie C — Itinéraire réel

### Audit

- Le détail de lieu possède déjà le bouton de navigation qui ouvre `/(places)/route/[id]`; aucun second bouton n'a été créé.
- L'écran de route appelait le vieux `POST /maps/route`, puis dessinait une ligne directe depuis Yaoundé quand le service ou la localisation échouait. Ce fallback fictif a été supprimé.
- Le contrat backend utilisé est `GET /api/v1/places/directions` avec `originLat`, `originLng`, `destLat`, `destLng`, `mode`, et la réponse `distanceMeters`, `durationSeconds`, `geometry[{ latitude, longitude }]`.

### Implémentation

- `src/features/maps/maps.api.ts` expose `mapsApi.getDirections(origin, destination, mode)` et son type `DirectionsResult`.
- `src/app/(places)/route/[id].tsx` demande la localisation réelle avant tout appel, utilise le lieu affiché comme destination et dessine `geometry` au moyen de `NativePolyline`.
- Distance et durée proviennent exclusivement de la réponse backend.
- Sans position, l'écran invite à activer/réessayer la localisation; si le backend renvoie `ROUTING_UNAVAILABLE`, il affiche « Itinéraire temporairement indisponible. » et ne dessine pas de route inventée.

Validation exécutée après cette partie :

```text
> npx tsc --noEmit
Exit code: 0

> git diff --check
Exit code: 0
```

Test manuel à exécuter dès qu'un backend et une clé OpenRouteService valides sont disponibles : ouvrir un lieu géolocalisé, toucher le bouton de navigation, autoriser la localisation, puis vérifier l'affichage de la polyline, de la distance et de la durée. Refuser l'autorisation et provoquer une réponse `ROUTING_UNAVAILABLE` doivent conserver l'écran stable avec le message adéquat.

## Fichiers modifiés ou ajoutés

- `src/components/security/TurnstileWidget.tsx` — nouveau pont WebView Cloudflare officiel.
- `src/app/(auth)/login.tsx`, `src/app/(auth)/register.tsx` — intégration Turnstile et OAuth Google.
- `src/features/auth/auth.api.ts`, `auth.service.ts`, `useAuth.ts`, `useGoogleIdToken.ts` — jeton Turnstile obligatoire et échange de l'ID token Google.
- `src/components/auth/SocialButton.tsx` — bouton Google conforme au flux et au logo officiel.
- `src/features/maps/maps.api.ts`, `src/app/(places)/route/[id].tsx` — client et affichage de l'itinéraire backend.
- `app.config.ts`, `.env.example`, `package.json`, `package-lock.json` — configuration Web OAuth et dépendances Expo SDK 57.

## Actions manuelles restantes

1. Définir `EXPO_PUBLIC_TURNSTILE_SITE_KEY` avec une site key Cloudflare autorisée pour les origines réellement utilisées par l'application.
2. Créer/configurer les clients Google OAuth Web, iOS et Android dans Google Cloud Console, puis renseigner les trois `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID`.
3. Créer une nouvelle development build après l'ajout de `expo-web-browser` et valider OAuth sur appareil réel.
4. Configurer une clé OpenRouteService valide côté backend avant le test réel de l'itinéraire.

PHASE 9 CLÔTURÉE — TURNSTILE, GOOGLE SIGN-IN ET ITINÉRAIRE INTÉGRÉS
