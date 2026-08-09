import { apiGet, apiPost, apiPut } from '@/services/api/client';
import type {
  AuthApiUser,
  AuthResponse,
  LoginCredentials,
  PasswordResetCredentials,
  RegisterCredentials,
  SocialLoginCredentials,
  VerifyCodeCredentials,
} from './types';

export const authApi = {
  login: (credentials: LoginCredentials, turnstileToken?: string) =>
    apiPost<AuthResponse>('/auth/login', {
      identifier: credentials.email.trim(),
      password: credentials.password,
      turnstileToken,
    }),

  register: (credentials: RegisterCredentials, turnstileToken?: string) =>
    apiPost<AuthResponse>('/auth/register', {
      email: credentials.email.trim() || null,
      phone: credentials.phone || null,
      password: credentials.password,
      displayName: credentials.display_name,
      turnstileToken,
    }),

  logout: () => apiPost<void>('/auth/logout'),

  me: () => apiGet<AuthApiUser>('/auth/me'),

  refresh: (refreshToken: string) =>
    apiPost<AuthResponse>('/auth/refresh', { refreshToken }),

  requestEmailVerification: (email: string, turnstileToken: string) =>
    apiPost<{ message: string }>('/auth/email/verification/request', { email, turnstileToken }),

  confirmEmailVerification: (credentials: VerifyCodeCredentials) =>
    apiPost<{ message: string }>('/auth/email/verification/confirm', {
      email: credentials.email,
      otp: credentials.code,
    }),

  forgotPassword: (email: string, turnstileToken: string) =>
    apiPost<{ message: string }>('/auth/password/forgot', { email, turnstileToken }),

  resetPassword: (credentials: PasswordResetCredentials) =>
    apiPost<{ message: string }>('/auth/password/reset', {
      email: credentials.email,
      otp: credentials.code,
      newPassword: credentials.newPassword,
    }),

  socialLogin: (credentials: SocialLoginCredentials) =>
    apiPost<AuthResponse>(`/auth/oauth/${credentials.provider}`, {
      idToken: credentials.token,
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiPut<void>('/auth/password', { currentPassword, newPassword }),
};
