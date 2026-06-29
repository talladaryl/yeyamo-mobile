import { View, Text } from 'react-native';
import { Icon } from '@/components/ui/Icon';

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
  return (
    <View className="px-4 py-4">
      <Text className="text-white text-lg font-bold mb-4">Équipements</Text>
      
      <View className="flex-row flex-wrap gap-4">
        {amenitiesData.map((amenity, index) => (
          <View key={index} className="items-center" style={{ width: 70 }}>
            <View className="bg-[#161616] w-14 h-14 rounded-full items-center justify-center mb-2">
              <Icon
                library={amenity.library || 'ionicons'}
                name={amenity.icon}
                size={24}
                color="#EF4444"
              />
            </View>
            <Text className="text-white text-xs text-center">{amenity.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
