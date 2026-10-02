import { create } from 'zustand';

type NetworkState = {
  isConnected: boolean | null;
  setConnected: (value: boolean) => void;
};

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: null,
  setConnected: (isConnected) => set({ isConnected }),
}));
