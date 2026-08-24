import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { CTAButton } from '@/components/ui/CTAButton';
import { Input } from '@/components/ui/Input';
import { Stepper } from '@/components/ui/Stepper';
import { FormSelect } from '@/components/ui/FormSelect';
import { useThemeStore } from '@/features/theme/theme.store';
import { usePartnerStore } from '@/features/partner/partner.store';
import { formValidation } from '@/utils/formValidation';

const CATEGORIES = ['Hôtel', 'Restaurant', 'Culture', 'Loisir', 'Commerce', 'Nature'].map((value) => ({ label: value, value }));
const TYPES = ['Hébergement', 'Restaurant', 'Site culturel', 'Espace événementiel', 'Commerce', 'Site naturel'].map((value) => ({ label: value, value }));

export default function AddPlaceStep1Screen() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors);
  const { placeForm, setPlaceForm, setPlaceStep } = usePartnerStore();
  const [name, setName] = useState(placeForm.name || ''); const [email, setEmail] = useState(placeForm.email || ''); const [category, setCategory] = useState(placeForm.category || ''); const [subcategory, setSubcategory] = useState(placeForm.subcategory || ''); const [type, setType] = useState(placeForm.type || ''); const [location, setLocation] = useState(placeForm.location || ''); const [contactEmail, setContactEmail] = useState(placeForm.contact_email || '');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const continueForm = () => { const next = { name: formValidation.required(name, 'Nom de l’établissement'), email: formValidation.email(email, true), category: formValidation.required(category, 'Catégorie'), type: formValidation.required(type, 'Type de lieu'), contactEmail: formValidation.email(contactEmail) }; setErrors(next); const first = Object.values(next).find(Boolean); if (first) { Alert.alert('Informations à vérifier', first); return; } setPlaceForm({ name: name.trim(), email: email.trim(), category, subcategory: subcategory.trim(), type, location: location.trim(), contact_email: contactEmail.trim() }); setPlaceStep(2); router.push('/(partner)/add-place-step2'); };
  return <SafeScreen><Stack.Screen options={{ headerShown: false }} /><KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><View className="ml-3"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>Ajouter un lieu</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>Informations principales</Text></View></View>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled"><Stepper currentStep={1} totalSteps={4} /><View className="mb-6 items-center"><View className="h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: colors.accentSoft }}><Icon name="business" size={38} color={colors.primary} /></View></View><Text className="mb-5 text-xl font-extrabold" style={{ color: colors.text }}>Informations de base</Text>
      <View className="gap-4"><Input label="Nom de l’établissement *" value={name} onChangeText={setName} error={errors.name} placeholder="Ex. La Falaise Hotel" autoCapitalize="words" /><Input label="E-mail principal *" value={email} onChangeText={setEmail} error={errors.email} placeholder="info@etablissement.com" keyboardType="email-address" /><FormSelect label="Catégorie" value={category} options={CATEGORIES} onChange={setCategory} error={errors.category} required /><Input label="Sous-catégorie" value={subcategory} onChangeText={setSubcategory} placeholder="Ex. Hôtel 4 étoiles" /><FormSelect label="Type de lieu" value={type} options={TYPES} onChange={setType} error={errors.type} required /><Input label="Localisation générale" value={location} onChangeText={setLocation} placeholder="Ex. Douala, Cameroun" /><Input label="E-mail de contact" value={contactEmail} onChangeText={setContactEmail} error={errors.contactEmail} placeholder="contact@etablissement.com" keyboardType="email-address" /></View>
    </ScrollView><View className="absolute bottom-0 left-0 right-0 border-t px-4 py-4" style={{ backgroundColor: colors.background, borderColor: colors.border }}><CTAButton title="Continuer" onPress={continueForm} /></View>
  </KeyboardAvoidingView></SafeScreen>;
}
