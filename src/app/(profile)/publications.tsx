// ÉCRAN 2 - Mes publications
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { PublicationGrid } from '@/components/profile/PublicationGrid';
import { useUserPublications } from '@/features/profile/useProfile';

export default function PublicationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'publications' | 'saved'>('publications');
  const { data: publications, isLoading } = useUserPublications();

  const displayedPublications = activeTab === 'publications' 
    ? publications 
    : publications?.filter((p) => p.is_saved);

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#27272A]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Mes publications</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="options-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Onglets */}
      <View className="flex-row px-4 pt-4 pb-2 border-b border-[#27272A]">
        <TouchableOpacity
          onPress={() => setActiveTab('publications')}
          className={`flex-1 pb-3 border-b-2 ${
            activeTab === 'publications' ? 'border-[#EF4444]' : 'border-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'publications' ? 'text-[#EF4444]' : 'text-[#A1A1AA]'
            }`}
          >
            Publications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('saved')}
          className={`flex-1 pb-3 border-b-2 ${
            activeTab === 'saved' ? 'border-[#EF4444]' : 'border-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'saved' ? 'text-[#EF4444]' : 'text-[#A1A1AA]'
            }`}
          >
            Enregistrés
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grille de publications */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-[#A1A1AA]">Chargement...</Text>
          </View>
        ) : displayedPublications && displayedPublications.length > 0 ? (
          <PublicationGrid
            publications={displayedPublications}
            onPressPublication={(id) => router.push(`/(post)/${id}`)}
          />
        ) : (
          <View className="flex-1 items-center justify-center py-12 px-8">
            <Ionicons name="images-outline" size={64} color="#52525B" />
            <Text className="text-white text-lg font-semibold mt-4 text-center">
              {activeTab === 'publications' ? 'Aucune publication' : 'Aucune publication enregistrée'}
            </Text>
            <Text className="text-[#A1A1AA] text-center mt-2">
              {activeTab === 'publications'
                ? 'Partagez vos moments pour qu\'ils apparaissent ici'
                : 'Enregistrez des publications pour les retrouver facilement'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
