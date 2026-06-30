// ─── Create Types ───────────────────────────────────────────────────────────

export type CreationType = 'publication' | 'story' | 'event' | 'place';

export interface CreationOption {
  id: CreationType;
  title: string;
  description: string;
  icon: string;
  iconLibrary: 'ionicons' | 'material' | 'material-community';
  color: string;
}

export interface CreateEventForm {
  title: string;
  description: string;
  cover_image_url: string | null;
  location: string;
  date: string;
  time: string;
  max_participants: number;
  share_to_feed: boolean;
}

export interface EventSettings {
  visibility: 'public' | 'friends' | 'close_friends';
  allow_strangers: boolean;
  allow_comments_participants_only: boolean;
  show_participants_list: boolean;
  allow_share_outside: boolean;
  enable_waitlist: boolean;
  invited_users: string[];
}

export interface SuggestPlaceForm {
  // Step 1 - Basic Info
  name: string;
  address: string;
  manual_address: boolean;
  category: string;
  type: string;
  description: string;
  region: string;
  
  // Step 2 - Location
  coordinates: {
    latitude: number;
    longitude: number;
  };
  city: string;
  route_details: string;
  
  // Step 3+ (à compléter selon les étapes suivantes)
  images?: string[];
  amenities?: string[];
  opening_hours?: string;
  phone?: string;
  website?: string;
}

export interface StoryCreation {
  media_url: string;
  media_type: 'image' | 'video';
  duration: number;
  text_overlays?: TextOverlay[];
  stickers?: Sticker[];
  drawings?: Drawing[];
  visibility: 'all' | 'close_friends';
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily?: string;
}

export interface Sticker {
  id: string;
  type: string;
  x: number;
  y: number;
  scale: number;
}

export interface Drawing {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
}

export interface PublicationForm {
  media_urls: string[];
  media_type: 'image' | 'video' | 'carousel';
  caption: string;
  location?: string;
  tags?: string[];
}
