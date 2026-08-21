import { create } from 'zustand';
import { secureStore } from '@/services/storage/secure-store';

interface OnboardingState {
  currentStep: number;
  hasSeenOnboarding: boolean;
  hasCompletedLaunchFlow: boolean;
  isHydrated: boolean;
  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeOnboarding: () => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;
}

const TOTAL_STEPS = 3; // steps 1-3 (splash is step 0)

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 0,
  hasSeenOnboarding: false,
  hasCompletedLaunchFlow: false,
  isHydrated: false,

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

  completeOnboarding: async () => {
    set({ hasSeenOnboarding: true, hasCompletedLaunchFlow: true, isHydrated: true });
    await secureStore.set(secureStore.KEYS.HAS_SEEN_ONBOARDING, 'true');
  },

  checkOnboardingStatus: async () => {
    const hasSeenOnboarding = await secureStore.get(secureStore.KEYS.HAS_SEEN_ONBOARDING);
    const hasCompletedLaunchFlow = hasSeenOnboarding === 'true';
    set({
      hasSeenOnboarding: hasCompletedLaunchFlow,
      hasCompletedLaunchFlow,
      isHydrated: true,
    });
  },
}));
