import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { CTAButton } from '@/components/ui/CTAButton';
import { Stepper } from '@/components/ui/Stepper';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { usePartnerStore } from '@/features/partner/partner.store';
import { useThemeStore } from '@/features/theme/theme.store';
import { formValidation } from '@/utils/formValidation';

export default function AddEventStep2Screen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { eventForm, setEventForm, setEventStep } = usePartnerStore();
  const [coverImage, setCoverImage] = useState<string | null>(eventForm.cover_image_url || null);
  const [endDate, setEndDate] = useState(eventForm.end_date || '');
  const [endTime, setEndTime] = useState(eventForm.end_time || '');
  const [error, setError] = useState<string>();
  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 0.9 });
    if (!result.canceled && result.assets[0]) setCoverImage(result.assets[0].uri);
  };
  const continueForm = () => {
    const next = formValidation.date(endDate, 'Date de fin')
      ?? formValidation.required(endTime, 'Heure de fin')
      ?? formValidation.dateOrder(eventForm.start_date || '', endDate);
    setError(next);
    if (next) return Alert.alert('Période à vérifier', next);
    setEventForm({ cover_image_url: coverImage, end_date: endDate, end_time: endTime });
    setEventStep(3);
    router.push('/(partner)/add-event-step3');
  };
  return <SafeScreen><Stack.Screen options={{ headerShown: false }} /><View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><View className="ml-3"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>Ajouter un événement</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>Période et visuel</Text></View></View>
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}><Stepper currentStep={2} totalSteps={4} /><Text className="mb-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>Image de couverture</Text><TouchableOpacity onPress={pick} className="mb-6 h-48 overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>{coverImage ? <Image source={{ uri: coverImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : <View className="flex-1 items-center justify-center"><Icon name="image-outline" size={38} color={colors.textMuted} /><Text className="mt-2 font-semibold" style={{ color: colors.textSecondary }}>Choisir une image</Text></View>}</TouchableOpacity><DateTimeField label="Date de fin" value={endDate} onChange={setEndDate} minimumDate={eventForm.start_date ? new Date(`${eventForm.start_date}T12:00:00`) : new Date()} error={error} required /><DateTimeField label="Heure de fin" value={endTime} onChange={setEndTime} mode="time" error={error} required /></ScrollView>
    <View className="absolute bottom-0 left-0 right-0 border-t px-4 py-4" style={{ backgroundColor: colors.background, borderColor: colors.border }}><CTAButton title="Continuer" onPress={continueForm} /></View></SafeScreen>;
}
