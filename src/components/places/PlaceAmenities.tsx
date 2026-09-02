import { View, Text } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

type Amenity = {
  icon: string;
  label: string;
  library?: 'ionicons' | 'material' | 'material-community';
};

const amenitiesData: Amenity[] = [
  { icon: 'wifi', label: 'Wi-Fi', library: 'ionicons' },
  { icon: 'car', label: 'Parking', library: 'ionicons' },
  { icon: 'water', label: 'Piscine', library: 'ionicons' },
  { icon: 'restaurant', label: 'Restaurant', library: 'ionicons' },
  { icon: 'fitness', label: 'Fitness', library: 'ionicons' },
  { icon: 'cafe', label: 'Bar', library: 'ionicons' },
];

export function PlaceAmenities() {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="px-4 py-4">
      <Text className="mb-4 text-lg font-bold" style={{ color: colors.text }}>Équipements</Text>
      
      <View className="flex-row flex-wrap gap-4">
        {amenitiesData.map((amenity, index) => (
          <View key={index} className="items-center" style={{ width: 70 }}>
            <View className="mb-2 h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
              <Icon
                library={amenity.library || 'ionicons'}
                name={amenity.icon}
                size={24}
                color="#EF4444"
              />
            </View>
            <Text className="text-center text-xs" style={{ color: colors.text }}>{amenity.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
