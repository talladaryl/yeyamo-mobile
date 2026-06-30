import { TouchableOpacity, Text, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { CreationOption } from '@/features/create/types';

interface CreationOptionCardProps {
  option: CreationOption;
  onPress: () => void;
}

export function CreationOptionCard({ option, onPress }: CreationOptionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-[#161616] rounded-2xl p-4 mb-3 flex-row items-center"
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
        <Text className="text-white text-base font-semibold mb-1">
          {option.title}
        </Text>
        <Text className="text-[#A1A1AA] text-xs">
          {option.description}
        </Text>
      </View>
      
      <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
    </TouchableOpacity>
  );
}
