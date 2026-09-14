import { useEffect, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AVAILABLE_INTERESTS, REGIONS, type ProfileSettings } from '@/features/settings/types';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { useYeyamoMediaPicker } from '@/components/media/useYeyamoMediaPicker';
import { FormSelect } from '@/components/ui/FormSelect';
import { Input } from '@/components/ui/Input';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { useThemeStore } from '@/features/theme/theme.store';
import { useProfileSettings, useUpdateProfileSettings } from '@/features/settings/useSettings';
import { useUploadMedia } from '@/features/post/usePost';
import { useInterestsStore } from '@/features/interests/interests.store';

const genderOptions = [
  { label: 'Homme', value: 'male' }, { label: 'Femme', value: 'female' }, { label: 'Autre', value: 'other' }, { label: 'Préfère ne pas dire', value: 'prefer_not_to_say' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { data } = useProfileSettings();
  const updateProfile = useUpdateProfileSettings();
  const uploadMedia = useUploadMedia();
  const { pickFromLibrary } = useYeyamoMediaPicker();
  const [settings, setSettings] = useState<ProfileSettings | null>(null);
  useEffect(() => { if (data) setSettings(data); }, [data]);
  if (!settings) return null;

  const handleSave = async () => {
    let avatarUrl = settings.avatar_url;
    if (avatarUrl?.startsWith('file:') || avatarUrl?.startsWith('content:')) {
      const formData = new FormData();
      formData.append('file', { uri: avatarUrl, name: 'avatar.jpg', type: 'image/jpeg' } as unknown as Blob);
      avatarUrl = (await uploadMedia.mutateAsync(formData)).data.url;
    }
    await updateProfile.mutateAsync({ ...settings, avatar_url: avatarUrl });
    const interests = useInterestsStore.getState();
    interests.setSelectedInterests(settings.interests);
    await interests.saveInterests();
    Alert.alert('Succès', 'Votre profil a été mis à jour');
    router.back();
  };
  const handlePickAvatar = async () => { try { const result = await pickFromLibrary({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 }); if (!result.cancelled && result.assets[0]) setSettings({ ...settings, avatar_url: result.assets[0].uri }); } catch (error) { Alert.alert('Image indisponible', error instanceof Error ? error.message : 'Réessayez dans quelques instants.'); } };

  return <SafeScreen><View className="flex-row items-center justify-between border-b px-4 py-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}><View className="flex-row items-center"><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityRole="button" accessibilityLabel="Retour"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="ml-2 text-xl font-bold" style={{ color: colors.text }}>Modifier le profil</Text></View><TouchableOpacity onPress={() => void handleSave()} disabled={updateProfile.isPending || uploadMedia.isPending} accessibilityRole="button" accessibilityLabel="Enregistrer le profil"><Text className="font-semibold" style={{ color: colors.primary, opacity: updateProfile.isPending || uploadMedia.isPending ? 0.5 : 1 }}>{updateProfile.isPending || uploadMedia.isPending ? 'Enregistrement…' : 'Enregistrer'}</Text></TouchableOpacity></View><YeyamoFormScreen><View className="items-center border-b py-6" style={{ borderColor: colors.border }}><View className="relative">{settings.avatar_url ? <Image source={{ uri: settings.avatar_url }} className="h-24 w-24 rounded-full" /> : <View className="h-24 w-24 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Ionicons name="person" size={40} color={colors.textMuted} /></View>}<TouchableOpacity className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: colors.primary }} onPress={() => void handlePickAvatar()} accessibilityRole="button" accessibilityLabel="Modifier la photo"><Ionicons name="camera" size={16} color="#FFFFFF" /></TouchableOpacity></View><Text className="mt-2 text-xs" style={{ color: colors.textSecondary }}>Modifier la photo</Text></View><View className="gap-4 px-4 py-6"><Input label="Nom" value={settings.display_name} onChangeText={(display_name) => setSettings({ ...settings, display_name })} placeholder="Votre nom" /><Input label="Nom d’utilisateur" value={settings.username} onChangeText={(username) => setSettings({ ...settings, username })} placeholder="@username" autoCapitalize="none" /><Input label="Bio" value={settings.bio || ''} onChangeText={(bio) => setSettings({ ...settings, bio })} placeholder="Parlez de vous…" multiline numberOfLines={3} /><View><Text className="mb-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>Ville</Text><TouchableOpacity className="min-h-12 flex-row items-center justify-between rounded-xl border px-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }} activeOpacity={0.7} onPress={() => Alert.alert('Ville', 'Sélecteur de ville à implémenter')}><Text style={{ color: settings.city ? colors.text : colors.textMuted }}>{settings.city || 'Sélectionner une ville'}</Text><Ionicons name="chevron-forward" size={18} color={colors.textMuted} /></TouchableOpacity></View><FormSelect label="Région" value={settings.region || undefined} options={REGIONS.map((value) => ({ label: value, value }))} onChange={(region) => setSettings({ ...settings, region })} /><FormSelect label="Genre" value={settings.gender || undefined} options={genderOptions} onChange={(gender) => setSettings({ ...settings, gender: gender as ProfileSettings['gender'] })} /><MultiSelect label="Centres d’intérêt" values={settings.interests} options={AVAILABLE_INTERESTS.map((interest) => ({ label: interest.label, value: interest.id }))} onChange={(interests) => setSettings({ ...settings, interests })} /></View></YeyamoFormScreen></SafeScreen>;
}
