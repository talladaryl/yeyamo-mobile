import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { useCountryFeature } from '@/features/country/country.hooks';
import { useCountryStore } from '@/features/country/country.store';
import { useCreateCultureContribution, useCultureLanguages, useSubmitContribution } from '@/features/culture/culture.hooks';
import type { CultureContentType } from '@/features/culture/culture.types';

const TYPES: { value: CultureContentType; label: string }[] = [
  { value: 'STORY', label: 'Récit' }, { value: 'TRADITION', label: 'Tradition' }, { value: 'PROVERB', label: 'Proverbe' },
  { value: 'EXPRESSION', label: 'Expression' }, { value: 'RECIPE', label: 'Recette' }, { value: 'SONG', label: 'Chant' },
];

export default function CultureContributionScreen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors);
  const countryCode = useCountryStore((state) => state.selectedCountryCode);
  const languageCode = useCountryStore((state) => state.preferredLanguageCode);
  const cultureEnabled = useCountryFeature('cultureModuleEnabled');
  const contentPublishingEnabled = useCountryFeature('contentPublishingEnabled');
  const languages = useCultureLanguages(); const create = useCreateCultureContribution(); const submit = useSubmitContribution();
  const [type, setType] = useState<CultureContentType>('STORY'); const [title, setTitle] = useState(''); const [summary, setSummary] = useState(''); const [body, setBody] = useState(''); const [communityName, setCommunityName] = useState(''); const [contentLanguage, setContentLanguage] = useState(languageCode ?? '');
  const publish = async () => {
    if (!cultureEnabled || !contentPublishingEnabled) { Alert.alert('Contribution indisponible', 'La publication culturelle n’est pas activée pour ce pays.'); return; }
    if (!countryCode || !contentLanguage || !title.trim() || !body.trim()) { Alert.alert('Informations manquantes', 'Choisissez un pays, une langue, un titre et le récit à transmettre.'); return; }
    try {
      const content = await create.mutateAsync({ type, slug: title.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, ''), primaryLanguageCode: contentLanguage, countryCode, communityName: communityName.trim() || undefined, sourceType: 'PERSONAL_CONTRIBUTION', sensitivityLevel: 'PUBLIC', title: title.trim(), summary: summary.trim() || undefined, body: body.trim() });
      await submit.mutateAsync(content.id);
      Alert.alert('Contribution envoyée', 'Elle sera publiée après la vérification éditoriale.', [{ text: 'Fermer', onPress: () => router.back() }]);
    } catch { Alert.alert('Envoi impossible', 'Votre contribution n’a pas été envoyée. Vérifiez la connexion puis réessayez.'); }
  };
  return <SafeScreen><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled"><View className="flex-row items-center"><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityLabel="Retour"><Icon name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="ml-2 text-2xl font-extrabold" style={{ color: colors.text }}>Transmettre un savoir</Text></View><Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>Votre contribution est relue avant publication ; aucun contenu normal n’est prérempli.</Text>{!countryCode ? <Text className="mt-4 text-sm text-[#B91C1C]">Choisissez d’abord votre pays dans vos préférences.</Text> : null}{(!cultureEnabled || !contentPublishingEnabled) ? <Text className="mt-3 text-sm text-[#B91C1C]">La publication culturelle n’est pas disponible pour ce pays.</Text> : null}
    <Label value="Type de contenu" /><View className="flex-row flex-wrap gap-2">{TYPES.map((item) => <TouchableOpacity key={item.value} onPress={() => setType(item.value)} className="rounded-full px-3 py-2" style={{ backgroundColor: type === item.value ? colors.primary : colors.elevated }}><Text className="text-sm font-semibold" style={{ color: type === item.value ? '#FFFFFF' : colors.text }}>{item.label}</Text></TouchableOpacity>)}</View>
    <Label value="Langue" /><ScrollView horizontal showsHorizontalScrollIndicator={false}>{(languages.data ?? []).map((language) => <TouchableOpacity key={language.code} onPress={() => setContentLanguage(language.code)} className="mr-2 rounded-full border px-3 py-2" style={{ borderColor: contentLanguage === language.code ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{language.nativeName}</Text></TouchableOpacity>)}</ScrollView>
    <Field label="Titre" value={title} onChangeText={setTitle} placeholder="Ex. L’histoire de…" colors={colors} /><Field label="Communauté (facultatif)" value={communityName} onChangeText={setCommunityName} placeholder="Ex. Bassa, Sawa…" colors={colors} /><Field label="Résumé" value={summary} onChangeText={setSummary} placeholder="Quelques lignes pour introduire ce savoir" colors={colors} multiline /><Field label="Récit ou explication" value={body} onChangeText={setBody} placeholder="Expliquez le contexte, la transmission et vos sources." colors={colors} multiline />
    <TouchableOpacity disabled={!countryCode || !contentLanguage || !cultureEnabled || !contentPublishingEnabled || create.isPending || submit.isPending} onPress={publish} className="mt-7 items-center rounded-xl bg-[#EF4444] p-4" style={{ opacity: countryCode && contentLanguage && cultureEnabled && contentPublishingEnabled ? 1 : 0.5 }}><Text className="font-bold text-white">{create.isPending || submit.isPending ? 'Envoi…' : 'Envoyer pour vérification'}</Text></TouchableOpacity>
  </ScrollView></SafeScreen>;
}
function Label({ value }: { value: string }) { const colors = useThemeStore((state) => state.colors); return <Text className="mb-2 mt-6 text-sm font-bold" style={{ color: colors.text }}>{value}</Text>; }
function Field({ label, colors, multiline, ...props }: { label: string; colors: { text: string; textSecondary: string; card: string; border: string }; multiline?: boolean; value: string; onChangeText: (value: string) => void; placeholder: string }) { return <View className="mt-5"><Text className="mb-2 text-sm font-bold" style={{ color: colors.text }}>{label}</Text><TextInput {...props} multiline={multiline} placeholderTextColor={colors.textSecondary} className={`rounded-xl border px-4 py-3 ${multiline ? 'min-h-[110px]' : ''}`} style={{ color: colors.text, backgroundColor: colors.card, borderColor: colors.border, textAlignVertical: multiline ? 'top' : 'center' }} /></View>; }
