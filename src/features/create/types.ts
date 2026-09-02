// ─── Create Types ───────────────────────────────────────────────────────────

export type CreationType = 'publication' | 'story' | 'event' | 'place' | 'culture' | 'artwork' | 'challenge';

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

export interface ArtworkDraft {
  artisanPartnerId: string;
  title: string;
  slug?: string;
  shortDescription: string;
  materials?: string;
  techniques?: string;
  story: string;
  countryCode: string;
  adminLevel1Id?: string;
  cityId?: string;
  localityId?: string;
  cultureContentId?: string;
  culturalCommunity?: string;
  yearCreated?: number;
  productionTime?: string;
  width?: string;
  height?: string;
  depth?: string;
  weight?: string;
  editionType: 'UNIQUE' | 'LIMITED_EDITION' | 'SERIES' | 'REPRODUCTION' | 'CUSTOM_ORDER';
  editionSize?: number;
  availabilityStatus: 'DISPLAY_ONLY' | 'AVAILABLE' | 'ON_ORDER' | 'RESERVED' | 'SOLD' | 'UNAVAILABLE';
  saleType?: 'FIXED_PRICE' | 'ON_REQUEST' | 'CUSTOM_ORDER' | 'AUCTION_FUTURE';
  amount?: string;
  currencyCode?: string;
  availableQuantity?: number;
  internationalShipping?: boolean;
  customOrderAllowed?: boolean;
  mediaIds: Array<{ mediaId: string; type: 'PRIMARY_IMAGE' | 'GALLERY_IMAGE' | 'VIDEO' | 'CREATION_PROCESS' | 'ARTISAN_AUDIO' | 'HISTORY_AUDIO' | 'CERTIFICATE'; displayOrder: number }>;
}
