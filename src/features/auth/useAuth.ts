import { useState } from 'react';
import { isAxiosError } from 'axios';
import { useAuthStore } from './auth.store';
import { authService } from './auth.service';
import { authApi } from './auth.api';
import { secureStore } from '@/services/storage/secure-store';
import { reverbClient } from '@/services/socket/reverb.client';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  PartnerRegisterCredentials,
  VerifyCodeCredentials,
  ForgotPasswordCredentials,
  SocialLoginCredentials
} from './types';

function authErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.code === 'ECONNABORTED') return 'Le serveur met trop de temps à répondre.';
    if (!error.response) return 'Impossible de joindre le serveur.';
  }
  return error instanceof Error ? error.message : fallback;
}

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
      setError(authErrorMessage(err, 'Connexion impossible. Réessayez.'));
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
      setError(authErrorMessage(err, 'Inscription impossible. Réessayez.'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function loginDemo(kind: 'user' | 'partner') {
    setIsLoading(true);
    setError(null);
    try {
      await authService.loginDemo(kind);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Impossible de lancer le mode démo.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function registerPartner(credentials: PartnerRegisterCredentials) {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement partner registration API call
      console.log('Partner registration:', credentials);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Partner registration failed. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyCode(credentials: VerifyCodeCredentials) {
    setIsLoading(true);
    setError(null);
    try {
      const email = credentials.email ?? useAuthStore.getState().user?.email;
      if (!email) throw new Error("L'adresse email est requise pour vérifier le code.");
      await authApi.confirmEmailVerification({ ...credentials, email });
    } catch (err: unknown) {
      setError(authErrorMessage(err, 'Vérification impossible. Réessayez.'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function forgotPassword(credentials: ForgotPasswordCredentials) {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(credentials.email);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to send reset code. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function socialLogin(credentials: SocialLoginCredentials) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.socialLogin(credentials);
      await Promise.all([
        secureStore.set(secureStore.KEYS.AUTH_TOKEN, response.accessToken),
        secureStore.set(secureStore.KEYS.REFRESH_TOKEN, response.refreshToken),
        secureStore.set(secureStore.KEYS.USER_ID, String(response.user.id)),
      ]);
      const identifier = response.user.email ?? response.user.phone ?? `user-${response.user.id}`;
      useAuthStore.getState().setAuth({
        id: response.user.id,
        username: identifier.split('@')[0],
        display_name: identifier.split('@')[0],
        email: response.user.email ?? '',
        avatar_url: null,
        city: '',
        is_verified: Boolean(response.user.emailVerifiedAt),
        user_type: response.user.roles.includes('PARTNER') ? 'partner' : 'user',
        created_at: response.user.createdAt,
      }, response.accessToken, 'backend');
      await secureStore.set(secureStore.KEYS.SESSION_MODE, 'backend');
      reverbClient.connect(response.accessToken);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Social login failed. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    await authService.logout();
  }

  return { 
    user, 
    isAuthenticated, 
    isHydrated, 
    isLoading, 
    error, 
    login, 
    loginDemo,
    register, 
    registerPartner,
    verifyCode,
    forgotPassword,
    socialLogin,
    logout 
  };
}
