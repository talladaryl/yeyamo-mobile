// ÉCRAN 1 - Liste des badges de l'utilisateur
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BadgeCard } from '@/components/social-graph/BadgeCard';
import { useUserBadges, useUserBadgeStats } from '@/features/social-graph/useBadges';
import type { BadgeSummary } from '@/features/social-graph/types';

export default function BadgesScreen() {
  const router = useRouter();
  const { data: badges, isLoading } = useUserBadges();
  const { data: stats } = useUserBadgeStats();

  // Séparer les badges débloqués et non débloqués
  const unlockedBadges = badges?.filter((b) => b.is_unlocked) || [];
  const lockedBadges = badges?.filter((b) => !b.is_unlocked) || [];

  // Badge principal (plus haut niveau)
  const mainBadge = unlockedBadges.sort((a, b) => b.current_level - a.current_level)[0];

  const convertToBadgeSummary = (badge: any): BadgeSummary => ({
    id: badge.id,
    name: badge.name,
    slug: badge.slug,
    icon_url: badge.icon_url,
    current_level: badge.current_level,
    max_level: badge.max_level,
    progress_percentage: Math.round((badge.current_xp / badge.next_level_xp) * 100),
    is_unlocked: badge.is_unlocked,
  });

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-[#18181B] dark:text-white text-xl font-bold">Mes badges</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="information-circle-outline" size={24} color="#A1A1AA" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats globales */}
        {stats && (
          <View className="px-4 pt-6 pb-4">
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mb-2">Niveau global</Text>
            <Text className="text-[#18181B] dark:text-white text-3xl font-bold mb-1">Niveau {stats.level}</Text>
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-base">{stats.rank}</Text>
            <View className="flex-row mt-4">
              <View className="flex-1 mr-2">
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs">Total XP</Text>
                <Text className="text-[#18181B] dark:text-white text-2xl font-bold">{stats.total_xp.toLocaleString()}</Text>
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs">Badges débloqués</Text>
                <Text className="text-[#18181B] dark:text-white text-2xl font-bold">
                  {stats.unlocked_badges}/{stats.total_badges}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Badge principal */}
        {mainBadge && (
          <View className="mx-4 mb-6 bg-gradient-to-br from-[#EF4444] to-[#DC2626] rounded-2xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-sm text-white/80">Niveau global</Text>
                <Text className="text-2xl font-bold text-white">{mainBadge.name}</Text>
                <Text className="text-lg text-white/90">Niv. {mainBadge.current_level}</Text>
              </View>
              <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center">
                <Ionicons name="map-outline" size={48} color="#FFFFFF" />
              </View>
            </View>
            <View className="bg-white/20 rounded-full h-2 overflow-hidden">
              <View
                className="h-full bg-white rounded-full"
                style={{ width: `${(mainBadge.current_xp / mainBadge.next_level_xp) * 100}%` }}
              />
            </View>
            <Text className="mt-2 text-sm text-white/90">
              {mainBadge.current_xp} / {mainBadge.next_level_xp} XP
            </Text>
          </View>
        )}

        {/* Liste des badges débloqués */}
        <View className="px-4 mb-6">
          <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-4">Mes badges</Text>
          {unlockedBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={convertToBadgeSummary(badge)}
              onPress={() => router.push(`/(social-graph)/badges/${badge.id}`)}
            />
          ))}
        </View>

        {/* Badges à débloquer */}
        {lockedBadges.length > 0 && (
          <View className="px-4 pb-8">
            <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-4">Badges à débloquer</Text>
            {lockedBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={convertToBadgeSummary(badge)}
                onPress={() => router.push(`/(social-graph)/badges/${badge.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
