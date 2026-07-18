// ÉCRAN 2 - Détail d'un badge
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBadgeDetails } from '@/features/social-graph/useBadges';
import { BadgeProgressBar } from '@/components/social-graph/BadgeProgressBar';
import { BadgeLevelItem } from '@/components/social-graph/BadgeLevelItem';
import { XPActionItem } from '@/components/social-graph/XPActionItem';
import { XP_ACTIONS } from '@/features/social-graph/mockData';

export default function BadgeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const badgeId = parseInt(id || '0', 10);
  
  const { data: badge, isLoading } = useBadgeDetails(badgeId);

  if (isLoading || !badge) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#0A0A0A] items-center justify-center">
        <Text className="text-[#18181B] dark:text-white">Chargement...</Text>
      </SafeAreaView>
    );
  }

  const currentLevelData = badge.levels.find((l) => l.level === badge.current_level);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-[#18181B] dark:text-white text-xl font-bold">{badge.name}</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-horizontal" size={24} color="#A1A1AA" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Badge Icon & Info */}
        <View className="items-center pt-8 pb-6 px-4">
          <View className="w-32 h-32 rounded-full bg-[#10B981]/20 items-center justify-center mb-4">
            <Image
              source={{ uri: badge.icon_url }}
              className="w-24 h-24"
              resizeMode="contain"
            />
          </View>
          <Text className="text-[#18181B] dark:text-white text-2xl font-bold mb-2">{badge.name}</Text>
          {currentLevelData && (
            <View className="bg-[#EF4444] px-4 py-1.5 rounded-full mb-3">
              <Text className="font-bold text-white">Niveau {badge.current_level} • {currentLevelData.name}</Text>
            </View>
          )}
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-center text-base px-4">{badge.description}</Text>
        </View>

        {/* Progression */}
        <View className="px-4 mb-8">
          <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-4">Votre progression</Text>
          <View className="bg-white dark:bg-[#161616] rounded-xl p-4">
            <BadgeProgressBar currentXP={badge.current_xp} nextLevelXP={badge.next_level_xp} />
          </View>
        </View>

        {/* Niveaux */}
        <View className="px-4 mb-8">
          <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-4">Niveaux</Text>
          <View className="bg-white dark:bg-[#161616] rounded-xl p-4">
            {badge.levels.map((level) => (
              <BadgeLevelItem
                key={level.level}
                level={level}
                isActive={level.level === badge.current_level}
              />
            ))}
          </View>
        </View>

        {/* Comment gagner des XP */}
        <View className="px-4 pb-8">
          <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-4">Comment gagner des XP ?</Text>
          <View className="bg-white dark:bg-[#161616] rounded-xl p-4">
            {XP_ACTIONS.map((action) => (
              <XPActionItem key={action.id} action={action} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
