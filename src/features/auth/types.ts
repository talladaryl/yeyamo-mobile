export interface AuthUser {
  id: number;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  city: string;
  is_verified: boolean;
  user_type: 'user' | 'partner';
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  display_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  city?: string;
  phone?: string;
  countryCode: string;
  cityId?: string;
  preferredLanguageCode?: string;
  timezone?: string;
}

export interface VerifyCodeCredentials {
  code: string;
  email?: string;
  phone?: string;
}

export interface ForgotPasswordCredentials {
  email: string;
}

export interface SocialLoginCredentials {
  provider: 'google' | 'apple';
  token: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthApiUser;
}

export interface AuthApiUser {
  id: number;
  email: string | null;
  phone: string | null;
  status: string;
  roles: string[];
  createdAt: string;
  emailVerifiedAt: string | null;
}

export interface PasswordResetCredentials {
  email: string;
  code: string;
  newPassword: string;
}
