import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Hook pour gérer l'accessibilité de l'application
 */
export function useAccessibility() {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  const [isReduceTransparencyEnabled, setIsReduceTransparencyEnabled] = useState(false);

  useEffect(() => {
    // Vérifier si un lecteur d'écran est actif
    AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      setIsScreenReaderEnabled(enabled);
    });

    // Vérifier si "réduire les animations" est actif
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setIsReduceMotionEnabled(enabled);
    });

    // Vérifier si "réduire la transparence" est actif
    AccessibilityInfo.isReduceTransparencyEnabled().then((enabled) => {
      setIsReduceTransparencyEnabled(enabled);
    });

    // Écouter les changements
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled
    );

    const reduceTransparencyListener = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setIsReduceTransparencyEnabled
    );

    return () => {
      screenReaderListener.remove();
      reduceMotionListener.remove();
      reduceTransparencyListener.remove();
    };
  }, []);

  /**
   * Annoncer un message au lecteur d'écran
   */
  const announce = (message: string) => {
    if (isScreenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  };

  /**
   * Obtenir la durée d'animation appropriée selon les préférences
   */
  const getAnimationDuration = (defaultDuration: number): number => {
    return isReduceMotionEnabled ? 0 : defaultDuration;
  };

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    isReduceTransparencyEnabled,
    announce,
    getAnimationDuration,
  };
}
