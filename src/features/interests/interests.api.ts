import { apiGet, apiPost, apiPut } from '@/services/api/client';

export type InterestProfile = {
  interestCodes: string[];
  interestsOnboardingCompleted: boolean;
};

export const interestsApi = {
  get: () => apiGet<InterestProfile>('/users/me'),
  save: (categoryCodes: string[], completeOnboarding: boolean) => apiPut<InterestProfile>('/users/me/interests', { categoryCodes, completeOnboarding }),
  activity: (login = false) => apiPost<void>(`/users/me/activity?login=${login}`),
};
