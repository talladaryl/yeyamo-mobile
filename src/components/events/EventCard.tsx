import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';

interface EventCardProps {
  id: number;
  title: string;
  date: string;
  location: string;
  city: string;
  imageUrl: string | null;
  isSaved: boolean;
  onPress: () => void;
  onSavePress: () => void;
}

export function EventCard({
  title,
  date,
  location,
  city,
  imageUrl,
  isSaved,
  onPress,
  onSavePress,
}: EventCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-[#161616] rounded-2xl overflow-hidden mb-4"
    >
      <View className="relative">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: 160 }}
            contentFit="cover"
          />
        ) : (
          <View className="w-full h-40 bg-[#27272A] items-center justify-center">
            <Icon library="ionicons" name="calendar" size={48} color="#52525B" />
          </View>
        )}
        
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
        <Text className="text-white text-base font-semibold mb-2" numberOfLines={2}>
          {title}
        </Text>
        
        <View className="flex-row items-center gap-1 mb-1">
          <Icon library="ionicons" name="calendar-outline" size={14} color="#A1A1AA" />
          <Text className="text-[#A1A1AA] text-xs">{date}</Text>
        </View>
        
        <View className="flex-row items-center gap-1">
          <Icon library="ionicons" name="location-outline" size={14} color="#A1A1AA" />
          <Text className="text-[#A1A1AA] text-xs">{location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
