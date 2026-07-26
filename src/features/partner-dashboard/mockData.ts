import type {
  DashboardMetrics,
  RecentActivity,
  Establishment,
  PartnerEvent,
  Reservation,
  CustomerReview,
  StatisticCard,
  TrafficSource,
  Notification,
  SettingsSection,
} from './types';

export const dashboardMetrics: DashboardMetrics = {
  publications: 1248,
  views: 368,
  establishments: 24,
};

export const recentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'reservation',
    title: 'Nouvelle réservation',
    subtitle: 'Marie K. - Il y a 5 min',
    timestamp: 'Il y a 5 min',
    icon: 'calendar',
  },
  {
    id: '2',
    type: 'review',
    title: 'Nouvel avis',
    subtitle: 'Alex T. - Il y a 15 min',
    timestamp: 'Il y a 15 min',
    icon: 'star',
  },
  {
    id: '3',
    type: 'message',
    title: 'Message reçu',
    subtitle: 'Sophie L. - Il y a 1h',
    timestamp: 'Il y a 1h',
    icon: 'chatbubble',
  },
];

export const establishments: Establishment[] = [
  {
    id: '1',
    name: 'La Falaise Resort',
    category: 'Hôtel • Resort',
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    rating: 4.8,
    reviews_count: 78,
    address: 'Bonapriso, Douala',
  },
  {
    id: '2',
    name: 'Bistro Douala',
    category: 'Restaurant • Bar',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    rating: 4.5,
    reviews_count: 42,
    address: 'Akwa, Douala',
  },
  {
    id: '3',
    name: 'Espace Sunshine',
    category: 'Événementiel',
    image_url: 'https://images.unsplash.com/photo-1519167758481-83f29da8c2ce?w=400',
    rating: 4.7,
    reviews_count: 56,
    address: 'Bastos, Yaoundé',
  },
];

export const partnerEvents: PartnerEvent[] = [
  {
    id: '1',
    name: 'Vendu Juin à Douala',
    date: '24 Mai 2025',
    time: '20:00',
    location: 'La Falaise Resort',
    participants: 8,
    status: 'published',
    supports_ticketing: true,
  },
  {
    id: '2',
    name: 'Brunch du Dimanche',
    date: '01 Juin 2025',
    time: '10:00',
    location: 'Bistro Douala',
    participants: 0,
    status: 'draft',
    supports_ticketing: false,
  },
  {
    id: '3',
    name: 'Fête de la Musique',
    date: '21 Juin 2025',
    time: '18:00',
    location: 'Espace Sunshine',
    participants: 15,
    status: 'published',
    supports_ticketing: true,
  },
];

export const reservations: Reservation[] = [
  {
    id: '1',
    customer_name: 'Marie K.',
    date: '24 Mai 2025',
    time: '19:30',
    guests: 4,
    amount: 50000,
    status: 'confirmed',
    establishment: 'La Falaise Resort',
  },
  {
    id: '2',
    customer_name: 'Jean P.',
    date: '28 Mai 2025',
    time: '20:00',
    guests: 2,
    amount: 40000,
    status: 'confirmed',
    establishment: 'Bistro Douala',
  },
  {
    id: '3',
    customer_name: 'Luce B.',
    date: '1 Juin 2025',
    time: '12:00',
    guests: 6,
    amount: 85000,
    status: 'pending',
    establishment: 'Espace Sunshine',
  },
];

export const customerReviews: CustomerReview[] = [
  {
    id: '1',
    customer_name: 'Sylvia K.',
    rating: 5,
    date: 'Il y a 2 jours',
    comment: 'Parfait pour une soirée en amoureux magnifique! Le service était impeccable et l\'ambiance...',
    establishment: 'La Falaise Resort',
  },
  {
    id: '2',
    customer_name: 'Alex T.',
    rating: 4,
    date: 'Il y a 1 semaine',
    comment: 'Très bon accueil, la cuisine était excellente. Juste un peu d\'attente lors du service mais sinon...',
    establishment: 'Bistro Douala',
  },
  {
    id: '3',
    customer_name: 'Sophie L.',
    rating: 5,
    date: 'Il y a 3 jours',
    comment: 'L\'endroit parfait pour organiser un événement ! L\'équipe est professionnelle et à l\'écoute...',
    establishment: 'Espace Sunshine',
  },
];

export const statisticCards: StatisticCard[] = [
  {
    label: 'Nouveaux abonnés',
    value: '12,640',
    change: '+13.8%',
    isPositive: true,
  },
  {
    label: 'Total des vues',
    value: '2,153',
    change: '+1.6%',
    isPositive: true,
  },
];

export const trafficSources: TrafficSource[] = [
  { name: 'Recherche', percentage: 40, color: '#EF4444' },
  { name: 'Partage', percentage: 25, color: '#F59E0B' },
  { name: 'Direct', percentage: 20, color: '#10B981' },
  { name: 'Autre', percentage: 15, color: '#6B7280' },
];

export const notifications: Notification[] = [
  {
    id: '1',
    type: 'reservation',
    title: 'Nouvelle réservation',
    subtitle: 'Marie K. pour le 24 Mai 2025',
    timestamp: 'Il y a 10 min',
    icon: 'calendar',
    iconColor: '#EF4444',
    read: false,
  },
  {
    id: '2',
    type: 'message',
    title: 'Nouveau message',
    subtitle: 'Jean P. vous a envoyé un message',
    timestamp: 'Il y a 30 min',
    icon: 'chatbubble',
    iconColor: '#3B82F6',
    read: false,
  },
  {
    id: '3',
    type: 'review',
    title: 'Nouvel avis - 5 étoiles',
    subtitle: 'Sylvia K. a laissé un avis',
    timestamp: 'Il y a 2h',
    icon: 'star',
    iconColor: '#F59E0B',
    read: true,
  },
  {
    id: '4',
    type: 'event',
    title: 'Événement en approche',
    subtitle: 'Vendu Juin à Douala - Dans 3 jours',
    timestamp: 'Hier à 14:30',
    icon: 'notifications',
    iconColor: '#8B5CF6',
    read: true,
  },
  {
    id: '5',
    type: 'expiring',
    title: 'Offre expire à date',
    subtitle: 'Votre offre "Brunch" expire le 30 Mai',
    timestamp: 'Il y a 1 jour',
    icon: 'time',
    iconColor: '#EF4444',
    read: true,
  },
];

export const settingsSections: SettingsSection[] = [
  {
    title: 'Compte',
    items: [
      {
        id: 'business-info',
        label: 'Informations de l\'établissement',
        icon: 'business',
        hasArrow: true,
      },
      {
        id: 'password',
        label: 'Changer le mot de passe',
        icon: 'lock-closed',
        hasArrow: true,
      },
    ],
  },
  {
    title: 'Préférences',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: 'notifications',
        hasArrow: true,
      },
      {
        id: 'language',
        label: 'Langue',
        icon: 'language',
        value: 'Français',
        hasArrow: true,
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        id: 'help',
        label: 'Centre d\'aide',
        icon: 'help-circle',
        value: '7843',
        hasArrow: true,
      },
      {
        id: 'contact',
        label: 'Nous contacter',
        icon: 'mail',
        hasArrow: true,
      },
      {
        id: 'about',
        label: 'À propos de Yeyamo',
        icon: 'information-circle',
        hasArrow: true,
      },
    ],
  },
];
