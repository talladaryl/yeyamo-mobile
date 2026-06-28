import { useState } from 'react';
import { useAuthStore } from './auth.store';
import { authService } from './auth.service';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  PartnerRegisterCredentials,
  VerifyCodeCredentials,
  ForgotPasswordCredentials,
  SocialLoginCredentials
} from './types';

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
      // TODO: Implement code verification API call
      console.log('Verify code:', credentials);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Code verification failed. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function forgotPassword(credentials: ForgotPasswordCredentials) {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement forgot password API call
      console.log('Forgot password:', credentials);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
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
      // TODO: Implement social login API call
      console.log('Social login:', credentials);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
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
    register, 
    registerPartner,
    verifyCode,
    forgotPassword,
    socialLogin,
    logout 
  };
}
