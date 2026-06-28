import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { CategoryPicker } from '@/components/auth/CategoryPicker';
import { useAuth } from '@/features/auth/useAuth';
import { partnerRegisterSchema, type PartnerRegisterForm } from '@/utils/validation';

export default function RegisterPartnerScreen() {
  const router = useRouter();
  const { register: registerUser, isLoading, error } = useAuth();
  const [countryCode, setCountryCode] = useState('+237');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PartnerRegisterForm>({
    resolver: zodResolver(partnerRegisterSchema),
    defaultValues: { 
      company_name: '',
      category: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      accept_terms: false,
    },
  });

  const phoneValue = watch('phone') || '';
  const categoryValue = watch('category') || '';
  const acceptTerms = watch('accept_terms');

  const onSubmit = async (data: PartnerRegisterForm) => {
    try {
      const fullPhone = `${countryCode}${data.phone}`;
      // TODO: Call partner registration API
      console.log('Partner registration:', { ...data, phone: fullPhone });
      router.replace('/(auth)/verify-code');
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
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header avec bouton retour */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-white text-2xl">←</Text>
            </TouchableOpacity>
          </View>

          {/* Logo et Header */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-[#EF4444] rounded-2xl items-center justify-center mb-3">
              <Text className="text-white text-xl font-bold">Y</Text>
            </View>
            <Text className="text-white text-2xl font-bold mb-2 text-center">
              Développez votre activité{'\n'}avec YEYAMO
            </Text>
            <Text className="text-[#A1A1AA] text-sm text-center">
              Présentez votre établissement,{'\n'}publiez vos produits et services et connectez-vous{'\n'}avec vos clients et partenaires.
            </Text>
          </View>

          {/* Formulaire */}
          <View className="gap-4 mb-6">
            <CategoryPicker
              value={categoryValue}
              onValueChange={(value) => setValue('category', value)}
              error={errors.category?.message}
            />

            <Controller
              control={control}
              name="company_name"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Nom de l'établissement"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Nom de l'établissement"
                  error={errors.company_name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Email professionnel"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Email professionnel"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  error={errors.email?.message}
                />
              )}
            />

            <PhoneInput
              label="Téléphone (+237)"
              value={phoneValue}
              onChangeText={(text) => setValue('phone', text)}
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              placeholder="6XX XX XX XX"
              error={errors.phone?.message}
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

            {error && (
              <Text className="text-[#EF4444] text-sm text-center">{error}</Text>
            )}

            {/* Conditions générales */}
            <TouchableOpacity 
              className="flex-row items-start mb-4"
              onPress={() => setValue('accept_terms', !acceptTerms)}
            >
              <View className={`w-5 h-5 border-2 rounded mr-3 mt-0.5 items-center justify-center ${
                acceptTerms ? 'bg-[#EF4444] border-[#EF4444]' : 'border-[#A1A1AA]'
              }`}>
                {acceptTerms && (
                  <Text className="text-white text-xs">✓</Text>
                )}
              </View>
              <Text className="text-[#A1A1AA] text-sm flex-1 leading-5">
                J'accepte les{' '}
                <Text className="text-[#EF4444]">Conditions Générales d'Utilisation</Text>
                {' '}et la{' '}
                <Text className="text-[#EF4444]">Politique</Text>
              </Text>
            </TouchableOpacity>

            {errors.accept_terms && (
              <Text className="text-[#EF4444] text-sm -mt-4">
                {errors.accept_terms.message}
              </Text>
            )}

            <Button
              label="Continuer"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              className="mt-2"
            />
          </View>

          {/* Navigation vers inscription utilisateur */}
          <View className="flex-row justify-center items-center gap-1">
            <Text className="text-[#A1A1AA] text-sm">Vous êtes un utilisateur ?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-[#EF4444] text-sm font-semibold">Créer un compte utilisateur</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}