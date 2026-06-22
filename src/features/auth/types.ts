export interface AuthUser {
  id: number;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  city: string;
  is_verified: boolean;
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
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
