import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { SocialButton } from '@/components/auth/SocialButton';
import { StaticYeyamoSplashLogo } from '@/components/onboarding/StaticYeyamoSplashLogo';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeStore } from '@/features/theme/theme.store';
import { registerSchema, type RegisterForm } from '@/utils/validation';
import { TurnstileWidget } from '@/components/security/TurnstileWidget';
import { useGoogleIdToken } from '@/features/auth/useGoogleIdToken';
import { useAppleIdToken } from '@/features/auth/useAppleIdToken';
import { useMicrosoftIdToken } from '@/features/auth/useMicrosoftIdToken';
import ENV from '@/config/env';
import { CountryStatusPill } from '@/features/country/components/CountryStatusPill';
import { useCountries, useCountryCities, useCountryConfiguration } from '@/features/country/country.hooks';

const TOTAL_STEPS = 4;

export default function RegisterScreen() {
  const router = useRouter();
  const { register: registerUser, socialLogin, isLoading, error } = useAuth();
  const colors = useThemeStore((state) => state.colors);
  const turnstileEnabled = ENV.TURNSTILE_ENABLED;
  const [step, setStep] = useState(1);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [countrySelectorVisible, setCountrySelectorVisible] = useState(false);
  const countries = useCountries();
  const configuration = useCountryConfiguration(selectedCountryCode);
  const cities = useCountryCities(selectedCountryCode);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileVersion, setTurnstileVersion] = useState(0);
  const [turnstileMessage, setTurnstileMessage] = useState<string | null>(null);
  const { googleRequest, requestGoogleIdToken, googleError } = useGoogleIdToken();
  const { appleError, requestAppleIdToken } = useAppleIdToken();
  const { microsoftError, requestMicrosoftIdToken } = useMicrosoftIdToken();
  const { control, handleSubmit, setValue, trigger, formState: { dirtyFields, errors, isValid } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema), mode: 'onChange', reValidateMode: 'onChange',
    defaultValues: { display_name: '', username: '', email: '', password: '', password_confirmation: '', city: '', phone: '', countryCode: '', cityId: undefined, preferredLanguageCode: undefined, timezone: undefined },
  });
  const phoneValue = useWatch({ control, name: 'phone' }) || '';
  const preferredLanguageCode = useWatch({ control, name: 'preferredLanguageCode' });
  const displayName = useWatch({ control, name: 'display_name' });
  const selectedCountry = (countries.data ?? []).find((country) => country.code === selectedCountryCode);
  const countryLoadingError = countries.isError && isCountryServiceUnavailable(countries.error)
    ? 'Le service des pays est momentanément indisponible. Réessayez dans quelques instants.'
    : 'Impossible de charger les pays. Réessayez plus tard.';

  useEffect(() => {
    if (dirtyFields.username || !displayName.trim()) return;
    const username = displayName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    setValue('username', username, { shouldValidate: true });
  }, [dirtyFields.username, displayName, setValue]);

  useEffect(() => {
    if (!configuration.data) return;
    setValue('countryCode', configuration.data.code, { shouldValidate: true });
    setValue('cityId', selectedCityId ?? undefined, { shouldValidate: true });
    setValue('preferredLanguageCode', preferredLanguageCode ?? configuration.data.languages[0], { shouldValidate: true });
    setValue('timezone', configuration.data.defaultTimezone, { shouldValidate: true });
  }, [configuration.data, preferredLanguageCode, selectedCityId, setValue]);

  const selectRegistrationCountry = (countryCode: string) => {
    setSelectedCountryCode(countryCode); setSelectedCityId(null);
    setValue('countryCode', countryCode, { shouldValidate: true });
    setValue('cityId', undefined, { shouldValidate: true });
    setValue('preferredLanguageCode', undefined, { shouldValidate: true });
    setValue('timezone', undefined, { shouldValidate: true });
    setCountrySelectorVisible(false);
  };

  const selectRegistrationCity = (cityId: string) => {
    const nextCityId = selectedCityId === cityId ? null : cityId;
    setSelectedCityId(nextCityId);
    setValue('cityId', nextCityId ?? undefined, { shouldValidate: true });
  };

  const goNext = async () => {
    const valid = step === 1
      ? await trigger(['display_name', 'email', 'username'])
      : step === 2
        ? Boolean(configuration.data && await trigger(['countryCode', 'cityId', 'preferredLanguageCode', 'timezone']))
        : await trigger(['phone', 'password', 'password_confirmation']);
    if (valid) setStep((current) => Math.min(TOTAL_STEPS, current + 1));
  };

  const onSubmit = async (data: RegisterForm) => {
    if (!configuration.data || !data.countryCode || !configuration.data.features.registrationEnabled || configuration.data.status === 'DISABLED') {
      Alert.alert('Pays indisponible', 'Sélectionnez un pays dont les inscriptions sont autorisées.'); return;
    }
    try {
      const phone = data.phone ? `${configuration.data.callingCode ?? ''}${data.phone.replace(/^0+/, '')}` : undefined;
      if (turnstileEnabled && !turnstileToken) { setTurnstileMessage('Veuillez terminer la vérification anti-robot avant de créer votre compte.'); return; }
      await registerUser({ ...data, phone, accountType: 'EXPLORER' }, turnstileToken ?? undefined);
      router.replace({ pathname: '/(auth)/verify-code', params: { email: data.email.trim() } });
    } catch (requestError: unknown) {
      const code = typeof requestError === 'object' && requestError !== null && 'code' in requestError ? String(requestError.code) : undefined;
      if (code === 'TURNSTILE_VERIFICATION_FAILED' || code === 'TURNSTILE_REQUIRED') {
        setTurnstileToken(null); setTurnstileVersion((value) => value + 1); setTurnstileMessage('La vérification a expiré. Veuillez la recommencer.');
      }
    }
  };

  const social = async (provider: 'google' | 'apple' | 'microsoft') => {
    const token = provider === 'google' ? await requestGoogleIdToken() : provider === 'apple' ? await requestAppleIdToken() : await requestMicrosoftIdToken();
    if (!token) return;
    try { await socialLogin({ provider, token, accountType: 'EXPLORER' }); router.replace('/(tabs)'); } catch { /* exposed by useAuth */ }
  };

  return <SafeScreen>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <ScrollView contentContainerClassName="flex-grow px-6 py-6" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <YeyamoFormProgress currentStep={step} totalSteps={TOTAL_STEPS} label="Compte explorateur" description={`${TOTAL_STEPS - step} étape${TOTAL_STEPS - step > 1 ? 's' : ''} restante${TOTAL_STEPS - step > 1 ? 's' : ''}`} />

        {step === 1 ? <View className="gap-4">
          <View className="mb-2 items-center"><StaticYeyamoSplashLogo /><Text className="mt-3 text-2xl font-extrabold" style={{ color: colors.text }}>Votre identité</Text></View>
          <Controller control={control} name="display_name" render={({ field }) => <Input label="Nom complet" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="Nom complet" error={errors.display_name?.message} />} />
          <Controller control={control} name="email" render={({ field }) => <Input label="E-mail" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="Email" keyboardType="email-address" textContentType="emailAddress" autoComplete="email" error={errors.email?.message} />} />
          <Controller control={control} name="username" render={({ field }) => <Input label="Nom d'utilisateur" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="nom_utilisateur" error={errors.username?.message} />} />
          <Text className="my-1 text-center text-sm" style={{ color: colors.textSecondary }}>ou continuer avec</Text>
          <SocialButton provider="google" onPress={() => void social('google')} disabled={isLoading || !googleRequest} />
          <SocialButton provider="apple" onPress={() => void social('apple')} disabled={isLoading} />
          <SocialButton provider="microsoft" onPress={() => void social('microsoft')} disabled={isLoading} />
        </View> : null}

        {step === 2 ? <View className="gap-4">
          <Text className="text-xl font-extrabold" style={{ color: colors.text }}>Pays et préférences locales</Text>
          <View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.card }}>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>Choisissez votre pays et votre ville manuellement. Aucune localisation automatique n’est utilisée.</Text>
            <Text className="mb-2 mt-4 text-sm font-medium" style={{ color: colors.text }}>Pays</Text>
            <TouchableOpacity disabled={countries.isFetching} onPress={() => countries.isError ? void countries.refetch() : setCountrySelectorVisible(true)} className="flex-row items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: colors.border, backgroundColor: colors.background, opacity: countries.isFetching ? 0.6 : 1 }}>
              <Text style={{ color: selectedCountry ? colors.text : colors.textSecondary }}>{selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : countries.isError ? 'Réessayer le chargement des pays' : 'Sélectionner un pays'}</Text><Text style={{ color: colors.textSecondary }}>⌄</Text>
            </TouchableOpacity>
            {countries.isFetching ? <Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>Chargement des pays…</Text> : null}
            {countries.isError ? <Text className="mt-3 text-sm text-[#B91C1C]">{countryLoadingError}</Text> : null}
            {configuration.isLoading ? <Text className="mt-3 text-xs" style={{ color: colors.textSecondary }}>Vérification de la configuration…</Text> : null}
            {configuration.data ? <>
              <Text className="mt-4 text-sm font-medium" style={{ color: colors.text }}>Ville (facultatif)</Text>
              <View className="mt-2 flex-row flex-wrap gap-2">{(cities.data ?? []).filter((city) => city.active).map((city) => <TouchableOpacity key={city.id} onPress={() => selectRegistrationCity(city.id)} className="rounded-full border px-3 py-2" style={{ borderColor: selectedCityId === city.id ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{city.name}</Text></TouchableOpacity>)}</View>
              <Text className="mt-4 text-sm font-medium" style={{ color: colors.text }}>Langue préférée</Text>
              <View className="mt-2 flex-row flex-wrap gap-2">{configuration.data.languages.map((language) => <TouchableOpacity key={language} onPress={() => setValue('preferredLanguageCode', language, { shouldValidate: true })} className="rounded-full border px-3 py-2" style={{ borderColor: preferredLanguageCode === language ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{language}</Text></TouchableOpacity>)}</View>
            </> : null}
          </View>
        </View> : null}

        {step === 3 ? <View className="gap-4">
          <Text className="text-xl font-extrabold" style={{ color: colors.text }}>Sécurité du compte</Text>
          <PhoneInput label={configuration.data?.callingCode ? `Téléphone (${configuration.data.callingCode})` : 'Téléphone'} value={phoneValue} onChangeText={(text) => setValue('phone', text, { shouldDirty: true, shouldValidate: true })} countryCode={configuration.data?.callingCode ?? ''} onCountryCodeChange={() => undefined} placeholder="6XX XX XX XX" error={errors.phone?.message} disabled={!configuration.data} />
          <Controller control={control} name="password" render={({ field }) => <Input label="Mot de passe" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="12 caractères minimum" secureTextEntry textContentType="newPassword" error={errors.password?.message} />} />
          <Controller control={control} name="password_confirmation" render={({ field }) => <Input label="Confirmer le mot de passe" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="Confirmez le mot de passe" secureTextEntry textContentType="newPassword" error={errors.password_confirmation?.message} />} />
        </View> : null}

        {step === 4 ? <View className="gap-4">
          <Text className="text-xl font-extrabold" style={{ color: colors.text }}>Vérification et création</Text>
          <View className="rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Text className="font-semibold" style={{ color: colors.text }}>{displayName}</Text><Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>{selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : 'Pays non sélectionné'}</Text></View>
          {turnstileEnabled ? <><TurnstileWidget key={turnstileVersion} action="register" onVerify={(token) => { setTurnstileToken(token); setTurnstileMessage(null); }} onExpire={() => { setTurnstileToken(null); setTurnstileMessage('La vérification a expiré. Veuillez la recommencer.'); }} onError={(message) => { setTurnstileToken(null); setTurnstileMessage(message); }} />{turnstileMessage ? <Text className="text-center text-xs text-[#B45309]">{turnstileMessage}</Text> : null}</> : null}
        </View> : null}

        {error || googleError || appleError || microsoftError ? <Text className="mt-4 text-center text-sm text-[#EF4444]">{error ?? googleError ?? appleError ?? microsoftError}</Text> : null}
        <View className="mt-7 flex-row gap-3">{step > 1 ? <View className="flex-1"><Button label="Précédent" variant="secondary" onPress={() => setStep((current) => current - 1)} disabled={isLoading} /></View> : null}<View className="flex-1"><Button label={step === TOTAL_STEPS ? 'Créer mon compte' : 'Continuer'} onPress={step === TOTAL_STEPS ? handleSubmit(onSubmit) : () => void goNext()} isLoading={step === TOTAL_STEPS && isLoading} disabled={step === TOTAL_STEPS && (!configuration.data || configuration.isLoading || !isValid || isLoading)} /></View></View>
        <View className="mb-6 mt-6 flex-row items-center justify-center gap-1"><Text className="text-sm" style={{ color: colors.textSecondary }}>Vous avez déjà un compte ?</Text><TouchableOpacity onPress={() => router.back()}><Text className="text-sm font-semibold text-[#EF4444]">Se connecter</Text></TouchableOpacity></View>
      </ScrollView>
    </KeyboardAvoidingView>

    <Modal visible={countrySelectorVisible} transparent animationType="slide" onRequestClose={() => setCountrySelectorVisible(false)}><View className="flex-1 justify-end bg-black/50"><View className="max-h-[78%] rounded-t-3xl px-5 pb-8 pt-5" style={{ backgroundColor: colors.card }}><View className="mb-4 flex-row items-center justify-between"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>Choisir un pays</Text><TouchableOpacity onPress={() => setCountrySelectorVisible(false)}><Text className="font-semibold" style={{ color: colors.primary }}>Fermer</Text></TouchableOpacity></View><ScrollView>{(countries.data ?? []).map((country) => { const disabled = country.status === 'DISABLED' || !country.registrationEnabled; return <TouchableOpacity key={country.code} disabled={disabled} onPress={() => selectRegistrationCountry(country.code)} className="mb-2 flex-row items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: country.code === selectedCountryCode ? colors.primary : colors.border, opacity: disabled ? 0.5 : 1 }}><Text className="flex-1 font-medium" style={{ color: colors.text }}>{country.flag} {country.name}</Text><CountryStatusPill status={country.status} /></TouchableOpacity>; })}</ScrollView></View></View></Modal>
  </SafeScreen>;
}

function isCountryServiceUnavailable(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'SERVICE_UNAVAILABLE';
}
