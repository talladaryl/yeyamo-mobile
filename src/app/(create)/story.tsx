import { useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { useYeyamoMediaPicker, YeyamoMediaPickerError } from '@/components/media/useYeyamoMediaPicker';
import { YeyamoImageFilterEditor } from '@/components/media/YeyamoImageFilterEditor';
import { isVideoAsset, toMediaFormData, type PickedMediaAsset } from '@/features/media/media.utils';
import { useUploadMedia } from '@/features/post/usePost';
import { useCreateStory } from '@/features/story/useStory';
import type { StoryCaptionFont, StoryCaptionStyle } from '@/features/story/types';
import { normalizeApiError } from '@/services/api/errors';
import { createIdempotencyKey } from '@/services/api/contracts';
import { traceStoryRuntime } from '@/features/social/social.runtime-trace';

const { width, height } = Dimensions.get('window');
const imageDurations = [5, 10, 15] as const;

const storyFontOptions: { id: StoryCaptionFont; label: string }[] = [
  { id: 'SYSTEM', label: 'Systeme' },
  { id: 'SERIF', label: 'Serif' },
  { id: 'MONOSPACE', label: 'Mono' },
  { id: 'SANS_SERIF', label: 'Sans' },
  { id: 'CONDENSED', label: 'Condense' },
];
const defaultCaptionStyle: StoryCaptionStyle = { font_family: 'SYSTEM', bold: false, italic: false, underline: false, strikethrough: false };

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
  const { pickFromLibrary, captureFromCamera } = useYeyamoMediaPicker();
  const [asset, setAsset] = useState<PickedMediaAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<PickedMediaAsset | null>(null);
  const [caption, setCaption] = useState('');
  const [duration, setDuration] = useState<number>(15);
  const [captionStyle, setCaptionStyle] = useState<StoryCaptionStyle>(defaultCaptionStyle);
  const [error, setError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [uploadedMediaId, setUploadedMediaId] = useState<string | null>(null);
  const [submissionKey, setSubmissionKey] = useState<string | null>(null);
  const uploadMedia = useUploadMedia();
  const createStory = useCreateStory();
  const pending = uploadMedia.isPending || createStory.isPending;
  const videoDuration = useMemo(() => videoDurationSeconds(asset), [asset]);
  const effectiveDuration = videoDuration ?? duration;

  useEffect(() => {
    traceStoryRuntime('STORY_EDITOR_OPEN', { flow: 'story' });
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
      if (!result.cancelled && result.assets[0]) {
        if (isVideoAsset(result.assets[0])) setAsset(result.assets[0]); else setEditingAsset(result.assets[0]);
        setUploadedMediaId(null); setSubmissionKey(null);
      }
    } catch (caught) {
      setError(caught instanceof YeyamoMediaPickerError ? caught.message : 'Le média ne peut pas être sélectionné pour le moment.');
    }
  };

  const captureMedia = async (kind: 'photo' | 'video') => {
    if (pending) return;
    setError(null);
    try {
      const result = await captureFromCamera(kind, { allowsEditing: kind === 'photo', quality: 0.9, videoMaxDuration: 60 });
      if (!result.cancelled && result.assets[0]) {
        if (isVideoAsset(result.assets[0])) setAsset(result.assets[0]); else setEditingAsset(result.assets[0]);
        setUploadedMediaId(null); setSubmissionKey(null);
      }
    } catch (caught) {
      setError(caught instanceof YeyamoMediaPickerError ? caught.message : 'La caméra ne peut pas être ouverte pour le moment.');
    }
  };

  const publish = async () => {
    if (!asset || pending) return;
    setError(null);
    const idempotencyKey = submissionKey ?? createIdempotencyKey();
    setSubmissionKey(idempotencyKey);
    traceStoryRuntime('STORY_SUBMIT_START', { flow: 'story' });
    let mediaId = uploadedMediaId;
    if (!mediaId) {
      try {
        const uploaded = await uploadMedia.mutateAsync(await toMediaFormData(asset, 'story', 0));
        mediaId = String(uploaded.data.id);
        setUploadedMediaId(mediaId);
        traceStoryRuntime('STORY_MEDIA_READY', { flow: 'story', mediaId });
      } catch (caught) {
        setError(`Le média n’a pas pu être envoyé. ${normalizeApiError(caught).message}`);
        return;
      }
    }
    try {
      await createStory.mutateAsync({ mediaId, caption: caption.trim() || undefined, captionStyle, durationSeconds: effectiveDuration, idempotencyKey });
      setUploadedMediaId(null);
      setSubmissionKey(null);
      traceStoryRuntime('STORY_UI_SUCCESS', { flow: 'story' });
      Alert.alert('Story publiée', 'Votre story est visible pendant 24 heures dans Messages.', [{ text: 'Voir les stories', onPress: () => router.replace('/(tabs)/chats') }]);
    } catch (caught) {
      traceStoryRuntime('STORY_UI_ERROR', { flow: 'story', errorType: caught instanceof Error ? caught.name : 'UnknownError' });
      setError(`La story n’a pas pu être publiée. Réessayez sans changer votre média. ${normalizeApiError(caught).message}`);
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
          <View className="mt-3 flex-row gap-3"><TouchableOpacity onPress={() => void captureMedia('photo')} className="rounded-full border border-white/60 px-5 py-3" accessibilityRole="button"><Text className="font-bold text-white">Photo</Text></TouchableOpacity><TouchableOpacity onPress={() => void captureMedia('video')} className="rounded-full border border-white/60 px-5 py-3" accessibilityRole="button"><Text className="font-bold text-white">Vidéo</Text></TouchableOpacity></View>
        </View>
      )}

      <View className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4 pt-14">
        <TouchableOpacity onPress={() => router.back()} disabled={pending} className="h-11 w-11 items-center justify-center rounded-full bg-black/50" accessibilityLabel="Fermer"><Icon name="close" size={25} color="#FFFFFF" /></TouchableOpacity>
         {asset ? <TouchableOpacity onPress={() => { setAsset(null); setUploadedMediaId(null); setSubmissionKey(null); }} disabled={pending} className="h-11 w-11 items-center justify-center rounded-full bg-black/50" accessibilityLabel="Retirer le média"><Icon name="trash-outline" size={22} color="#FFFFFF" /></TouchableOpacity> : null}
      </View>

      {asset ? <View className="absolute left-4 right-4 top-28"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2"><TouchableOpacity onPress={() => void chooseMedia()} disabled={pending} className="rounded-full bg-black/55 px-4 py-2"><Text className="text-xs font-bold text-white">Changer le média</Text></TouchableOpacity>{isVideoAsset(asset) ? <View className="rounded-full bg-black/55 px-4 py-2"><Text className="text-xs font-bold text-white">Vidéo · {effectiveDuration}s</Text></View> : imageDurations.map((value) => <TouchableOpacity key={value} onPress={() => setDuration(value)} disabled={pending} className="rounded-full px-4 py-2" style={{ backgroundColor: value === duration ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.55)' }}><Text className="text-xs font-bold" style={{ color: value === duration ? '#000000' : '#FFFFFF' }}>{value}s</Text></TouchableOpacity>)}</ScrollView></View> : null}

      {asset ? <SafeAreaView edges={['bottom']} className="mt-auto gap-3 px-5 pb-4">
        <Input value={caption} onChangeText={setCaption} placeholder="Ajouter une legende (facultatif)" maxLength={500} editable={!pending} multiline scrollEnabled inputStyle={{ minHeight: 96, maxHeight: 148 }} containerClassName="rounded-2xl bg-black/60 p-1" helperText={`${caption.length}/500`} />
        <View className="rounded-2xl bg-black/60 px-3 py-2">
          <Text className="mb-2 text-xs font-bold text-white">Style de la legende</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            {storyFontOptions.map((option) => <TouchableOpacity key={option.id} onPress={() => setCaptionStyle((current) => ({ ...current, font_family: option.id }))} className="rounded-full px-3 py-2" style={{ backgroundColor: captionStyle.font_family === option.id ? '#FFFFFF' : 'rgba(255,255,255,0.16)' }} accessibilityRole="button" accessibilityState={{ selected: captionStyle.font_family === option.id }}><Text className="text-xs font-bold" style={{ color: captionStyle.font_family === option.id ? '#000000' : '#FFFFFF' }}>{option.label}</Text></TouchableOpacity>)}
            <TouchableOpacity onPress={() => setCaptionStyle((current) => ({ ...current, bold: !current.bold }))} className="rounded-full px-3 py-2" style={{ backgroundColor: captionStyle.bold ? '#FFFFFF' : 'rgba(255,255,255,0.16)' }} accessibilityLabel="Gras"><Text className="text-xs font-bold" style={{ color: captionStyle.bold ? '#000000' : '#FFFFFF' }}>B</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setCaptionStyle((current) => ({ ...current, italic: !current.italic }))} className="rounded-full px-3 py-2" style={{ backgroundColor: captionStyle.italic ? '#FFFFFF' : 'rgba(255,255,255,0.16)' }} accessibilityLabel="Italique"><Text className="text-xs font-bold italic" style={{ color: captionStyle.italic ? '#000000' : '#FFFFFF' }}>I</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setCaptionStyle((current) => ({ ...current, underline: !current.underline }))} className="rounded-full px-3 py-2" style={{ backgroundColor: captionStyle.underline ? '#FFFFFF' : 'rgba(255,255,255,0.16)' }} accessibilityLabel="Souligne"><Text className="text-xs font-bold underline" style={{ color: captionStyle.underline ? '#000000' : '#FFFFFF' }}>U</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setCaptionStyle((current) => ({ ...current, strikethrough: !current.strikethrough }))} className="rounded-full px-3 py-2" style={{ backgroundColor: captionStyle.strikethrough ? '#FFFFFF' : 'rgba(255,255,255,0.16)' }} accessibilityLabel="Barre"><Text className="text-xs font-bold line-through" style={{ color: captionStyle.strikethrough ? '#000000' : '#FFFFFF' }}>S</Text></TouchableOpacity>
          </ScrollView>
        </View>
        {keyboardVisible ? <TouchableOpacity onPress={Keyboard.dismiss} className="self-end rounded-full bg-black/60 px-3 py-2" accessibilityRole="button" accessibilityLabel="Fermer le clavier"><Text className="text-xs font-bold text-white">Fermer le clavier</Text></TouchableOpacity> : null}
        <TouchableOpacity onPress={() => void publish()} disabled={pending} className="items-center rounded-full bg-[#EF4444] px-5 py-4" style={{ opacity: pending ? 0.65 : 1 }} accessibilityRole="button"><Text className="font-bold text-white">{pending ? 'Publication...' : 'Publier dans ma story'}</Text></TouchableOpacity>
      </SafeAreaView> : null}

      {error ? <View className="absolute bottom-4 left-5 right-5 rounded-xl bg-red-700/95 px-4 py-3"><Text className="text-center text-sm text-white">{error}</Text></View> : null}
      {editingAsset ? <YeyamoImageFilterEditor asset={editingAsset} onCancel={() => setEditingAsset(null)} onConfirm={(filtered) => { setAsset(filtered); setEditingAsset(null); }} /> : null}
    </KeyboardAvoidingView>
  );
}
