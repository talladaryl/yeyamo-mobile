// ─── Experience Types ───────────────────────────────────────────────────────

export interface Experience {
  id: number;
  title: string;
  description: string;
  location: string;
  city: string;
  region: string;
  cover_image_url: string;
  images: string[];
  rating: number;
  reviews_count: number;
  price_from: number;
  currency: string;
  duration_hours: number;
  duration_days?: number;
  difficulty: 'facile' | 'modérée' | 'difficile';
  group_size_min: number;
  group_size_max: number;
  languages: string[];
  availability: 'available' | 'limited' | 'unavailable';
  category: 'adventure' | 'culture' | 'nature' | 'relaxation';
  included_items: ExperienceIncludedItem[];
  equipment_provided: string[];
  is_saved: boolean;
  created_at: string;
}

export interface ExperienceIncludedItem {
  id: string;
  label: string;
  icon: string;
  iconLibrary: 'ionicons' | 'material' | 'material-community';
}

export interface ExperiencesFilters {
  category: 'all' | 'adventure' | 'culture' | 'nature' | 'relaxation';
  min_price?: number;
  max_price?: number;
  difficulty?: 'facile' | 'modérée' | 'difficile';
  duration?: 'half-day' | 'full-day' | 'multi-day';
}
