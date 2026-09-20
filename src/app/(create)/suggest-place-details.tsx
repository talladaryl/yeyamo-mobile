import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { Input } from '@/components/ui/Input';
import { useCreateStore } from '@/features/create/create.store';
import { useThemeStore } from '@/features/theme/theme.store';

export default function SuggestPlaceDetailsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const initial = useRef(useCreateStore.getState().placeForm).current;
  const setPlaceForm = useCreateStore((state) => state.setPlaceForm);
  const setPlaceStep = useCreateStore((state) => state.setPlaceStep);
  const [description, setDescription] = useState(initial.description ?? '');

  const continueToReview = () => {
    setPlaceForm({ description: description.trim() });
    setPlaceStep(4);
    router.push('/(create)/suggest-place-review');
  };

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={continueToReview} continueLabel="Vérifier la suggestion" />}>
    <YeyamoFormProgress currentStep={3} totalSteps={4} label="Suggérer un lieu" />
    <YeyamoFormStep title="Ajoutez quelques détails" description="Aidez l’équipe de modération à comprendre ce qui rend ce lieu utile ou intéressant.">
      <View className="gap-5">
        <Input label="Description (facultatif)" value={description} onChangeText={setDescription} placeholder="Ce que les visiteurs peuvent découvrir, les accès utiles, l’ambiance…" multiline maxLength={500} returnKeyType="done" blurOnSubmit={false} />
        <View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.accentSoft }}>
          <Text className="text-sm font-semibold" style={{ color: colors.text }}>Les photos ne sont pas encore ajoutées à cette suggestion.</Text>
          <Text className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>L’API de suggestion ne reçoit actuellement aucun média ; aucun envoi d’image fictif n’est affiché.</Text>
        </View>
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}
