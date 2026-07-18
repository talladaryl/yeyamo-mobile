// ÉCRAN 4 - Ajouter un lieu à une collection
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useCollectionSummaries, useAddPlaceToCollection } from '@/features/collections/useCollections';

export default function AddToCollectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ placeId?: string; placeName?: string; placeImage?: string }>();
  
  const placeId = parseInt(params.placeId || '0', 10);
  const placeName = params.placeName || 'La Falaise Resort';
  const placeImage = params.placeImage || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400';

  const { data: collections, isLoading } = useCollectionSummaries();
  const addToCollection = useAddPlaceToCollection();

  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!selectedCollectionId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une collection');
      return;
    }

    setIsSubmitting(true);
    try {
      await addToCollection.mutateAsync({
        collection_id: selectedCollectionId,
        place_id: placeId,
      });

      Alert.alert('Succès', 'Lieu ajouté à la collection', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le lieu à la collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting}>
            <Text className="text-[#EF4444] text-base font-semibold">Annuler</Text>
          </TouchableOpacity>
          <Text className="text-[#18181B] dark:text-white text-xl font-bold">Enregistrer</Text>
          <TouchableOpacity onPress={() => router.push('/(collections)/create')} disabled={isSubmitting}>
            <Text className="text-[#EF4444] text-base font-semibold">Nouveau</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Contexte du lieu */}
        <View className="px-4 py-4 border-b border-[#E4E4E7] dark:border-[#27272A]">
          <View className="flex-row items-center bg-white dark:bg-[#161616] rounded-xl p-3">
            <Image source={{ uri: placeImage }} className="w-16 h-16 rounded-lg" />
            <View className="flex-1 ml-3">
              <Text className="text-[#18181B] dark:text-white font-semibold text-base">{placeName}</Text>
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm">Hôtel & Resort • Kribi</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="text-[#18181B] dark:text-white text-sm ml-1">4.8</Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm ml-1">(208 avis)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Liste des collections */}
        <View className="px-4 py-4">
          <Text className="text-[#18181B] dark:text-white font-semibold text-lg mb-4">Choisir une collection</Text>

          {isLoading ? (
            <View className="py-12">
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-center">Chargement...</Text>
            </View>
          ) : collections && collections.length > 0 ? (
            collections.map((collection) => (
              <TouchableOpacity
                key={collection.id}
                onPress={() => setSelectedCollectionId(collection.id)}
                className="flex-row items-center py-4 border-b border-[#E4E4E7] dark:border-[#27272A]"
                activeOpacity={0.7}
              >
                {/* Image de la collection */}
                <View className="w-12 h-12 rounded-lg overflow-hidden mr-3">
                  {collection.cover_image_url ? (
                    <Image
                      source={{ uri: collection.cover_image_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-[#F4F4F5] dark:bg-[#27272A] items-center justify-center">
                      <Ionicons name="images-outline" size={20} color="#52525B" />
                    </View>
                  )}
                </View>

                {/* Informations */}
                <View className="flex-1">
                  <Text className="text-[#18181B] dark:text-white font-semibold text-base">{collection.name}</Text>
                  <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm">
                    {collection.places_count} {collection.places_count > 1 ? 'lieux' : 'lieu'}
                  </Text>
                </View>

                {/* Radio button */}
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    selectedCollectionId === collection.id
                      ? 'border-[#EF4444] bg-[#EF4444]'
                      : 'border-[#52525B]'
                  }`}
                >
                  {selectedCollectionId === collection.id && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center py-12">
              <Ionicons name="albums-outline" size={64} color="#52525B" />
              <Text className="text-[#18181B] dark:text-white text-lg font-semibold mt-4">Aucune collection</Text>
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-center mt-2 px-8">
                Créez votre première collection
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(collections)/create')}
                className="bg-[#EF4444] px-6 py-3 rounded-xl mt-6"
              >
                <Text className="font-semibold text-white">Créer une collection</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bouton Enregistrer fixé en bas */}
      {collections && collections.length > 0 && (
        <View className="px-4 py-4 border-t border-[#E4E4E7] dark:border-[#27272A]">
          <TouchableOpacity
            onPress={handleSave}
            disabled={!selectedCollectionId || isSubmitting}
            className={`py-4 rounded-xl ${
              !selectedCollectionId || isSubmitting ? 'bg-[#F4F4F5] dark:bg-[#27272A]' : 'bg-[#EF4444]'
            }`}
          >
            <Text className="text-center text-base font-semibold text-white">
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
