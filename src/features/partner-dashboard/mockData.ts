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
  { id: '4', name: 'Maison du Café', category: 'Café • Coworking', image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800', rating: 4.6, reviews_count: 64, address: 'Bonamoussadi, Douala' },
  { id: '5', name: 'Jardin des Saveurs', category: 'Restaurant • Gastronomie', image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', rating: 4.9, reviews_count: 112, address: 'Odza, Yaoundé' },
  { id: '6', name: 'Galerie Mboa', category: 'Culture • Galerie', image_url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800', rating: 4.7, reviews_count: 39, address: 'Bonanjo, Douala' },
  { id: '7', name: 'Lodge des Chutes', category: 'Hébergement • Nature', image_url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', rating: 4.8, reviews_count: 87, address: 'Kribi, Sud' },
  { id: '8', name: 'Atelier Foumban', category: 'Artisanat • Culture', image_url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800', rating: 4.9, reviews_count: 51, address: 'Foumban, Ouest' },
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
  { id: '4', name: 'Nuit des Contes', date: '12 Sep 2026', time: '18:30', location: 'Galerie Mboa', participants: 86, status: 'published', supports_ticketing: true },
  { id: '5', name: 'Marché des Créateurs', date: '26 Sep 2026', time: '09:00', location: 'Atelier Foumban', participants: 42, status: 'published', supports_ticketing: false },
  { id: '6', name: 'Brunch Culturel', date: '04 Oct 2026', time: '11:00', location: 'Jardin des Saveurs', participants: 55, status: 'draft', supports_ticketing: true },
  { id: '7', name: 'Festival des Langues', date: '18 Oct 2026', time: '10:00', location: 'Espace Sunshine', participants: 210, status: 'published', supports_ticketing: true },
  { id: '8', name: 'Rencontre Artisans', date: '02 Nov 2026', time: '15:00', location: 'Galerie Mboa', participants: 73, status: 'published', supports_ticketing: false },
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
  { id: '4', customer_name: 'Amina F.', customer_avatar: 'https://i.pravatar.cc/150?img=25', date: '12 Sep 2026', time: '18:00', guests: 3, amount: 36000, status: 'confirmed', establishment: 'Jardin des Saveurs' },
  { id: '5', customer_name: 'Brice N.', customer_avatar: 'https://i.pravatar.cc/150?img=15', date: '18 Sep 2026', time: '20:00', guests: 5, amount: 90000, status: 'pending', establishment: 'La Falaise Resort' },
  { id: '6', customer_name: 'Carine M.', customer_avatar: 'https://i.pravatar.cc/150?img=32', date: '26 Sep 2026', time: '12:30', guests: 2, amount: 24000, status: 'confirmed', establishment: 'Bistro Douala' },
  { id: '7', customer_name: 'Éric T.', customer_avatar: 'https://i.pravatar.cc/150?img=13', date: '04 Oct 2026', time: '10:30', guests: 8, amount: 128000, status: 'pending', establishment: 'Espace Sunshine' },
];

export const customerReviews: CustomerReview[] = [
  {
    id: '1',
    customer_name: 'Sylvia K.',
    customer_avatar: 'https://i.pravatar.cc/150?img=47',
    rating: 5,
    date: 'Il y a 2 jours',
    comment: 'Parfait pour une soirée en amoureux magnifique! Le service était impeccable et l\'ambiance...',
    establishment: 'La Falaise Resort',
    partner_reply: 'Merci Sylvia ! Toute l’équipe est heureuse que votre soirée vous ait plu.',
  },
  {
    id: '2',
    customer_name: 'Alex T.',
    customer_avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 4,
    date: 'Il y a 1 semaine',
    comment: 'Très bon accueil, la cuisine était excellente. Juste un peu d\'attente lors du service mais sinon...',
    establishment: 'Bistro Douala',
  },
  {
    id: '3',
    customer_name: 'Sophie L.',
    customer_avatar: 'https://i.pravatar.cc/150?img=44',
    rating: 5,
    date: 'Il y a 3 jours',
    comment: 'L\'endroit parfait pour organiser un événement ! L\'équipe est professionnelle et à l\'écoute...',
    establishment: 'Espace Sunshine',
  },
  { id: '4', customer_name: 'Nadia B.', customer_avatar: 'https://i.pravatar.cc/150?img=45', rating: 5, date: 'Il y a 4 jours', comment: 'Une équipe attentionnée et un cadre superbe. Nous reviendrons avec plaisir.', establishment: 'Jardin des Saveurs' },
  { id: '5', customer_name: 'Patrick O.', customer_avatar: 'https://i.pravatar.cc/150?img=14', rating: 3, date: 'Il y a 6 jours', comment: 'Le lieu est très agréable mais le temps d’attente peut encore être amélioré.', establishment: 'Maison du Café' },
  { id: '6', customer_name: 'Estelle M.', customer_avatar: 'https://i.pravatar.cc/150?img=48', rating: 5, date: 'Il y a 1 semaine', comment: 'Magnifique sélection et médiation culturelle très intéressante.', establishment: 'Galerie Mboa', partner_reply: 'Merci pour votre visite et votre retour. À très bientôt pour notre prochaine exposition !' },
  { id: '7', customer_name: 'Yannick S.', customer_avatar: 'https://i.pravatar.cc/150?img=11', rating: 4, date: 'Il y a 9 jours', comment: 'Très belle expérience au calme, avec un accueil professionnel.', establishment: 'Lodge des Chutes' },
  { id: '8', customer_name: 'Fatou D.', customer_avatar: 'https://i.pravatar.cc/150?img=49', rating: 5, date: 'Il y a 2 semaines', comment: 'Les artisans prennent le temps d’expliquer chaque technique. Une vraie découverte.', establishment: 'Atelier Foumban' },
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
