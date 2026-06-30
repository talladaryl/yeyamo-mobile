import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { StatCard } from '@/components/partner-dashboard/StatCard';
import { statisticCards, trafficSources } from '@/features/partner-dashboard/mockData';

export default function StatisticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="px-4 pt-3 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-2xl font-bold">STATISTIQUES</Text>
            <Text className="text-[#A1A1AA] text-sm">Analysez vos performances</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* Stat Cards */}
        <View className="flex-row gap-3 mb-6">
          {statisticCards.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </View>

        {/* Evolution Chart */}
        <View className="bg-[#161616] rounded-xl p-4 mb-6">
          <Text className="text-white font-semibold text-base mb-4">Évolution des vues</Text>
          <View className="h-40 items-center justify-center">
            <Icon library="ionicons" name="stats-chart" size={48} color="#EF4444" />
            <Text className="text-[#A1A1AA] text-xs mt-2">Graphique en évolution</Text>
          </View>
        </View>

        {/* Traffic Sources */}
        <View className="bg-[#161616] rounded-xl p-4 mb-6">
          <Text className="text-white font-semibold text-base mb-4">Sources de trafic</Text>
          
          {/* Donut Chart Placeholder */}
          <View className="items-center mb-4">
            <View className="w-32 h-32 rounded-full border-8 border-[#EF4444] items-center justify-center">
              <Text className="text-white text-2xl font-bold">100%</Text>
            </View>
          </View>

          {/* Legend */}
          <View className="gap-2">
            {trafficSources.map((source, index) => (
              <View key={index} className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <Text className="text-[#E5E5E5] text-sm">{source.name}</Text>
                </View>
                <Text className="text-white font-semibold text-sm">
                  {source.percentage}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          className="bg-[#161616] rounded-xl p-4 mb-6 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-[#EF4444] font-semibold">Voir rapport complet</Text>
        </TouchableOpacity>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
