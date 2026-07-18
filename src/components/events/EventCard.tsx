import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

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
  const colors = useThemeStore((state) => state.colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="rounded-2xl overflow-hidden mb-4 border"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <View className="relative">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: 160 }}
            contentFit="cover"
          />
        ) : (
          <View className="w-full h-40 items-center justify-center" style={{ backgroundColor: colors.elevated }}>
            <Icon library="ionicons" name="calendar" size={48} color={colors.textSecondary} />
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
        <Text className="text-base font-semibold mb-2" style={{ color: colors.text }} numberOfLines={2}>
          {title}
        </Text>
        
        <View className="flex-row items-center gap-1 mb-1">
          <Icon library="ionicons" name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text className="text-xs" style={{ color: colors.textSecondary }}>{date}</Text>
        </View>
        
        <View className="flex-row items-center gap-1">
          <Icon library="ionicons" name="location-outline" size={14} color={colors.textSecondary} />
          <Text className="text-xs" style={{ color: colors.textSecondary }}>{location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
