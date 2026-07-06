// Données fictives pour le profil utilisateur
import type { Publication, FavoritePlace, EventParticipation, Reservation, UserReview } from './types';

export const MOCK_PUBLICATIONS: Publication[] = [
  {
    id: 1,
    type: 'image',
    media_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    likes_count: 234,
    comments_count: 12,
    is_saved: false,
    created_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 2,
    type: 'video',
    media_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400',
    likes_count: 456,
    comments_count: 28,
    is_saved: true,
    created_at: '2024-03-14T10:00:00Z',
  },
  {
    id: 3,
    type: 'image',
    media_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400',
    likes_count: 189,
    comments_count: 15,
    is_saved: false,
    created_at: '2024-03-13T10:00:00Z',
  },
];

export const MOCK_USER_PUBLICATIONS = MOCK_PUBLICATIONS;

export const MOCK_FAVORITE_PLACES: FavoritePlace[] = [
  {
    id: 101,
    name: 'La Falaise Resort',
    category: { id: 1, name: 'Hôtel & Resort', icon: 'bed' },
    address: 'Kribi',
    city: 'Kribi',
    region: 'Sud',
    latitude: 2.9389,
    longitude: 9.9081,
    photos: [],
    cover_photo_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    rating: 4.8,
    reviews_count: 208,
    price_range: 4,
    amenities: [],
    opening_hours: [],
    phone: null,
    website: null,
    is_verified: true,
    is_favorited: true,
    favorited_at: '2024-03-10T10:00:00Z',
    is_priority: true,
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const MOCK_USER_FAVORITES = MOCK_FAVORITE_PLACES;

export const MOCK_EVENT_PARTICIPATIONS: EventParticipation[] = [
  {
    id: 1,
    event: {
      id: 201,
      title: 'Soirée Jazz à Douala',
      description: 'Une soirée jazz inoubliable',
      cover_image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
      place: {} as any,
      organizer: {} as any,
      start_date: '2025-01-24T19:00:00Z',
      end_date: null,
      max_participants: 200,
      current_participants: 180,
      participants: [],
      price: 5000,
      visibility: 'public',
      allow_strangers: true,
      status: 'upcoming',
      user_participation_status: 'going',
      created_at: '2024-01-01T00:00:00Z',
    },
    status: 'confirmed',
    participants: [],
    participants_count: 180,
    joined_at: '2024-03-01T10:00:00Z',
  },
];

export const MOCK_USER_EVENTS = MOCK_EVENT_PARTICIPATIONS;

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 1,
    place: {
      id: 101,
      name: 'La Falaise Resort',
      category: { id: 1, name: 'Hôtel', icon: 'bed' },
      address: 'Kribi',
      city: 'Kribi',
      region: 'Sud',
      latitude: 2.9389,
      longitude: 9.9081,
      photos: [],
      cover_photo_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
      rating: 4.8,
      reviews_count: 208,
      price_range: 4,
      amenities: [],
      opening_hours: [],
      phone: null,
      website: null,
      is_verified: true,
      is_favorited: false,
      created_at: '2024-01-01T00:00:00Z',
    },
    reservation_date: '2025-03-20T14:00:00Z',
    guests_count: 2,
    status: 'confirmed',
    created_at: '2024-03-01T10:00:00Z',
  },
];

export const MOCK_USER_RESERVATIONS = MOCK_RESERVATIONS;

export const MOCK_USER_REVIEWS: UserReview[] = [
  {
    id: 1,
    place: {
      id: 101,
      name: 'La Falaise Resort',
      category: { id: 1, name: 'Hôtel & Resort', icon: 'bed' },
      address: 'Kribi',
      city: 'Kribi',
      region: 'Sud',
      latitude: 2.9389,
      longitude: 9.9081,
      photos: [],
      cover_photo_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
      rating: 4.8,
      reviews_count: 208,
      price_range: 4,
      amenities: [],
      opening_hours: [],
      phone: null,
      website: null,
      is_verified: true,
      is_favorited: false,
      created_at: '2024-01-01T00:00:00Z',
    },
    rating: 5.0,
    comment: 'Superbe expérience ! Vue imprenable sur l\'océan et service impeccable.',
    created_at: '2024-03-10T10:00:00Z',
    helpful_count: 12,
  },
];
