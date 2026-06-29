import type { Category, TrendingPlace, Region, MapPlace, UpcomingEvent } from './types';

// ─── Categories ─────────────────────────────────────────────────────────────

export const categories: Category[] = [
  {
    id: 'attractions',
    label: 'Attractions',
    icon: 'location',
    iconLibrary: 'ionicons',
  },
  {
    id: 'events',
    label: 'Événements',
    icon: 'calendar',
    iconLibrary: 'ionicons',
  },
  {
    id: 'experiences',
    label: 'Expériences',
    icon: 'compass',
    iconLibrary: 'ionicons',
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    icon: 'restaurant',
    iconLibrary: 'ionicons',
  },
  {
    id: 'hotels',
    label: 'Hôtels',
    icon: 'bed',
    iconLibrary: 'ionicons',
  },
];

// ─── Trending Places ────────────────────────────────────────────────────────

export const trendingPlaces: TrendingPlace[] = [
  {
    id: 1,
    name: 'Chutes d\'Ekom',
    city: 'Nkongsamba',
    rating: 4.6,
    reviews_count: 142,
    distance_km: 85,
    image_url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9',
    category: 'attractions',
  },
  {
    id: 2,
    name: 'Mont Cameroun',
    city: 'Buéa',
    rating: 4.8,
    reviews_count: 230,
    distance_km: 120,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'attractions',
  },
  {
    id: 3,
    name: 'La Falaise',
    city: 'Dschang',
    rating: 4.7,
    reviews_count: 105,
    distance_km: 215,
    image_url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000',
    category: 'hotels',
  },
  {
    id: 4,
    name: 'Lac Baleng',
    city: 'Bafoussam',
    rating: 4.6,
    reviews_count: 89,
    distance_km: 8.3,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'attractions',
  },
  {
    id: 5,
    name: 'Parc National de Waza',
    city: 'Maroua',
    rating: 4.8,
    reviews_count: 94,
    distance_km: 408,
    image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801',
    category: 'attractions',
  },
];

// ─── Regions ────────────────────────────────────────────────────────────────

export const regions: Region[] = [
  {
    id: 1,
    name: 'Région de l\'Ouest',
    description: 'Découvrez la richesse culturelle et les paysages montagneux de l\'Ouest.',
    places_count: 258,
    events_count: 86,
    experiences_count: 124,
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    coordinates: { latitude: 5.4775, longitude: 10.4155 },
  },
  {
    id: 2,
    name: 'Littoral',
    description: 'Explorez Douala et ses plages magnifiques.',
    places_count: 342,
    events_count: 156,
    experiences_count: 198,
    cover_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    coordinates: { latitude: 4.0511, longitude: 9.7679 },
  },
  {
    id: 3,
    name: 'Sud-Ouest',
    description: 'Découvrez le Mont Cameroun et les plages de Limbé.',
    places_count: 189,
    events_count: 64,
    experiences_count: 87,
    cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    coordinates: { latitude: 4.1561, longitude: 9.2395 },
  },
  {
    id: 4,
    name: 'Nord',
    description: 'Partez à l\'aventure dans les savanes du Nord.',
    places_count: 145,
    events_count: 42,
    experiences_count: 67,
    cover_image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801',
    coordinates: { latitude: 9.3333, longitude: 13.3833 },
  },
  {
    id: 5,
    name: 'Extrême-Nord',
    description: 'Explorez le Parc de Waza et les monts Mandara.',
    places_count: 112,
    events_count: 28,
    experiences_count: 45,
    cover_image_url: 'https://images.unsplash.com/photo-1535262412227-4f17e537dd50',
    coordinates: { latitude: 10.5967, longitude: 14.2333 },
  },
  {
    id: 6,
    name: 'Est',
    description: 'Découvrez la forêt tropicale et la faune sauvage.',
    places_count: 98,
    events_count: 22,
    experiences_count: 52,
    cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23',
    coordinates: { latitude: 4.5594, longitude: 14.4133 },
  },
];

// ─── Map Places ─────────────────────────────────────────────────────────────

export const mapPlaces: MapPlace[] = [
  {
    id: 1,
    name: 'La Falaise de Dschang',
    coordinates: { latitude: 5.4556, longitude: 10.0588 },
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000',
    category: 'hotels',
  },
  {
    id: 2,
    name: 'Mont Cameroun',
    coordinates: { latitude: 4.2192, longitude: 9.1708 },
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'attractions',
  },
  {
    id: 3,
    name: 'Chutes d\'Ekom',
    coordinates: { latitude: 4.6342, longitude: 9.8856 },
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9',
    category: 'attractions',
  },
  {
    id: 4,
    name: 'Parc de Waza',
    coordinates: { latitude: 11.3333, longitude: 14.7167 },
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801',
    category: 'attractions',
  },
  {
    id: 5,
    name: 'Lac Baleng',
    coordinates: { latitude: 5.4775, longitude: 10.4155 },
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    category: 'attractions',
  },
];

// ─── Upcoming Events ────────────────────────────────────────────────────────

export const upcomingEvents: UpcomingEvent[] = [
  {
    id: 1,
    title: 'Festival des Arts Populaires',
    date_start: '2025-03-20',
    date_end: '2025-03-24',
    location: 'Bafoussam',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
    attendees_count: 2456,
  },
  {
    id: 2,
    title: 'Ngondo',
    date_start: '2025-12-01',
    date_end: '2025-12-07',
    location: 'Douala',
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    attendees_count: 5890,
  },
  {
    id: 3,
    title: 'Festival Eboa Lotin',
    date_start: '2025-05-24',
    date_end: '2025-05-26',
    location: 'Kribi',
    image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
    attendees_count: 1234,
  },
];

// ─── Cameroon Center Coordinates ────────────────────────────────────────────

export const CAMEROON_CENTER = {
  latitude: 6.2,
  longitude: 12.3547,
  latitudeDelta: 8,
  longitudeDelta: 8,
};
