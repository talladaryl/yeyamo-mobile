import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { EventCard } from '@/components/partner-dashboard/EventCard';
import { partnerEvents } from '@/features/partner-dashboard/mockData';

export default function EventsScreen() {
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
            <Text className="text-white text-2xl font-bold">MES ÉVÉNEMENTS</Text>
            <Text className="text-[#A1A1AA] text-sm">Consultez et gérez vos événements</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(partner)/add-event-step1')}
          className="w-10 h-10 bg-[#EF4444] rounded-full items-center justify-center"
          activeOpacity={0.7}
        >
          <Icon library="ionicons" name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {partnerEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onPress={() => console.log('View event:', event.id)}
          />
        ))}

        <TouchableOpacity
          className="bg-[#161616] rounded-xl p-4 mb-6 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-[#EF4444] font-semibold">Voir tous les événements</Text>
        </TouchableOpacity>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
