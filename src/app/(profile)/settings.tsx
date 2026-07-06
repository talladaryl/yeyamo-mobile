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

  // États des toggles
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Se déconnecter',
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
        {/* Section Mon compte */}
        <View className="mt-6">
          <Text className="text-white font-bold text-base px-4 mb-3">Mon compte</Text>
          <View className="bg-[#161616] mx-4 rounded-xl overflow-hidden">
            <SettingsItem
              icon="person-outline"
              label="Informations personnelles"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
            <SettingsItem
              icon="lock-closed-outline"
              label="Mot de passe"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
              showBorder
            />
            <SettingsItem
              icon="shield-checkmark-outline"
              label="Confidentialité"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
              showBorder={false}
            />
          </View>
        </View>

        {/* Section Préférences */}
        <View className="mt-6">
          <Text className="text-white font-bold text-base px-4 mb-3">Préférences</Text>
          <View className="bg-[#161616] mx-4 rounded-xl overflow-hidden">
            <SettingsItem
              icon="language-outline"
              label="Langue"
              value="Français"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />

            {/* Notifications Push */}
            <View className="flex-row items-center px-4 py-4 border-t border-[#27272A]">
              <View className="w-10 h-10 rounded-full bg-[#27272A] items-center justify-center mr-3">
                <Ionicons name="notifications-outline" size={20} color="#EF4444" />
              </View>
              <Text className="flex-1 text-white font-medium text-base">Notifications</Text>
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
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
              showBorder
            />
            <SettingsItem
              icon="accessibility-outline"
              label="Accessibilité"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
              showBorder={false}
            />
          </View>
        </View>

        {/* Section Support & à propos */}
        <View className="mt-6">
          <Text className="text-white font-bold text-base px-4 mb-3">Support & à propos</Text>
          <View className="bg-[#161616] mx-4 rounded-xl overflow-hidden">
            <SettingsItem
              icon="help-circle-outline"
              label="Aide"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
            />
            <SettingsItem
              icon="document-text-outline"
              label="Conditions d'utilisation"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
              showBorder
            />
            <SettingsItem
              icon="shield-outline"
              label="Politique de confidentialité"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
              showBorder
            />
            <SettingsItem
              icon="information-circle-outline"
              label="À propos de Yeyamo"
              value="v1.0.0"
              onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
              showBorder={false}
            />
          </View>
        </View>

        {/* Bouton Déconnexion */}
        <View className="px-4 py-6 pb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-[#27272A] py-4 rounded-xl flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-[#EF4444] font-semibold text-base ml-2">Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
