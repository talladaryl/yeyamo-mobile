import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { FormSelect } from '@/components/ui/FormSelect';
import { Input } from '@/components/ui/Input';
import { useCountryStore } from '@/features/country/country.store';
import { useCreateStore } from '@/features/create/create.store';
import { usePlaceCategories } from '@/features/places/placeReferences.hooks';
import { useThemeStore } from '@/features/theme/theme.store';

export default function SuggestPlaceStep1Screen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const initial = useRef(useCreateStore.getState().placeForm).current;
  const setPlaceForm = useCreateStore((state) => state.setPlaceForm);
  const setPlaceStep = useCreateStore((state) => state.setPlaceStep);
  const countryCode = useCountryStore((state) => state.selectedCountryCode);
  const categories = usePlaceCategories();
  const [name, setName] = useState(initial.name ?? '');
  const [category, setCategory] = useState(initial.category ?? '');
  const [type, setType] = useState(initial.type ?? '');

  const continueToLocation = () => {
    if (!name.trim()) return;
    setPlaceForm({ name: name.trim(), category, type: type.trim() });
    setPlaceStep(2);
    router.push('/(create)/suggest-place-step2');
  };

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={continueToLocation} disabled={!name.trim()} />}>
    <YeyamoFormProgress currentStep={1} totalSteps={4} label="Suggérer un lieu" />
    <YeyamoFormStep title="Quel lieu souhaitez-vous proposer ?" description="Cette suggestion sera examinée avant d’être publiée sur Yeyamo.">
      <View className="gap-5">
        <Input label="Nom du lieu *" value={name} onChangeText={setName} placeholder="Ex. Jardin botanique de Limbé" maxLength={120} autoCapitalize="words" returnKeyType="next" />
        <FormSelect label="Catégorie" value={category} options={(categories.data ?? []).filter((item) => item.active).map((item) => ({ label: item.name, value: item.name }))} onChange={setCategory} placeholder={categories.isLoading ? 'Chargement des catégories…' : 'Choisir une catégorie'} />
        {categories.isError ? <Text className="-mt-3 text-xs" style={{ color: colors.textSecondary }}>Les catégories sont momentanément indisponibles. Elles sont facultatives pour l’envoi de la suggestion.</Text> : null}
        <Input label="Type de lieu (facultatif)" value={type} onChangeText={setType} placeholder="Ex. Jardin, restaurant, musée…" maxLength={80} autoCapitalize="sentences" returnKeyType="done" />
        <View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.accentSoft }}>
          <Text className="text-sm font-semibold" style={{ color: colors.text }}>Pays : {countryCode ?? 'non défini dans votre profil'}</Text>
          <Text className="mt-1 text-xs leading-5" style={{ color: colors.textSecondary }}>Vous préciserez ensuite la région, la ville et l’adresse. Une suggestion publique est distincte d’un lieu personnalisé créé pour une sortie.</Text>
        </View>
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}
