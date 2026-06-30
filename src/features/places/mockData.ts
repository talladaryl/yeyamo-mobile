import type { Place } from './types';

export const mockPlaces: Place[] = [
  {
    id: 1,
    name: "Chutes d'Ekom Nkam",
    description: "Magnifique cascade située en plein cœur d'une forêt tropicale luxuriante. Lieu paisible pour se ressourcer et admirer la nature camerounaise. Un site historique où plusieurs films ont été tournés, dont Greystoke: La Légende de Tarzan.",
    city: 'Melong',
    address: 'Route de Nkongsamba',
    lat: 4.9667,
    lng: 10.4667,
    cover_image_url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800',
    category: 'Cascade',
    rating: 4.8,
    reviews_count: 203,
    events_count: 5,
    posts_count: 142,
    is_saved: true,
    opening_hours: '8h - 17h',
    phone: '+237 690 123 456',
    price_from: 2000,
    currency: 'FCFA',
    equipment: [
      { id: '1', label: 'Parking', icon: 'car', iconLibrary: 'ionicons' },
      { id: '2', label: 'Restaurant', icon: 'restaurant', iconLibrary: 'ionicons' },
      { id: '3', label: 'WC', icon: 'water', iconLibrary: 'ionicons' },
      { id: '4', label: 'Aire de pique-nique', icon: 'fast-food', iconLibrary: 'ionicons' },
    ],
  },
];
