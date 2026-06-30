import { create } from 'zustand';
import type { AddPlaceForm, AddEventForm, PartnerStoryData, OfferForm } from './types';

interface PartnerStore {
  // Place management
  placeForm: Partial<AddPlaceForm>;
  placeStep: number;
  setPlaceForm: (form: Partial<AddPlaceForm>) => void;
  setPlaceStep: (step: number) => void;
  resetPlaceForm: () => void;

  // Event management
  eventForm: Partial<AddEventForm>;
  eventStep: number;
  setEventForm: (form: Partial<AddEventForm>) => void;
  setEventStep: (step: number) => void;
  resetEventForm: () => void;

  // Story management
  storyData: Partial<PartnerStoryData>;
  setStoryData: (data: Partial<PartnerStoryData>) => void;
  resetStoryData: () => void;

  // Offer management
  offerForm: Partial<OfferForm>;
  setOfferForm: (form: Partial<OfferForm>) => void;
  resetOfferForm: () => void;
}

export const usePartnerStore = create<PartnerStore>((set) => ({
  // Place
  placeForm: {},
  placeStep: 1,
  setPlaceForm: (form) => set((state) => ({ placeForm: { ...state.placeForm, ...form } })),
  setPlaceStep: (step) => set({ placeStep: step }),
  resetPlaceForm: () => set({ placeForm: {}, placeStep: 1 }),

  // Event
  eventForm: { ticket_price_enabled: false },
  eventStep: 1,
  setEventForm: (form) => set((state) => ({ eventForm: { ...state.eventForm, ...form } })),
  setEventStep: (step) => set({ eventStep: step }),
  resetEventForm: () => set({ eventForm: { ticket_price_enabled: false }, eventStep: 1 }),

  // Story
  storyData: { duration: 5, visibility: 'subscribers' },
  setStoryData: (data) => set((state) => ({ storyData: { ...state.storyData, ...data } })),
  resetStoryData: () => set({ storyData: { duration: 5, visibility: 'subscribers' } }),

  // Offer
  offerForm: {},
  setOfferForm: (form) => set((state) => ({ offerForm: { ...state.offerForm, ...form } })),
  resetOfferForm: () => set({ offerForm: {} }),
}));
