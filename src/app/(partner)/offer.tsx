import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { CTAButton } from '@/components/ui/CTAButton';
import { Icon } from '@/components/ui/Icon';
import { usePartnerStore } from '@/features/partner/partner.store';
import { useThemeStore } from '@/features/theme/theme.store';

export default function PartnerOfferScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { offerForm, setOfferForm, resetOfferForm } = usePartnerStore();
  const [title, setTitle] = useState(offerForm.title ?? '');
  const [description, setDescription] = useState(offerForm.description ?? '');
  const [price, setPrice] = useState(offerForm.price ? String(offerForm.price) : '');
  const [originalPrice, setOriginalPrice] = useState(offerForm.original_price ? String(offerForm.original_price) : '');
  const [validUntil, setValidUntil] = useState(offerForm.valid_until ?? '');
  const [terms, setTerms] = useState(offerForm.terms ?? '');
  const [imageUri, setImageUri] = useState(offerForm.images?.[0] ?? '');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.85 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const publish = () => {
    const numericPrice = Number(price.replace(/\s/g, ''));
    const numericOriginalPrice = originalPrice ? Number(originalPrice.replace(/\s/g, '')) : undefined;
    if (!title.trim() || !description.trim() || !numericPrice || !validUntil.trim()) {
      Alert.alert('Informations manquantes', 'Renseignez le titre, la description, le prix et la date de fin.');
      return;
    }
    setOfferForm({
      title: title.trim(), description: description.trim(), price: numericPrice,
      original_price: numericOriginalPrice, valid_until: validUntil.trim(), terms: terms.trim(),
      images: imageUri ? [imageUri] : [],
      discount_percentage: numericOriginalPrice && numericOriginalPrice > numericPrice ? Math.round((1 - numericPrice / numericOriginalPrice) * 100) : undefined,
    });
    Alert.alert('Offre envoyée', 'Votre offre sera vérifiée avant sa publication.', [
      { text: 'Terminer', onPress: () => { resetOfferForm(); router.replace('/(tabs)/profile'); } },
    ]);
  };

  return (
    <SafeScreen>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center border-b px-4 pb-3 pt-2" style={{ borderColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity>
        <View className="ml-3"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>Créer une offre</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>Promotion ou package partenaire</Text></View>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={pickImage} className="mb-5 h-44 overflow-hidden rounded-2xl border items-center justify-center" style={{ backgroundColor: colors.elevated, borderColor: colors.border }}>
            {imageUri ? <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : <><View className="h-12 w-12 items-center justify-center rounded-full bg-[#FEE2E2]"><Icon name="camera-outline" size={25} color="#E60012" /></View><Text className="mt-3 text-sm font-bold" style={{ color: colors.text }}>Ajouter une image de couverture</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>Format conseillé : 16:9</Text></>}
            {imageUri ? <View className="absolute bottom-3 right-3 h-10 w-10 items-center justify-center rounded-full bg-black/60"><Icon name="camera" size={20} color="#FFFFFF" /></View> : null}
          </TouchableOpacity>
          <Field label="Titre de l’offre *" value={title} onChangeText={setTitle} placeholder="Ex. Week-end détente à -20 %" />
          <Field label="Description *" value={description} onChangeText={setDescription} placeholder="Présentez clairement l’avantage proposé" multiline />
          <View className="flex-row gap-3"><View className="flex-1"><Field label="Prix promotionnel *" value={price} onChangeText={setPrice} placeholder="25 000" keyboardType="numeric" suffix="FCFA" /></View><View className="flex-1"><Field label="Prix initial" value={originalPrice} onChangeText={setOriginalPrice} placeholder="30 000" keyboardType="numeric" suffix="FCFA" /></View></View>
          <Field label="Valable jusqu’au *" value={validUntil} onChangeText={setValidUntil} placeholder="Ex. 30/08/2026" icon="calendar-outline" />
          <Field label="Conditions de l’offre" value={terms} onChangeText={setTerms} placeholder="Ex. Sur réservation, hors boissons…" multiline />
          <View className="mb-5 flex-row rounded-xl bg-[#FEE2E2] p-3"><Icon name="information-circle-outline" size={20} color="#E60012" /><Text className="ml-2 flex-1 text-xs leading-5 text-[#991B1B]">L’offre sera visible après validation par l’équipe Yeyamo.</Text></View>
          <CTAButton title="Publier l’offre" variant="primary" onPress={publish} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

type FieldProps = { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: 'default' | 'numeric'; suffix?: string; icon?: string };
function Field({ label, value, onChangeText, placeholder, multiline, keyboardType = 'default', suffix, icon }: FieldProps) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mb-4"><Text className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>{label}</Text><View className="flex-row items-center rounded-xl border px-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}>{icon ? <Icon name={icon} size={19} color={colors.textMuted} /> : null}<TextInput className={`flex-1 px-2 py-3 text-sm ${multiline ? 'min-h-24' : ''}`} style={{ color: colors.text, textAlignVertical: multiline ? 'top' : 'center' }} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted} multiline={multiline} keyboardType={keyboardType} />{suffix ? <Text className="text-xs font-semibold" style={{ color: colors.textSecondary }}>{suffix}</Text> : null}</View></View>;
}
