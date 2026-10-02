import { create } from 'zustand';
import { interestsApi } from './interests.api';
import { secureStore } from '@/services/storage/secure-store';
import { useAuthStore } from '@/features/auth/auth.store';

type InterestState = {
  selectedInterestIds: string[];
  hasCompletedInterestSelection: boolean;
  isHydrated: boolean;
  isServerResolved: boolean;
  hydrate: () => Promise<void>;
  syncFromServer: (viewerId: string) => Promise<void>;
  toggleInterest: (interestId: string) => void;
  setSelectedInterests: (interestIds: string[]) => void;
  saveInterests: (completeOnboarding?: boolean) => Promise<void>;
  markResolutionUnavailable: () => void;
  reset: () => void;
};

export const useInterestsStore = create<InterestState>((set, get) => ({
  selectedInterestIds: [], hasCompletedInterestSelection: false, isHydrated: false, isServerResolved: false,
  hydrate: async () => set({ isHydrated: true }),
  syncFromServer: async (viewerId) => {
    try {
      const profile = await interestsApi.get();
      set({ selectedInterestIds: profile.interestCodes ?? [], hasCompletedInterestSelection: profile.interestsOnboardingCompleted, isHydrated: true, isServerResolved: true });
      await secureStore.set(secureStore.KEYS.INTEREST_PROFILE, JSON.stringify({ viewerId, ...profile }));
      console.info(profile.interestsOnboardingCompleted ? 'INTEREST_ONBOARDING_SKIPPED' : 'INTEREST_ONBOARDING_REQUIRED');
    } catch (error) {
      const cached = await secureStore.get(secureStore.KEYS.INTEREST_PROFILE);
      if (cached) {
        try {
          const profile = JSON.parse(cached) as { viewerId: string; interestCodes: string[]; interestsOnboardingCompleted: boolean };
          if (profile.viewerId === viewerId) {
            set({ selectedInterestIds: profile.interestCodes, hasCompletedInterestSelection: profile.interestsOnboardingCompleted, isServerResolved: true });
            console.info('OFFLINE_CACHE_USED');
            return;
          }
        } catch { /* Invalid optimization cache is ignored. */ }
      }
      throw error;
    }
  },
  toggleInterest: (interestId) => set((state) => ({ selectedInterestIds: state.selectedInterestIds.includes(interestId) ? state.selectedInterestIds.filter((id) => id !== interestId) : [...state.selectedInterestIds, interestId] })),
  setSelectedInterests: (interestIds) => set({ selectedInterestIds: [...new Set(interestIds)] }),
  saveInterests: async (completeOnboarding = true) => {
    const selectedInterestIds = get().selectedInterestIds;
    console.info('INTEREST_SELECTION_SAVE', selectedInterestIds);
    const profile = await interestsApi.save(selectedInterestIds, completeOnboarding);
    set({ selectedInterestIds: profile.interestCodes ?? selectedInterestIds, hasCompletedInterestSelection: profile.interestsOnboardingCompleted, isServerResolved: true });
    const viewerId = String(useAuthStore.getState().user?.id ?? '');
    if (viewerId) await secureStore.set(secureStore.KEYS.INTEREST_PROFILE, JSON.stringify({ viewerId, ...profile }));
    console.info('INTEREST_ONBOARDING_COMPLETE');
  },
  markResolutionUnavailable: () => set({ isServerResolved: true, hasCompletedInterestSelection: true }),
  reset: () => { void secureStore.remove(secureStore.KEYS.INTEREST_PROFILE); set({ selectedInterestIds: [], hasCompletedInterestSelection: false, isHydrated: true, isServerResolved: false }); },
}));
