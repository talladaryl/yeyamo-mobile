// Types pour les paramètres utilisateur

export interface UserSettings {
  profile: ProfileSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
  preferences: PreferencesSettings;
}

export interface ProfileSettings {
  avatar_url: string | null;
  display_name: string;
  username: string;
  bio: string | null;
  city: string | null;
  region: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  interests: string[];
}

export interface PrivacySettings {
  // Visibilité du compte
  account_visibility: 'public' | 'private' | 'friends_only';
  show_online_status: boolean;
  
  // Interactions
  who_can_message: 'everyone' | 'friends' | 'no_one';
  who_can_see_posts: 'everyone' | 'friends' | 'no_one';
  who_can_tag_me: 'everyone' | 'friends' | 'no_one';
  
  // Localisation
  show_location_in_posts: boolean;
  show_city_in_profile: boolean;
  
  // Découverte
  show_in_search: boolean;
  show_in_suggestions: boolean;
}

export interface SecuritySettings {
  // Authentification
  password_last_changed: string;
  email: string;
  email_verified: boolean;
  phone: string | null;
  phone_verified: boolean;
  
  // 2FA
  two_factor_enabled: boolean;
  
  // Sessions actives
  active_sessions: ActiveSession[];
}

export interface ActiveSession {
  id: string;
  device_name: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
  location: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
}

export interface PreferencesSettings {
  // Langue
  language: 'fr' | 'en';
  
  // Thème
  theme: 'light' | 'dark' | 'system';
  
  // Contenu
  content_categories: string[];
  show_sensitive_content: boolean;
  
  // Accessibilité
  reduce_motion: boolean;
  large_text: boolean;
  high_contrast: boolean;
  
  // Découverte
  discovery_radius_km: number; // 1-100km
  
  // Notifications
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

export interface InterestTag {
  id: string;
  label: string;
}

export const AVAILABLE_INTERESTS: InterestTag[] = [
  { id: 'restaurants', label: 'Restaurants' },
  { id: 'bars', label: 'Bars & Lounges' },
  { id: 'nightlife', label: 'Nightlife' },
  { id: 'events', label: 'Événements' },
  { id: 'music', label: 'Musique' },
  { id: 'sports', label: 'Sports' },
  { id: 'culture', label: 'Culture' },
  { id: 'nature', label: 'Nature' },
  { id: 'adventure', label: 'Aventure' },
  { id: 'wellness', label: 'Bien-être' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'food', label: 'Gastronomie' },
];

export const AVAILABLE_CONTENT_CATEGORIES = [
  'Restaurants & Bars',
  'Événements',
  'Expériences',
  'Culture',
  'Sport',
  'Nature',
  'Nightlife',
  'Shopping',
];

export const REGIONS = [
  'Centre',
  'Littoral',
  'Ouest',
  'Nord',
  'Sud',
  'Est',
  'Adamaoua',
  'Nord-Ouest',
  'Sud-Ouest',
  'Extrême-Nord',
];
