import type { UserSummary } from '@/types/api.types';

export interface Event {
  id: number;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  start_date: string;
  end_date: string;
  location: string;
  address: string;
  city: string;
  organizer: UserSummary;
  participants_count: number;
  participants: UserSummary[];
  is_participating: boolean;
  is_saved: boolean;
  price: number | null;
  currency: string;
  created_at: string;
}
