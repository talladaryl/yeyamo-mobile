import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { EstablishmentCard } from '@/components/partner-dashboard/EstablishmentCard';
import { establishments } from '@/features/partner-dashboard/mockData';

export default function EstablishmentsScreen() {
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
            <Text className="text-white text-2xl font-bold">MES ÉTABLISSEMENTS</Text>
            <Text className="text-[#A1A1AA] text-sm">Gérez vos établissements</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(partner)/add-place-step1')}
          className="w-10 h-10 bg-[#EF4444] rounded-full items-center justify-center"
          activeOpacity={0.7}
        >
          <Icon library="ionicons" name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {establishments.map((establishment) => (
          <EstablishmentCard
            key={establishment.id}
            establishment={establishment}
            onPress={() => console.log('View establishment:', establishment.id)}
          />
        ))}

        <TouchableOpacity
          className="bg-[#161616] rounded-xl p-4 mb-6 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-[#EF4444] font-semibold">Voir tous les établissements</Text>
        </TouchableOpacity>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
