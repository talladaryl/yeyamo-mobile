// Carte de badge pour la liste
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BadgeSummary } from '@/features/social-graph/types';

interface BadgeCardProps {
  badge: BadgeSummary;
  onPress: () => void;
}

export function BadgeCard({ badge, onPress }: BadgeCardProps) {
  const progressPercentage = badge.progress_percentage;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white dark:bg-[#161616] rounded-xl p-4 mb-3"
      activeOpacity={0.7}
    >
      {/* Icône du badge */}
      <View className="w-14 h-14 rounded-full bg-[#F4F4F5] dark:bg-[#27272A] items-center justify-center mr-4">
        <Image
          source={{ uri: badge.icon_url }}
          className="w-10 h-10"
          resizeMode="contain"
        />
      </View>

      {/* Informations */}
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Text className="text-[#18181B] dark:text-white font-semibold text-base">{badge.name}</Text>
          {badge.current_level > 0 && (
            <View className="ml-2 bg-[#EF4444] px-2 py-0.5 rounded-full">
              <Text className="text-xs font-bold text-white">Niv. {badge.current_level}</Text>
            </View>
          )}
        </View>

        {/* Progression */}
        {badge.is_unlocked ? (
          <View className="mt-2">
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mb-1">
              {progressPercentage}% pour atteindre le niveau {badge.current_level + 1}
            </Text>
            <View className="h-2 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full overflow-hidden">
              <View
                className="h-full bg-[#EF4444] rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
          </View>
        ) : (
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-1">Badge non débloqué</Text>
        )}
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
    </TouchableOpacity>
  );
}
