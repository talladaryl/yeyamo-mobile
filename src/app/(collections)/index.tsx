// ÉCRAN 1 - Liste des collections de l'utilisateur
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { useUserCollections, usePublicCollections } from '@/features/collections/useCollections';
import type { CollectionTab } from '@/features/collections/types';

export default function CollectionsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CollectionTab>('saved');

  const { data: userCollections, isLoading: loadingUser } = useUserCollections();
  const { data: publicCollections, isLoading: loadingPublic } = usePublicCollections();

  const collections = activeTab === 'saved' ? userCollections : publicCollections;
  const isLoading = activeTab === 'saved' ? loadingUser : loadingPublic;

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#27272A]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Mes collections</Text>
          <TouchableOpacity onPress={() => router.push('/(collections)/create')} className="p-2">
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Onglets */}
      <View className="flex-row px-4 pt-4 pb-2 border-b border-[#27272A]">
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

        <TouchableOpacity
          onPress={() => setActiveTab('public')}
          className={`flex-1 pb-3 border-b-2 ${
            activeTab === 'public' ? 'border-[#EF4444]' : 'border-transparent'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'public' ? 'text-[#EF4444]' : 'text-[#A1A1AA]'
            }`}
          >
            Collections publiques
          </Text>
        </TouchableOpacity>
      </View>

      {/* Liste des collections */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#A1A1AA]">Chargement...</Text>
        </View>
      ) : collections && collections.length > 0 ? (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <View className="flex-1">
              <CollectionCard
                collection={item}
                onPress={() => router.push(`/(collections)/${item.id}`)}
              />
            </View>
          )}
          ListFooterComponent={
            activeTab === 'saved' ? (
              <TouchableOpacity
                onPress={() => router.push('/(collections)/create')}
                className="bg-[#161616] rounded-xl p-6 mt-3 border-2 border-dashed border-[#27272A] items-center"
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={40} color="#EF4444" />
                <Text className="text-white font-semibold text-base mt-2">Créer une collection</Text>
                <Text className="text-[#A1A1AA] text-sm text-center mt-1">
                  Organisez vos découvertes
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="albums-outline" size={64} color="#52525B" />
          <Text className="text-white text-lg font-semibold mt-4 text-center">
            {activeTab === 'saved' ? 'Aucune collection' : 'Aucune collection publique'}
          </Text>
          <Text className="text-[#A1A1AA] text-center mt-2">
            {activeTab === 'saved'
              ? 'Créez votre première collection pour organiser vos lieux favoris'
              : 'Explorez les collections partagées par la communauté'}
          </Text>
          {activeTab === 'saved' && (
            <TouchableOpacity
              onPress={() => router.push('/(collections)/create')}
              className="bg-[#EF4444] px-6 py-3 rounded-xl mt-6"
            >
              <Text className="text-white font-semibold">Créer une collection</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
