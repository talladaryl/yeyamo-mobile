import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { SocialButton } from '@/components/auth/SocialButton';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/useAuth';
import { registerSchema, type RegisterForm } from '@/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const { register: registerUser, isLoading, error } = useAuth();
  const [countryCode, setCountryCode] = useState('+237');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      display_name: '', 
      username: '', 
      email: '', 
      password: '', 
      password_confirmation: '', 
      city: '',
      phone: ''
    },
  });

  const phoneValue = watch('phone') || '';

  const onSubmit = async (data: RegisterForm) => {
    try {
      const fullPhone = data.phone ? `${countryCode}${data.phone}` : undefined;
      await registerUser({
        ...data,
        phone: fullPhone,
      });
      // Navigation handled by root layout guard or verification screen
      router.replace('/(auth)/verify-code');
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
          contentContainerClassName="flex-grow px-6 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo et Header */}
          <View className="items-center mb-8">
            <Logo size="medium" />
            <Text className="text-white text-2xl font-bold mb-1 mt-3">
              Rejoignez la
              Rejoignez la
            </Text>
            <Text className="text-white text-2xl font-bold mb-2">
              communauté YEYAMO
            </Text>
            <Text className="text-[#A1A1AA] text-sm text-center">
              Découvrez tous les lieux avec les{'\n'}meilleures offres et nouveautés de{'\n'}la communauté
            </Text>
          </View>

          {/* Formulaire */}
          <View className="gap-4 mb-4">
            <Controller
              control={control}
              name="display_name"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Nom complet"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Nom complet"
                  error={errors.display_name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="E-mail"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  error={errors.email?.message}
                />
              )}
            />

            <PhoneInput
              label="Téléphone (+237 par défaut)"
              value={phoneValue}
              onChangeText={(text) => setValue('phone', text)}
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              placeholder="6XX XX XX XX"
              error={errors.phone?.message}
            />

            <Controller
              control={control}
              name="city"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Ville de résidence"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Ville de résidence"
                  error={errors.city?.message}
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
                  textContentType="newPassword"
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password_confirmation"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Confirmer le mot de passe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="••••••••"
                  secureTextEntry
                  textContentType="newPassword"
                  error={errors.password_confirmation?.message}
                />
              )}
            />

            {/* Auto-generate username from display_name */}
            <Controller
              control={control}
              name="username"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Nom d'utilisateur (auto-généré)"
                  value={value || watch('display_name')?.toLowerCase().replace(/\s+/g, '_')}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="nom_utilisateur"
                  error={errors.username?.message}
                />
              )}
            />

            {error && (
              <Text className="text-[#EF4444] text-sm text-center">{error}</Text>
            )}

            {/* CGU/Politique */}
            <View className="flex-row items-start mb-2">
              <View className="w-4 h-4 border border-[#A1A1AA] rounded mr-3 mt-0.5" />
              <Text className="text-[#A1A1AA] text-xs flex-1 leading-4">
                J'accepte les{' '}
                <Text className="text-[#EF4444]">Conditions Générales d'Utilisation</Text>
                {' '}et la{' '}
                <Text className="text-[#EF4444]">Politique de Confidentialité</Text>
              </Text>
            </View>

            <Button
              label="Créer mon compte"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              className="mt-2"
            />
          </View>

          {/* Connexion */}
          <View className="flex-row justify-center items-center mb-6 gap-1">
            <Text className="text-[#A1A1AA] text-sm">Vous avez déjà un compte ?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-[#EF4444] text-sm font-semibold">Se connecter</Text>
            </TouchableOpacity>
          </View>

          {/* Séparateur */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-[#27272A]" />
            <Text className="text-[#A1A1AA] text-sm mx-4">ou</Text>
            <View className="flex-1 h-px bg-[#27272A]" />
          </View>

          {/* Connexion sociale */}
          <View className="gap-3 mb-6">
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}