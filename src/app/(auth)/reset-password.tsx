import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/features/auth/auth.api';
import { useThemeStore } from '@/features/theme/theme.store';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const colors = useThemeStore((state) => state.colors);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isLoading, setLoading] = useState(false);

  const submit = async () => {
    const email = params.email?.trim();
    if (!email || code.length !== 6 || password.length < 8 || password !== confirmation) {
      Alert.alert('Informations invalides', 'Vérifiez le code et la confirmation du mot de passe.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ email, code, newPassword: password });
      Alert.alert('Mot de passe modifié', 'Vous pouvez maintenant vous connecter.');
      router.replace('/(auth)/login');
    } catch {
      Alert.alert('Échec', 'Le code est invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-center px-6">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>Nouveau mot de passe</Text>
        <Text className="mb-6 mt-2 text-sm" style={{ color: colors.textSecondary }}>{params.email}</Text>
        <View className="gap-4">
          <Input value={code} onChangeText={setCode} placeholder="Code à 6 chiffres" keyboardType="number-pad" />
          <Input value={password} onChangeText={setPassword} placeholder="Nouveau mot de passe" secureTextEntry />
          <Input value={confirmation} onChangeText={setConfirmation} placeholder="Confirmer le mot de passe" secureTextEntry />
          <Button label="Réinitialiser" onPress={() => void submit()} isLoading={isLoading} />
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
