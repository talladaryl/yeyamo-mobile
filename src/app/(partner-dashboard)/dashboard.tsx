import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import {
  dashboardMetrics,
  recentActivities,
} from '@/features/partner-dashboard/mockData';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="px-4 pt-3 pb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-[#18181B] dark:text-white text-2xl font-bold">DASHBOARD</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Icon library="ionicons" name="notifications-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-1">
          Vue d'ensemble de votre activité
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Metrics Cards */}
        <View className="px-4 mb-6">
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-[#EF4444] rounded-xl p-4">
              <Icon library="ionicons" name="document-text" size={24} color="#FFFFFF" />
              <Text className="mt-2 text-3xl font-bold text-white">
                {dashboardMetrics.publications}
              </Text>
              <Text className="mt-1 text-xs text-white/80">Publications</Text>
            </View>
            <View className="flex-1 bg-white dark:bg-[#161616] rounded-xl p-4">
              <Icon library="ionicons" name="eye" size={24} color="#EF4444" />
              <Text className="text-[#18181B] dark:text-white text-3xl font-bold mt-2">
                {dashboardMetrics.views}
              </Text>
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">Vues</Text>
            </View>
          </View>
          <View className="bg-white dark:bg-[#161616] rounded-xl p-4">
            <Icon library="ionicons" name="business" size={24} color="#EF4444" />
            <Text className="text-[#18181B] dark:text-white text-3xl font-bold mt-2">
              {dashboardMetrics.establishments}
            </Text>
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">Nb établissements</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-4 mb-6">
          <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-3">Activité récente</Text>
          {recentActivities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              className="bg-white dark:bg-[#161616] rounded-xl p-4 mb-2 flex-row items-center justify-between"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 bg-[#EF4444]/20 rounded-full items-center justify-center">
                  <Icon
                    library="ionicons"
                    name={activity.icon as any}
                    size={20}
                    color="#EF4444"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[#18181B] dark:text-white font-semibold text-sm">
                    {activity.title}
                  </Text>
                  <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-0.5">
                    {activity.subtitle}
                  </Text>
                </View>
              </View>
              <Text className="text-[#71717A] text-xs">
                {activity.timestamp}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="px-4 mb-6">
          <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-3">Voir les activités</Text>
          <View className="flex-row flex-wrap gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(partner-dashboard)/establishments')}
              className="flex-1 bg-white dark:bg-[#161616] rounded-xl p-4 min-w-[45%]"
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="business" size={24} color="#EF4444" />
              <Text className="text-[#18181B] dark:text-white font-semibold mt-2 text-sm">Établissements</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(partner-dashboard)/events')}
              className="flex-1 bg-white dark:bg-[#161616] rounded-xl p-4 min-w-[45%]"
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="calendar" size={24} color="#EF4444" />
              <Text className="text-[#18181B] dark:text-white font-semibold mt-2 text-sm">Événements</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(partner-dashboard)/reservations')}
              className="flex-1 bg-white dark:bg-[#161616] rounded-xl p-4 min-w-[45%]"
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="calendar-outline" size={24} color="#EF4444" />
              <Text className="text-[#18181B] dark:text-white font-semibold mt-2 text-sm">Réservations</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(partner-dashboard)/reviews')}
              className="flex-1 bg-white dark:bg-[#161616] rounded-xl p-4 min-w-[45%]"
              activeOpacity={0.8}
            >
              <Icon library="ionicons" name="star" size={24} color="#EF4444" />
              <Text className="text-[#18181B] dark:text-white font-semibold mt-2 text-sm">Avis clients</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
