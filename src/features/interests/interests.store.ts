import { create } from 'zustand';
import { secureStore } from '@/services/storage/secure-store';

type InterestState = {
  selectedInterestIds: string[];
  hasCompletedInterestSelection: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  toggleInterest: (interestId: string) => void;
  setSelectedInterests: (interestIds: string[]) => void;
  saveInterests: () => Promise<void>;
  reset: () => void;
};

export const useInterestsStore = create<InterestState>((set, get) => ({
  selectedInterestIds: [],
  hasCompletedInterestSelection: false,
  isHydrated: false,

  hydrate: async () => {
    const [storedInterests, hasSelected] = await Promise.all([
      secureStore.get(secureStore.KEYS.INTERESTS),
      secureStore.get(secureStore.KEYS.HAS_SELECTED_INTERESTS),
    ]);

    let selectedInterestIds: string[] = [];
    if (storedInterests) {
      try {
        const parsed = JSON.parse(storedInterests);
        if (Array.isArray(parsed)) {
          selectedInterestIds = parsed.filter((item): item is string => typeof item === 'string');
        }
      } catch {
        selectedInterestIds = [];
      }
    }

    set({
      selectedInterestIds,
      hasCompletedInterestSelection: hasSelected === 'true' && selectedInterestIds.length > 0,
      isHydrated: true,
    });
  },

  toggleInterest: (interestId) => set((state) => ({
    selectedInterestIds: state.selectedInterestIds.includes(interestId)
      ? state.selectedInterestIds.filter((id) => id !== interestId)
      : [...state.selectedInterestIds, interestId],
  })),

  setSelectedInterests: (interestIds) => set({
    selectedInterestIds: [...new Set(interestIds)],
  }),

  saveInterests: async () => {
    const selectedInterestIds = get().selectedInterestIds;
    await Promise.all([
      secureStore.set(secureStore.KEYS.INTERESTS, JSON.stringify(selectedInterestIds)),
      secureStore.set(secureStore.KEYS.HAS_SELECTED_INTERESTS, 'true'),
    ]);
    set({ hasCompletedInterestSelection: true });
  },

  reset: () => set({
    selectedInterestIds: [],
    hasCompletedInterestSelection: false,
    isHydrated: true,
  }),
}));
