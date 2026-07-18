// ÉCRAN 5 - Désactiver/Supprimer le Compte
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmDeletion, setConfirmDeletion] = useState(false);

  const handleDeactivate = () => {
    Alert.alert(
      'Désactiver le compte',
      'Votre compte sera désactivé temporairement. Vous pourrez le réactiver à tout moment en vous reconnectant.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désactiver',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Succès', 'Votre compte a été désactivé');
            logout();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    if (!password) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe');
      return;
    }

    if (!confirmDeletion) {
      Alert.alert(
        'Erreur',
        'Veuillez confirmer que vous comprenez que cette action est irréversible'
      );
      return;
    }

    Alert.alert(
      'Supprimer définitivement',
      'Êtes-vous absolument sûr ? Cette action ne peut pas être annulée et toutes vos données seront perdues.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Succès', 'Votre compte a été supprimé définitivement');
            logout();
          },
        },
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
          <Text className="text-[#18181B] dark:text-white text-xl font-bold ml-2">Gérer le compte</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Désactivation temporaire */}
        <View className="mt-6 px-4">
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-3">
            Désactivation temporaire
          </Text>
          <View className="bg-white dark:bg-[#161616] rounded-xl p-4">
            <View className="flex-row mb-3">
              <View className="w-10 h-10 bg-[#F59E0B]/20 rounded-full items-center justify-center mr-3">
                <Ionicons name="pause-circle" size={24} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-[#18181B] dark:text-white font-bold text-base mb-1">
                  Désactiver temporairement
                </Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm leading-5">
                  Votre profil sera caché et vous pourrez le réactiver à tout moment en
                  vous reconnectant.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleDeactivate}
              className="bg-[#F59E0B] rounded-xl py-3 items-center mt-2"
              activeOpacity={0.8}
            >
              <Text className="text-[#18181B] dark:text-white font-semibold text-base">
                Désactiver mon compte
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Suppression définitive */}
        <View className="mt-6 px-4">
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-semibold uppercase mb-3">
            Suppression définitive
          </Text>
          <View className="bg-white dark:bg-[#161616] rounded-xl p-4 border border-[#EF4444]/20">
            <View className="flex-row mb-3">
              <View className="w-10 h-10 bg-[#EF4444]/20 rounded-full items-center justify-center mr-3">
                <Ionicons name="trash" size={24} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-[#18181B] dark:text-white font-bold text-base mb-1">
                  Supprimer définitivement
                </Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm leading-5">
                  Toutes vos données seront définitivement supprimées. Cette action est
                  irréversible.
                </Text>
              </View>
            </View>

            {/* Avertissement */}
            <View className="bg-[#EF4444]/10 rounded-xl p-3 mb-4 border border-[#EF4444]/20">
              <View className="flex-row items-start">
                <Ionicons name="warning" size={20} color="#EF4444" />
                <View className="flex-1 ml-2">
                  <Text className="text-[#EF4444] font-semibold text-sm mb-1">
                    Attention
                  </Text>
                  <Text className="text-[#EF4444]/80 text-xs leading-4">
                    La suppression de votre compte entraînera la perte définitive de :
                  </Text>
                  <View className="mt-2">
                    <Text className="text-[#EF4444]/80 text-xs">• Tous vos posts</Text>
                    <Text className="text-[#EF4444]/80 text-xs">
                      • Vos conversations
                    </Text>
                    <Text className="text-[#EF4444]/80 text-xs">• Vos favoris</Text>
                    <Text className="text-[#EF4444]/80 text-xs">
                      • Vos réservations
                    </Text>
                    <Text className="text-[#EF4444]/80 text-xs">
                      • Votre réseau social
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Confirmation checkbox */}
            <TouchableOpacity
              onPress={() => setConfirmDeletion(!confirmDeletion)}
              className="flex-row items-center mb-4"
              activeOpacity={0.7}
            >
              <View
                className="w-5 h-5 rounded border-2 items-center justify-center mr-3"
                style={{
                  borderColor: confirmDeletion ? '#EF4444' : '#52525B',
                  backgroundColor: confirmDeletion ? '#EF4444' : 'transparent',
                }}
              >
                {confirmDeletion && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text className="text-[#18181B] dark:text-white text-sm flex-1">
                Je comprends que cette action est irréversible
              </Text>
            </TouchableOpacity>

            {/* Mot de passe */}
            <View className="mb-4">
              <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
                Entrez votre mot de passe pour confirmer
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                className="bg-[#F4F4F5] dark:bg-[#27272A] text-[#18181B] dark:text-white px-4 py-3 rounded-xl"
                placeholderTextColor="#52525B"
                placeholder="Mot de passe"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Bouton supprimer */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              className="bg-[#EF4444] rounded-xl py-3 items-center"
              activeOpacity={0.8}
              disabled={!password || !confirmDeletion}
              style={{
                opacity: password && confirmDeletion ? 1 : 0.5,
              }}
            >
              <Text className="text-[#18181B] dark:text-white font-bold text-base">
                Supprimer définitivement mon compte
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Aide */}
        <View className="mt-6 px-4 pb-8">
          <View className="bg-white dark:bg-[#161616] rounded-xl p-4">
            <View className="flex-row items-center">
              <Ionicons name="help-circle-outline" size={24} color="#EF4444" />
              <View className="flex-1 ml-3">
                <Text className="text-[#18181B] dark:text-white font-medium text-sm mb-1">
                  Besoin d'aide ?
                </Text>
                <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs">
                  Contactez notre support avant de supprimer votre compte
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert('Support Yeyamo', 'Contact demo : support@yeyamo.local')}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={20} color="#52525B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
