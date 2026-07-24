// ÉCRAN 1 - Modifier Profil
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { AVAILABLE_INTERESTS, REGIONS, type ProfileSettings } from '@/features/settings/types';
import { InterestTag } from '@/components/settings/InterestTag';
import { useThemeStore } from '@/features/theme/theme.store';
import { useProfileSettings, useUpdateProfileSettings } from '@/features/settings/useSettings';
import { useUploadMedia } from '@/features/post/usePost';
import { useInterestsStore } from '@/features/interests/interests.store';

export default function EditProfileScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { data } = useProfileSettings();
  const updateProfile = useUpdateProfileSettings();
  const uploadMedia = useUploadMedia();
  const [settings, setSettings] = useState<ProfileSettings | null>(null);

  useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  if (!settings) return null;

  const handleSave = async () => {
    let avatarUrl = settings.avatar_url;
    if (avatarUrl?.startsWith('file:') || avatarUrl?.startsWith('content:')) {
      const formData = new FormData();
      formData.append('file', {
        uri: avatarUrl,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as unknown as Blob);
      avatarUrl = (await uploadMedia.mutateAsync(formData)).data.url;
    }
    await updateProfile.mutateAsync({ ...settings, avatar_url: avatarUrl });
    const interests = useInterestsStore.getState();
    interests.setSelectedInterests(settings.interests);
    await interests.saveInterests();
    Alert.alert('Succès', 'Votre profil a été mis à jour');
    router.back();
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      setSettings({ ...settings, avatar_url: result.assets[0].uri });
    }
  };

  const handleAddInterest = () => {
    Alert.alert(
      'Ajouter un intérêt',
      'Sélectionnez un intérêt',
      AVAILABLE_INTERESTS.map((interest) => ({
        text: interest.label,
        onPress: () => {
          if (!settings.interests.includes(interest.id)) {
            setSettings({
              ...settings,
              interests: [...settings.interests, interest.id],
            });
          }
        },
      }))
    );
  };

  const handleRemoveInterest = (interestId: string) => {
    setSettings({
      ...settings,
      interests: settings.interests.filter((id) => id !== interestId),
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b flex-row items-center justify-between" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-[#18181B] dark:text-white text-xl font-bold ml-2">Modifier le profil</Text>
        </View>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
          <Text className="text-[#EF4444] font-semibold text-base">Enregistrer</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}>
        {/* Photo de profil */}
        <View className="items-center py-6 border-b border-[#E4E4E7] dark:border-[#27272A]">
          <View className="relative">
            {settings.avatar_url ? (
              <Image
                source={{ uri: settings.avatar_url }}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-[#F4F4F5] dark:bg-[#27272A] items-center justify-center">
                <Ionicons name="person" size={40} color="#A1A1AA" />
              </View>
            )}
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#EF4444] rounded-full items-center justify-center"
              activeOpacity={0.7}
              onPress={handlePickAvatar}
            >
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-2">Modifier la photo</Text>
        </View>

        {/* Formulaire */}
        <View className="px-4 pt-6">
          {/* Nom */}
          <View className="mb-4">
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-2">
              Nom
            </Text>
            <TextInput
              value={settings.display_name}
              onChangeText={(text) => setSettings({ ...settings, display_name: text })}
              className="border px-4 py-3 rounded-xl"
              style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}
              placeholderTextColor="#52525B"
              placeholder="Votre nom"
            />
          </View>

          {/* Nom d'utilisateur */}
          <View className="mb-4">
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-2">
              Nom d'utilisateur
            </Text>
            <TextInput
              value={settings.username}
              onChangeText={(text) => setSettings({ ...settings, username: text })}
              className="border px-4 py-3 rounded-xl"
              style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}
              placeholderTextColor="#52525B"
              placeholder="@username"
              autoCapitalize="none"
            />
          </View>

          {/* Bio */}
          <View className="mb-4">
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-2">
              Bio
            </Text>
            <TextInput
              value={settings.bio || ''}
              onChangeText={(text) => setSettings({ ...settings, bio: text })}
              className="border px-4 py-3 rounded-xl"
              style={{ minHeight: 96, backgroundColor: colors.card, borderColor: colors.border, color: colors.text }}
              placeholderTextColor="#52525B"
              placeholder="Parlez de vous..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Ville */}
          <View className="mb-4">
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-2">
              Ville
            </Text>
            <TouchableOpacity
              className="border px-4 py-3 rounded-xl flex-row items-center justify-between"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert('Ville', 'Sélecteur de ville à implémenter')
              }
            >
              <Text className="text-[#18181B] dark:text-white">{settings.city || 'Sélectionner une ville'}</Text>
              <Ionicons name="chevron-forward" size={18} color="#52525B" />
            </TouchableOpacity>
          </View>

          {/* Région */}
          <View className="mb-4">
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-2">
              Région
            </Text>
            <TouchableOpacity
              className="border px-4 py-3 rounded-xl flex-row items-center justify-between"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert(
                  'Région',
                  'Sélectionnez une région',
                  REGIONS.map((region) => ({
                    text: region,
                    onPress: () => setSettings({ ...settings, region }),
                  }))
                )
              }
            >
              <Text className="text-[#18181B] dark:text-white">
                {settings.region || 'Sélectionner une région'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#52525B" />
            </TouchableOpacity>
          </View>

          {/* Genre */}
          <View className="mb-4">
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-2">
              Genre
            </Text>
            <TouchableOpacity
              className="border px-4 py-3 rounded-xl flex-row items-center justify-between"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert('Genre', 'Sélectionnez votre genre', [
                  {
                    text: 'Homme',
                    onPress: () => setSettings({ ...settings, gender: 'male' }),
                  },
                  {
                    text: 'Femme',
                    onPress: () => setSettings({ ...settings, gender: 'female' }),
                  },
                  {
                    text: 'Autre',
                    onPress: () => setSettings({ ...settings, gender: 'other' }),
                  },
                  {
                    text: 'Préfère ne pas dire',
                    onPress: () =>
                      setSettings({ ...settings, gender: 'prefer_not_to_say' }),
                  },
                ])
              }
            >
              <Text className="text-[#18181B] dark:text-white">
                {settings.gender === 'male'
                  ? 'Homme'
                  : settings.gender === 'female'
                  ? 'Femme'
                  : settings.gender === 'other'
                  ? 'Autre'
                  : settings.gender === 'prefer_not_to_say'
                  ? 'Préfère ne pas dire'
                  : 'Sélectionner'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#52525B" />
            </TouchableOpacity>
          </View>

          {/* Centres d'intérêt */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase">
                Centres d'intérêt
              </Text>
              <TouchableOpacity onPress={handleAddInterest} activeOpacity={0.7}>
                <Ionicons name="add-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {settings.interests.map((interestId) => {
                const interest = AVAILABLE_INTERESTS.find((i) => i.id === interestId);
                if (!interest) return null;
                return (
                  <InterestTag
                    key={interestId}
                    label={interest.label}
                    onRemove={() => handleRemoveInterest(interestId)}
                  />
                );
              })}
              {settings.interests.length === 0 && (
                <Text className="text-[#52525B] text-sm">
                  Ajoutez vos centres d'intérêt
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
