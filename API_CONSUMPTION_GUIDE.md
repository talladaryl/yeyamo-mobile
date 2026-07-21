# Guide de consommation des APIs - Yeyamo Mobile

## Architecture

L'application mobile utilise une architecture en couches pour consommer les APIs backend :

```
Client API (axios) → Feature API → Feature Service → React Hook → Component
```

## Configuration de base

### 1. Variables d'environnement (`src/config/env.ts`)

```typescript
const ENV = {
  API_BASE_URL: 'https://api.yeyamo.com', // ou http://localhost:8080 en dev
  USE_MOCKS: false, // activer/désactiver les mocks
  APP_ENV: 'development', // development | staging | production
};
```

### 2. Client API (`src/services/api/client.ts`)

Le client axios centralisé gère :
- ✅ Authentification automatique (injection du token Bearer)
- ✅ Timeout par défaut (15s)
- ✅ Gestion des erreurs 401 (déconnexion automatique)
- ✅ Headers standards

```typescript
import { apiGet, apiPost, apiPatch, apiDelete } from '@/services/api/client';

// Méthodes disponibles
apiGet<T>(url, config?)      // GET request
apiPost<T>(url, body, config?)   // POST request
apiPatch<T>(url, body, config?)  // PATCH request
apiDelete<T>(url, config?)   // DELETE request
```

## Pattern de consommation API

### Étape 1 : Définir les types (`feature/types.ts`)

```typescript
// Exemple: src/features/places/types.ts
export interface Place {
  id: number;
  name: string;
  description: string;
  category: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  photos: string[];
}

export interface PlacesQuery {
  city?: string;
  search?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  page?: number;
}
```

### Étape 2 : Créer l'API layer (`feature/feature.api.ts`)

```typescript
// Exemple: src/features/places/places.api.ts
import { apiGet, apiPost, apiDelete } from '@/services/api/client';
import type { PaginatedResponse } from '@/types/api.types';
import type { Place, PlacesQuery } from './types';

export const placesApi = {
  // GET /places avec query params
  getPlaces: (query: PlacesQuery) => {
    const params = new URLSearchParams();
    if (query.city) params.set('city', query.city);
    if (query.search) params.set('search', query.search);
    if (query.lat) params.set('lat', String(query.lat));
    if (query.lng) params.set('lng', String(query.lng));
    
    return apiGet<PaginatedResponse<Place>>(`/places?${params.toString()}`);
  },

  // GET /places/:id
  getPlace: (placeId: number) =>
    apiGet<{ data: Place }>(`/places/${placeId}`),

  // POST /places/:id/favorite
  favoritePlace: (placeId: number) =>
    apiPost<void>(`/places/${placeId}/favorite`),

  // DELETE /places/:id/favorite
  unfavoritePlace: (placeId: number) =>
    apiDelete<void>(`/places/${placeId}/favorite`),
};
```

### Étape 3 : Créer un Hook React (`feature/useFeature.ts`)

```typescript
// Exemple: src/features/places/usePlaces.ts
import { useState, useEffect } from 'react';
import { placesApi } from './places.api';
import type { Place, PlacesQuery } from './types';

export function usePlaces(query: PlacesQuery) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPlaces() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await placesApi.getPlaces(query);
      setPlaces(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load places');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPlaces();
  }, [query.city, query.search]);

  return { places, isLoading, error, reload: loadPlaces };
}
```

### Étape 4 : Utiliser dans un composant

```typescript
// Exemple: src/app/(places)/places.tsx
import { usePlaces } from '@/features/places/usePlaces';

export default function PlacesScreen() {
  const { places, isLoading, error } = usePlaces({ city: 'Abidjan' });

  if (isLoading) return <Text>Chargement...</Text>;
  if (error) return <Text>Erreur: {error}</Text>;

  return (
    <FlatList
      data={places}
      renderItem={({ item }) => <PlaceCard place={item} />}
    />
  );
}
```

## Exemples par fonctionnalité

### 🔐 Authentification

```typescript
// src/features/auth/auth.api.ts
export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiPost<AuthResponse>('/auth/login', credentials),

  register: (credentials: RegisterCredentials) =>
    apiPost<AuthResponse>('/auth/register', credentials),

  logout: () => apiPost<void>('/auth/logout'),

  me: () => apiGet<{ data: User }>('/auth/me'),
};

// Utilisation
const { login, isLoading } = useAuth();
await login({ email: 'user@example.com', password: 'secret' });
```

### 📰 Feed

