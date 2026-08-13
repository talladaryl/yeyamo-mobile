import { useCallback, useRef } from 'react';
import type { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { create } from 'zustand';

type FloatingNavigationState = {
  isScrolling: boolean;
  scrollDirection: 'up' | 'down' | 'idle';
  setScrolling: (isScrolling: boolean) => void;
  setScrollDirection: (direction: 'up' | 'down' | 'idle') => void;
};

export const useFloatingNavigationStore = create<FloatingNavigationState>((set) => ({
  isScrolling: false,
  scrollDirection: 'idle',
  setScrolling: (isScrolling) => set({ isScrolling }),
  setScrollDirection: (scrollDirection) => set({ scrollDirection }),
}));

type ScrollHandlers = {
  onScrollBeginDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEndDrag: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollBegin: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export function useFloatingNavigationScroll(): ScrollHandlers {
  const setScrolling = useFloatingNavigationStore((state) => state.setScrolling);
  const setScrollDirection = useFloatingNavigationStore((state) => state.setScrollDirection);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousOffset = useRef(0);
  const clearStopTimer = useCallback(() => {
    if (stopTimer.current) {
      clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }
  }, []);
  const startScrolling = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    clearStopTimer();
    previousOffset.current = event.nativeEvent.contentOffset.y;
    setScrolling(true);
  }, [clearStopTimer, setScrolling]);
  const stopScrolling = useCallback((_event: NativeSyntheticEvent<NativeScrollEvent>) => {
    clearStopTimer();
    setScrolling(false);
    setScrollDirection('idle');
  }, [clearStopTimer, setScrollDirection, setScrolling]);
  const onScrollEndDrag = useCallback((_event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // onScrollEndDrag can fire just before momentum scrolling starts. Keep the
    // compact state briefly so a fast flick does not expand the bar mid-flight.
    clearStopTimer();
    stopTimer.current = setTimeout(() => {
      stopTimer.current = null;
      setScrolling(false);
      setScrollDirection('idle');
    }, 140);
  }, [clearStopTimer, setScrollDirection, setScrolling]);
  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    const delta = offset - previousOffset.current;
    if (Math.abs(delta) > 3) {
      setScrollDirection(delta > 0 ? 'down' : 'up');
      previousOffset.current = offset;
    }
  }, [setScrollDirection]);

  return {
    onScrollBeginDrag: startScrolling,
    onScrollEndDrag,
    onMomentumScrollBegin: startScrolling,
    onMomentumScrollEnd: stopScrolling,
    onScroll,
  };
}
