import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { Input } from '@/components/ui/Input';
import { useMyArtisan } from '@/features/artisans/artisans.hooks';
import { useCreateStore } from '@/features/create/create.store';
import { useThemeStore } from '@/features/theme/theme.store';
import { useCountryStore } from '@/features/country/country.store';

export default function ArtworkBasicInformation() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const draft = useCreateStore((state) => state.artworkDraft);
  const setDraft = useCreateStore((state) => state.setArtworkDraft);
  const countryCode = useCountryStore((state) => state.selectedCountryCode);
  const artisan = useMyArtisan();
  const partnerId = draft.artisanPartnerId ?? artisan.data?.partnerId ?? '';
  const valid = Boolean(draft.title?.trim() && draft.shortDescription?.trim() && partnerId);

  const next = () => {
    if (!countryCode) {
      Alert.alert('Pays requis', 'Choisissez votre pays dans les préférences avant de publier une œuvre.');
      return;
    }
    if (!valid) {
      Alert.alert('Profil artisan requis', 'Créez ou complétez votre profil artisan avant de publier une œuvre.');
      return;
    }
    setDraft({ artisanPartnerId: partnerId, countryCode });
    router.push('/(create)/artwork/story');
  };

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={next} disabled={!valid} />}>
    <View className="px-4 pt-5"><YeyamoFormProgress currentStep={1} totalSteps={7} label="Créer une œuvre" /></View>
    <YeyamoFormStep title="Présenter l’œuvre" description="Décrivez la création et l’atelier qui la porte.">
      <View className="gap-4">
        <Input label="Titre" value={draft.title ?? ''} onChangeText={(value) => setDraft({ title: value })} placeholder="Ex. Masque de transmission" returnKeyType="next" />
        <Input label="Description courte" value={draft.shortDescription ?? ''} onChangeText={(value) => setDraft({ shortDescription: value })} placeholder="Une phrase pour la découvrir" returnKeyType="next" />
        <Input label="Identifiant artisan / partenaire" value={partnerId} onChangeText={(value) => setDraft({ artisanPartnerId: value })} placeholder="UUID du profil artisan" autoCapitalize="none" returnKeyType="done" />
      </View>
      {artisan.isError ? <Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>Profil artisan non trouvé : vous pouvez renseigner un identifiant vérifié.</Text> : null}
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}
