// ÉCRAN 4 - Mes sorties (événements)
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EventParticipantItem } from '@/components/profile/EventParticipantItem';
import { useUserEvents } from '@/features/profile/useProfile';

export default function EventsScreen() {
  const router = useRouter();
  const { data: events, isLoading } = useUserEvents();

  const handleCreateEvent = () => {
    router.push('/(create)/event');
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#18181B] dark:text-white">Mes sorties</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste des événements */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#52525B] dark:text-[#A1A1AA]">Chargement...</Text>
        </View>
      ) : events && events.length > 0 ? (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <EventParticipantItem
              participation={item}
              onPress={() => router.push(`/(events)/${item.event.id}`)}
            />
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="calendar-outline" size={64} color="#52525B" />
          <Text className="mt-4 text-center text-lg font-semibold text-[#18181B] dark:text-white">
            Aucune sortie prévue
          </Text>
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-center mt-2">
            Rejoignez des événements pour les voir ici
          </Text>
        </View>
      )}

      {/* Bouton flottant */}
      {events && events.length > 0 && (
        <View className="absolute bottom-6 left-0 right-0 px-4">
          <TouchableOpacity
            onPress={handleCreateEvent}
            className="bg-[#EF4444] py-4 rounded-xl flex-row items-center justify-center shadow-lg"
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text className="text-white font-bold text-base ml-2">Créer une sortie</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
