import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';
import { useYeyamoMediaPicker, YeyamoMediaPickerError } from '@/components/media/useYeyamoMediaPicker';
import { isVideoAsset, toMediaFormData, type PickedMediaAsset } from '@/features/media/media.utils';
import { useThemeStore } from '@/features/theme/theme.store';
import { useCreatePost, useUploadMedia } from '@/features/post/usePost';

const MAX_MEDIA = 10;

export default function PartnerPublicationScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { pickFromLibrary, takePhoto } = useYeyamoMediaPicker();
  const [selectedMedia, setSelectedMedia] = useState<PickedMediaAsset[]>([]);
  const [caption, setCaption] = useState('');
  const [pickerError, setPickerError] = useState<string | null>(null);
  const uploadMedia = useUploadMedia();
  const createPost = useCreatePost();
  const pending = uploadMedia.isPending || createPost.isPending;
  const canPublish = Boolean(caption.trim() || selectedMedia.length) && !pending;

  const pickMedia = async (mediaTypes: ('images' | 'videos')[] = ['images']) => {
    setPickerError(null);
    try {
      const result = await pickFromLibrary({ mediaTypes, allowsMultipleSelection: true, quality: 1 });
      if (!result.cancelled) setSelectedMedia(result.assets.slice(0, MAX_MEDIA));
    } catch (error) {
      setPickerError(error instanceof YeyamoMediaPickerError ? error.message : 'Le sélecteur de médias ne peut pas être ouvert.');
    }
  };

  const capturePhoto = async () => {
    setPickerError(null);
    try {
      const result = await takePhoto({ mediaTypes: ['images'], allowsEditing: true, quality: 1 });
      if (!result.cancelled && result.assets[0]) setSelectedMedia([result.assets[0]]);
    } catch (error) {
      setPickerError(error instanceof YeyamoMediaPickerError ? error.message : 'La caméra ne peut pas être ouverte.');
    }
  };

  const handlePublish = async () => {
    if (!canPublish) return;
    try {
      const mediaIds: (string | number)[] = [];
      for (const [index, media] of selectedMedia.entries()) {
        mediaIds.push((await uploadMedia.mutateAsync(toMediaFormData(media, 'partner-publication', index))).data.id);
      }
      const type = selectedMedia.length > 1 ? 'carousel' : selectedMedia[0] && isVideoAsset(selectedMedia[0]) ? 'video' : 'image';
      await createPost.mutateAsync({ type, caption: caption.trim() || undefined, media_ids: mediaIds });
      Alert.alert('Publication envoyée', 'Votre publication est maintenant visible dans le Feed.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch {
      Alert.alert('Publication impossible', 'Le média ou la publication n’a pas pu être envoyé. Réessayez sans changer votre sélection.');
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitle: 'Nouvelle publication',
        headerLeft: () => <TouchableOpacity onPress={() => router.back()} className="ml-4" accessibilityLabel="Fermer"><Icon name="close" size={24} color={colors.text} /></TouchableOpacity>,
        headerRight: () => <TouchableOpacity onPress={() => void handlePublish()} disabled={!canPublish} className="mr-4"><Text className="text-base font-semibold" style={{ color: colors.primary, opacity: canPublish ? 1 : 0.45 }}>{pending ? 'Envoi…' : 'Publier'}</Text></TouchableOpacity>,
      }} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => void pickMedia(['images', 'videos'])} activeOpacity={0.9} className="relative">
          {selectedMedia[0] ? isVideoAsset(selectedMedia[0]) ? <View className="h-96 items-center justify-center" style={{ backgroundColor: colors.elevated }}><Icon name="play-circle" size={58} color={colors.primary} /><Text className="mt-3 text-sm font-bold" style={{ color: colors.text }}>Aperçu vidéo</Text></View> : <Image source={{ uri: selectedMedia[0].uri }} style={{ width: '100%', height: 400 }} contentFit="cover" /> : <View className="h-96 w-full items-center justify-center" style={{ backgroundColor: colors.card }}><Icon name="images" size={64} color={colors.textSecondary} /><Text className="mt-4 text-sm" style={{ color: colors.textSecondary }}>Ajoutez une photo ou une vidéo</Text><Text className="mt-1 text-xs" style={{ color: colors.textMuted }}>ou publiez simplement votre texte.</Text></View>}
        </TouchableOpacity>

        {selectedMedia.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-4" contentContainerStyle={{ gap: 8 }}>{selectedMedia.map((media, index) => <View key={`${media.uri}-${index}`} className="relative"><Image source={{ uri: media.uri }} style={{ width: 80, height: 80 }} className="rounded-lg" contentFit="cover" /><TouchableOpacity onPress={() => setSelectedMedia((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: colors.primary }} accessibilityLabel="Retirer le média"><Icon name="close" size={15} color="#FFFFFF" /></TouchableOpacity></View>)}</ScrollView> : null}

        <View className="px-4 py-4">
          <TextInput value={caption} onChangeText={setCaption} className="rounded-xl px-4 py-3 text-sm" placeholder="Ajoutez une légende..." placeholderTextColor={colors.textMuted} multiline maxLength={500} blurOnSubmit={false} style={{ minHeight: 100, textAlignVertical: 'top', backgroundColor: colors.card, color: colors.text }} />
        </View>

        <View className="px-4 pb-6"><View className="flex-row justify-around rounded-xl py-4" style={{ backgroundColor: colors.card }}>
          <PartnerAction label="Média" icon="images" onPress={() => void pickMedia(['images', 'videos'])} color={colors.primary} />
          <PartnerAction label="Photo" icon="camera" onPress={() => void capturePhoto()} color={colors.primary} />
          <PartnerAction label="Vidéo" icon="videocam" onPress={() => void pickMedia(['videos'])} color={colors.primary} />
          <PartnerAction label="Photos" icon="albums" onPress={() => void pickMedia(['images'])} color={colors.primary} />
        </View></View>
        {pickerError ? <Text className="px-5 pb-6 text-center text-sm" style={{ color: colors.primary }}>{pickerError}</Text> : null}
      </ScrollView>
    </View>
  );
}

function PartnerAction({ label, icon, onPress, color }: { label: string; icon: string; onPress: () => void; color: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="flex-1 items-center" activeOpacity={0.7}><View className="mb-2 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name={icon} size={24} color={color} /></View><Text className="text-xs" style={{ color: colors.text }}>{label}</Text></TouchableOpacity>;
}
