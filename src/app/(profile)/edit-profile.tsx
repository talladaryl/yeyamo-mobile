import { useEffect, useMemo, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AVAILABLE_INTERESTS, type ProfileSettings } from '@/features/settings/types';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { useYeyamoMediaPicker } from '@/components/media/useYeyamoMediaPicker';
import { FormSelect } from '@/components/ui/FormSelect';
import { Input } from '@/components/ui/Input';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Button } from '@/components/ui/Button';
import { ErrorState, LoadingState } from '@/components/ui/ViewStates';
import { useThemeStore } from '@/features/theme/theme.store';
import { useProfileSettings, useUpdateProfileLocation, useUpdateProfileSettings } from '@/features/settings/useSettings';
import { useUploadMedia } from '@/features/post/usePost';
import { useInterestsStore } from '@/features/interests/interests.store';
import { toMediaFormData, type PickedMediaAsset } from '@/features/media/media.utils';
import { useCountries, useCountryCities, useCountryConfiguration } from '@/features/country/country.hooks';

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const profileQuery = useProfileSettings();
  const countriesQuery = useCountries();
  const updateProfile = useUpdateProfileSettings();
  const updateLocation = useUpdateProfileLocation();
  const uploadMedia = useUploadMedia();
  const { pickFromLibrary } = useYeyamoMediaPicker();
  const saveInterests = useInterestsStore((state) => state.saveInterests);
  const setSelectedInterests = useInterestsStore((state) => state.setSelectedInterests);
  const [settings, setSettings] = useState<ProfileSettings | null>(null);
  const [avatarAsset, setAvatarAsset] = useState<PickedMediaAsset | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => { if (profileQuery.data && !settings) setSettings(profileQuery.data); }, [profileQuery.data, settings]);
  const citiesQuery = useCountryCities(settings?.country_code ?? null);
  const configurationQuery = useCountryConfiguration(settings?.country_code ?? null);
  const countryOptions = useMemo(() => (countriesQuery.data ?? []).map((country) => ({ label: `${country.flag} ${country.name}`, value: country.code })), [countriesQuery.data]);
  const cityOptions = useMemo(() => (citiesQuery.data ?? []).filter((city) => city.active).map((city) => ({ label: city.name, value: city.id })), [citiesQuery.data]);
  const busy = updateProfile.isPending || updateLocation.isPending || uploadMedia.isPending;

  const handlePickAvatar = async () => {
    setFailure(null);
    try {
      const result = await pickFromLibrary({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
      if (!result.cancelled && result.assets[0]) setAvatarAsset(result.assets[0]);
    } catch (error) {
      setFailure(errorMessage(error, 'La sélection de la photo a échoué.'));
    }
  };

  const handleSave = async () => {
    if (!settings || busy) return;
    setFailure(null);
    let avatarUrl = settings.avatar_url;
    if (avatarAsset) {
      try {
        avatarUrl = (await uploadMedia.mutateAsync(toMediaFormData(avatarAsset, 'avatar'))).data.url;
      } catch (error) {
        setFailure(errorMessage(error, 'La photo n’a pas été envoyée. Le profil est inchangé.'));
        return;
      }
    }
    const next = { ...settings, avatar_url: avatarUrl };
    try {
      await updateProfile.mutateAsync(next);
    } catch (error) {
      setFailure(errorMessage(error, 'Les informations du profil n’ont pas été enregistrées.'));
      return;
    }
    if (settings.country_code && (settings.country_code !== profileQuery.data?.country_code || settings.city_id !== profileQuery.data?.city_id)) {
      try {
        await updateLocation.mutateAsync({ countryCode: settings.country_code, cityId: settings.city_id, timezone: configurationQuery.data?.defaultTimezone ?? settings.timezone });
      } catch (error) {
        setFailure(errorMessage(error, 'Le profil est enregistré, mais la localisation n’a pas pu être mise à jour.'));
        return;
      }
    }
    try {
      setSelectedInterests(settings.interests);
      await saveInterests();
    } catch (error) {
      setFailure(errorMessage(error, 'Le profil est enregistré, mais les préférences Explorer n’ont pas été conservées sur cet appareil.'));
      return;
    }
    router.back();
  };
  

  if (profileQuery.isLoading || !settings) return <LoadingState label="Chargement du profil…" />;
  if (profileQuery.isError) return <ErrorState title="Profil indisponible" message="Vos informations ne peuvent pas être chargées pour le moment." retry={() => void profileQuery.refetch()} />;

  const avatarUri = avatarAsset?.uri ?? settings.avatar_url;
  return <View className="flex-1" style={{ backgroundColor: colors.background }}>
    <View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={() => router.back()} className="-ml-2 p-2" accessibilityRole="button" accessibilityLabel="Retour"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="ml-2 text-xl font-bold" style={{ color: colors.text }}>Modifier le profil</Text></View>
    <YeyamoFormScreen footer={<View className="p-4"><Button label="Enregistrer" onPress={() => void handleSave()} isLoading={busy} /></View>}>
      <View className="items-center border-b py-6" style={{ borderColor: colors.border }}><View className="relative">{avatarUri ? <Image source={{ uri: avatarUri }} className="h-24 w-24 rounded-full" /> : <View className="h-24 w-24 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Ionicons name="person" size={40} color={colors.textMuted} /></View>}<TouchableOpacity className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: colors.primary }} onPress={() => void handlePickAvatar()} accessibilityRole="button" accessibilityLabel="Modifier la photo"><Ionicons name="camera" size={16} color="#FFFFFF" /></TouchableOpacity></View><Text className="mt-2 text-xs" style={{ color: colors.textSecondary }}>Photo de profil</Text></View>
      <View className="gap-4 px-4 py-6">
        {failure ? <View className="rounded-xl border p-3" style={{ borderColor: colors.primary, backgroundColor: colors.surface }}><Text style={{ color: colors.textSecondary }}>{failure}</Text></View> : null}
        <Input label="Nom affiché" value={settings.display_name} onChangeText={(display_name) => setSettings({ ...settings, display_name })} placeholder="Votre nom" maxLength={100} />
        <Input label="Identifiant" value={settings.username} editable={false} helperText="Le changement d’identifiant n’est pas pris en charge par le contrat de profil actuel." autoCapitalize="none" />
        <Input label="Bio" value={settings.bio ?? ''} onChangeText={(bio) => setSettings({ ...settings, bio })} placeholder="Parlez de vous…" multiline numberOfLines={4} maxLength={500} />
        <FormSelect label="Pays" value={settings.country_code ?? undefined} options={countryOptions} placeholder={countriesQuery.isLoading ? 'Chargement…' : 'Sélectionner un pays'} onChange={(country_code) => setSettings({ ...settings, country_code, city_id: null })} />
        {countriesQuery.isError ? <Text className="-mt-3 text-xs" style={{ color: colors.primary }}>Impossible de charger les pays. Réessayez plus tard.</Text> : null}
        <FormSelect label="Ville" value={settings.city_id ?? undefined} options={cityOptions} placeholder={!settings.country_code ? 'Choisissez d’abord un pays' : citiesQuery.isLoading ? 'Chargement…' : 'Sélectionner une ville (facultatif)'} onChange={(city_id) => setSettings({ ...settings, city_id })} />
        {citiesQuery.isError ? <Text className="-mt-3 text-xs" style={{ color: colors.primary }}>Impossible de charger les villes pour ce pays.</Text> : null}
        <MultiSelect label="Centres d’intérêt" values={settings.interests} options={AVAILABLE_INTERESTS.map((interest) => ({ label: interest.label, value: interest.id }))} onChange={(interests) => setSettings({ ...settings, interests })} />
        <Text className="-mt-2 text-xs leading-5" style={{ color: colors.textSecondary }}>Ces centres d’intérêt sont des préférences Explorer enregistrées sur cet appareil. Le profil backend ne fournit pas encore ce champ.</Text>
      </View>
    </YeyamoFormScreen>
  </View>;
}
