import { create } from 'zustand';
import type {
  BillingModel,
  CampaignObjective,
  PromotedEntityType,
} from './types';

export interface CampaignDraft {
  name: string;
  objective: CampaignObjective;
  promotedEntityType: PromotedEntityType;
  promotedEntityId: string;
  billingModel: BillingModel;
  totalBudget: string;
  dailyBudget: string;
  startAt: string;
  endAt: string;
  countryCodes: string;
  cityIds: string;
  minimumAge: string;
  maximumAge: string;
  interestIds: string;
  title: string;
  description: string;
  imageUrl: string;
  destinationUrl: string;
  callToAction: string;
}

const initialDraft: CampaignDraft = {
  name: '',
  objective: 'AWARENESS',
  promotedEntityType: 'EVENT',
  promotedEntityId: '',
  billingModel: 'CPM',
  totalBudget: '',
  dailyBudget: '',
  startAt: '',
  endAt: '',
  countryCodes: 'CM',
  cityIds: '',
  minimumAge: '',
  maximumAge: '',
  interestIds: '',
  title: '',
  description: '',
  imageUrl: '',
  destinationUrl: '',
  callToAction: '',
};

interface CampaignDraftState {
  draft: CampaignDraft;
  step: number;
  update: (values: Partial<CampaignDraft>) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

export const useCampaignDraftStore = create<CampaignDraftState>((set) => ({
  draft: initialDraft,
  step: 1,
  update: (values) => set((state) => ({ draft: { ...state.draft, ...values } })),
  setStep: (step) => set({ step: Math.max(1, Math.min(6, step)) }),
  reset: () => set({ draft: initialDraft, step: 1 }),
}));
