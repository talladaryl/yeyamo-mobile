import { TouchableOpacity, Text } from 'react-native';

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export function FilterButton({ label, isActive, onPress }: FilterButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`px-4 py-2 rounded-full mr-2 ${
        isActive ? 'bg-[#EF4444]' : 'bg-[#161616]'
      }`}
    >
      <Text
        className={`text-sm font-medium ${
          isActive ? 'text-white' : 'text-[#A1A1AA]'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
