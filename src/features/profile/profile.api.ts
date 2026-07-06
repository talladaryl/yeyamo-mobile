import { apiClient } from '@/services/api/client';
import type {
  FavoritePlace,
  EventParticipation,
  ProfileStats,
  Reservation,
  UserPublication,
  UserReview,
} from './types';

export const profileApi = {
  getUserPublications: async (): Promise<UserPublication[]> => {
    const response = await apiClient.get<{ data: UserPublication[] }>('/profile/publications');
    return response.data.data;
  },

  getUserFavorites: async (): Promise<FavoritePlace[]> => {
    const response = await apiClient.get<{ data: FavoritePlace[] }>('/profile/favorites');
    return response.data.data;
  },

  getUserEvents: async (): Promise<EventParticipation[]> => {
    const response = await apiClient.get<{ data: EventParticipation[] }>('/profile/events');
    return response.data.data;
  },

  getUserReservations: async (): Promise<Reservation[]> => {
    const response = await apiClient.get<{ data: Reservation[] }>('/profile/reservations');
    return response.data.data;
  },

  getUserReviews: async (): Promise<UserReview[]> => {
    const response = await apiClient.get<{ data: UserReview[] }>('/profile/reviews');
    return response.data.data;
  },

  getProfileStats: async (): Promise<ProfileStats> => {
    const response = await apiClient.get<{ data: ProfileStats }>('/profile/stats');
    return response.data.data;
  },
};
