import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { Input } from '@/components/ui/Input';
import { useCreateStore } from '@/features/create/create.store';
import { useCountryStore } from '@/features/country/country.store';

export default function ArtworkCulture() {
  const router = useRouter();
  const draft = useCreateStore((state) => state.artworkDraft);
  const setDraft = useCreateStore((state) => state.setArtworkDraft);
  const selectedCountryCode = useCountryStore((state) => state.selectedCountryCode);
  const countryCode = draft.countryCode ?? selectedCountryCode ?? '';
  const next = () => {
    if (!countryCode) {
      Alert.alert('Pays requis', 'Choisissez d’abord un pays dans vos préférences.');
      return;
    }
    setDraft({ countryCode });
    router.push('/(create)/artwork/materials');
  };

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={next} />}>
    <View className="px-4 pt-5"><YeyamoFormProgress currentStep={3} totalSteps={7} label="Créer une œuvre" /></View>
    <YeyamoFormStep title="Ancrage culturel" description="Reliez l’œuvre à un territoire et à une communauté.">
      <View className="gap-4">
        <Input label="Pays" value={countryCode} editable={false} placeholder="Sélectionnez un pays dans vos préférences" />
        <Input label="Région" value={draft.adminLevel1Id ?? ''} onChangeText={(value) => setDraft({ adminLevel1Id: value })} placeholder="Identifiant de région" returnKeyType="next" />
        <Input label="Ville" value={draft.cityId ?? ''} onChangeText={(value) => setDraft({ cityId: value })} placeholder="Identifiant de ville" returnKeyType="next" />
        <Input label="Communauté / culture" value={draft.culturalCommunity ?? ''} onChangeText={(value) => setDraft({ culturalCommunity: value })} placeholder="Ex. Bamiléké" returnKeyType="next" />
        <Input label="Contenu culturel lié (facultatif)" value={draft.cultureContentId ?? ''} onChangeText={(value) => setDraft({ cultureContentId: value || undefined })} placeholder="UUID du contenu" autoCapitalize="none" returnKeyType="done" />
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}
