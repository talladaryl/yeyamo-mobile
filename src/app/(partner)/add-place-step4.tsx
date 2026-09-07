import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Stepper } from '@/components/ui/Stepper';
import { CTAButton } from '@/components/ui/CTAButton';
import { usePartnerStore } from '@/features/partner/partner.store';
import { useAuthStore } from '@/features/auth/auth.store';
import { partnerApi } from '@/features/partner/partner.api';
import { placesApi } from '@/features/places/places.api';
import { useThemeStore } from '@/features/theme/theme.store';

function messageFor(error: unknown) {
  return typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
    ? error.message
    : 'Impossible de créer ce lieu pour le moment. Réessayez plus tard.';
}

export default function AddPlaceStep4Screen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const sessionMode = useAuthStore((state) => state.sessionMode);
  const isDemo = sessionMode?.startsWith('demo-') ?? false;
  const { placeForm, resetPlaceForm } = usePartnerStore();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (isDemo) {
      resetPlaceForm();
      router.push('/(tabs)/explore');
      return;
    }
    if (!placeForm.categoryId || !placeForm.regionId || !placeForm.cityId || !placeForm.name || !placeForm.coordinates || !placeForm.exact_address) {
      Alert.alert('Informations incomplètes', 'Revenez aux étapes précédentes et complétez les références et la localisation du lieu.');
      return;
    }
    setIsPublishing(true);
    try {
      const partner = await partnerApi.me();
      if (partner.status !== 'APPROVED') {
        Alert.alert('Partenaire non approuvé', 'Votre compte partenaire doit être approuvé avant la création d’un lieu.');
        return;
      }
      await placesApi.createPlace({
        partnerId: partner.id,
        categoryId: placeForm.categoryId,
        regionId: placeForm.regionId,
        cityId: placeForm.cityId,
        name: placeForm.name,
        latitude: placeForm.coordinates.latitude,
        longitude: placeForm.coordinates.longitude,
        address: placeForm.exact_address,
        phone: placeForm.phone || undefined,
        website: placeForm.website || undefined,
        status: 'DRAFT',
      });
      resetPlaceForm();
      Alert.alert('Lieu envoyé', 'Votre lieu a été enregistré comme brouillon et sera vérifié avant publication.', [
        { text: 'Continuer', onPress: () => router.replace('/(tabs)/explore') },
      ]);
    } catch (error) {
      Alert.alert('Création impossible', messageFor(error));
    } finally {
      setIsPublishing(false);
    }
  };

  return <View className="flex-1" style={{ backgroundColor: colors.background }}><Stack.Screen options={{ headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerTitle: 'Ajouter un lieu', headerTitleStyle: { fontSize: 18, fontWeight: '600' }, headerLeft: () => <TouchableOpacity onPress={() => router.back()} className="ml-4"><Icon library="ionicons" name="arrow-back" size={24} color={colors.text} /></TouchableOpacity> }} />
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}><View className="px-4 py-6"><Stepper currentStep={4} totalSteps={4} /><View className="mb-6 mt-4 items-center"><View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-[#EF4444]/20"><Icon library="ionicons" name="checkmark-circle" size={48} color="#EF4444" /></View><Text className="mb-2 text-lg font-bold" style={{ color: colors.text }}>Aperçu</Text><Text className="text-center text-sm" style={{ color: colors.textSecondary }}>Vérifiez les informations avant envoi</Text></View>
      <View className="mb-6 overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}><View className="p-4"><Text className="mb-1 text-lg font-bold" style={{ color: colors.text }}>{placeForm.name || 'Lieu non renseigné'}</Text><Text className="text-sm" style={{ color: colors.textSecondary }}>{placeForm.category || 'Catégorie non renseignée'}</Text>
        <Detail label="Adresse" value={placeForm.exact_address} /><Detail label="Ville" value={[placeForm.city, placeForm.region].filter(Boolean).join(', ')} /><Detail label="Téléphone" value={placeForm.phone} /><Detail label="E-mail" value={placeForm.contact_email} /><Detail label="Site web" value={placeForm.website} />
      </View></View>
      <View className="flex-row rounded-xl border p-4" style={{ backgroundColor: colors.accentSoft, borderColor: colors.border }}><Icon library="ionicons" name="information-circle" size={20} color={colors.primary} /><Text className="ml-3 flex-1 text-xs leading-5" style={{ color: colors.textSecondary }}>En mode réel, seuls les champs reconnus par le contrat de création sont envoyés. Les informations éditoriales supplémentaires restent dans le brouillon local.</Text></View>
    </View><View className="h-24" /></ScrollView>
    <View className="absolute bottom-0 left-0 right-0 border-t px-4 py-4" style={{ backgroundColor: colors.background, borderColor: colors.border }}><View className="flex-row gap-3"><View className="flex-1"><CTAButton title="Retour" variant="secondary" onPress={() => router.back()} disabled={isPublishing} /></View><View className="flex-1"><CTAButton title={isDemo ? 'Publier le lieu' : 'Enregistrer le lieu'} onPress={handlePublish} loading={isPublishing} /></View></View></View>
  </View>;
}

function Detail({ label, value }: { label: string; value?: string }) {
  const colors = useThemeStore((state) => state.colors);
  return value ? <View className="mt-4"><Text className="mb-1 text-xs font-medium" style={{ color: colors.textSecondary }}>{label}</Text><Text className="text-sm" style={{ color: colors.text }}>{value}</Text></View> : null;
}
