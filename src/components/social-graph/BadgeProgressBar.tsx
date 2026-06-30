// Barre de progression de badge
import { View, Text } from 'react-native';

interface BadgeProgressBarProps {
  currentXP: number;
  nextLevelXP: number;
}

export function BadgeProgressBar({ currentXP, nextLevelXP }: BadgeProgressBarProps) {
  const percentage = Math.min((currentXP / nextLevelXP) * 100, 100);

  return (
    <View className="mt-4">
      <View className="flex-row justify-between mb-2">
        <Text className="text-[#A1A1AA] text-sm">Progression</Text>
        <Text className="text-white font-semibold text-sm">
          {currentXP} / {nextLevelXP} XP
        </Text>
      </View>
      <View className="h-3 bg-[#27272A] rounded-full overflow-hidden">
        <View
          className="h-full bg-gradient-to-r from-[#EF4444] to-[#F87171] rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>
      <Text className="text-[#10B981] text-xs mt-2 font-medium">
        Plus que {nextLevelXP - currentXP} XP pour atteindre le niveau suivant
      </Text>
    </View>
  );
}
