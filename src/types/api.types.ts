// ─── Generic API Wrappers ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// ─── Shared Entities ────────────────────────────────────────────────────────

export interface UserSummary {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string | null;
  is_verified: boolean;
}

export interface MediaAttachment {
  id: number;
  url: string;
  thumbnail_url: string | null;
  type: 'image' | 'video';
  width: number;
  height: number;
  duration_seconds: number | null;
}
