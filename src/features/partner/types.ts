// ─── Partner Types ──────────────────────────────────────────────────────────

export type PartnerCreationType = 'publication' | 'story' | 'place' | 'event' | 'offer';

export interface PartnerCreationOption {
  id: PartnerCreationType;
  title: string;
  description: string;
  icon: string;
  iconLibrary: 'ionicons' | 'material' | 'material-community';
  color: string;
}

export interface AddPlaceForm {
  // Step 1 - Basic Info
  name: string;
  email: string;
  category: string;
  subcategory: string;
  type: string;
  location: string;
  contact_email: string;
  
  // Step 2 - Location
  use_my_position: boolean;
  exact_address: string;
  region: string;
  city: string;
  landmarks: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // Step 3 - Contact Details
  phone: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface AddEventForm {
  // Step 1 - Basic Info
  name: string;
  location: string;
  category: string;
  place: string;
  type: string;
  start_date: string;
  start_time: string;
  
  // Step 2 - Date & Time
  end_date?: string;
  end_time?: string;
  
  // Step 3 - Details & Billing
  description: string;
  cover_image_url?: string | null;
  ticket_price_enabled: boolean;
  ticket_price?: number;
  max_seats?: number;
}

export interface PartnerStoryData {
  media_url: string;
  media_type: 'image' | 'video';
  text_overlay: string;
  location_tag: string;
  visibility: 'subscribers' | 'public';
  duration: number;
}

export interface OfferForm {
  title: string;
  description: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  valid_until: string;
  terms: string;
  images: string[];
}
