import { useState } from 'react';
import { useAuthStore } from './auth.store';
import { authService } from './auth.service';
import type { LoginCredentials, RegisterCredentials } from './types';

export function useAuth() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(credentials: LoginCredentials) {
    setIsLoading(true);
    setError(null);
    try {
      await authService.login(credentials);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(credentials: RegisterCredentials) {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(credentials);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    await authService.logout();
  }

  return { user, isAuthenticated, isHydrated, isLoading, error, login, register, logout };
}
