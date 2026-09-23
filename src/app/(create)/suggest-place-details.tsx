import { useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { useYeyamoMediaPicker } from '@/components/media/useYeyamoMediaPicker';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { useCreateStore } from '@/features/create/create.store';
import type { SuggestionMediaDraft } from '@/features/create/types';
import { isVideoAsset } from '@/features/media/media.utils';
import { useThemeStore } from '@/features/theme/theme.store';

const MAX_SUGGESTION_MEDIA = 8;

export default function SuggestPlaceDetailsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const initial = useRef(useCreateStore.getState().placeForm).current;
  const setPlaceForm = useCreateStore((state) => state.setPlaceForm);
  const setPlaceStep = useCreateStore((state) => state.setPlaceStep);
  const { pickFromLibrary } = useYeyamoMediaPicker();
  const [description, setDescription] = useState(initial.description ?? '');
  const [media, setMedia] = useState<SuggestionMediaDraft[]>(initial.media_assets ?? []);

  const chooseMedia = async () => {
    try {
      const remaining = MAX_SUGGESTION_MEDIA - media.length;
      if (remaining <= 0) {
        Alert.alert('Limite atteinte', `Une suggestion peut contenir au maximum ${MAX_SUGGESTION_MEDIA} médias.`);
        return;
      }
      const result = await pickFromLibrary({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 1,
      });
      if (result.cancelled) return;
      const additions = result.assets.slice(0, remaining).map((asset) => ({
        uri: asset.uri,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
        type: isVideoAsset(asset) ? 'video' as const : 'image' as const,
      }));
      setMedia((current) => [...current, ...additions].slice(0, MAX_SUGGESTION_MEDIA));
    } catch (error) {
      Alert.alert('Média indisponible', error instanceof Error ? error.message : 'Réessayez dans quelques instants.');
    }
  };

  const continueToReview = () => {
    setPlaceForm({ description: description.trim(), media_assets: media });
    setPlaceStep(4);
    router.push('/(create)/suggest-place-review');
  };

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={continueToReview} continueLabel="Vérifier la suggestion" />}>
    <YeyamoFormProgress currentStep={3} totalSteps={4} label="Suggérer un lieu" />
    <YeyamoFormStep title="Ajoutez quelques détails" description="Les médias sont transférés vers le service Média puis vérifiés par le serveur avant l’envoi de la suggestion.">
      <View className="gap-5">
        <Input label="Description (facultatif)" value={description} onChangeText={setDescription} placeholder="Ce que les visiteurs peuvent découvrir, les accès utiles, l’ambiance…" multiline maxLength={500} returnKeyType="done" blurOnSubmit={false} />
        <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1"><Text className="text-sm font-semibold" style={{ color: colors.text }}>Photos et vidéos (facultatif)</Text><Text className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>Jusqu’à {MAX_SUGGESTION_MEDIA} médias. Aucun média n’est considéré comme joint tant que le serveur n’a pas confirmé la suggestion.</Text></View>
            <Button label="Ajouter" variant="secondary" size="sm" fullWidth={false} onPress={() => void chooseMedia()} />
          </View>
          {media.length ? <View className="mt-4 flex-row flex-wrap gap-3">{media.map((item, index) => <View key={`${item.uri}-${index}`} className="relative h-20 w-20 overflow-hidden rounded-xl" style={{ backgroundColor: colors.elevated }}>
            {item.type === 'image' ? <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : <View className="flex-1 items-center justify-center"><Icon name="videocam-outline" size={24} color={colors.textSecondary} /><Text className="mt-1 text-[10px]" style={{ color: colors.textSecondary }}>Vidéo</Text></View>}
            <TouchableOpacity onPress={() => setMedia((current) => current.filter((_, mediaIndex) => mediaIndex !== index))} className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: colors.surfaceGlassStrong }} accessibilityRole="button" accessibilityLabel="Retirer ce média"><Icon name="close" size={14} color={colors.text} /></TouchableOpacity>
          </View>)}</View> : null}
        </View>
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}
