import { View, Text, TouchableOpacity } from 'react-native';

type StatItem = {
  label: string;
  value: string | number;
  onPress?: () => void;
};

type StatsRowProps = {
  stats: StatItem[];
};

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <View className="flex-row items-center justify-around py-4">
      {stats.map((stat, index) => {
        const content = (
          <View className="items-center" key={index}>
            <Text className="text-white text-lg font-bold">{stat.value}</Text>
            <Text className="text-[#A1A1AA] text-xs mt-1">{stat.label}</Text>
          </View>
        );

        return stat.onPress ? (
          <TouchableOpacity key={index} onPress={stat.onPress} activeOpacity={0.7}>
            {content}
          </TouchableOpacity>
        ) : (
          content
        );
      })}
    </View>
  );
}
