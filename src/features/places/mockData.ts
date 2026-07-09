import type { Place } from './types';

export const mockPlaces: Place[] = [
  {
    id: 1,
    name: "La Falaise Resort",
    description: "Hôtel 4 étoiles avec vue imprenable sur la mer, chambres luxueuses, spa, piscine à débordement et restaurant gastronomique. Idéal pour des séjours romantiques ou en famille. Service impeccable et cadre enchanteur.",
    city: 'Douala',
    address: 'Route de Yégémbé, Douala, Cameroun',
    lat: 4.0511,
    lng: 9.7679,
    cover_image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    category: 'Hôtel',
    rating: 4.8,
    reviews_count: 228,
    events_count: 3,
    posts_count: 156,
    is_saved: false,
    opening_hours: '24h/24',
    open_time: '00:00',
    close_time: '24:00',
    phone: '+237 233 456 789',
    price_from: 40000,
    price_to: 80000,
    currency: 'FCFA',
    photos: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
    ],
    equipment: [
      { id: '1', label: 'Wifi', icon: 'wifi', iconLibrary: 'ionicons' },
      { id: '2', label: 'Piscine', icon: 'water', iconLibrary: 'ionicons' },
      { id: '3', label: 'Restaurant', icon: 'restaurant', iconLibrary: 'ionicons' },
      { id: '4', label: 'Parking', icon: 'car', iconLibrary: 'ionicons' },
      { id: '5', label: 'Spa', icon: 'flower', iconLibrary: 'ionicons' },
      { id: '6', label: 'Climatisation', icon: 'snow', iconLibrary: 'ionicons' },
    ],
    recent_reviews: [
      {
        id: '1',
        user_name: 'Jean Paul',
        user_avatar: 'https://i.pravatar.cc/150?img=12',
        rating: 5,
        comment: 'Séjour magnifique ! Service impeccable et cadre enchanteur.',
        photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'],
        date: 'Il y a 2 jours'
      },
      {
        id: '2',
        user_name: 'Marie D.',
        user_avatar: 'https://i.pravatar.cc/150?img=5',
        rating: 4,
        comment: 'Très bel endroit, personnel accueillant.',
        date: 'Il y a 1 semaine'
      }
    ],
    related_events: [
      {
        id: 1,
        title: 'Soirée Jazz à Douala',
        image_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
        date: 'Sam, 24 mai 2025',
        time: '19:00'
      }
    ],
    similar_events: [
      {
        id: 2,
        title: 'Festival Ngondo 2025',
        image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
        date: 'Lun 09 au Dim 15 déc 2025',
        time: ''
      }
    ]
  },
];
