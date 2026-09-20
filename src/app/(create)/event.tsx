import { useRef, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { useYeyamoMediaPicker } from '@/components/media/useYeyamoMediaPicker';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { useCreateStore } from '@/features/create/create.store';
import { useThemeStore } from '@/features/theme/theme.store';

export default function CreateEventScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const initial = useRef(useCreateStore.getState().eventForm).current;
  const setEventForm = useCreateStore((state) => state.setEventForm);
  const resetEventForm = useCreateStore((state) => state.resetEventForm);
  const { pickFromLibrary } = useYeyamoMediaPicker();
  const [coverImage, setCoverImage] = useState<string | null>(initial.cover_image_url ?? null);
  const [coverMimeType, setCoverMimeType] = useState<string | null>(initial.cover_image_mime_type ?? null);
  const [title, setTitle] = useState(initial.title ?? '');
  const [description, setDescription] = useState(initial.description ?? '');

  const pickCoverImage = async () => {
    try {
      const result = await pickFromLibrary({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 1 });
      if (result.cancelled) return;
      const asset = result.assets[0];
      if (!asset) return;
      setCoverImage(asset.uri);
      setCoverMimeType(asset.mimeType ?? 'image/jpeg');
    } catch (error) {
      Alert.alert('Image indisponible', error instanceof Error ? error.message : 'Réessayez dans quelques instants.');
    }
  };

  const continueToLocation = () => {
    if (!title.trim()) {
      Alert.alert('Titre requis', 'Donnez un titre à votre sortie avant de continuer.');
      return;
    }
    setEventForm({ title: title.trim(), description: description.trim(), cover_image_url: coverImage, cover_image_mime_type: coverMimeType });
    router.push('/(create)/event-location');
  };

  const exit = () => {
    if (!title && !description && !coverImage) {
      router.back();
      return;
    }
    Alert.alert('Quitter la création ?', 'Les informations de cette sortie seront perdues.', [
      { text: 'Continuer', style: 'cancel' },
      { text: 'Quitter', style: 'destructive', onPress: () => { resetEventForm(); router.back(); } },
    ]);
  };

  return <YeyamoFormScreen footer={<YeyamoFormFooter onContinue={continueToLocation} continueLabel="Continuer" />}>
    <YeyamoFormProgress currentStep={1} totalSteps={5} label="Créer une sortie" />
    <YeyamoFormStep title="Quelle sortie organisez-vous ?" description="Commencez par présenter l’activité aux personnes qui pourraient vous rejoindre.">
      <View className="gap-5">
        <View className="overflow-hidden rounded-2xl border" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          {coverImage ? <Image source={{ uri: coverImage }} style={{ width: '100%', height: 190 }} contentFit="cover" accessibilityLabel="Aperçu de l'image de couverture" /> : <View className="h-44 items-center justify-center px-6"><Icon name="image-outline" size={42} color={colors.textMuted} /><Text className="mt-3 text-center text-sm" style={{ color: colors.textSecondary }}>Ajoutez une image pour rendre votre sortie plus facile à repérer.</Text></View>}
          <View className="flex-row gap-3 p-3">
            <View className="flex-1"><Button label={coverImage ? 'Remplacer' : 'Ajouter une image'} variant="secondary" size="sm" onPress={() => void pickCoverImage()} /></View>
            {coverImage ? <Button label="Retirer" variant="ghost" size="sm" fullWidth={false} onPress={() => { setCoverImage(null); setCoverMimeType(null); }} /> : null}
          </View>
        </View>
        <Input label="Titre de la sortie *" value={title} onChangeText={setTitle} placeholder="Ex. Randonnée au Mont Cameroun" maxLength={100} autoCapitalize="sentences" returnKeyType="next" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Expliquez l’activité, l’ambiance et ce qu’il faut prévoir." multiline maxLength={500} returnKeyType="default" blurOnSubmit={false} />
        <View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.accentSoft }}>
          <Text className="text-sm font-semibold" style={{ color: colors.text }}>Vous choisirez le lieu, l’horaire et la capacité aux prochaines étapes.</Text>
        </View>
        <Button label="Annuler la création" variant="ghost" onPress={exit} />
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}
