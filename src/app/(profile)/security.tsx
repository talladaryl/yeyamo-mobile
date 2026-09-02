// ÉCRAN 3 - Sécurité du Compte
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { MOCK_USER_SETTINGS } from '@/features/settings/mockData';
import { NavigationItem } from '@/components/settings/NavigationItem';
import { ToggleItem } from '@/components/settings/ToggleItem';
import { useAuthStore } from '@/features/auth/auth.store';

export default function SecurityScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const [settings, setSettings] = useState(() => isDemo ? MOCK_USER_SETTINGS.security : {
    password_last_changed: '',
    email: user?.email ?? '',
    email_verified: user?.is_verified ?? false,
    phone: null,
    phone_verified: false,
    two_factor_enabled: false,
    active_sessions: [],
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Changement de mot de passe',
      'En mode démo, utilisez le parcours Mot de passe oublié depuis la page de connexion.'
    );
  };

  const handleManageSessions = () => {
    Alert.alert(
      'Sessions actives',
      `${settings.active_sessions.length} appareils connectés`,
      [
        ...settings.active_sessions.map((session) => ({
          text: `${session.device_name} - ${session.location}`,
          onPress: () => {
            if (!session.is_current) {
              Alert.alert('Déconnecter', 'Voulez-vous déconnecter cet appareil ?', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Déconnecter', style: 'destructive' },
              ]);
            }
          },
        })),
        { text: 'Fermer', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0A0A0A]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-[#18181B] dark:text-white text-xl font-bold ml-2">Sécurité</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Connexion */}
        <View className="mt-6 px-4">
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-3">
            Connexion
          </Text>
          <View className="bg-white dark:bg-[#161616] rounded-xl overflow-hidden">
            <NavigationItem
              icon="lock-closed-outline"
              label="Mot de passe"
              description={`Modifié le ${formatDate(settings.password_last_changed)}`}
              onPress={handleChangePassword}
              showBorder={false}
            />
            <View className="px-4 py-4 border-t border-[#E4E4E7] dark:border-[#27272A]">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full items-center justify-center mr-3">
                  <Ionicons name="mail-outline" size={20} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-[#18181B] dark:text-white font-medium text-sm">Email</Text>
                  <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-0.5">
                    {settings.email}
                  </Text>
                </View>
                {settings.email_verified && (
                  <View className="w-6 h-6 bg-[#10B981] rounded-full items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </View>
            <View className="px-4 py-4 border-t border-[#E4E4E7] dark:border-[#27272A]">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-[#F4F4F5] dark:bg-[#27272A] rounded-full items-center justify-center mr-3">
                  <Ionicons name="call-outline" size={20} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="text-[#18181B] dark:text-white font-medium text-sm">Téléphone</Text>
                  <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mt-0.5">
                    {settings.phone || 'Non renseigné'}
                  </Text>
                </View>
                {settings.phone_verified && (
                  <View className="w-6 h-6 bg-[#10B981] rounded-full items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Authentification */}
        <View className="mt-6 px-4">
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-3">
            Authentification à deux facteurs
          </Text>
          <View className="bg-white dark:bg-[#161616] rounded-xl overflow-hidden">
            <ToggleItem
              icon="shield-checkmark-outline"
              label="Authentification à deux facteurs"
              description="Sécurisez votre compte avec un code de vérification"
              value={settings.two_factor_enabled}
              onValueChange={(value) => {
                if (value) {
                  Alert.alert(
                    'Activer 2FA',
                    'Vous recevrez un code par SMS à chaque connexion'
                  );
                }
                setSettings({ ...settings, two_factor_enabled: value });
              }}
              showBorder={false}
            />
          </View>
        </View>

        {/* Sessions actives */}
        <View className="mt-6 px-4">
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-3">
            Sessions actives
          </Text>
          <View className="bg-white dark:bg-[#161616] rounded-xl overflow-hidden">
            <NavigationItem
              icon="phone-portrait-outline"
              label="Gérer les appareils"
              description={`${settings.active_sessions.length} appareils connectés`}
              onPress={handleManageSessions}
              showBorder={false}
            />
          </View>
        </View>

        {/* Badge sécurité */}
        <View className="mt-6 px-4 pb-8">
          <View className="bg-white dark:bg-[#161616] rounded-xl p-4 border border-[#10B981]/20">
            <View className="flex-row items-start">
              <View className="w-12 h-12 bg-[#10B981]/20 rounded-full items-center justify-center mr-3">
                <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-[#18181B] dark:text-white font-bold text-base mb-1">
                  Compte sécurisé
                </Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm leading-5">
                  Votre compte est protégé. Email et téléphone vérifiés.
                  {settings.two_factor_enabled
                    ? ' Authentification à deux facteurs activée.'
                    : ' Activez la 2FA pour plus de sécurité.'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
