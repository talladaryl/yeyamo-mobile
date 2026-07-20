import { TouchableOpacity, Text, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

interface CreationOptionCardProps {
  option: {
    id: string;
    title: string;
    description: string;
    icon: string;
    iconLibrary: 'ionicons' | 'material' | 'material-community';
    color: string;
  };
  onPress: () => void;
}

export function CreationOptionCard({ option, onPress }: CreationOptionCardProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="rounded-2xl border p-4 mb-3 flex-row items-center"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <View 
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: option.color + '20' }}
      >
        <Icon
          library={option.iconLibrary}
          name={option.icon}
          size={24}
          color={option.color}
        />
      </View>
      
      <View className="flex-1">
        <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>
          {option.title}
        </Text>
        <Text className="text-xs leading-5" style={{ color: colors.textSecondary }}>
          {option.description}
        </Text>
      </View>
      
      <Icon library="ionicons" name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}
