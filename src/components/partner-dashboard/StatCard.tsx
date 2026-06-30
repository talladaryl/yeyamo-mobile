import { View, Text } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { StatisticCard } from '@/features/partner-dashboard/types';

interface StatCardProps {
  stat: StatisticCard;
}

export function StatCard({ stat }: StatCardProps) {
  return (
    <View className="bg-[#EF4444] rounded-xl p-4 flex-1">
      <Text className="text-white text-sm mb-1">
        {stat.label}
      </Text>
      <Text className="text-white text-3xl font-bold mb-1">
        {stat.value}
      </Text>
      <View className="flex-row items-center gap-1">
        <Icon
          library="ionicons"
          name={stat.isPositive ? 'arrow-up' : 'arrow-down'}
          size={14}
          color="#FFFFFF"
        />
        <Text className="text-white text-sm font-semibold">
          {stat.change}
        </Text>
      </View>
    </View>
  );
}
