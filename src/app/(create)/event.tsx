import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@/components/ui/Icon';
import { Toggle } from '@/components/ui/Toggle';
import { CTAButton } from '@/components/ui/CTAButton';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { useCreateStore } from '@/features/create/create.store';
import { useThemeStore } from '@/features/theme/theme.store';
import { formValidation } from '@/utils/formValidation';

export default function CreateEventScreen() {
  const router = useRouter();
  const initial = useRef(useCreateStore.getState().eventForm).current;
  const setEventForm = useCreateStore((state) => state.setEventForm);
  const colors = useThemeStore((state) => state.colors);
  const [coverImage, setCoverImage] = useState<string | null>(initial.cover_image_url ?? null);
  const [title, setTitle] = useState(initial.title ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [location, setLocation] = useState(initial.location ?? '');
  const [latitude, setLatitude] = useState(initial.latitude ?? '');
  const [longitude, setLongitude] = useState(initial.longitude ?? '');
  const [date, setDate] = useState(initial.date ?? '');
  const [time, setTime] = useState(initial.time ?? '');
  const [endTime, setEndTime] = useState(initial.end_time ?? '');
  const [maxParticipants, setMaxParticipants] = useState(String(initial.max_participants ?? 20));
  const [shareToFeed, setShareToFeed] = useState(initial.share_to_feed ?? true);

  const pickCoverImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [16, 9], quality: 1 });
    if (!result.canceled && result.assets?.[0]) {
      setCoverImage(result.assets[0].uri);
      setEventForm({ cover_image_url: result.assets[0].uri, cover_image_mime_type: result.assets[0].mimeType });
    }
  };

  const next = () => {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(location.trim());
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    const error = formValidation.required(title, 'Le titre')
      ?? formValidation.required(location, 'Le lieu')
      ?? formValidation.date(date, 'La date', true)
      ?? formValidation.required(time, 'L’heure de début')
      ?? formValidation.required(endTime, 'L’heure de fin')
      ?? formValidation.positiveNumber(maxParticipants, 'Le nombre de participants', true)
      ?? (!uuid && (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) ? 'Saisissez les coordonnées exactes du lieu libre, ou l’identifiant UUID d’un lieu Yeyamo.' : null);
    if (error) {
      Alert.alert('Informations à vérifier', error);
      return;
    }
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(`${date}T${endTime}:00`);
    if (end <= start) {
      Alert.alert('Horaire invalide', 'L’heure de fin doit être postérieure à l’heure de début.');
      return;
    }
    setEventForm({
      title: title.trim(), description: description.trim(), location: location.trim(), latitude, longitude, date, time,
      end_time: endTime, max_participants: Number(maxParticipants), share_to_feed: shareToFeed,
    });
    router.push('/(create)/event-settings');
  };

  return <View className="flex-1" style={{ backgroundColor: colors.background }}>
    <Stack.Screen options={{ headerShown: true, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerTitle: 'Créer une sortie', headerTitleStyle: { fontSize: 18, fontWeight: '600' }, headerLeft: () => <TouchableOpacity onPress={() => router.back()} className="ml-4"><Icon library="ionicons" name="arrow-back" size={24} color={colors.text} /></TouchableOpacity> }} />
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={pickCoverImage} activeOpacity={0.9} className="relative">
        {coverImage ? <Image source={{ uri: coverImage }} style={{ width: '100%', height: 200 }} contentFit="cover" /> : <View className="w-full h-48 bg-white dark:bg-[#161616] items-center justify-center"><Icon library="ionicons" name="image" size={48} color="#52525B" /><Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-2">Ajouter une photo de couverture</Text></View>}
      </TouchableOpacity>
      <View className="px-4 py-6">
        <Field label="Titre de votre sortie *" value={title} onChangeText={setTitle} placeholder="Ex : randonnée au Mont Cameroun" maxLength={100} />
        <Field label="Description" value={description} onChangeText={setDescription} placeholder="Décrivez votre sortie…" multiline maxLength={500} />
        <Field label="Lieu *" value={location} onChangeText={setLocation} placeholder="UUID d’un lieu Yeyamo ou nom du lieu libre" />
        <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs -mt-2 mb-4">Pour un lieu libre, saisissez aussi ses coordonnées. Un UUID Yeyamo suffit pour un lieu déjà référencé.</Text>
        <View className="flex-row gap-3"><View className="flex-1"><Field label="Latitude" value={latitude} onChangeText={setLatitude} placeholder="4.05" keyboardType="decimal-pad" /></View><View className="flex-1"><Field label="Longitude" value={longitude} onChangeText={setLongitude} placeholder="9.77" keyboardType="decimal-pad" /></View></View>
        <DateTimeField label="Date" value={date} onChange={setDate} mode="date" required minimumDate={new Date()} />
        <DateTimeField label="Heure de début" value={time} onChange={setTime} mode="time" required />
        <DateTimeField label="Heure de fin" value={endTime} onChange={setEndTime} mode="time" required />
        <Field label="Nombre maximal de participants" value={maxParticipants} onChangeText={setMaxParticipants} placeholder="20" keyboardType="number-pad" />
        <View className="bg-white dark:bg-[#161616] rounded-xl px-4 py-2 mb-4"><Toggle label="Partager dans le fil Sorties" value={shareToFeed} onValueChange={setShareToFeed} /></View>
        <View className="bg-[#FEF3C7]/10 border border-[#F59E0B]/30 rounded-xl p-4"><Text className="text-[#F59E0B] text-xs leading-5">Ne partagez pas votre adresse personnelle ni des informations sensibles dans la description publique.</Text></View>
      </View>
    </ScrollView>
    <View className="border-t px-4 py-4" style={{ backgroundColor: colors.background, borderColor: colors.border }}><View className="flex-row gap-3"><TouchableOpacity onPress={() => router.back()} className="flex-1 bg-[#F4F4F5] dark:bg-[#27272A] rounded-xl py-4 items-center"><Text className="text-[#18181B] dark:text-white text-sm font-semibold">Annuler</Text></TouchableOpacity><View className="flex-1"><CTAButton title="Suivant" variant="primary" onPress={next} disabled={!title || !location} /></View></View></View>
    </KeyboardAvoidingView>
  </View>;
}

function Field({ label, multiline, ...props }: { label: string; multiline?: boolean } & React.ComponentProps<typeof TextInput>) {
  return <View className="mb-4"><Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">{label}</Text><TextInput className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]" placeholderTextColor="#A1A1AA" multiline={multiline} style={multiline ? { minHeight: 100, textAlignVertical: 'top' } : undefined} {...props} /></View>;
}
