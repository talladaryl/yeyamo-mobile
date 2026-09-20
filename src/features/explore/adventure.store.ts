import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type AdventurePartyType = 'SOLO' | 'FAMILY' | 'FRIENDS' | 'COUPLE';
export type AdventureBudgetTier = 'STANDARD' | 'MEDIUM' | 'PREMIUM' | 'CUSTOM';

/**
 * A local draft only. Suggestions are not fabricated while the itinerary API
 * is unavailable; see EXPLORE.md for the server contract.
 */
export interface AdventureDraft {
  id: string;
  createdAt: string;
  countryCode: string;
  countryName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  partyType: AdventurePartyType;
  interestCodes: string[];
  interestLabels: string[];
  budgetTier: AdventureBudgetTier;
  minimumBudget?: number;
  maximumBudget?: number;
  currencyCode?: string;
}

interface AdventureState {
  draft?: AdventureDraft;
  plans: AdventureDraft[];
  plansHydrated: boolean;
  hydratePlans: () => Promise<void>;
  setDraft: (draft: AdventureDraft) => void;
  savePlan: (plan: AdventureDraft) => Promise<void>;
  clearDraft: () => void;
  removePlan: (planId: string) => void;
}

const STORAGE_KEY = 'yeyamo-adventure-plans-v1';

function persistPlans(plans: AdventureDraft[]) {
  return SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(plans));
}

export const useAdventureStore = create<AdventureState>((set, get) => ({
  draft: undefined,
  plans: [],
  plansHydrated: false,
  hydratePlans: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        set((state) => ({
          plans: [...state.plans, ...parsed]
            .filter((plan, index, all): plan is AdventureDraft => Boolean(plan?.id) && all.findIndex((candidate) => candidate?.id === plan.id) === index)
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
          plansHydrated: true,
        }));
        return;
      }
    } catch {
      // A corrupted local plan must not prevent creating a new adventure.
    }
    set({ plansHydrated: true });
  },
  // A draft is only a preview. It becomes a saved planning after the user
  // explicitly confirms it from the planning screen.
  setDraft: (draft) => set({ draft }),
  savePlan: async (plan) => {
    const plans = [plan, ...get().plans.filter((savedPlan) => savedPlan.id !== plan.id)];
    await persistPlans(plans);
    set({ plans });
  },
  clearDraft: () => set({ draft: undefined }),
  removePlan: (planId) => set((state) => {
    const plans = state.plans.filter((plan) => plan.id !== planId);
    void persistPlans(plans);
    return { plans, draft: state.draft?.id === planId ? undefined : state.draft };
  }),
}));
