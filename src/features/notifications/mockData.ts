// Données fictives pour les notifications
import type { Notification } from './types';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'like',
    user: {
      id: 2,
      username: 'marie_k',
      display_name: 'Marie',
      avatar_url: 'https://i.pravatar.cc/150?img=1',
      is_verified: false,
      user_type: 'user',
    },
    content: 'a aimé votre publication',
    target_id: 101,
    target_type: 'post',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // il y a 30 min
    is_read: false,
  },
  {
    id: 2,
    type: 'new_place',
    user: {
      id: 3,
      username: 'lafalaise',
      display_name: 'La Falaise Resort',
      avatar_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=150',
      is_verified: true,
      user_type: 'partner',
    },
    content: 'a ajouté un nouveau lieu',
    target_id: 102,
    target_type: 'place',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // il y a 2h
    is_read: false,
  },
  {
    id: 3,
    type: 'reservation_confirmed',
    user: {
      id: 3,
      username: 'lafalaise',
      display_name: 'La Falaise Resort',
      avatar_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=150',
      is_verified: true,
      user_type: 'partner',
    },
    content: 'Votre réservation au Safari à Waza est confirmée',
    target_id: 103,
    target_type: 'reservation',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // il y a 5h
    is_read: true,
  },
  {
    id: 4,
    type: 'event_invitation',
    user: {
      id: 4,
      username: 'emma_d',
      display_name: 'Emma',
      avatar_url: 'https://i.pravatar.cc/150?img=5',
      is_verified: false,
      user_type: 'user',
    },
    content: 'vous a invité à un événement',
    target_id: 104,
    target_type: 'event',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // il y a 1 jour
    is_read: true,
  },
  {
    id: 5,
    type: 'follow',
    user: {
      id: 5,
      username: 'jean_p',
      display_name: 'Jean',
      avatar_url: 'https://i.pravatar.cc/150?img=12',
      is_verified: false,
      user_type: 'user',
    },
    content: 'a commencé à vous suivre',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // il y a 2 jours
    is_read: true,
  },
  {
    id: 6,
    type: 'event_reminder',
    user: {
      id: 6,
      username: 'yeyamo',
      display_name: 'Yeyamo',
      avatar_url: null,
      is_verified: true,
      user_type: 'user',
    },
    content: 'Rappel: Événement demain - Soirée Jazz à Douala',
    target_id: 105,
    target_type: 'event',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // il y a 3 jours
    is_read: true,
  },
];
