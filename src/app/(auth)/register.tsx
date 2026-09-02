import React, { useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { SocialButton } from '@/components/auth/SocialButton';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeStore } from '@/features/theme/theme.store';
import { registerSchema, type RegisterForm } from '@/utils/validation';
import { useTurnstileChallenge } from '@/features/auth/useTurnstileChallenge';
import { CountryStatusPill } from '@/features/country/components/CountryStatusPill';
import { useCountries, useCountryCities, useCountryConfiguration } from '@/features/country/country.hooks';
import { useCountryStore } from '@/features/country/country.store';
import type { CountryConfiguration } from '@/features/country/country.types';

function provisionalConfiguration(country: { code: string; name: string; flag: string; status: CountryConfiguration['status']; defaultCurrencyCode: string; defaultTimezone: string; defaultLanguageCode: string; callingCode: string | null; registrationEnabled: boolean }): CountryConfiguration {
  return {
    ...country, currencies: [country.defaultCurrencyCode], timezones: [country.defaultTimezone], languages: [country.defaultLanguageCode],
    features: { registrationEnabled: country.registrationEnabled, contentPublishingEnabled: false, placePublishingEnabled: false, eventFeatureEnabled: false, partnerOnboardingEnabled: false, paymentsEnabled: false, bookingEnabled: false, ticketingEnabled: false, artisanCommerceEnabled: false, cultureModuleEnabled: false },
  };
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register: registerUser, googleLogin, isLoading, error } = useAuth();
  const colors = useThemeStore((state) => state.colors);
  const selectedCountryCode = useCountryStore((state) => state.selectedCountryCode);
  const selectedCityId = useCountryStore((state) => state.selectedCityId);
  const selectCountry = useCountryStore((state) => state.selectCountry);
  const setSelectedCityId = useCountryStore((state) => state.setSelectedCityId);
  const countries = useCountries();
  const configuration = useCountryConfiguration(selectedCountryCode);
  const cities = useCountryCities(selectedCountryCode);
  const { requestToken, challenge } = useTurnstileChallenge();
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { display_name: '', username: '', email: '', password: '', password_confirmation: '', city: '', phone: '', countryCode: '', cityId: undefined, preferredLanguageCode: undefined, timezone: undefined },
  });
  const phoneValue = watch('phone') || '';
  const preferredLanguageCode = watch('preferredLanguageCode');

  useEffect(() => {
    if (!configuration.data) return;
    setValue('countryCode', configuration.data.code);
    setValue('cityId', selectedCityId ?? undefined);
    setValue('preferredLanguageCode', preferredLanguageCode ?? configuration.data.languages[0]);
    setValue('timezone', configuration.data.defaultTimezone);
  }, [configuration.data, preferredLanguageCode, selectedCityId, setValue]);

  const onSubmit = async (data: RegisterForm) => {
    if (!configuration.data || !data.countryCode || !configuration.data.features.registrationEnabled || configuration.data.status === 'DISABLED') {
      Alert.alert('Pays indisponible', 'Sélectionnez un pays dont les inscriptions sont autorisées.');
      return;
    }
    try {
      const phone = data.phone ? `${configuration.data.callingCode ?? ''}${data.phone.replace(/^0+/, '')}` : undefined;
      const turnstileToken = await requestToken('register');
      await registerUser({ ...data, phone }, turnstileToken);
      router.replace({ pathname: '/(auth)/verify-code', params: { email: data.email.trim() } });
    } catch { /* useAuth exposes the normalized error */ }
  };

  return <SafeScreen>{challenge}<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1"><ScrollView contentContainerClassName="flex-grow px-6 py-8" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    <View className="mb-8 items-center"><Logo size="medium" /><Text className="mb-2 mt-3 text-center text-2xl font-extrabold" style={{ color: colors.text }}>Rejoignez la{`\n`}communauté Yeyamo ✨</Text><Text className="text-center text-sm leading-5" style={{ color: colors.textSecondary }}>Choisissez votre pays, puis personnalisez votre découverte.</Text></View>
    <View className="mb-4 gap-4">
      <Controller control={control} name="display_name" render={({ field: { value, onChange, onBlur } }) => <Input label="Nom complet" value={value} onChangeText={onChange} onBlur={onBlur} placeholder="Nom complet" error={errors.display_name?.message} />} />
      <Controller control={control} name="email" render={({ field: { value, onChange, onBlur } }) => <Input label="E-mail" value={value} onChangeText={onChange} onBlur={onBlur} placeholder="Email" keyboardType="email-address" textContentType="emailAddress" autoComplete="email" error={errors.email?.message} />} />

      <View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
        <Text className="text-sm font-semibold" style={{ color: colors.text }}>Pays et localisation</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>La disponibilité est définie par le serveur et doit être confirmée.</Text>
        {countries.isLoading ? <Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>Chargement des pays…</Text> : null}
        {countries.isError ? <Text className="mt-3 text-sm text-[#B91C1C]">Impossible de charger les pays. Réessayez plus tard.</Text> : null}
        <View className="mt-3 gap-2">{(countries.data ?? []).map((country) => { const selected = country.code === selectedCountryCode; const disabled = country.status === 'DISABLED' || !country.registrationEnabled; return <TouchableOpacity key={country.code} disabled={disabled} onPress={() => void selectCountry(provisionalConfiguration(country))} className="flex-row items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: selected ? colors.primary : colors.border, opacity: disabled ? 0.5 : 1 }}><Text style={{ color: colors.text }}>{country.flag} {country.name}</Text><CountryStatusPill status={country.status} /></TouchableOpacity>; })}</View>
        {configuration.isLoading ? <Text className="mt-3 text-xs" style={{ color: colors.textSecondary }}>Vérification de la configuration…</Text> : null}
        {configuration.data ? <><Text className="mt-4 text-sm font-medium" style={{ color: colors.text }}>Ville (facultatif)</Text><View className="mt-2 flex-row flex-wrap gap-2">{(cities.data ?? []).filter((city) => city.active).map((city) => <TouchableOpacity key={city.id} onPress={() => void setSelectedCityId(selectedCityId === city.id ? null : city.id)} className="rounded-full border px-3 py-2" style={{ borderColor: selectedCityId === city.id ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{city.name}</Text></TouchableOpacity>)}</View><Text className="mt-4 text-sm font-medium" style={{ color: colors.text }}>Langue préférée</Text><View className="mt-2 flex-row flex-wrap gap-2">{configuration.data.languages.map((language) => <TouchableOpacity key={language} onPress={() => setValue('preferredLanguageCode', language)} className="rounded-full border px-3 py-2" style={{ borderColor: preferredLanguageCode === language ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{language}</Text></TouchableOpacity>)}</View></> : null}
      </View>
      <PhoneInput label={configuration.data?.callingCode ? `Téléphone (${configuration.data.callingCode})` : 'Téléphone'} value={phoneValue} onChangeText={(text) => setValue('phone', text)} countryCode={configuration.data?.callingCode ?? ''} onCountryCodeChange={() => undefined} placeholder="6XX XX XX XX" error={errors.phone?.message} disabled={!configuration.data} />
      <Controller control={control} name="password" render={({ field: { value, onChange, onBlur } }) => <Input label="Mot de passe" value={value} onChangeText={onChange} onBlur={onBlur} placeholder="••••••••••••" secureTextEntry textContentType="newPassword" error={errors.password?.message} />} />
      <Controller control={control} name="password_confirmation" render={({ field: { value, onChange, onBlur } }) => <Input label="Confirmer le mot de passe" value={value} onChangeText={onChange} onBlur={onBlur} placeholder="••••••••••••" secureTextEntry textContentType="newPassword" error={errors.password_confirmation?.message} />} />
      <Controller control={control} name="username" render={({ field: { value, onChange, onBlur } }) => <Input label="Nom d'utilisateur" value={value || watch('display_name')?.toLowerCase().replace(/\s+/g, '_')} onChangeText={onChange} onBlur={onBlur} placeholder="nom_utilisateur" error={errors.username?.message} />} />
      {error ? <Text className="text-center text-sm text-[#EF4444]">{error}</Text> : null}
      <Button label="Créer mon compte" onPress={handleSubmit(onSubmit)} isLoading={isLoading} disabled={!configuration.data || configuration.isLoading} className="mt-2" />
    </View>
    <View className="mb-6 flex-row items-center justify-center gap-1"><Text className="text-sm" style={{ color: colors.textSecondary }}>Vous avez déjà un compte ?</Text><TouchableOpacity onPress={() => router.back()}><Text className="text-sm font-semibold text-[#EF4444]">Se connecter</Text></TouchableOpacity></View>
    <View className="mb-6 flex-row items-center"><View className="h-px flex-1" style={{ backgroundColor: colors.border }} /><Text className="mx-4 text-sm" style={{ color: colors.textSecondary }}>ou continuer avec</Text><View className="h-px flex-1" style={{ backgroundColor: colors.border }} /></View>
    <View className="mb-6 gap-3"><SocialButton provider="google" onPress={async () => { if (await googleLogin()) router.replace('/interests'); }} disabled={isLoading} /><SocialButton provider="apple" onPress={() => undefined} disabled /></View>
  </ScrollView></KeyboardAvoidingView></SafeScreen>;
}
