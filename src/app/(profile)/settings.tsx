import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SettingsItem } from '@/components/profile/SettingsItem';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeStore } from '@/features/theme/theme.store';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { preference, setThemePreference } = useThemeStore();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const themeLabel = preference === 'light' ? 'Clair' : preference === 'dark' ? 'Sombre' : 'Système';

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]" edges={['top']}>
      <View className="px-4 py-3 border-b border-[#27272A]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-2">Paramètres</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mt-6 px-4">
          <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-3">Mon compte</Text>
          <View className="bg-[#161616] rounded-xl overflow-hidden">
            <SettingsItem icon="person-outline" label="Modifier le profil" onPress={() => router.push('/(profile)/edit-profile')} />
            <SettingsItem icon="shield-checkmark-outline" label="Confidentialité" onPress={() => router.push('/(profile)/privacy')} showBorder />
            <SettingsItem icon="lock-closed-outline" label="Sécurité du compte" onPress={() => router.push('/(profile)/security')} showBorder />
          </View>
        </View>

        <View className="mt-6 px-4">
          <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-3">Apparence</Text>
          <View className="bg-[#161616] rounded-xl overflow-hidden">
            <SettingsItem
              icon="color-palette-outline"
              label="Thème"
              value={themeLabel}
              onPress={() => setShowThemeSelector((value) => !value)}
            />
            {showThemeSelector ? (
              <ThemeSelector value={preference} onChange={(value) => setThemePreference(value)} />
            ) : null}
          </View>
        </View>

        <View className="mt-6 px-4">
          <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-3">Préférences</Text>
          <View className="bg-[#161616] rounded-xl overflow-hidden">
            <SettingsItem
              icon="language-outline"
              label="Langue & Préférences"
              value="Français"
              onPress={() => router.push('/(profile)/preferences')}
            />
            <View className="flex-row items-center justify-between px-4 py-4 border-t border-[#27272A]">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-[#27272A] rounded-full items-center justify-center">
                  <Ionicons name="notifications-outline" size={20} color="#EF4444" />
                </View>
                <Text className="text-white font-medium ml-3">Notifications</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#27272A', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View className="mt-6 px-4">
          <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-3">Support & à propos</Text>
          <View className="bg-[#161616] rounded-xl overflow-hidden">
            <SettingsItem icon="help-circle-outline" label="Aide" onPress={() => Alert.alert('Aide Yeyamo', 'Support demo : support@yeyamo.local')} />
            <SettingsItem icon="document-text-outline" label="Conditions d'utilisation" onPress={() => Alert.alert('CGU', 'Conditions d\'utilisation')} showBorder />
            <SettingsItem icon="shield-outline" label="Politique de confidentialité" onPress={() => Alert.alert('Politique', 'Politique de confidentialité')} showBorder />
            <SettingsItem icon="information-circle-outline" label="À propos de Yeyamo" value="v1.0.0" onPress={() => Alert.alert('À propos', 'Yeyamo - Version 1.0.0')} showBorder />
          </View>
        </View>

        <View className="mt-6 px-4">
          <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-3">Gestion du compte</Text>
          <View className="bg-[#161616] rounded-xl overflow-hidden">
            <SettingsItem icon="trash-outline" label="Désactiver / Supprimer le compte" onPress={() => router.push('/(profile)/delete-account')} destructive />
          </View>
        </View>

        <View className="mt-6 px-4 pb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-[#161616] rounded-xl p-4 flex-row items-center justify-center border border-[#EF4444]/20"
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-[#EF4444] font-semibold ml-2">Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
