// ─── Partner Dashboard Types ────────────────────────────────────────────────

export interface DashboardMetrics {
  publications: number;
  views: number;
  establishments: number;
}

export interface RecentActivity {
  id: string;
  type: 'reservation' | 'review' | 'message' | 'event';
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
}

export interface Establishment {
  id: string;
  name: string;
  category: string;
  image_url: string;
  rating: number;
  reviews_count: number;
  address: string;
}

export interface PartnerEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  status: 'published' | 'draft' | 'archived';
}

export interface Reservation {
  id: string;
  customer_name: string;
  customer_avatar?: string;
  date: string;
  time: string;
  guests: number;
  amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  establishment: string;
}

export interface CustomerReview {
  id: string;
  customer_name: string;
  customer_avatar?: string;
  rating: number;
  date: string;
  comment: string;
  establishment: string;
}

export interface StatisticCard {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface TrafficSource {
  name: string;
  percentage: number;
  color: string;
}

export interface Notification {
  id: string;
  type: 'reservation' | 'message' | 'review' | 'event' | 'expiring';
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
  iconColor: string;
  read: boolean;
}

export interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

export interface SettingsItem {
  id: string;
  label: string;
  icon: string;
  value?: string;
  hasArrow: boolean;
  route?: string;
}
