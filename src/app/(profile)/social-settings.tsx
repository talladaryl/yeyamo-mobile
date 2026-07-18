// ÉCRAN 8 - Paramètres Social Graph
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { mockSettings } from '@/features/social/mockData';
import type { SocialSettings } from '@/features/social/types';

export default function SocialSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<SocialSettings>(mockSettings);

  const updatePrivacy = (key: keyof SocialSettings['privacy'], value: any) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value },
    }));
  };

  const updateNotifications = (key: keyof SocialSettings['notifications'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const updatePreferences = (key: keyof SocialSettings['preferences'], value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Paramètres réseau social',
        }}
      />

      <ScrollView>
        {/* Privacy Section */}
        <View className="mt-4">
          <Text className="text-[#18181B] dark:text-white font-bold text-base px-4 mb-3">Confidentialité</Text>

          {/* Profile Visibility */}
          <View className="bg-white dark:bg-[#161616] mx-4 rounded-xl overflow-hidden mb-3">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              activeOpacity={0.7}
            >
              <View className="flex-1">
                <Text className="text-[#18181B] dark:text-white font-semibold text-sm">Visibilité du profil</Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">
                  {settings.privacy.profile_visibility === 'public'
                    ? 'Public - Tout le monde'
                    : settings.privacy.profile_visibility === 'followers'
                    ? 'Abonnés uniquement'
                    : 'Privé'}
                </Text>
              </View>
              <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Show Activity */}
          <View className="bg-white dark:bg-[#161616] mx-4 rounded-xl overflow-hidden mb-3">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-[#18181B] dark:text-white font-semibold text-sm">Afficher mon activité</Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">
                  Les autres peuvent voir vos likes et commentaires
                </Text>
              </View>
              <Switch
                value={settings.privacy.show_activity}
                onValueChange={(value) => updatePrivacy('show_activity', value)}
                trackColor={{ false: '#27272A', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Show Followers */}
          <View className="bg-white dark:bg-[#161616] mx-4 rounded-xl overflow-hidden mb-3">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-[#18181B] dark:text-white font-semibold text-sm">Afficher mes abonnés</Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">
                  Masquer votre liste d'abonnés
                </Text>
              </View>
              <Switch
                value={settings.privacy.show_followers}
                onValueChange={(value) => updatePrivacy('show_followers', value)}
                trackColor={{ false: '#27272A', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Show Following */}
          <View className="bg-white dark:bg-[#161616] mx-4 rounded-xl overflow-hidden mb-3">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-[#18181B] dark:text-white font-semibold text-sm">Afficher mes abonnements</Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">
                  Masquer votre liste d'abonnements
                </Text>
              </View>
              <Switch
                value={settings.privacy.show_following}
                onValueChange={(value) => updatePrivacy('show_following', value)}
                trackColor={{ false: '#27272A', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View className="mt-6">
          <Text className="text-[#18181B] dark:text-white font-bold text-base px-4 mb-3">Notifications</Text>

          {/* New Followers */}
          <View className="bg-white dark:bg-[#161616] mx-4 rounded-xl overflow-hidden mb-3">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-[#18181B] dark:text-white font-semibold text-sm">Nouveaux abonnés</Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">
                  Quand quelqu'un vous suit
                </Text>
              </View>
              <Switch
                value={settings.notifications.new_followers}
                onValueChange={(value) => updateNotifications('new_followers', value)}
                trackColor={{ false: '#27272A', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Follow Requests */}
          <View className="bg-white dark:bg-[#161616] mx-4 rounded-xl overflow-hidden mb-3">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-[#18181B] dark:text-white font-semibold text-sm">Demandes d'abonnement</Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">
                  Si votre profil est privé
                </Text>
              </View>
              <Switch
                value={settings.notifications.follow_requests}
                onValueChange={(value) => updateNotifications('follow_requests', value)}
                trackColor={{ false: '#27272A', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Mentions */}
          <View className="bg-white dark:bg-[#161616] mx-4 rounded-xl overflow-hidden mb-3">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-[#18181B] dark:text-white font-semibold text-sm">Mentions</Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">
                  Quand quelqu'un vous mentionne
                </Text>
              </View>
              <Switch
                value={settings.notifications.mentions}
                onValueChange={(value) => updateNotifications('mentions', value)}
                trackColor={{ false: '#27272A', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Activity Updates */}
          <View className="bg-white dark:bg-[#161616] mx-4 rounded-xl overflow-hidden mb-3">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-[#18181B] dark:text-white font-semibold text-sm">Mises à jour d'activité</Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">
                  Activité de votre réseau
                </Text>
              </View>
              <Switch
                value={settings.notifications.activity_updates}
                onValueChange={(value) => updateNotifications('activity_updates', value)}
                trackColor={{ false: '#27272A', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="mt-6">
          <Text className="text-[#18181B] dark:text-white font-bold text-base px-4 mb-3">Préférences</Text>

          {/* Allow Suggestions */}
          <View className="bg-white dark:bg-[#161616] mx-4 rounded-xl overflow-hidden mb-3">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-[#18181B] dark:text-white font-semibold text-sm">Autoriser les suggestions</Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">
                  Suggérer votre profil aux autres
                </Text>
              </View>
              <Switch
                value={settings.preferences.allow_suggestions}
                onValueChange={(value) => updatePreferences('allow_suggestions', value)}
                trackColor={{ false: '#27272A', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Messages from Strangers */}
          <View className="bg-white dark:bg-[#161616] mx-4 rounded-xl overflow-hidden mb-3">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1">
                <Text className="text-[#18181B] dark:text-white font-semibold text-sm">Messages des inconnus</Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-1">
                  Autoriser les personnes que vous ne suivez pas
                </Text>
              </View>
              <Switch
                value={settings.preferences.allow_messages_from_strangers}
                onValueChange={(value) => updatePreferences('allow_messages_from_strangers', value)}
                trackColor={{ false: '#27272A', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Blocked Users */}
        <View className="mt-6 mb-6">
          <Text className="text-[#18181B] dark:text-white font-bold text-base px-4 mb-3">Comptes bloqués</Text>

          <TouchableOpacity
            className="bg-white dark:bg-[#161616] mx-4 rounded-xl p-4 flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full items-center justify-center">
                <Icon library="ionicons" name="ban" size={20} color="#EF4444" />
              </View>
              <Text className="text-[#18181B] dark:text-white font-semibold text-sm">Utilisateurs bloqués</Text>
            </View>
            <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
          </TouchableOpacity>
        </View>

        {/* Spacer for bottom safe area */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
