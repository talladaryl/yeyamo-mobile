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
  login: (credentials: LoginCredentials) =>
    apiPost<AuthResponse>('/auth/login', {
      identifier: credentials.email.trim(),
      password: credentials.password,
    }),

  register: (credentials: RegisterCredentials) =>
    apiPost<AuthResponse>('/auth/register', {
      email: credentials.email.trim() || null,
      phone: credentials.phone || null,
      password: credentials.password,
      displayName: credentials.display_name,
    }),

  logout: () => apiPost<void>('/auth/logout'),

  me: () => apiGet<AuthApiUser>('/auth/me'),

  refresh: (refreshToken: string) =>
    apiPost<AuthResponse>('/auth/refresh', { refreshToken }),

  requestEmailVerification: (email: string) =>
    apiPost<{ message: string }>('/auth/email/verification/request', { email }),

  confirmEmailVerification: (credentials: VerifyCodeCredentials) =>
    apiPost<{ message: string }>('/auth/email/verification/confirm', {
      email: credentials.email,
      otp: credentials.code,
    }),

  forgotPassword: (email: string) =>
    apiPost<{ message: string }>('/auth/password/forgot', { email }),

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
