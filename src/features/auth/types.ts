export interface AuthUser {
  id: number;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  city: string;
  /** Authentication evidence; it is not a public certification badge. */
  email_verified: boolean;
  /** The auth contract currently does not expose a phone-verification state. */
  phone_verified: boolean | null;
  /** Public certification is deliberately separate from email verification. */
  is_certified: boolean;
  verification_status: string | null;
  badge_type: string | null;
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
