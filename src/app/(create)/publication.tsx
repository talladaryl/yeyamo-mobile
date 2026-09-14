import { useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { useYeyamoMediaPicker, YeyamoMediaPickerError } from '@/components/media/useYeyamoMediaPicker';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { useCreateStore } from '@/features/create/create.store';
import type { PublicationMediaDraft } from '@/features/create/types';
import { isVideoAsset, toMediaFormData, type PickedMediaAsset } from '@/features/media/media.utils';
import { useCreatePost, useUploadMedia } from '@/features/post/usePost';
import { PostPublicationError } from '@/features/post/post.api';
import { useCultureContents, useSubmitChallenge } from '@/features/culture/culture.hooks';
import { useThemeStore } from '@/features/theme/theme.store';
import { normalizeApiError } from '@/services/api/errors';

const MAX_MEDIA = 10; // PostRequest.mediaIds is @Size(max = 10).

type Failure = { phase: 'picker' | 'upload' | 'create' | 'publish' | 'challenge'; message: string } | null;
type LinkedTarget = { id: string; type: 'PROVERB' | 'RECIPE'; title: string };

function toPublicationMedia(asset: PickedMediaAsset): PublicationMediaDraft {
  return {
    uri: asset.uri,
    type: isVideoAsset(asset) ? 'video' : 'image',
    mimeType: asset.mimeType,
    fileName: asset.fileName,
    width: asset.width,
    height: asset.height,
    duration: asset.duration,
    fileSize: asset.fileSize,
  };
}

function restoreMedia(urls: string[], type: 'image' | 'video' | 'carousel'): PublicationMediaDraft[] {
  return urls.map((uri) => ({ uri, type: type === 'video' ? 'video' : 'image', width: 0, height: 0 }));
}

export default function CreatePublicationScreen() {
  const router = useRouter();
  const { challengeId } = useLocalSearchParams<{ challengeId?: string }>();
  const initial = useRef(useCreateStore.getState().publicationData).current;
  const setPublicationData = useCreateStore((state) => state.setPublicationData);
  const resetPublicationData = useCreateStore((state) => state.resetPublicationData);
  const uploadMedia = useUploadMedia();
  const createPost = useCreatePost();
  const submitChallenge = useSubmitChallenge();
  const proverbs = useCultureContents({ type: 'PROVERB', size: 20 });
  const recipes = useCultureContents({ type: 'RECIPE', size: 20 });
  const colors = useThemeStore((state) => state.colors);
  const { pickFromLibrary, takePhoto } = useYeyamoMediaPicker();
  const [media, setMedia] = useState<PublicationMediaDraft[]>(() => initial.media_assets ?? restoreMedia(initial.media_urls ?? [], initial.media_type ?? 'image'));
  const [caption, setCaption] = useState(initial.caption ?? '');
  const [linkedTarget, setLinkedTarget] = useState<LinkedTarget | null>(null);
  const [culturePickerVisible, setCulturePickerVisible] = useState(false);
  const [uploadedIds, setUploadedIds] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState<Failure>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const mediaType = useMemo<'image' | 'video' | 'carousel'>(() => media.length > 1 ? 'carousel' : media[0]?.type === 'video' ? 'video' : 'image', [media]);

  const persistDraft = (nextMedia = media, nextCaption = caption) => {
    setPublicationData({ media_urls: nextMedia.map((item) => item.uri), media_assets: nextMedia, media_type: nextMedia.length > 1 ? 'carousel' : nextMedia[0]?.type === 'video' ? 'video' : 'image', caption: nextCaption });
  };

  const addAssets = (assets: PickedMediaAsset[]) => {
    const selected = assets.map(toPublicationMedia);
    setMedia((current) => {
      const next = [...current, ...selected].slice(0, MAX_MEDIA);
      if (current.length + selected.length > MAX_MEDIA) Alert.alert('Limite atteinte', `Une publication peut contenir au maximum ${MAX_MEDIA} médias.`);
      persistDraft(next);
      return next;
    });
    setFailure(null);
  };

  const selectMedia = async (kind: 'images' | 'videos' | 'mixed') => {
    try {
      const result = await pickFromLibrary({
        mediaTypes: kind === 'mixed' ? ['images', 'videos'] : [kind],
        allowsMultipleSelection: true,
        selectionLimit: MAX_MEDIA,
        quality: 0.9,
      });
      if (!result.cancelled) addAssets(result.assets);
    } catch (error) {
      const message = error instanceof YeyamoMediaPickerError ? error.message : 'Le sélecteur de médias ne peut pas être ouvert pour le moment.';
      setFailure({ phase: 'picker', message });
    }
  };

  const capturePhoto = async () => {
    try {
      const result = await takePhoto({ allowsEditing: true, quality: 0.9 });
      if (!result.cancelled) addAssets(result.assets);
    } catch (error) {
      const message = error instanceof YeyamoMediaPickerError ? error.message : 'L’appareil photo ne peut pas être ouvert pour le moment.';
      setFailure({ phase: 'picker', message });
    }
  };

  const removeMedia = (uri: string) => {
    setMedia((current) => {
      const next = current.filter((item) => item.uri !== uri);
      persistDraft(next);
      return next;
    });
    setUploadedIds((current) => {
      const next = { ...current };
      delete next[uri];
      return next;
    });
  };

  const handlePublish = async () => {
    const trimmedCaption = caption.trim();
    if (!trimmedCaption && media.length === 0) {
      setFailure({ phase: 'create', message: 'Ajoutez un texte ou au moins un média avant de publier.' });
      return;
    }
    if (isPublishing) return;
    setFailure(null);
    setIsPublishing(true);
    persistDraft(media, trimmedCaption);
    const resolvedIds = { ...uploadedIds };
    try {
      for (const [index, asset] of media.entries()) {
        if (resolvedIds[asset.uri]) continue;
        try {
          const uploaded = await uploadMedia.mutateAsync(toMediaFormData(asset, 'publication', index));
          resolvedIds[asset.uri] = String(uploaded.data.id);
          setUploadedIds((current) => ({ ...current, [asset.uri]: String(uploaded.data.id) }));
        } catch (error) {
          setFailure({ phase: 'upload', message: `Impossible d’envoyer le média ${index + 1}. ${normalizeApiError(error).message}` });
          return;
        }
      }
      const created = await createPost.mutateAsync({
        type: mediaType,
        caption: trimmedCaption || undefined,
        media_ids: media.map((asset) => resolvedIds[asset.uri]),
        ...(linkedTarget ? { target_type: linkedTarget.type, target_id: linkedTarget.id } : {}),
      });
      if (challengeId) {
        try {
          await submitChallenge.mutateAsync({ id: challengeId, postId: String(created.data.id) });
        } catch (error) {
          setFailure({ phase: 'challenge', message: `La publication est envoyée, mais le challenge n’a pas été mis à jour. ${normalizeApiError(error).message}` });
          return;
        }
      }
      resetPublicationData();
      Alert.alert('Publication envoyée', 'Votre publication est maintenant visible dans le Feed.', [{ text: 'Voir le Feed', onPress: () => router.replace('/(tabs)') }]);
    } catch (error) {
      if (error instanceof PostPublicationError) {
        setFailure({ phase: error.phase, message: `${error.message} ${normalizeApiError(error.cause).message}` });
      } else {
        setFailure({ phase: 'create', message: normalizeApiError(error).message });
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return <YeyamoFormScreen footer={<View className="px-4 py-3"><Button label="Publier" onPress={() => void handlePublish()} isLoading={isPublishing} disabled={isPublishing} /></View>}>
    <Stack.Screen options={{ headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, title: 'Nouvelle publication', headerLeft: () => <TouchableOpacity onPress={() => router.back()} className="ml-3 h-11 w-11 items-center justify-center" accessibilityLabel="Fermer"><Icon name="close" size={24} color={colors.text} /></TouchableOpacity> }} />
    <View className="px-4 py-5">
      <Text className="text-xl font-extrabold" style={{ color: colors.text }}>Partagez avec Yeyamo</Text>
      <Text className="mt-1 text-sm leading-5" style={{ color: colors.textSecondary }}>Un texte, une photo, une vidéo — ou les deux. Les médias ne sont publiés qu’après confirmation du serveur.</Text>
      {failure ? <View className="mt-5 rounded-xl border p-4" style={{ borderColor: colors.primary, backgroundColor: colors.accentSoft }}><Text className="text-sm font-bold" style={{ color: colors.text }}>{failure.phase === 'upload' ? 'Envoi du média impossible' : failure.phase === 'publish' ? 'Publication finale impossible' : 'Publication impossible'}</Text><Text className="mt-1 text-sm leading-5" style={{ color: colors.textSecondary }}>{failure.message}</Text></View> : null}

      <View className="mt-5 gap-3">
        {media.length ? <MediaPreview asset={media[0]} /> : <TouchableOpacity onPress={() => void selectMedia('mixed')} className="h-56 items-center justify-center rounded-2xl border border-dashed px-8" style={{ borderColor: colors.border, backgroundColor: colors.surface }} accessibilityRole="button" accessibilityLabel="Ajouter une photo ou une vidéo"><Icon name="images-outline" size={48} color={colors.textMuted} /><Text className="mt-3 text-center text-sm font-semibold" style={{ color: colors.text }}>Ajouter une photo ou une vidéo</Text><Text className="mt-1 text-center text-xs" style={{ color: colors.textSecondary }}>Facultatif : vous pouvez aussi publier uniquement du texte.</Text></TouchableOpacity>}
        {media.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}><TouchableOpacity onPress={() => void selectMedia('mixed')} className="h-20 w-20 items-center justify-center rounded-xl border border-dashed" style={{ borderColor: colors.border, backgroundColor: colors.surface }} accessibilityLabel="Ajouter un média"><Icon name="add" size={28} color={colors.primary} /></TouchableOpacity>{media.map((asset) => <MediaTile key={asset.uri} asset={asset} onRemove={() => removeMedia(asset.uri)} />)}</ScrollView> : null}
        <View className="flex-row gap-3"><View className="flex-1"><Button label="Photo" variant="secondary" size="sm" onPress={() => void selectMedia('images')} /></View><View className="flex-1"><Button label="Vidéo" variant="secondary" size="sm" onPress={() => void selectMedia('videos')} /></View><View className="flex-1"><Button label="Caméra" variant="secondary" size="sm" onPress={() => void capturePhoto()} /></View></View>
      </View>

      <View className="mt-6"><Input label="Légende" value={caption} onChangeText={setCaption} placeholder="Qu’avez-vous envie de partager ?" multiline maxLength={5000} blurOnSubmit={false} returnKeyType="default" helperText="Une publication nécessite un texte ou au moins un média." /></View>

      <View className="mt-5"><TouchableOpacity onPress={() => setCulturePickerVisible((visible) => !visible)} className="flex-row items-center justify-between rounded-xl border px-4 py-3" style={{ backgroundColor: colors.surface, borderColor: colors.border }} accessibilityRole="button" accessibilityLabel="Associer un contenu culturel"><View className="flex-1"><Text className="text-sm font-semibold" style={{ color: colors.text }}>Contenu culturel (facultatif)</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{linkedTarget ? linkedTarget.title : 'Associer un proverbe ou une recette réelle'}</Text></View><Icon name={culturePickerVisible ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} /></TouchableOpacity>{culturePickerVisible ? <View className="mt-2 rounded-xl border p-3" style={{ borderColor: colors.border, backgroundColor: colors.elevated }}><CultureOptions title="Proverbes" items={proverbs.data?.content ?? []} type="PROVERB" selected={linkedTarget?.id} onSelect={(target) => { setLinkedTarget(target); setCulturePickerVisible(false); }} /> <CultureOptions title="Recettes" items={recipes.data?.content ?? []} type="RECIPE" selected={linkedTarget?.id} onSelect={(target) => { setLinkedTarget(target); setCulturePickerVisible(false); }} />{proverbs.isLoading || recipes.isLoading ? <Text className="mt-3 text-xs" style={{ color: colors.textSecondary }}>Chargement des contenus culturels…</Text> : null}{linkedTarget ? <TouchableOpacity onPress={() => setLinkedTarget(null)} className="mt-3 self-start"><Text className="text-sm font-semibold" style={{ color: colors.primary }}>Retirer l’association</Text></TouchableOpacity> : null}</View> : null}</View>
    </View>
  </YeyamoFormScreen>;
}

function MediaPreview({ asset }: { asset: PublicationMediaDraft }) {
  if (asset.type === 'video') return <VideoPreview uri={asset.uri} height={280} />;
  return <Image source={{ uri: asset.uri }} style={{ width: '100%', height: 280, borderRadius: 16 }} contentFit="cover" accessibilityLabel="Aperçu de l’image" />;
}

function VideoPreview({ uri, height }: { uri: string; height: number }) {
  const player = useVideoPlayer(uri, (current) => { current.pause(); });
  return <View className="overflow-hidden rounded-2xl"><VideoView player={player} style={{ width: '100%', height }} contentFit="cover" nativeControls /><View className="absolute left-3 top-3 rounded-full px-3 py-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} pointerEvents="none"><Text className="text-xs font-bold text-white">VIDÉO</Text></View></View>;
}

function MediaTile({ asset, onRemove }: { asset: PublicationMediaDraft; onRemove: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="relative"><View className="h-20 w-20 overflow-hidden rounded-xl" style={{ backgroundColor: colors.elevated }}>{asset.type === 'video' ? <View className="flex-1 items-center justify-center"><Icon name="videocam" size={28} color={colors.primary} /><Text className="mt-1 text-[9px] font-bold" style={{ color: colors.text }}>VIDÉO</Text></View> : <Image source={{ uri: asset.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />}</View><TouchableOpacity onPress={onRemove} className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: colors.primary }} accessibilityLabel="Retirer ce média"><Icon name="close" size={16} color="#FFFFFF" /></TouchableOpacity></View>;
}

function CultureOptions({ title, items, type, selected, onSelect }: { title: string; items: { id: string; slug: string }[]; type: LinkedTarget['type']; selected?: string; onSelect: (target: LinkedTarget) => void }) {
  const colors = useThemeStore((state) => state.colors);
  if (!items.length) return null;
  return <View className="mt-3"><Text className="text-xs font-bold" style={{ color: colors.textSecondary }}>{title.toUpperCase()}</Text>{items.map((item) => <TouchableOpacity key={item.id} onPress={() => onSelect({ id: item.id, type, title: item.slug })} className="mt-2 rounded-lg px-3 py-2" style={{ backgroundColor: selected === item.id ? colors.primary : colors.surface }}><Text numberOfLines={1} style={{ color: selected === item.id ? '#FFFFFF' : colors.text }}>{item.slug}</Text></TouchableOpacity>)}</View>;
}
