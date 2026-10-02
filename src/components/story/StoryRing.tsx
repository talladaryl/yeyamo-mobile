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
  onAddPress?: () => void;
  addButtonSize?: number;
};

export function StoryRing({
  uri,
  displayName,
  onPress,
  size = 68,
  isViewed = false,
  onAddPress,
  addButtonSize = 24,
  showAddButton = false,
}: StoryRingProps) {
  const colors = useThemeStore((state) => state.colors);
  const gradientColors: readonly [ColorValue, ColorValue, ...ColorValue[]] = isViewed 
    ? ['#52525B', '#52525B'] 
    : ['#EF4444', '#F59E0B', '#EF4444'];

  return (
    <View
      className="items-center"
    >
      <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Voir les stories de ${displayName}`}
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
      </TouchableOpacity>

      {showAddButton && (
        <TouchableOpacity onPress={onAddPress ?? onPress} className="absolute bottom-0 right-0 items-center justify-center rounded-full border-2" style={{ width: addButtonSize, height: addButtonSize, borderColor: colors.background, backgroundColor: colors.primary }} accessibilityRole="button" accessibilityLabel="Ajouter une story">
          <View className="w-3 h-0.5 bg-white" />
          <View className="w-0.5 h-3 bg-white absolute" />
        </TouchableOpacity>
      )}
    </View>
  );
}
