import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

interface ExperienceCardProps {
  id: number;
  title: string;
  location: string;
  rating: number;
  reviewsCount: number;
  priceFrom: number;
  currency: string;
  imageUrl: string;
  isSaved: boolean;
  onPress: () => void;
  onSavePress: () => void;
}

export function ExperienceCard({
  title,
  location,
  rating,
  reviewsCount,
  priceFrom,
  currency,
  imageUrl,
  isSaved,
  onPress,
  onSavePress,
}: ExperienceCardProps) {
  const colors = useThemeStore((state) => state.colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="rounded-2xl overflow-hidden mb-4 border"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <View className="relative">
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: 180 }}
          contentFit="cover"
        />
        
        <TouchableOpacity
          onPress={onSavePress}
          className="absolute top-3 right-3 bg-black/60 w-9 h-9 rounded-full items-center justify-center"
          activeOpacity={0.7}
        >
          <Icon
            library="ionicons"
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      <View className="p-4">
        <Text className="text-base font-semibold mb-1" style={{ color: colors.text }} numberOfLines={2}>
          {title}
        </Text>
        
        <View className="flex-row items-center gap-1 mb-3">
          <Icon library="ionicons" name="location-outline" size={14} color={colors.textSecondary} />
          <Text className="text-xs" style={{ color: colors.textSecondary }}>{location}</Text>
        </View>
        
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="star" size={14} color="#F59E0B" />
            <Text className="text-sm font-medium" style={{ color: colors.text }}>{rating.toFixed(1)}</Text>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>({reviewsCount} avis)</Text>
          </View>
          
          <View>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>à partir de</Text>
            <Text className="text-sm font-bold" style={{ color: colors.text }}>
              {priceFrom.toLocaleString()} {currency}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
