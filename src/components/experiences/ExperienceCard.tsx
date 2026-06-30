import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';

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
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-[#161616] rounded-2xl overflow-hidden mb-4"
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
        <Text className="text-white text-base font-semibold mb-1" numberOfLines={2}>
          {title}
        </Text>
        
        <View className="flex-row items-center gap-1 mb-3">
          <Icon library="ionicons" name="location-outline" size={14} color="#A1A1AA" />
          <Text className="text-[#A1A1AA] text-xs">{location}</Text>
        </View>
        
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Icon library="ionicons" name="star" size={14} color="#F59E0B" />
            <Text className="text-white text-sm font-medium">{rating.toFixed(1)}</Text>
            <Text className="text-[#A1A1AA] text-xs">({reviewsCount} avis)</Text>
          </View>
          
          <View>
            <Text className="text-[#A1A1AA] text-xs">à partir de</Text>
            <Text className="text-white text-sm font-bold">
              {priceFrom.toLocaleString()} {currency}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
