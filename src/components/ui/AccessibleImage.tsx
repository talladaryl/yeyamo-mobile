import { Image as ExpoImage, ImageSource } from 'expo-image';
import { View, Text } from 'react-native';
import { useState } from 'react';
import { useThemeStore } from '@/features/theme/theme.store';

interface AccessibleImageProps {
  source: ImageSource;
  alt: string;
  className?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  priority?: 'low' | 'normal' | 'high';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Image accessible avec alt text et fallback
 */
export function AccessibleImage({
  source,
  alt,
  className = '',
  contentFit = 'cover',
  priority = 'normal',
  onLoad,
  onError,
}: AccessibleImageProps) {
  const colors = useThemeStore((state) => state.colors);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  if (hasError) {
    return (
      <View
        className={`items-center justify-center ${className}`}
        style={{ backgroundColor: colors.elevated }}
        accessible={true}
        accessibilityLabel={`Image non disponible: ${alt}`}
        accessibilityRole="image"
      >
        <Text className="px-4 text-center text-sm" style={{ color: colors.textSecondary }}>
          Image non disponible
        </Text>
      </View>
    );
  }

  return (
    <ExpoImage
      source={source}
      contentFit={contentFit}
      priority={priority}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      accessible={true}
      accessibilityLabel={alt}
      accessibilityRole="image"
      accessibilityIgnoresInvertColors={true}
    />
  );
}
