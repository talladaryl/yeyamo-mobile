import { TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '@/components/ui/Avatar';
import type { ColorValue } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';

type StoryRingProps = {
  uri?: string | null;
  displayName: string;
  onPress?: () => void;
  size?: number;
  isViewed?: boolean;
  showAddButton?: boolean;
};

export function StoryRing({
  uri,
  displayName,
  onPress,
  size = 68,
  isViewed = false,
  showAddButton = false,
}: StoryRingProps) {
  const colors = useThemeStore((state) => state.colors);
  const gradientColors: readonly [ColorValue, ColorValue, ...ColorValue[]] = isViewed 
    ? ['#52525B', '#52525B'] 
    : ['#EF4444', '#F59E0B', '#EF4444'];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="items-center"
    >
      <View style={{ padding: 3 }}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: size / 2,
            padding: 3,
          }}
        >
          <View
            className="items-center justify-center rounded-full"
            style={{ padding: 2, backgroundColor: colors.background }}
          >
            <Avatar uri={uri} displayName={displayName} size={size - 10} />
          </View>
        </LinearGradient>
      </View>

      {showAddButton && (
        <View className="absolute bottom-0 right-0 h-6 w-6 items-center justify-center rounded-full border-2 bg-[#EF4444]" style={{ borderColor: colors.background }}>
          <View className="w-3 h-0.5 bg-white" />
          <View className="w-0.5 h-3 bg-white absolute" />
        </View>
      )}
    </TouchableOpacity>
  );
}
