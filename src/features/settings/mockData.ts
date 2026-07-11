// Mock data pour les paramètres utilisateur
import type { UserSettings, ActiveSession } from './types';

export const MOCK_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: '1',
    device_name: 'iPhone 15 Pro',
    device_type: 'mobile',
    location: 'Douala, Cameroun',
    ip_address: '197.234.221.45',
    last_active: new Date().toISOString(),
    is_current: true,
  },
  {
    id: '2',
    device_name: 'MacBook Pro',
    device_type: 'desktop',
    location: 'Yaoundé, Cameroun',
    ip_address: '197.234.220.12',
    last_active: new Date(Date.now() - 3600000).toISOString(), // 1h ago
    is_current: false,
  },
  {
    id: '3',
    device_name: 'iPad Air',
    device_type: 'tablet',
    location: 'Kribi, Cameroun',
    ip_address: '197.234.219.88',
    last_active: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    is_current: false,
  },
];

export const MOCK_USER_SETTINGS: UserSettings = {
  profile: {
    avatar_url: 'https://i.pravatar.cc/300?img=1',
    display_name: 'Marie Kasan',
    username: 'mariekasan',
    bio: 'Passionnée de voyage et de découvertes',
    city: 'Douala',
    region: 'Littoral',
    gender: 'female',
    interests: ['restaurants', 'events', 'music', 'culture', 'nature'],
  },
  privacy: {
    account_visibility: 'public',
    show_online_status: true,
    who_can_message: 'everyone',
    who_can_see_posts: 'everyone',
    who_can_tag_me: 'friends',
    show_location_in_posts: true,
    show_city_in_profile: true,
    show_in_search: true,
    show_in_suggestions: true,
  },
  security: {
    password_last_changed: '2024-01-15T10:00:00Z',
    email: 'marie.kasan@example.com',
    email_verified: true,
    phone: '+237 6 99 99 99 99',
    phone_verified: true,
    two_factor_enabled: false,
    active_sessions: MOCK_ACTIVE_SESSIONS,
  },
  preferences: {
    language: 'fr',
    theme: 'dark',
    content_categories: [
      'Restaurants & Bars',
      'Événements',
      'Expériences',
      'Culture',
      'Nature',
    ],
    show_sensitive_content: false,
    reduce_motion: false,
    large_text: false,
    high_contrast: false,
    discovery_radius_km: 25,
    push_notifications: true,
    email_notifications: false,
    sms_notifications: false,
  },
};
