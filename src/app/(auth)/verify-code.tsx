import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { CodeInput } from '@/components/auth/CodeInput';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeStore } from '@/features/theme/theme.store';
import { verifyCodeSchema, type VerifyCodeForm } from '@/utils/validation';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { verifyCode, isLoading, error } = useAuth();
  const colors = useThemeStore((state) => state.colors);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VerifyCodeForm>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: '' },
  });

  const codeValue = watch('code');

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const onSubmit = async (data: VerifyCodeForm) => {
    try {
      // TODO: Implement verification API call
      console.log('Verifying code:', data.code);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.replace('/interests');
    } catch {
      // error displayed via useAuth state
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    try {
      // TODO: Implement resend code API call
      console.log('Resending code...');
      setTimer(60);
      setCanResend(false);
      setValue('code', '');
    } catch {
      console.error('Failed to resend code');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-8">
          {/* Header avec bouton retour */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Icon et titre */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-[#EF4444]/20 rounded-full items-center justify-center mb-6">
              <View className="w-12 h-12 bg-[#EF4444] rounded-full items-center justify-center">
                <Icon name="lock-closed" size={22} color="#FFFFFF" />
              </View>
            </View>

            <Text className="mb-3 text-2xl font-bold" style={{ color: colors.text }}>
              Vérifiez votre identité
            </Text>
            
            <Text className="text-center text-base leading-6" style={{ color: colors.textSecondary }}>
              Nous avons envoyé un code de{'\n'}vérification à votre adresse e-mail{'\n'}ou numéro de téléphone.
            </Text>
            
            <Text className="text-[#EF4444] text-base font-semibold mt-2">
              +237 6XX XXX XX*
            </Text>
          </View>

          {/* Code Input */}
          <View className="items-center mb-8">
            <Controller
              control={control}
              name="code"
              render={({ field: { value, onChange } }) => (
                <CodeInput
                  value={value}
                  onChangeText={onChange}
                  error={errors.code?.message}
                  disabled={isLoading}
                />
              )}
            />
          </View>

          {error && (
            <Text className="text-[#EF4444] text-sm text-center mb-4">
              {error}
            </Text>
          )}

          {/* Bouton de vérification */}
          <View className="mb-8">
            <Button
              label="Vérifier"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              disabled={codeValue.length !== 6}
            />
          </View>

          {/* Timer et renvoi */}
          <View className="items-center">
            {!canResend ? (
              <Text className="mb-4 text-base" style={{ color: colors.textSecondary }}>
                Renvoyer le code dans {formatTime(timer)}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendCode} className="mb-4">
                <Text className="text-[#EF4444] text-base font-semibold">
                  Renvoyer le code
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Modifier le numéro
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
