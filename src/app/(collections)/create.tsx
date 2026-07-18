// ÉCRAN 3 - Créer une nouvelle collection
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { VisibilityPicker } from '@/components/collections/VisibilityPicker';
import { useCreateCollection } from '@/features/collections/useCollections';
import type { Collection } from '@/features/collections/types';

export default function CreateCollectionScreen() {
  const router = useRouter();
  const createCollection = useCreateCollection();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string | undefined>();
  const [visibility, setVisibility] = useState<Collection['visibility']>('private');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour la collection');
      return;
    }

    setIsSubmitting(true);
    try {
      await createCollection.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        cover_image_url: coverImage,
        visibility,
      });

      router.back();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la collection');
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
          <Text className="text-[#18181B] dark:text-white text-xl font-bold">Nouvelle collection</Text>
          <TouchableOpacity onPress={handleCreate} disabled={isSubmitting || !name.trim()}>
            <Text
              className={`text-base font-semibold ${
                isSubmitting || !name.trim() ? 'text-[#52525B]' : 'text-[#EF4444]'
              }`}
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Photo de couverture */}
          <View className="mb-6">
            <Text className="text-[#18181B] dark:text-white font-semibold text-base mb-3">Photo (optionnel)</Text>
            <TouchableOpacity
              onPress={handlePickImage}
              className="bg-white dark:bg-[#161616] rounded-xl h-40 items-center justify-center border-2 border-dashed border-[#E4E4E7] dark:border-[#27272A]"
              activeOpacity={0.7}
            >
              {coverImage ? (
                <Image source={{ uri: coverImage }} className="w-full h-full rounded-xl" />
              ) : (
                <>
                  <Ionicons name="camera" size={40} color="#52525B" />
                  <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-2">Ajoutez une photo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Nom de la collection */}
          <View className="mb-6">
            <Text className="text-[#18181B] dark:text-white font-semibold text-base mb-3">Nom de la collection</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Restaurants à tester"
              placeholderTextColor="#52525B"
              maxLength={50}
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white px-4 py-3 rounded-xl"
            />
            <Text className="text-[#52525B] text-xs mt-2 text-right">{name.length}/50</Text>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-[#18181B] dark:text-white font-semibold text-base mb-3">Description (optionnelle)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez votre collection..."
              placeholderTextColor="#52525B"
              maxLength={120}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white px-4 py-3 rounded-xl"
              style={{ minHeight: 80 }}
            />
            <Text className="text-[#52525B] text-xs mt-2 text-right">{description.length}/120</Text>
          </View>

          {/* Visibilité */}
          <View className="mb-6">
            <VisibilityPicker value={visibility} onChange={setVisibility} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
