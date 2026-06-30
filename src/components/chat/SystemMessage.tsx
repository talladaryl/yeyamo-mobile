import { View, Text } from 'react-native';

interface SystemMessageProps {
  message: string;
}

export function SystemMessage({ message }: SystemMessageProps) {
  return (
    <View className="items-center py-2">
      <View className="bg-[#27272A] rounded-full px-4 py-2 max-w-[80%]">
        <Text className="text-[#A1A1AA] text-xs text-center italic">
          {message}
        </Text>
      </View>
    </View>
  );
}
