import { TouchableOpacity, Text, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { Category } from '@/features/explore/types';
import { useThemeStore } from '@/features/theme/theme.store';

type CategoryCardProps = {
  category: Category;
  onPress: () => void;
};

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center flex-1 min-w-[100px]"
      activeOpacity={0.7}
    >
      <View className="mb-2 h-16 w-16 items-center justify-center rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <Icon
          library={category.iconLibrary}
          name={category.icon}
          size={28}
          color="#EF4444"
        />
      </View>
      <Text className="text-center text-xs" style={{ color: colors.text }}>{category.label}</Text>
    </TouchableOpacity>
  );
}
