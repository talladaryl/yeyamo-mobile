import { TouchableOpacity, Text, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { Category } from '@/features/explore/types';

type CategoryCardProps = {
  category: Category;
  onPress: () => void;
};

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center flex-1 min-w-[100px]"
      activeOpacity={0.7}
    >
      <View className="bg-[#161616] w-16 h-16 rounded-2xl items-center justify-center mb-2">
        <Icon
          library={category.iconLibrary}
          name={category.icon}
          size={28}
          color="#EF4444"
        />
      </View>
      <Text className="text-white text-xs text-center">{category.label}</Text>
    </TouchableOpacity>
  );
}
