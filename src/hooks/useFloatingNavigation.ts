import { useCallback, useRef } from 'react';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { create } from 'zustand';

type FloatingNavigationState = {
  isScrolling: boolean;
  setScrolling: (isScrolling: boolean) => void;
};

export const useFloatingNavigationStore = create<FloatingNavigationState>((set) => ({
  isScrolling: false,
  setScrolling: (isScrolling) => set({ isScrolling }),
}));

type ScrollHandlers = {
  onScrollBeginDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollBegin: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function useFloatingNavigationScroll(): ScrollHandlers {
  const setScrolling = useFloatingNavigationStore((state) => state.setScrolling);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearStopTimer = useCallback(() => {
    if (stopTimer.current) {
      clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }
  }, []);
  const startScrolling = useCallback((_event: NativeSyntheticEvent<NativeScrollEvent>) => {
    clearStopTimer();
    setScrolling(true);
  }, [clearStopTimer, setScrolling]);
  const stopScrolling = useCallback((_event: NativeSyntheticEvent<NativeScrollEvent>) => {
    clearStopTimer();
    setScrolling(false);
  }, [clearStopTimer, setScrolling]);
  const onScrollEndDrag = useCallback((_event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // onScrollEndDrag can fire just before momentum scrolling starts. Keep the
    // compact state briefly so a fast flick does not expand the bar mid-flight.
    clearStopTimer();
    stopTimer.current = setTimeout(() => {
      stopTimer.current = null;
      setScrolling(false);
    }, 140);
  }, [clearStopTimer, setScrolling]);

  return {
    onScrollBeginDrag: startScrolling,
    onScrollEndDrag,
    onMomentumScrollBegin: startScrolling,
    onMomentumScrollEnd: stopScrolling,
  };
}
