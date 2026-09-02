import { create } from 'zustand';

type PassportStore = {
  claimedMissionIds: string[];
  claimMission: (id: string) => void;
};

export const usePassportStore = create<PassportStore>((set) => ({
  claimedMissionIds: [],
  claimMission: (id) => set((state) => state.claimedMissionIds.includes(id) ? state : { claimedMissionIds: [...state.claimedMissionIds, id] }),
}));
