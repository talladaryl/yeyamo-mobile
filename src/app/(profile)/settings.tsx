// ÉCRAN 8 - Paramètres
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SettingsItem } from '@/components/profile/SettingsItem';
import { useAuth } from '@/features/auth/useAuth';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  // États des préférences
  const [language, setLanguage] = useState('Français');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [theme, setTheme] = useState('dark');

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#27272A]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-2">Paramètres</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Mon compte */}
        <View className="mt-6 px-4">
          <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-3">Mon compte</Text>
          
          <View className="bg-[#161616] rounded-xl overflow-hidden">
            <SettingsItem
              icon="person-outline"
              label="Informations personnelles"
              onPress={() => Alert.alert('Informations personnelles', 'Fonctionnalité à venir')}
            />
            <SettingsItem
              icon="lock-closed-outline"
              label="Mot de passe"
              onPress={() => Alert.alert('Mot de passe', 'Fonctionnalité à venir')}
              showBorder
            />
            <SettingsItem
              icon="shield-checkmark-outline"
              label="Confidentialité"
              onPress={() => Alert.alert('Confidentialité', 'Fonctionnalité à venir')}
              showBorder
            />
          </View>
        </View>

        {/* Préférences */}
        <View className="mt-6 px-4">
          <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-3">Préférences</Text>
          
          <View className="bg-[#161616] rounded-xl overflow-hidden">
            <SettingsItem
              icon="language-outline"
              label="Langue"
              value={language}
              onPress={() => Alert.alert('Langue', 'Sélection de langue à venir')}
            />
            
            {/* Notifications Push */}
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

            <SettingsItem
              icon="contrast-outline"
              label="Thème"
              value="Sombre"
              onPress={() => Alert.alert('Thème', 'Sélection de thème à venir')}
              showBorder
            />
            
            <SettingsItem
              icon="accessibility-outline"
              label="Accessibilité"
              onPress={() => Alert.alert('Accessibilité', 'Fonctionnalité à venir')}
              showBorder
            />
          </View>
        </View>

        {/* Support & À propos */}
        <View className="mt-6 px-4">
          <Text className="text-[#A1A1AA] text-xs font-semibold uppercase mb-3">Support & à propos</Text>
          
          <View className="bg-[#161616] rounded-xl overflow-hidden">
            <SettingsItem
              icon="help-circle-outline"
              label="Aide"
              onPress={() => Alert.alert('Aide', 'Centre d\'aide à venir')}
            />
            <SettingsItem
              icon="document-text-outline"
              label="Conditions d'utilisation"
              onPress={() => Alert.alert('CGU', 'Conditions d\'utilisation')}
              showBorder
            />
            <SettingsItem
              icon="shield-outline"
              label="Politique de confidentialité"
              onPress={() => Alert.alert('Politique', 'Politique de confidentialité')}
              showBorder
            />
            <SettingsItem
              icon="information-circle-outline"
              label="À propos de Yeyamo"
              value="v1.0.0"
              onPress={() => Alert.alert('À propos', 'Yeyamo - Version 1.0.0')}
              showBorder
            />
          </View>
        </View>

        {/* Déconnexion */}
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
