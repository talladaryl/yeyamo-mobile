// ÉCRAN 5 - Mes réservations
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ReservationCard } from '@/components/profile/ReservationCard';
import { useUserReservations } from '@/features/profile/useProfile';

export default function ReservationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'confirmed' | 'pending'>('confirmed');
  const { data: reservations, isLoading } = useUserReservations();

  const filteredReservations = reservations?.filter(
    (r) => r.status === activeTab || (activeTab === 'confirmed' && r.status === 'confirmed')
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#27272A]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Mes réservations</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Onglets */}
      <View className="flex-row px-4 pt-4 pb-2 border-b border-[#27272A]">
        <TouchableOpacity
          onPress={() => setActiveTab('confirmed')}
          className={`flex-1 pb-3 border-b-2 ${
            activeTab === 'confirmed' ? 'border-[#EF4444]' : 'border-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'confirmed' ? 'text-[#EF4444]' : 'text-[#A1A1AA]'
            }`}
          >
            Confirmées
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('pending')}
          className={`flex-1 pb-3 border-b-2 ${
            activeTab === 'pending' ? 'border-[#EF4444]' : 'border-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'pending' ? 'text-[#EF4444]' : 'text-[#A1A1AA]'
            }`}
          >
            En attente
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des réservations */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#A1A1AA]">Chargement...</Text>
        </View>
      ) : filteredReservations && filteredReservations.length > 0 ? (
        <FlatList
          data={filteredReservations}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <ReservationCard
              reservation={item}
              onPress={() => router.push(`/(places)/${item.place.id}`)}
            />
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="calendar-outline" size={64} color="#52525B" />
          <Text className="text-white text-lg font-semibold mt-4 text-center">
            {activeTab === 'confirmed' ? 'Aucune réservation confirmée' : 'Aucune réservation en attente'}
          </Text>
          <Text className="text-[#A1A1AA] text-center mt-2">
            Réservez des lieux pour qu'ils apparaissent ici
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
