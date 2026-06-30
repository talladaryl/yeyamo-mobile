// Item d'action pour gagner des XP
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { XPAction } from '@/features/social-graph/types';

interface XPActionItemProps {
  action: XPAction;
}

export function XPActionItem({ action }: XPActionItemProps) {
  return (
    <View className="flex-row items-center py-4 border-b border-[#27272A]">
      {/* Icône */}
      <View className="w-10 h-10 rounded-full bg-[#27272A] items-center justify-center mr-4">
        <Ionicons name={action.icon as any} size={20} color="#EF4444" />
      </View>

      {/* Description */}
      <View className="flex-1">
        <Text className="text-white font-medium text-base">{action.action}</Text>
        <Text className="text-[#A1A1AA] text-sm mt-0.5">{action.description}</Text>
      </View>

      {/* Récompense XP */}
      <View className="bg-[#EF4444]/10 px-3 py-1.5 rounded-full">
        <Text className="text-[#EF4444] font-bold text-sm">+{action.xp_reward} XP</Text>
      </View>
    </View>
  );
}
