import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SettingsItem } from '@/components/profile/SettingsItem';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeStore } from '@/features/theme/theme.store';
import { i18n } from '@/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { preference, setThemePreference, colors } = useThemeStore();

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
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
      <View className="border-b px-4 py-3" style={{ borderColor: colors.border }}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="ml-2 text-xl font-bold" style={{ color: colors.text }}>Paramètres</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mt-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Mon compte</Text>
          <View className="overflow-hidden rounded-xl" style={{ backgroundColor: colors.card }}>
            <SettingsItem icon="person-outline" label="Modifier le profil" onPress={() => router.push('/(profile)/edit-profile')} />
            <SettingsItem icon="shield-checkmark-outline" label="Confidentialité" onPress={() => router.push('/(profile)/privacy')} showBorder />
            <SettingsItem icon="lock-closed-outline" label="Sécurité du compte" onPress={() => router.push('/(profile)/security')} showBorder />
          </View>
        </View>

        <View className="mt-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Apparence</Text>
          <View className="overflow-hidden rounded-xl" style={{ backgroundColor: colors.card }}>
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
          <Text className="mb-3 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Préférences</Text>
          <View className="overflow-hidden rounded-xl" style={{ backgroundColor: colors.card }}>
            <SettingsItem
              icon="language-outline"
              label="Langue & Préférences"
              value="Français"
              onPress={() => router.push('/(profile)/preferences')}
            />
            <View className="flex-row items-center justify-between border-t px-4 py-4" style={{ borderColor: colors.border }}>
              <View className="flex-row items-center flex-1">
                <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
                  <Ionicons name="notifications-outline" size={20} color="#EF4444" />
                </View>
                <Text className="ml-3 font-medium" style={{ color: colors.text }}>Notifications</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View className="mt-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Support & à propos</Text>
          <View className="overflow-hidden rounded-xl" style={{ backgroundColor: colors.card }}>
            <SettingsItem icon="help-circle-outline" label={i18n.t('support.howToUse')} onPress={() => router.push('/(profile)/help')} />
            <SettingsItem icon="help-circle-outline" label={i18n.t('support.faq')} onPress={() => router.push('/(profile)/faq')} showBorder />
            <SettingsItem icon="mail-outline" label={i18n.t('support.contact')} onPress={() => router.push('/(profile)/support')} showBorder />
            <SettingsItem icon="document-text-outline" label="Conditions d'utilisation" onPress={() => Alert.alert('CGU', 'Conditions d\'utilisation')} showBorder />
            <SettingsItem icon="shield-outline" label={i18n.t('support.privacyPolicy')} onPress={() => router.push('/(profile)/privacy-policy')} showBorder />
            <SettingsItem icon="information-circle-outline" label={i18n.t('support.about')} value="v1.0.0" onPress={() => router.push('/(profile)/about')} showBorder />
          </View>
        </View>

        <View className="mt-6 px-4">
          <Text className="mb-3 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>Gestion du compte</Text>
          <View className="overflow-hidden rounded-xl" style={{ backgroundColor: colors.card }}>
            <SettingsItem icon="trash-outline" label="Désactiver / Supprimer le compte" onPress={() => router.push('/(profile)/delete-account')} destructive />
          </View>
        </View>

        <View className="mt-6 px-4 pb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center rounded-xl border p-4"
            style={{ backgroundColor: colors.card, borderColor: `${colors.primary}33` }}
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
