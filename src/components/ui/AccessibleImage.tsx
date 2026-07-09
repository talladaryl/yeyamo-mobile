import { Image as ExpoImage, ImageSource } from 'expo-image';
import { View, Text } from 'react-native';
import { useState } from 'react';

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
        className={`bg-[#27272A] items-center justify-center ${className}`}
        accessible={true}
        accessibilityLabel={`Image non disponible: ${alt}`}
        accessibilityRole="image"
      >
        <Text className="text-[#A1A1AA] text-sm text-center px-4">
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
