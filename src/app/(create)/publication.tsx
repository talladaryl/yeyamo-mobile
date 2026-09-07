import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { CTAButton } from '@/components/ui/CTAButton';
import { useCreateStore } from '@/features/create/create.store';
import { useCreatePost, useUploadMedia } from '@/features/post/usePost';
import { useCultureContents, useSubmitChallenge } from '@/features/culture/culture.hooks';
import { useThemeStore } from '@/features/theme/theme.store';

export default function CreatePublicationScreen() {
  const router = useRouter();
  const { challengeId } = useLocalSearchParams<{ challengeId?: string }>();
  const { publicationData, setPublicationData } = useCreateStore();
  const uploadMedia = useUploadMedia();
  const createPost = useCreatePost();
  const submitChallenge = useSubmitChallenge();
  const proverbs = useCultureContents({ type: 'PROVERB', size: 20 });
  const recipes = useCultureContents({ type: 'RECIPE', size: 20 });
  const colors = useThemeStore((state) => state.colors);
  const [selectedImages, setSelectedImages] = useState<string[]>(publicationData.media_urls ?? []);
  const [linkedTarget, setLinkedTarget] = useState<{ id: string; type: 'PROVERB' | 'RECIPE'; title: string } | null>(null);
  const [culturePickerVisible, setCulturePickerVisible] = useState(false);
  // L'éditeur reste non contrôlé pendant la saisie : cela évite qu'un
  // rerender du formulaire ne réinitialise le focus et ne ferme le clavier.
  const captionRef = useRef(publicationData.caption ?? '');

  const applyAssets = useCallback((assets: ImagePicker.ImagePickerAsset[]) => {
    if (!assets.length) return;
    const uris = assets.map((asset) => asset.uri);
    setSelectedImages(uris);
    setPublicationData({
      media_urls: uris,
      media_type: assets[0]?.type === 'video' ? 'video' : 'image',
    });
  }, [setPublicationData]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    ImagePicker.getPendingResultAsync().then((pending) => {
      if (pending && 'canceled' in pending && !pending.canceled && pending.assets) applyAssets(pending.assets);
    }).catch(() => undefined);
  }, [applyAssets]);

  const pickImage = async (mediaTypes: ('images' | 'videos')[] = ['images']) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Accès aux photos requis', 'Autorisez Yeyamo à accéder à vos photos et vidéos dans les réglages de l’iPhone.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.9,
      });
      if (!result.canceled && result.assets) applyAssets(result.assets);
    } catch {
      Alert.alert('Ajout impossible', 'Le sélecteur de médias n’a pas pu être ouvert. Réessayez.');
    }
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Accès à la caméra requis', 'Autorisez Yeyamo à utiliser la caméra dans les réglages.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.9 });
      if (!result.canceled && result.assets) applyAssets(result.assets);
    } catch {
      Alert.alert('Caméra indisponible', 'La caméra n’a pas pu être ouverte.');
    }
  };

  const handlePublish = async () => {
    setPublicationData({ caption: captionRef.current });
    try {
      const uploads = await Promise.all(selectedImages.map(async (uri, index) => {
        const formData = new FormData();
        formData.append('file', {
          uri,
          name: `publication-${index}.jpg`,
          type: 'image/jpeg',
        } as unknown as Blob);
        return (await uploadMedia.mutateAsync(formData)).data.id;
      }));
      const created = await createPost.mutateAsync({
        type: publicationData.media_type ?? 'image',
        caption: captionRef.current,
        media_ids: uploads,
        ...(linkedTarget ? { target_type: linkedTarget.type, target_id: linkedTarget.id } : {}),
      });
      if (challengeId) await submitChallenge.mutateAsync({ id: challengeId, postId: String(created.data.id) });
      router.back();
    } catch {
      Alert.alert('Publication impossible', 'Les médias ou la publication n’ont pas pu être envoyés.');
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Nouvelle publication',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <Icon library="ionicons" name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always" keyboardDismissMode="none" automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
        {/* Main Image Area */}
        <TouchableOpacity
          onPress={() => pickImage(['images'])}
          activeOpacity={0.9}
          className="relative"
        >
          {selectedImages.length > 0 ? (
            <Image
              source={{ uri: selectedImages[0] }}
              style={{ width: '100%', height: 400 }}
              contentFit="cover"
            />
          ) : (
            <View className="h-96 w-full items-center justify-center" style={{ backgroundColor: colors.card }}>
              <Icon library="ionicons" name="images" size={64} color="#52525B" />
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-4">
                Appuyez pour ajouter des photos
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Carousel Thumbnails */}
        {selectedImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 py-4"
            contentContainerStyle={{ gap: 8 }}
          >
            {selectedImages.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={{ width: 80, height: 80 }}
                className="rounded-lg"
                contentFit="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Caption */}
        <View className="px-4 py-4">
          <TextInput
            className="rounded-xl border px-4 py-3 text-sm"
            placeholder="Ajoutez une légende..."
            placeholderTextColor="#A1A1AA"
            defaultValue={captionRef.current}
            onChangeText={(value) => { captionRef.current = value; }}
            multiline
            maxLength={500}
            blurOnSubmit={false}
            style={{ minHeight: 100, textAlignVertical: 'top', backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}
          />
        </View>

        <View className="px-4 pb-4">
          <TouchableOpacity onPress={() => setCulturePickerVisible((visible) => !visible)} className="flex-row items-center justify-between rounded-xl border px-4 py-3" style={{ backgroundColor: colors.card, borderColor: colors.border }} accessibilityRole="button" accessibilityLabel="Associer un contenu culturel">
            <View className="flex-1"><Text className="text-sm font-semibold" style={{ color: colors.text }}>Contenu culturel (facultatif)</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{linkedTarget ? linkedTarget.title : 'Associer un proverbe ou une recette réelle'}</Text></View><Icon library="ionicons" name={culturePickerVisible ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          {culturePickerVisible ? <View className="mt-2 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.elevated }}>
            <Text className="text-xs font-bold" style={{ color: colors.textSecondary }}>PROVERBES</Text>
            {(proverbs.data?.content ?? []).map((content) => <CultureOption key={content.id} title={content.slug} selected={linkedTarget?.id === content.id} onPress={() => { setLinkedTarget({ id: content.id, type: 'PROVERB', title: content.slug }); setCulturePickerVisible(false); }} />)}
            <Text className="mt-4 text-xs font-bold" style={{ color: colors.textSecondary }}>RECETTES</Text>
            {(recipes.data?.content ?? []).map((content) => <CultureOption key={content.id} title={content.slug} selected={linkedTarget?.id === content.id} onPress={() => { setLinkedTarget({ id: content.id, type: 'RECIPE', title: content.slug }); setCulturePickerVisible(false); }} />)}
            {proverbs.isLoading || recipes.isLoading ? <Text className="mt-3 text-xs" style={{ color: colors.textSecondary }}>Chargement des contenus culturels…</Text> : null}
            {!proverbs.isLoading && !recipes.isLoading && !(proverbs.data?.content.length || recipes.data?.content.length) ? <Text className="mt-3 text-xs" style={{ color: colors.textSecondary }}>Aucun proverbe ou recette publiés n’est disponible.</Text> : null}
            {linkedTarget ? <TouchableOpacity onPress={() => setLinkedTarget(null)}><Text className="mt-4 text-sm font-semibold text-[#B91C1C]">Retirer l’association</Text></TouchableOpacity> : null}
          </View> : null}
        </View>

        {/* Action Buttons */}
        <View className="px-4 pb-6">
          <View className="flex-row justify-around rounded-xl border py-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <TouchableOpacity
              onPress={() => pickImage(['images', 'videos'])}
              className="items-center flex-1"
              activeOpacity={0.7}
            >
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
                <Icon library="ionicons" name="images" size={24} color="#EF4444" />
              </View>
              <Text className="text-xs" style={{ color: colors.text }}>Média</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={takePhoto} className="items-center flex-1" activeOpacity={0.7}>
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
                <Icon library="ionicons" name="camera" size={24} color="#EF4444" />
              </View>
              <Text className="text-xs" style={{ color: colors.text }}>Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => pickImage(['videos'])} className="items-center flex-1" activeOpacity={0.7}>
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
                <Icon library="ionicons" name="videocam" size={24} color="#EF4444" />
              </View>
              <Text className="text-xs" style={{ color: colors.text }}>Vidéo</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => pickImage(['images'])} className="items-center flex-1" activeOpacity={0.7}>
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
                <Icon library="ionicons" name="albums" size={24} color="#EF4444" />
              </View>
              <Text className="text-xs" style={{ color: colors.text }}>Carrousel</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 border-t px-4 py-4" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
        <CTAButton
          title="Publier"
          variant="primary"
          onPress={() => void handlePublish()}
          disabled={selectedImages.length === 0}
        />
      </View>
    </View>
  );
}

function CultureOption({ title, selected, onPress }: { title: string; selected: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="mt-2 rounded-lg px-3 py-2" style={{ backgroundColor: selected ? colors.primary : colors.card }}><Text numberOfLines={1} style={{ color: selected ? '#FFFFFF' : colors.text }}>{title}</Text></TouchableOpacity>;
}
