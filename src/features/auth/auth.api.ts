import { apiPost } from '@/services/api/client';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from './types';

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiPost<AuthResponse>('/auth/login', credentials),

  register: (credentials: RegisterCredentials) =>
    apiPost<AuthResponse>('/auth/register', credentials),

  logout: () => apiPost<void>('/auth/logout'),

  me: () => apiPost<{ data: AuthResponse['user'] }>('/auth/me'),
};