```typescript
// src/features/feed/feed.api.ts
export const feedApi = {
  getFeed: (cursor?: string, interests: string[] = []) => {
    const params = [];
    if (cursor) params.push(`cursor=${cursor}`);
    if (interests.length) params.push(`interests=${interests.join(',')}`);
    
    return apiGet<PaginatedResponse<FeedPost>>(
      `/feed${params.length ? `?${params.join('&')}` : ''}`
    );
  },

  likePost: (postId: number) =>
    apiPost<void>(`/posts/${postId}/like`),

  unlikePost: (postId: number) =>
    apiDelete<void>(`/posts/${postId}/like`),
};
```

### 👤 Profil utilisateur

```typescript
// src/features/profile/profile.api.ts
export const profileApi = {
  getUserPublications: () =>
    apiGet<{ data: UserPublication[] }>('/profile/publications'),

  getUserFavorites: () =>
    apiGet<{ data: FavoritePlace[] }>('/profile/favorites'),

  updateProfile: (data: ProfileUpdateData) =>
    apiPatch<{ data: User }>('/profile', data),

  uploadAvatar: (file: FormData) =>
    apiPost<{ avatar_url: string }>('/profile/avatar', file, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};
```

### 🔍 Recherche

```typescript
// src/features/search/search.api.ts
export const searchApi = {
  searchAll: (query: string) =>
    apiGet<SearchResults>(`/search?q=${encodeURIComponent(query)}`),

  searchPlaces: (query: string, filters: PlaceFilters) => {
    const params = new URLSearchParams({ q: query });
    if (filters.category) params.set('category', filters.category);
    if (filters.city) params.set('city', filters.city);
    
    return apiGet<PaginatedResponse<Place>>(`/search/places?${params}`);
  },
};
```

## Gestion des erreurs

### Pattern recommandé

```typescript
export function useApiCall<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function execute(apiCall: () => Promise<T>) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  return { data, isLoading, error, execute };
}
```

### Gestion des erreurs axios

```typescript
import { AxiosError } from 'axios';

try {
  await placesApi.getPlaces(query);
} catch (error) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 404) {
      console.error('Place non trouvée');
    } else if (error.response?.status === 422) {
      console.error('Données invalides:', error.response.data.errors);
    } else if (error.code === 'ECONNABORTED') {
      console.error('Timeout - requête trop longue');
    }
  }
}
```

## Upload de fichiers

```typescript
// Upload d'une image
export const mediaApi = {
  uploadImage: async (uri: string) => {
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    return apiPost<{ url: string }>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
```

## Pagination

```typescript
// Hook de pagination
export function usePaginatedApi<T>(
  apiCall: (page: number) => Promise<PaginatedResponse<T>>
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  async function loadMore() {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await apiCall(page);
      setData(prev => [...prev, ...response.data]);
      setHasMore(response.meta.current_page < response.meta.last_page);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return { data, loadMore, isLoading, hasMore };
}

// Utilisation
const { data, loadMore, hasMore } = usePaginatedApi((page) =>
  placesApi.getPlaces({ city: 'Abidjan', page })
);
```

## WebSocket / Real-time

```typescript
// src/services/socket/reverb.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export const echo = new Echo({
  broadcaster: 'reverb',
  key: process.env.EXPO_PUBLIC_REVERB_APP_KEY,
  wsHost: process.env.EXPO_PUBLIC_REVERB_HOST,
  wsPort: 443,
  wssPort: 443,
  forceTLS: true,
  enabledTransports: ['ws', 'wss'],
});

// Écouter un channel
echo.channel('notifications')
  .listen('NewNotification', (e) => {
    console.log('New notification:', e);
  });
```

## Tips & Best Practices

### ✅ À faire
- Toujours typer les requêtes et réponses
- Gérer les états loading/error dans les hooks
- Utiliser URLSearchParams pour les query params
- Centraliser les appels API dans les fichiers `.api.ts`
- Ajouter des timeouts appropriés
- Valider les données avant l'envoi

### ❌ À éviter
- Appeler directement axios dans les composants
- Ignorer la gestion d'erreurs
- Concatener manuellement les URLs
- Stocker des données sensibles en clair
- Faire des appels API redondants

## Configuration backend locale

Pour tester avec le backend local:

```typescript
// src/config/env.ts
const ENV = {
  API_BASE_URL: 'http://localhost:8080', // ou l'IP de votre machine
  USE_MOCKS: false,
};
```

Puis démarrer le backend avec Docker:
```bash
cd yeyamo-api
docker-compose up -d
```

## Debugging

```typescript
// Activer les logs axios (développement uniquement)
import axios from 'axios';

if (__DEV__) {
  axios.interceptors.request.use(request => {
    console.log('Starting Request:', request.url);
    return request;
  });

  axios.interceptors.response.use(response => {
    console.log('Response:', response.data);
    return response;
  });
}
```
