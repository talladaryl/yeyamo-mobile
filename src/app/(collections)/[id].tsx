// ÉCRAN 2 - Détail d'une collection
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CollectionPlaceItem } from '@/components/collections/CollectionPlaceItem';
import {
  useCollection,
  useDeleteCollection,
  useUpdatePlaceInCollection,
} from '@/features/collections/useCollections';
import type { EntityId } from '@/types/api.types';

export default function CollectionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const collectionId = id || '';

  const { data: collection, isLoading } = useCollection(collectionId);
  const deleteCollection = useDeleteCollection();
  const updatePlace = useUpdatePlaceInCollection();

  const handleShare = async () => {
    if (!collection) return;
    await Share.share({
      message: `${collection.name} - ${collection.places_count} lieu${collection.places_count > 1 ? 'x' : ''} sur Yeyamo`,
    });
  };

  const handleEdit = () => {
    router.push('/(collections)/create');
  };

  const handleAddPlace = () => {
    router.push('/(explore)/places');
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la collection',
      'Êtes-vous sûr de vouloir supprimer cette collection ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteCollection.mutate(collectionId, {
              onSuccess: () => {
                router.back();
              },
            });
          },
        },
      ]
    );
  };

  const handleTogglePriority = (placeId: EntityId, isPriority: boolean, note?: string) => {
    updatePlace.mutate(
      { collectionId, placeId, isPriority: !isPriority, note },
      {
        onError: () =>
          Alert.alert('Mise à jour impossible', 'La priorité du lieu n’a pas pu être enregistrée.'),
      },
    );
  };

  if (isLoading || !collection) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#0A0A0A] items-center justify-center">
        <Text className="text-[#18181B] dark:text-white">Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-[#18181B] dark:text-white text-xl font-bold" numberOfLines={1} style={{ flex: 1, marginHorizontal: 16 }}>
            {collection.name}
          </Text>
          <TouchableOpacity onPress={handleDelete} className="p-2">
            <Ionicons name="ellipsis-horizontal" size={24} color="#A1A1AA" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Image de couverture */}
        {collection.cover_image_url ? (
          <Image
            source={{ uri: collection.cover_image_url }}
            className="w-full h-48"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-48 bg-[#F4F4F5] dark:bg-[#27272A] items-center justify-center">
            <Ionicons name="images-outline" size={64} color="#52525B" />
          </View>
        )}

        {/* Informations & Actions */}
        <View className="px-4 py-4 border-b border-[#E4E4E7] dark:border-[#27272A]">
          <Text className="text-[#18181B] dark:text-white text-2xl font-bold mb-1">{collection.name}</Text>
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-base mb-3">
            {collection.places_count} {collection.places_count > 1 ? 'lieux' : 'lieu'}
          </Text>

          {collection.description && (
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mb-4">{collection.description}</Text>
          )}

          {/* Boutons d'action */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleShare}
              className="flex-1 bg-white dark:bg-[#161616] py-3 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              <Text className="text-[#18181B] dark:text-white font-semibold ml-2">Partager</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEdit}
              className="flex-1 bg-white dark:bg-[#161616] py-3 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              <Text className="text-[#18181B] dark:text-white font-semibold ml-2">Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAddPlace}
              className="bg-[#EF4444] px-4 py-3 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text className="ml-1 font-semibold text-white">Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Liste des lieux */}
        <View className="px-4 py-4">
          {collection.places && collection.places.length > 0 ? (
            collection.places.map((place) => (
              <CollectionPlaceItem
                key={place.id}
                place={place}
                onPress={() => router.push(`/(places)/${place.id}`)}
                onTogglePriority={() => handleTogglePriority(place.id, !!place.is_priority, place.note)}
              />
            ))
          ) : (
            <View className="items-center py-12">
              <Ionicons name="location-outline" size={64} color="#52525B" />
              <Text className="text-[#18181B] dark:text-white text-lg font-semibold mt-4">Aucun lieu</Text>
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-center mt-2 px-8">
                Ajoutez des lieux à cette collection pour les retrouver facilement
              </Text>
              <TouchableOpacity
                onPress={handleAddPlace}
                className="bg-[#EF4444] px-6 py-3 rounded-xl mt-6"
              >
                <Text className="font-semibold text-white">Ajouter un lieu</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
