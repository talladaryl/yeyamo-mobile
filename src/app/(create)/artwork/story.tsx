import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { Input } from '@/components/ui/Input';
import { useCreateStore } from '@/features/create/create.store';

export default function ArtworkStory() {
  const router = useRouter();
  const draft = useCreateStore((state) => state.artworkDraft);
  const setDraft = useCreateStore((state) => state.setArtworkDraft);
  const valid = Boolean(draft.story?.trim());
  const next = () => {
    if (!valid) {
      Alert.alert('Histoire requise', 'Ajoutez l’histoire ou la provenance de l’œuvre.');
      return;
    }
    router.push('/(create)/artwork/culture');
  };

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={next} disabled={!valid} />}>
    <View className="px-4 pt-5"><YeyamoFormProgress currentStep={2} totalSteps={7} label="Créer une œuvre" /></View>
    <YeyamoFormStep title="L’histoire derrière la création" description="Les récits d’atelier rendent chaque œuvre unique.">
      <View className="gap-4">
        <Input label="Histoire et signification" value={draft.story ?? ''} onChangeText={(value) => setDraft({ story: value })} placeholder="Origine, transmission, usages…" multiline maxLength={2000} returnKeyType="default" blurOnSubmit={false} />
        <Input label="Année de création" value={draft.yearCreated ? String(draft.yearCreated) : ''} onChangeText={(value) => setDraft({ yearCreated: value ? Number(value) : undefined })} placeholder="2026" keyboardType="number-pad" />
        <Input label="Provenance" value={draft.productionTime ?? ''} onChangeText={(value) => setDraft({ productionTime: value })} placeholder="Temps ou étapes de fabrication" returnKeyType="done" />
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}
