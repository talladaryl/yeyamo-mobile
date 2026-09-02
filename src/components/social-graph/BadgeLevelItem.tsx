// Item de niveau de badge
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BadgeLevel } from '@/features/social-graph/types';

interface BadgeLevelItemProps {
  level: BadgeLevel;
  isActive: boolean;
}

export function BadgeLevelItem({ level, isActive }: BadgeLevelItemProps) {
  return (
    <View className="flex-row items-start py-4 border-b border-[#E4E4E7] dark:border-[#27272A]">
      {/* Icône de statut */}
      <View
        className={`w-8 h-8 rounded-full items-center justify-center mr-4 ${
          level.is_unlocked ? 'bg-[#10B981]' : 'bg-[#F4F4F5] dark:bg-[#27272A]'
        }`}
      >
        {level.is_unlocked ? (
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        ) : (
          <Ionicons name="lock-closed" size={16} color="#52525B" />
        )}
      </View>

      {/* Informations */}
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text
            className={`font-semibold text-base ${
              level.is_unlocked ? 'text-[#18181B] dark:text-white' : 'text-[#52525B]'
            }`}
          >
            Niv. {level.level}
          </Text>
          <View
            className={`ml-2 px-2 py-0.5 rounded-full ${
              isActive ? 'bg-[#EF4444]' : 'bg-[#F4F4F5] dark:bg-[#27272A]'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                isActive ? 'text-white' : 'text-[#52525B] dark:text-[#A1A1AA]'
              }`}
            >
              {level.name}
            </Text>
          </View>
        </View>

        <Text
          className={`text-sm mb-1 ${
            level.is_unlocked ? 'text-[#52525B] dark:text-[#A1A1AA]' : 'text-[#52525B]'
          }`}
        >
          {level.xp_required === 0
            ? 'Niveau de départ'
            : `${level.xp_required} XP requis`}
        </Text>

        {level.reward && (
          <View className="flex-row items-center mt-2 bg-[#F4F4F5] dark:bg-[#27272A] px-3 py-2 rounded-lg">
            <Ionicons name="gift" size={16} color="#F59E0B" />
            <Text className="text-[#F59E0B] text-xs ml-2 flex-1">{level.reward}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
