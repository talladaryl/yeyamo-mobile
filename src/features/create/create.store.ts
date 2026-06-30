import { create } from 'zustand';
import type { CreateEventForm, EventSettings, SuggestPlaceForm, StoryCreation, PublicationForm } from './types';

interface CreateStore {
  // Event creation
  eventForm: Partial<CreateEventForm>;
  eventSettings: Partial<EventSettings>;
  setEventForm: (form: Partial<CreateEventForm>) => void;
  setEventSettings: (settings: Partial<EventSettings>) => void;
  resetEventForm: () => void;

  // Place suggestion
  placeForm: Partial<SuggestPlaceForm>;
  placeStep: number;
  setPlaceForm: (form: Partial<SuggestPlaceForm>) => void;
  setPlaceStep: (step: number) => void;
  resetPlaceForm: () => void;

  // Story creation
  storyData: Partial<StoryCreation>;
  setStoryData: (data: Partial<StoryCreation>) => void;
  resetStoryData: () => void;

  // Publication creation
  publicationData: Partial<PublicationForm>;
  setPublicationData: (data: Partial<PublicationForm>) => void;
  resetPublicationData: () => void;
}

const initialEventSettings: EventSettings = {
  visibility: 'public',
  allow_strangers: true,
  allow_comments_participants_only: false,
  show_participants_list: true,
  allow_share_outside: false,
  enable_waitlist: false,
  invited_users: [],
};

export const useCreateStore = create<CreateStore>((set) => ({
  // Event
  eventForm: { share_to_feed: true, max_participants: 20 },
  eventSettings: initialEventSettings,
  setEventForm: (form) => set((state) => ({ eventForm: { ...state.eventForm, ...form } })),
  setEventSettings: (settings) => set((state) => ({ eventSettings: { ...state.eventSettings, ...settings } })),
  resetEventForm: () => set({ eventForm: { share_to_feed: true, max_participants: 20 }, eventSettings: initialEventSettings }),

  // Place
  placeForm: {},
  placeStep: 1,
  setPlaceForm: (form) => set((state) => ({ placeForm: { ...state.placeForm, ...form } })),
  setPlaceStep: (step) => set({ placeStep: step }),
  resetPlaceForm: () => set({ placeForm: {}, placeStep: 1 }),

  // Story
  storyData: { duration: 5, visibility: 'all' },
  setStoryData: (data) => set((state) => ({ storyData: { ...state.storyData, ...data } })),
  resetStoryData: () => set({ storyData: { duration: 5, visibility: 'all' } }),

  // Publication
  publicationData: { media_urls: [], media_type: 'image', caption: '' },
  setPublicationData: (data) => set((state) => ({ publicationData: { ...state.publicationData, ...data } })),
  resetPublicationData: () => set({ publicationData: { media_urls: [], media_type: 'image', caption: '' } }),
}));
