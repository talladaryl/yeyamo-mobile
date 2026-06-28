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
  city: string;
  phone?: string;
}

export interface PartnerRegisterCredentials {
  company_name: string;
  category: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  accept_terms: boolean;
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
  token: string;
  user: AuthUser;
}
