import { useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { useYeyamoMediaPicker, YeyamoMediaPickerError } from '@/components/media/useYeyamoMediaPicker';
import { isVideoAsset, toMediaFormData, type PickedMediaAsset } from '@/features/media/media.utils';
import { useUploadMedia } from '@/features/post/usePost';
import { useCreateStory } from '@/features/story/useStory';

const { width, height } = Dimensions.get('window');
const imageDurations = [5, 10, 15] as const;

function StoryPreviewVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (instance) => { instance.pause(); instance.loop = true; });
  return <VideoView player={player} style={{ width, height }} contentFit="cover" nativeControls />;
}

function videoDurationSeconds(asset: PickedMediaAsset | null) {
  if (!asset || !isVideoAsset(asset) || !asset.duration) return null;
  return Math.min(60, Math.max(5, Math.ceil(asset.duration / 1000)));
}

export default function CreateStoryScreen() {
  const router = useRouter();
  const { pickFromLibrary, takePhoto } = useYeyamoMediaPicker();
  const [asset, setAsset] = useState<PickedMediaAsset | null>(null);
  const [caption, setCaption] = useState('');
  const [duration, setDuration] = useState<number>(15);
  const [error, setError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const uploadMedia = useUploadMedia();
  const createStory = useCreateStory();
  const pending = uploadMedia.isPending || createStory.isPending;
  const videoDuration = useMemo(() => videoDurationSeconds(asset), [asset]);
  const effectiveDuration = videoDuration ?? duration;

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const chooseMedia = async () => {
    if (pending) return;
    setError(null);
    try {
      const result = await pickFromLibrary({ mediaTypes: ['images', 'videos'], allowsEditing: false, quality: 0.9 });
      if (!result.cancelled && result.assets[0]) setAsset(result.assets[0]);
    } catch (caught) {
      setError(caught instanceof YeyamoMediaPickerError ? caught.message : 'Le média ne peut pas être sélectionné pour le moment.');
    }
  };

  const takePicture = async () => {
    if (pending) return;
    setError(null);
    try {
      const result = await takePhoto({ mediaTypes: ['images'], allowsEditing: true, quality: 0.9 });
      if (!result.cancelled && result.assets[0]) setAsset(result.assets[0]);
    } catch (caught) {
      setError(caught instanceof YeyamoMediaPickerError ? caught.message : 'La caméra ne peut pas être ouverte pour le moment.');
    }
  };

  const publish = async () => {
    if (!asset || pending) return;
    setError(null);
    try {
      const uploaded = await uploadMedia.mutateAsync(toMediaFormData(asset, 'story', 0));
      await createStory.mutateAsync({ mediaId: uploaded.data.id, caption: caption.trim() || undefined, durationSeconds: effectiveDuration });
      Alert.alert('Story publiée', 'Votre story est visible pendant 24 heures.', [{ text: 'Voir le Feed', onPress: () => router.replace('/(tabs)') }]);
    } catch {
      setError(uploadMedia.isError
        ? 'Le média n’a pas pu être envoyé. Vérifiez votre connexion puis réessayez.'
        : 'La story n’a pas pu être publiée. Réessayez sans changer votre média.');
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-black" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      {asset ? (
        <View className="absolute inset-0">
          {isVideoAsset(asset) ? <StoryPreviewVideo uri={asset.uri} /> : <Image source={{ uri: asset.uri }} style={{ width, height }} contentFit="cover" />}
        </View>
      ) : (
        <View className="flex-1 items-center justify-center px-10">
          <Icon name="images-outline" size={58} color="#FFFFFF" />
          <Text className="mt-5 text-center text-base font-semibold text-white">Créer une story photo ou vidéo</Text>
          <Text className="mt-2 text-center text-sm text-white/70">Choisissez un média : il sera envoyé au service média avant publication.</Text>
          <TouchableOpacity onPress={() => void chooseMedia()} className="mt-7 rounded-full bg-white px-6 py-3" accessibilityRole="button"><Text className="font-bold text-black">Choisir dans la galerie</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => void takePicture()} className="mt-3 rounded-full border border-white/60 px-6 py-3" accessibilityRole="button"><Text className="font-bold text-white">Prendre une photo</Text></TouchableOpacity>
        </View>
      )}

      <View className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4 pt-14">
        <TouchableOpacity onPress={() => router.back()} disabled={pending} className="h-11 w-11 items-center justify-center rounded-full bg-black/50" accessibilityLabel="Fermer"><Icon name="close" size={25} color="#FFFFFF" /></TouchableOpacity>
        {asset ? <TouchableOpacity onPress={() => setAsset(null)} disabled={pending} className="h-11 w-11 items-center justify-center rounded-full bg-black/50" accessibilityLabel="Retirer le média"><Icon name="trash-outline" size={22} color="#FFFFFF" /></TouchableOpacity> : null}
      </View>

      {asset ? <View className="absolute left-4 right-4 top-28"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2"><TouchableOpacity onPress={() => void chooseMedia()} disabled={pending} className="rounded-full bg-black/55 px-4 py-2"><Text className="text-xs font-bold text-white">Changer le média</Text></TouchableOpacity>{isVideoAsset(asset) ? <View className="rounded-full bg-black/55 px-4 py-2"><Text className="text-xs font-bold text-white">Vidéo · {effectiveDuration}s</Text></View> : imageDurations.map((value) => <TouchableOpacity key={value} onPress={() => setDuration(value)} disabled={pending} className="rounded-full px-4 py-2" style={{ backgroundColor: value === duration ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.55)' }}><Text className="text-xs font-bold" style={{ color: value === duration ? '#000000' : '#FFFFFF' }}>{value}s</Text></TouchableOpacity>)}</ScrollView></View> : null}

      {asset ? <SafeAreaView edges={['bottom']} className="mt-auto gap-3 px-5 pb-4"><Input value={caption} onChangeText={setCaption} placeholder="Ajouter une légende (facultatif)" maxLength={500} editable={!pending} multiline containerClassName="rounded-2xl bg-black/60 p-1" />{keyboardVisible ? <TouchableOpacity onPress={Keyboard.dismiss} className="self-end rounded-full bg-black/60 px-3 py-2" accessibilityRole="button" accessibilityLabel="Fermer le clavier"><Text className="text-xs font-bold text-white">Fermer le clavier</Text></TouchableOpacity> : null}<TouchableOpacity onPress={() => void publish()} disabled={pending} className="items-center rounded-full bg-[#EF4444] px-5 py-4" style={{ opacity: pending ? 0.65 : 1 }} accessibilityRole="button"><Text className="font-bold text-white">{pending ? 'Publication…' : 'Publier dans ma story'}</Text></TouchableOpacity></SafeAreaView> : null}

      {error ? <View className="absolute bottom-4 left-5 right-5 rounded-xl bg-red-700/95 px-4 py-3"><Text className="text-center text-sm text-white">{error}</Text></View> : null}
    </KeyboardAvoidingView>
  );
}
