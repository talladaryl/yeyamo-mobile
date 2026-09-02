import { Alert, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { useMyArtisan } from '@/features/artisans/artisans.hooks';
import { useCreateStore } from '@/features/create/create.store';
import { useThemeStore } from '@/features/theme/theme.store';
import { useCountryStore } from '@/features/country/country.store';
export default function ArtworkBasicInformation() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors); const draft = useCreateStore((state) => state.artworkDraft); const setDraft = useCreateStore((state) => state.setArtworkDraft); const countryCode = useCountryStore((state) => state.selectedCountryCode); const artisan = useMyArtisan();
  const partnerId = draft.artisanPartnerId ?? artisan.data?.partnerId ?? '';
  const next = () => { if (!countryCode) { Alert.alert('Pays requis', 'Choisissez votre pays dans les préférences avant de publier une œuvre.'); return; } if (!draft.title?.trim() || !draft.shortDescription?.trim() || !partnerId) { Alert.alert('Profil artisan requis', 'Créez ou complétez votre profil artisan avant de publier une œuvre.'); return; } setDraft({ artisanPartnerId: partnerId, countryCode }); router.push('/(create)/artwork/story'); };
  return <SafeScreen><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled"><Stepper currentStep={1} totalSteps={7}/><Text className="text-3xl font-extrabold" style={{ color: colors.text }}>Présenter l’œuvre</Text><Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>Décrivez la création et l’atelier qui la porte.</Text><View className="mt-7 gap-4"><Input label="Titre" value={draft.title ?? ''} onChangeText={(value) => setDraft({ title: value })} placeholder="Ex. Masque de transmission"/><Input label="Description courte" value={draft.shortDescription ?? ''} onChangeText={(value) => setDraft({ shortDescription: value })} placeholder="Une phrase pour la découvrir"/><Input label="Identifiant artisan / partenaire" value={partnerId} onChangeText={(value) => setDraft({ artisanPartnerId: value })} placeholder="UUID du profil artisan" autoCapitalize="none"/></View>{artisan.isError?<Text className="mt-3 text-sm" style={{color:colors.textSecondary}}>Profil artisan non trouvé : vous pourrez renseigner un identifiant vérifié.</Text>:null}<Button label="Continuer" onPress={next} className="mt-8"/></ScrollView></SafeScreen>;
}
