import { useState } from 'react';
import { Alert, Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { useCreateStory, useUploadMedia } from '@/features/post/usePost';

const { width, height } = Dimensions.get('window');
const durations = [5, 10, 15] as const;

export default function CreateStoryScreen() {
  const router = useRouter();
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [duration, setDuration] = useState<number>(15);
  const uploadMedia = useUploadMedia();
  const createStory = useCreateStory();
  const pending = uploadMedia.isPending || createStory.isPending;

  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Accès requis', 'Autorisez la galerie pour créer une story.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.9 });
    if (!result.canceled && result.assets[0]) setAsset(result.assets[0]);
  };

  const publish = async () => {
    if (!asset || pending) return;
    try {
      const form = new FormData();
      form.append('file', {
        uri: asset.uri,
        name: asset.fileName ?? 'story.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      } as unknown as Blob);
      const uploaded = await uploadMedia.mutateAsync(form);
      await createStory.mutateAsync({ mediaId: uploaded.data.id, durationSeconds: duration });
      router.back();
    } catch {
      Alert.alert('Publication impossible', 'La story n’a pas pu être envoyée. Vérifiez votre connexion puis réessayez.');
    }
  };

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      {asset ? (
        <Image source={{ uri: asset.uri }} style={{ width, height }} contentFit="cover" />
      ) : (
        <TouchableOpacity onPress={() => void pickMedia()} className="flex-1 items-center justify-center px-10" activeOpacity={0.9} accessibilityRole="button" accessibilityLabel="Choisir une image pour la story">
          <Icon name="image-outline" size={58} color="#FFFFFF" />
          <Text className="mt-5 text-center text-base font-semibold text-white">Choisir une image</Text>
          <Text className="mt-2 text-center text-sm text-white/70">Votre fichier sera envoyé au service média avant publication.</Text>
        </TouchableOpacity>
      )}

      <View className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4 pt-14">
        <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-black/50" accessibilityLabel="Fermer">
          <Icon name="close" size={25} color="#FFFFFF" />
        </TouchableOpacity>
        {asset ? <TouchableOpacity onPress={() => setAsset(null)} disabled={pending} className="h-11 w-11 items-center justify-center rounded-full bg-black/50" accessibilityLabel="Supprimer l’image">
          <Icon name="trash-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity> : null}
      </View>

      {asset ? <View className="absolute left-0 right-0 top-28 items-center"><View className="flex-row rounded-full bg-black/50 p-1">{durations.map((value) => <TouchableOpacity key={value} onPress={() => setDuration(value)} disabled={pending} className="rounded-full px-4 py-2" style={{ backgroundColor: value === duration ? 'rgba(255,255,255,0.24)' : 'transparent' }}><Text className="text-xs font-bold text-white">{value}s</Text></TouchableOpacity>)}</View></View> : null}

      {asset ? <View className="absolute bottom-0 left-0 right-0 px-5 pb-12"><TouchableOpacity onPress={() => void publish()} disabled={pending} className="items-center rounded-full bg-[#EF4444] px-5 py-4" style={{ opacity: pending ? 0.65 : 1 }}><Text className="font-bold text-white">{pending ? 'Publication…' : 'Publier dans ma story'}</Text></TouchableOpacity></View> : null}
    </View>
  );
}
