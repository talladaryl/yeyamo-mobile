import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InterestTagProps {
  label: string;
  onRemove: () => void;
}

export function InterestTag({ label, onRemove }: InterestTagProps) {
  return (
    <View className="flex-row items-center bg-[#27272A] rounded-full px-3 py-2">
      <Text className="text-white text-sm font-medium mr-2">{label}</Text>
      <TouchableOpacity onPress={onRemove} activeOpacity={0.7}>
        <Ionicons name="close-circle" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );
}
