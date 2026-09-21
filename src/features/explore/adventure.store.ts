import { create } from 'zustand';
import type { AdventurePlanPreview, AdventurePlanRequest } from './adventure.types';

export type { AdventureBudgetTier, AdventurePartyType } from './adventure.types';

/**
 * A preview is deliberately ephemeral. Persisted plans always come from the
 * Adventure Plan API; neither SecureStore nor this Zustand store is a plan
 * source of truth.
 */
export interface AdventurePreviewDraft {
  request: AdventurePlanRequest;
  countryName: string;
  interestLabels: string[];
  preview: AdventurePlanPreview;
}

interface AdventureState {
  previewDraft?: AdventurePreviewDraft;
  setPreviewDraft: (draft: AdventurePreviewDraft) => void;
  clearPreviewDraft: () => void;
}

export const useAdventureStore = create<AdventureState>((set) => ({
  previewDraft: undefined,
  setPreviewDraft: (previewDraft) => set({ previewDraft }),
  clearPreviewDraft: () => set({ previewDraft: undefined }),
}));
