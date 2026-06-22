import { create } from 'zustand';

interface UiState {
  // Bottom sheet / modal control
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;

  // Global loading overlay (used for full-screen transitions)
  isGlobalLoading: boolean;
  setGlobalLoading: (value: boolean) => void;

  // Active tab index hint (for programmatic tab switching)
  activeTabIndex: number;
  setActiveTabIndex: (index: number) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),

  isGlobalLoading: false,
  setGlobalLoading: (value) => set({ isGlobalLoading: value }),

  activeTabIndex: 0,
  setActiveTabIndex: (index) => set({ activeTabIndex: index }),
}));
