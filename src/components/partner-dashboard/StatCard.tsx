import { View, Text } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { StatisticCard } from '@/features/partner-dashboard/types';

interface StatCardProps {
  stat: StatisticCard;
}

export function StatCard({ stat }: StatCardProps) {
  return (
    <View className="bg-[#EF4444] rounded-xl p-4 flex-1">
      <Text className="mb-1 text-sm text-white">
        {stat.label}
      </Text>
      <Text className="mb-1 text-3xl font-bold text-white">
        {stat.value}
      </Text>
      <View className="flex-row items-center gap-1">
        <Icon
          library="ionicons"
          name={stat.isPositive ? 'arrow-up' : 'arrow-down'}
          size={14}
          color="#FFFFFF"
        />
        <Text className="text-[#18181B] dark:text-white text-sm font-semibold">
          {stat.change}
        </Text>
      </View>
    </View>
  );
}
