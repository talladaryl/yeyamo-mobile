import type { EntityId, UserSummary } from '@/types/api.types';

export interface Event {
  id: EntityId;
  place_id?: EntityId;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  duration_hours?: number;
  location?: string | null;
  address?: string | null;
  city?: string | null;
  organizer?: UserSummary | null;
  participants_count: number;
  max_participants?: number;
  participants?: UserSummary[];
  interested_count?: number;
  is_participating: boolean;
  is_saved?: boolean;
  price: number | null;
  vip_price?: number;
  currency?: string | null;
  created_at: string;
  program?: EventProgramItem[];
  ticket_types?: EventTicket[];
}

export interface EventProgramItem {
  date: string;
  title: string;
  description?: string;
}

export interface EventTicket {
  id: string;
  type: 'standard' | 'vip';
  label: string;
  price: number;
  available: boolean;
}
