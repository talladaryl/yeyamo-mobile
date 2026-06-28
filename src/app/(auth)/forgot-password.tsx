import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/useAuth';
import { forgotPasswordSchema, type ForgotPasswordForm } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, isLoading, error } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      // TODO: Implement forgot password API call
      console.log('Forgot password for:', data.email);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/(auth)/verify-code');
    } catch {
      // error displayed via useAuth state
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-8 justify-center">
          {/* Header avec bouton retour */}
          <View className="flex-row items-center mb-8 absolute top-8 left-6">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-white text-2xl">←</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 justify-center">
            {/* Icon et titre */}
            <View className="items-center mb-12">
              <View className="w-24 h-24 bg-[#EF4444]/20 rounded-full items-center justify-center mb-6">
                <View className="w-12 h-12 bg-[#EF4444] rounded-full items-center justify-center">
                  <Text className="text-white text-xl">🔒</Text>
                </View>
              </View>

              <Text className="text-white text-2xl font-bold mb-3">
                Mot de passe oublié ?
              </Text>
              
              <Text className="text-[#A1A1AA] text-base text-center leading-6 px-4">
                Entrez votre adresse e-mail ou votre{'\n'}numéro de téléphone. Nous vous{'\n'}enverrons un lien pour réinitialiser votre{'\n'}mot de passe. Nous vous enverrons{'\n'}un code pour vérifier votre identité et{'\n'}réinitialiser votre mot de passe.
              </Text>
            </View>

            {/* Formulaire */}
            <View className="gap-6">
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label=""
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Entrez votre e-mail ou téléphone"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    error={errors.email?.message}
                  />
                )}
              />

              {error && (
                <Text className="text-[#EF4444] text-sm text-center">
                  {error}
                </Text>
              )}

              <Button
                label="Envoyer le code"
                onPress={handleSubmit(onSubmit)}
                isLoading={isLoading}
              />
            </View>
          </View>

          {/* Lien vers connexion */}
          <View className="items-center pb-8">
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text className="text-[#A1A1AA] text-sm">
                Retour à la connexion
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}