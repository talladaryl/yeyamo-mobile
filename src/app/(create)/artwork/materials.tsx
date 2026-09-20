import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { Input } from '@/components/ui/Input';
import { useCreateStore } from '@/features/create/create.store';

export default function ArtworkMaterials() {
  const router = useRouter();
  const draft = useCreateStore((state) => state.artworkDraft);
  const setDraft = useCreateStore((state) => state.setArtworkDraft);
  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={() => router.push('/(create)/artwork/media')} />}>
    <View className="px-4 pt-5"><YeyamoFormProgress currentStep={4} totalSteps={7} label="Créer une œuvre" /></View>
    <YeyamoFormStep title="Matières et dimensions" description="Ces informations aident à comprendre le geste artisanal.">
      <View className="gap-4">
        <Input label="Matières" value={draft.materials ?? ''} onChangeText={(value) => setDraft({ materials: value })} placeholder="Bois, perles, tissage…" returnKeyType="next" />
        <Input label="Techniques" value={draft.techniques ?? ''} onChangeText={(value) => setDraft({ techniques: value })} placeholder="Sculpture, teinture…" returnKeyType="next" />
        <View className="flex-row gap-3"><Input containerClassName="flex-1" label="Largeur (cm)" value={draft.width ?? ''} onChangeText={(value) => setDraft({ width: value })} keyboardType="decimal-pad" /><Input containerClassName="flex-1" label="Hauteur (cm)" value={draft.height ?? ''} onChangeText={(value) => setDraft({ height: value })} keyboardType="decimal-pad" /><Input containerClassName="flex-1" label="Profondeur (cm)" value={draft.depth ?? ''} onChangeText={(value) => setDraft({ depth: value })} keyboardType="decimal-pad" /></View>
        <Input label="Poids (g, facultatif)" value={draft.weight ?? ''} onChangeText={(value) => setDraft({ weight: value })} keyboardType="decimal-pad" returnKeyType="done" />
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}
