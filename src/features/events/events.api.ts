import { apiDelete, apiGet, apiPost } from '@/services/api/client';
import { mediaContentUrl } from '@/services/api/contracts';
import type { EntityId } from '@/types/api.types';
import type { Event } from './types';

interface BackendEvent {
  id: string;
  placeId: string;
  title: string;
  description?: string | null;
  startAt: string;
  endAt: string;
  capacity: number | null;
  registeredCount: number;
  coverMediaId?: string | null;
  createdAt?: string;
}

export interface CreateEventInput { placeId: string; title: string; description?: string; startAt: string; endAt: string; capacity: number; status: 'DRAFT' | 'PENDING'; }

/** Maps only fields returned by EventResponse/EventSummaryResponse. */
function mapEvent(event: BackendEvent): Event {
  return {
    id: event.id,
    place_id: event.placeId,
    title: event.title,
    description: event.description ?? null,
    cover_image_url: event.coverMediaId ? mediaContentUrl(event.coverMediaId) : null,
    start_date: event.startAt,
    end_date: event.endAt,
    start_time: new Date(event.startAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    end_time: new Date(event.endAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    participants_count: event.registeredCount,
    max_participants: event.capacity ?? undefined,
    is_participating: false,
    price: null,
    created_at: event.createdAt ?? event.startAt,
  };
}

export const eventsApi = {
  createEvent: (input: CreateEventInput) => apiPost<BackendEvent>('/events', input).then(mapEvent),
  upcoming: async (): Promise<Event[]> =>
    (await apiGet<BackendEvent[]>('/events/upcoming')).map(mapEvent),

  detail: async (eventId: EntityId): Promise<Event> => {
    const [detail, mine] = await Promise.all([
      apiGet<BackendEvent>(`/events/${eventId}`),
      apiGet<BackendEvent[]>('/events/me?limit=100').catch(() => []),
    ]);
    const event = mapEvent(detail);
    event.is_participating = mine.some((item) => item.id === detail.id);
    return event;
  },

  register: async (eventId: EntityId): Promise<Event> => {
    const event = mapEvent(await apiPost<BackendEvent>(`/events/${eventId}/register`));
    event.is_participating = true;
    return event;
  },

  unregister: async (eventId: EntityId): Promise<Event> => {
    const event = mapEvent(await apiDelete<BackendEvent>(`/events/${eventId}/unregister`));
    event.is_participating = false;
    return event;
  },
};
