import { create } from 'zustand';
import { secureStore } from '@/services/storage/secure-store';

interface OnboardingState {
  currentStep: number;
  hasSeenOnboarding: boolean;
  hasCompletedLaunchFlow: boolean;
  isHydrated: boolean;
  selectedAccountType: 'explorer' | 'developer' | null;
  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setAccountType: (type: 'explorer' | 'developer') => void;
  completeOnboarding: () => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;
}

const TOTAL_STEPS = 4; // steps 1-4 (splash is step 0)

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 0,
  hasSeenOnboarding: false,
  hasCompletedLaunchFlow: false,
  isHydrated: false,
  selectedAccountType: null,

  setCurrentStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < TOTAL_STEPS) {
      set({ currentStep: currentStep + 1 });
    }
  },

  previousStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  setAccountType: (type) => set({ selectedAccountType: type }),

  completeOnboarding: async () => {
    await secureStore.set(secureStore.KEYS.HAS_SEEN_ONBOARDING, 'true');
    set({ hasSeenOnboarding: true, hasCompletedLaunchFlow: true, isHydrated: true });
  },

  checkOnboardingStatus: async () => {
    const hasSeenOnboarding = await secureStore.get(secureStore.KEYS.HAS_SEEN_ONBOARDING);
    set({ hasSeenOnboarding: hasSeenOnboarding === 'true', isHydrated: true });
  },
}));
