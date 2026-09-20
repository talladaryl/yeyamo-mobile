import { create } from 'zustand';

interface ExploreLocationState {
  selectedRegionId?: number;
  setSelectedRegionId: (regionId?: number) => void;
}

export const useExploreLocationStore = create<ExploreLocationState>((set) => ({
  selectedRegionId: undefined,
  setSelectedRegionId: (selectedRegionId) => set({ selectedRegionId }),
}));
