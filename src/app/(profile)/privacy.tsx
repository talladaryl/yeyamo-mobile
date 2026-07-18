// ÉCRAN 2 - Confidentialité
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { MOCK_USER_SETTINGS } from '@/features/settings/mockData';
import { ToggleItem } from '@/components/settings/ToggleItem';
import { RadioItem } from '@/components/settings/RadioItem';

export default function PrivacyScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState(MOCK_USER_SETTINGS.privacy);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-[#18181B] dark:text-white text-xl font-bold ml-2">Confidentialité</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Visibilité du compte */}
        <View className="mt-6 px-4">
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-3">
            Visibilité du compte
          </Text>
          <View className="bg-white dark:bg-[#161616] rounded-xl overflow-hidden">
            <RadioItem
              label="Public"
              description="Tout le monde peut voir votre profil"
              selected={settings.account_visibility === 'public'}
              onPress={() =>
                setSettings({ ...settings, account_visibility: 'public' })
              }
              showBorder={false}
            />
            <RadioItem
              label="Privé"
              description="Seuls vos abonnés peuvent voir vos publications"
              selected={settings.account_visibility === 'private'}
              onPress={() =>
                setSettings({ ...settings, account_visibility: 'private' })
              }
            />
            <RadioItem
              label="Amis uniquement"
              description="Seuls vos amis peuvent voir votre profil"
              selected={settings.account_visibility === 'friends_only'}
              onPress={() =>
                setSettings({ ...settings, account_visibility: 'friends_only' })
              }
            />
          </View>

          <View className="bg-white dark:bg-[#161616] rounded-xl overflow-hidden mt-3">
            <ToggleItem
              label="Afficher mon statut en ligne"
              description="Les autres peuvent voir si vous êtes en ligne"
              value={settings.show_online_status}
              onValueChange={(value) =>
                setSettings({ ...settings, show_online_status: value })
              }
              showBorder={false}
            />
          </View>
        </View>

        {/* Interactions */}
        <View className="mt-6 px-4">
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-3">
            Interactions
          </Text>
          
          {/* Qui peut m'envoyer des messages */}
          <View className="bg-white dark:bg-[#161616] rounded-xl overflow-hidden mb-3">
            <View className="px-4 py-3">
              <Text className="text-[#18181B] dark:text-white font-medium text-sm mb-2">
                Qui peut m'envoyer des messages
              </Text>
            </View>
            <RadioItem
              label="Tout le monde"
              selected={settings.who_can_message === 'everyone'}
              onPress={() =>
                setSettings({ ...settings, who_can_message: 'everyone' })
              }
            />
            <RadioItem
              label="Mes amis"
              selected={settings.who_can_message === 'friends'}
              onPress={() =>
                setSettings({ ...settings, who_can_message: 'friends' })
              }
            />
            <RadioItem
              label="Personne"
              selected={settings.who_can_message === 'no_one'}
              onPress={() =>
                setSettings({ ...settings, who_can_message: 'no_one' })
              }
            />
          </View>

          {/* Qui peut voir mes publications */}
          <View className="bg-white dark:bg-[#161616] rounded-xl overflow-hidden mb-3">
            <View className="px-4 py-3">
              <Text className="text-[#18181B] dark:text-white font-medium text-sm mb-2">
                Qui peut voir mes publications
              </Text>
            </View>
            <RadioItem
              label="Tout le monde"
              selected={settings.who_can_see_posts === 'everyone'}
              onPress={() =>
                setSettings({ ...settings, who_can_see_posts: 'everyone' })
              }
            />
            <RadioItem
              label="Mes amis"
              selected={settings.who_can_see_posts === 'friends'}
              onPress={() =>
                setSettings({ ...settings, who_can_see_posts: 'friends' })
              }
            />
            <RadioItem
              label="Personne"
              selected={settings.who_can_see_posts === 'no_one'}
              onPress={() =>
                setSettings({ ...settings, who_can_see_posts: 'no_one' })
              }
            />
          </View>

          {/* Qui peut me taguer */}
          <View className="bg-white dark:bg-[#161616] rounded-xl overflow-hidden">
            <View className="px-4 py-3">
              <Text className="text-[#18181B] dark:text-white font-medium text-sm mb-2">
                Qui peut me taguer dans les publications
              </Text>
            </View>
            <RadioItem
              label="Tout le monde"
              selected={settings.who_can_tag_me === 'everyone'}
              onPress={() =>
                setSettings({ ...settings, who_can_tag_me: 'everyone' })
              }
            />
            <RadioItem
              label="Mes amis"
              selected={settings.who_can_tag_me === 'friends'}
              onPress={() =>
                setSettings({ ...settings, who_can_tag_me: 'friends' })
              }
            />
            <RadioItem
              label="Personne"
              selected={settings.who_can_tag_me === 'no_one'}
              onPress={() =>
                setSettings({ ...settings, who_can_tag_me: 'no_one' })
              }
            />
          </View>
        </View>

        {/* Localisation */}
        <View className="mt-6 px-4 pb-8">
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-3">
            Localisation
          </Text>
          <View className="bg-white dark:bg-[#161616] rounded-xl overflow-hidden">
            <ToggleItem
              label="Afficher ma ville sur mon profil"
              value={settings.show_city_in_profile}
              onValueChange={(value) =>
                setSettings({ ...settings, show_city_in_profile: value })
              }
              showBorder={false}
            />
            <ToggleItem
              label="Inclure ma localisation dans les publications"
              value={settings.show_location_in_posts}
              onValueChange={(value) =>
                setSettings({ ...settings, show_location_in_posts: value })
              }
            />
            <ToggleItem
              label="Apparaître dans les recherches"
              value={settings.show_in_search}
              onValueChange={(value) =>
                setSettings({ ...settings, show_in_search: value })
              }
            />
            <ToggleItem
              label="Apparaître dans les suggestions"
              value={settings.show_in_suggestions}
              onValueChange={(value) =>
                setSettings({ ...settings, show_in_suggestions: value })
              }
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
