import { View, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');
const imageSize = (width - 24 - 8) / 3; // 3 columns with gaps and padding

type PlacePhotoGridProps = {
  photos: string[];
  onPhotoPress?: (index: number) => void;
};

export function PlacePhotoGrid({ photos, onPhotoPress }: PlacePhotoGridProps) {
  // Show only first 6 photos in grid
  const displayPhotos = photos.slice(0, 6);

  return (
    <View className="px-4 py-4">
      <View className="flex-row flex-wrap gap-2">
        {displayPhotos.map((photo, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onPhotoPress?.(index)}
            activeOpacity={0.9}
            style={{ width: imageSize, height: imageSize }}
          >
            <Image
              source={{ uri: photo }}
              style={{ width: '100%', height: '100%', borderRadius: 8 }}
              contentFit="cover"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
