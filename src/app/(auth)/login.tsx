import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SocialButton } from '@/components/auth/SocialButton';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/useAuth';
import { loginSchema, type LoginForm } from '@/utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      // Navigation handled by root layout guard
    } catch {
      // error displayed via useAuth state
    }
  };

  const handleDemoLogin = async () => {
    try {
      await login({ email: 'demo@yeyamo.com', password: 'password123' });
    } catch {
      // error displayed via useAuth state
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    // TODO: Implement social login
    console.log(`${provider} login not implemented yet`);
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-1 justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo et Header */}
          <View className="items-center mb-10">
            <Logo size="large" />
            <Text className="text-white text-4xl font-extrabold tracking-tight mt-4 mb-2">
              YEYAMO
            </Text>
            <Text className="text-[#A1A1AA] text-base text-center">
              Connectez-vous à votre{'\n'}compte YEYAMO
            </Text>
          </View>

          {/* Formulaire */}
          <View className="gap-4 mb-6">
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Email ou numéro de téléphone"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="nom.utilisateur"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Mot de passe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="••••••••"
                  secureTextEntry
                  textContentType="password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                />
              )}
            />

            {error ? (
              <Text className="text-[#EF4444] text-sm text-center">{error}</Text>
            ) : null}

            <Button
              label="Se connecter"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              className="mt-2"
            />
            <TouchableOpacity
              onPress={handleDemoLogin}
              disabled={isLoading}
              className="bg-[#27272A] rounded-xl py-3 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">Entrer en mode demo</Text>
            </TouchableOpacity>
          </View>

          {/* Lien mot de passe oublié */}
          <TouchableOpacity 
            onPress={() => router.push('/(auth)/forgot-password')}
            className="items-center mb-6"
          >
            <Text className="text-[#EF4444] text-sm">Mot de passe oublié ?</Text>
          </TouchableOpacity>

          {/* Inscription */}
          <View className="flex-row justify-center items-center mb-6 gap-1">
            <Text className="text-[#A1A1AA] text-sm">Vous n'avez pas de compte ?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-[#EF4444] text-sm font-semibold">Créer un compte</Text>
            </TouchableOpacity>
          </View>

          {/* Séparateur */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-[#27272A]" />
            <Text className="text-[#A1A1AA] text-sm mx-4">ou</Text>
            <View className="flex-1 h-px bg-[#27272A]" />
          </View>

          {/* Connexion sociale */}
          <View className="gap-3">
            <SocialButton
              provider="google"
              onPress={() => handleSocialLogin('google')}
              disabled={isLoading}
            />
            <SocialButton
              provider="apple"
              onPress={() => handleSocialLogin('apple')}
              disabled={isLoading}
            />
          </View>

          {/* Lien inscription partenaire */}
          <TouchableOpacity 
            onPress={() => router.push('/(auth)/register-partner')}
            className="items-center mt-6"
          >
            <Text className="text-[#A1A1AA] text-sm">
              Vous êtes un partenaire ?{' '}
              <Text className="text-[#EF4444]">Créer un compte partenaire</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
