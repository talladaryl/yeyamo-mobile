import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SocialButton } from '@/components/auth/SocialButton';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { useAuth } from '@/features/auth/useAuth';
import { useAuthStore } from '@/features/auth/auth.store';
import { useGoogleIdToken } from '@/features/auth/useGoogleIdToken';
import { useAppleIdToken } from '@/features/auth/useAppleIdToken';
import { useMicrosoftIdToken } from '@/features/auth/useMicrosoftIdToken';
import { partnerApi, type PartnerBusinessType } from '@/features/partner/partner.api';

const TOTAL_STEPS = 4;
const BUSINESS_TYPES: { value: PartnerBusinessType; label: string }[] = [
  { value: 'INDIVIDUAL', label: 'Indépendant' },
  { value: 'COMPANY', label: 'Entreprise' },
  { value: 'ASSOCIATION', label: 'Association' },
  { value: 'PUBLIC_ORGANIZATION', label: 'Organisme public' },
  { value: 'BUSINESS', label: 'Commerce' },
  { value: 'ARTISAN', label: 'Artisan' },
  { value: 'ARTIST', label: 'Artiste' },
  { value: 'CULTURAL_ASSOCIATION', label: 'Association culturelle' },
  { value: 'MUSEUM', label: 'Musée' },
  { value: 'CULTURAL_EXPERT', label: 'Expert culturel' },
  { value: 'TOURISM_OPERATOR', label: 'Opérateur touristique' },
];

export default function RegisterPartnerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ social?: string }>();
  const colors = useThemeStore((state) => state.colors);
  const authUser = useAuthStore((state) => state.user);
  const { register, socialLogin, isLoading, error } = useAuth();
  const { googleRequest, requestGoogleIdToken, googleError } = useGoogleIdToken();
  const { requestAppleIdToken, appleError } = useAppleIdToken();
  const { requestMicrosoftIdToken, microsoftError } = useMicrosoftIdToken();
  const socialAuthenticated = params.social === '1' && Boolean(authUser);
  const [step, setStep] = useState(socialAuthenticated ? 2 : 1);
  const [submitting, setSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState(authUser?.email ?? '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [businessType, setBusinessType] = useState<PartnerBusinessType | null>(null);
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('CM');
  const [description, setDescription] = useState('');

  const stepValid = step === 1
    ? Boolean(displayName.trim() && email.trim() && password.length >= 12)
    : step === 2
      ? Boolean(legalName.trim() && (socialAuthenticated || passwordConfirmation === password))
      : step === 3
        ? Boolean(businessType && /^[A-Za-z]{2}$/.test(countryCode.trim()))
        : true;
  const canSubmit = Boolean(legalName.trim() && email.trim() && businessType
    && /^[A-Za-z]{2}$/.test(countryCode.trim())
    && (socialAuthenticated || (displayName.trim() && password.length >= 12 && password === passwordConfirmation)));

  const submit = async () => {
    if (!canSubmit || submitting || !businessType) return;
    setSubmitting(true);
    try {
      if (!socialAuthenticated) {
        await register({
          accountType: 'PARTNER', username: email.split('@')[0], display_name: displayName.trim(),
          email: email.trim(), password, password_confirmation: passwordConfirmation,
          countryCode: countryCode.trim().toUpperCase(), phone: phone.trim() || undefined,
        });
      }
      await partnerApi.create({
        legalName: legalName.trim(), tradeName: tradeName.trim() || undefined, businessType,
        contactEmail: email.trim(), contactPhone: phone.trim() || undefined,
        description: description.trim() || undefined,
        primaryCountryCode: countryCode.trim().toUpperCase(),
        operatingCountries: [countryCode.trim().toUpperCase()],
      });
      if (socialAuthenticated) router.replace('/(tabs)');
      else router.replace({ pathname: '/(auth)/verify-code', params: { email: email.trim() } });
    } catch (requestError) {
      const code = typeof requestError === 'object' && requestError !== null && 'code' in requestError
        ? String((requestError as { code?: unknown }).code) : '';
      if (code === 'PARTNER_ALREADY_EXISTS') router.replace('/(tabs)');
    } finally {
      setSubmitting(false);
    }
  };

  const authenticate = async (provider: 'google' | 'apple' | 'microsoft') => {
    const token = provider === 'google' ? await requestGoogleIdToken()
      : provider === 'apple' ? await requestAppleIdToken() : await requestMicrosoftIdToken();
    if (!token) return;
    try {
      await socialLogin({ provider, token, accountType: 'PARTNER' });
      const current = useAuthStore.getState().user;
      setEmail(current?.email ?? email);
      router.replace({ pathname: '/(auth)/register-partner', params: { social: '1' } });
    } catch {
      // Normalized provider/backend error is exposed by useAuth.
    }
  };

  return <SafeScreen>
    <View className="flex-row items-center px-5 pb-3 pt-2">
      <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
        <Icon name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>
      <Text className="ml-3 flex-1 text-xl font-extrabold" style={{ color: colors.text }}>Créer un compte partenaire</Text>
    </View>
    <View className="px-5 pt-2"><YeyamoFormProgress currentStep={step} totalSteps={TOTAL_STEPS} label="Inscription partenaire" description={`${TOTAL_STEPS - step} étape${TOTAL_STEPS - step > 1 ? 's' : ''} restante${TOTAL_STEPS - step > 1 ? 's' : ''}`} /></View>
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 }}>
        {step === 1 ? <View className="gap-4">
          <Text className="text-lg font-bold" style={{ color: colors.text }}>Votre identité</Text>
          <Input label="Nom du responsable" value={displayName} onChangeText={setDisplayName} placeholder="Nom complet" />
          <Input label="E-mail professionnel" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="contact@entreprise.com" />
          <Input label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry placeholder="12 caractères minimum" />
          <Text className="my-1 text-center text-sm" style={{ color: colors.textSecondary }}>ou continuer avec</Text>
          <SocialButton provider="google" onPress={() => void authenticate('google')} disabled={isLoading || !googleRequest} />
          <SocialButton provider="apple" onPress={() => void authenticate('apple')} disabled={isLoading} />
          <SocialButton provider="microsoft" onPress={() => void authenticate('microsoft')} disabled={isLoading} />
        </View> : null}

        {step === 2 ? <View className="gap-4">
          <Text className="text-lg font-bold" style={{ color: colors.text }}>Structure</Text>
          {socialAuthenticated ? <Text className="font-semibold" style={{ color: colors.text }}>Connecté avec {authUser?.email}</Text> : <Input label="Confirmer le mot de passe" value={passwordConfirmation} onChangeText={setPasswordConfirmation} secureTextEntry placeholder="Confirmez le mot de passe" />}
          <Input label="Raison sociale" value={legalName} onChangeText={setLegalName} placeholder="Nom légal" />
          <Input label="Nom commercial (facultatif)" value={tradeName} onChangeText={setTradeName} placeholder="Nom visible" />
        </View> : null}

        {step === 3 ? <View className="gap-4">
          <Text className="text-lg font-bold" style={{ color: colors.text }}>Activité principale</Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>Choisissez une seule activité.</Text>
          <View className="flex-row flex-wrap gap-2">{BUSINESS_TYPES.map((type) => {
            const selected = businessType === type.value;
            return <TouchableOpacity key={type.value} onPress={() => setBusinessType(type.value)} accessibilityRole="radio" accessibilityState={{ selected }} className="flex-row items-center rounded-full border px-3 py-2" style={{ borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.accentSoft : colors.card }}>
              <View className="mr-2 h-4 w-4 items-center justify-center rounded-full border" style={{ borderColor: selected ? colors.primary : colors.textMuted }}>{selected ? <View className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.primary }} /> : null}</View>
              <Text className="text-xs font-semibold" style={{ color: selected ? colors.primary : colors.text }}>{type.label}</Text>
            </TouchableOpacity>;
          })}</View>
          <Input label="Téléphone professionnel (facultatif)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+237…" />
          <Input label="Code pays" value={countryCode} onChangeText={(value) => setCountryCode(value.toUpperCase().slice(0, 2))} autoCapitalize="characters" maxLength={2} placeholder="CM" />
        </View> : null}

        {step === 4 ? <View className="gap-4">
          <Text className="text-lg font-bold" style={{ color: colors.text }}>Finalisation</Text>
          <Input label="Description (facultative)" value={description} onChangeText={setDescription} multiline placeholder="Présentez votre activité" />
          <View className="rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
            <Summary label="Responsable" value={socialAuthenticated ? authUser?.email ?? email : displayName} />
            <Summary label="Structure" value={tradeName || legalName} />
            <Summary label="Activité" value={BUSINESS_TYPES.find((type) => type.value === businessType)?.label ?? '—'} />
            <Summary label="Pays" value={countryCode.toUpperCase()} />
          </View>
        </View> : null}

        {error || googleError || appleError || microsoftError ? <Text className="mt-4 text-sm" style={{ color: colors.primary }}>{error ?? googleError ?? appleError ?? microsoftError}</Text> : null}
        <View className="mt-7 flex-row gap-3">
          {step > (socialAuthenticated ? 2 : 1) ? <View className="flex-1"><Button label="Précédent" variant="secondary" onPress={() => setStep(step - 1)} disabled={isLoading || submitting} /></View> : null}
          <View className="flex-1"><Button label={step === TOTAL_STEPS ? 'Créer le dossier' : 'Continuer'} onPress={() => step === TOTAL_STEPS ? void submit() : setStep(step + 1)} disabled={(step === TOTAL_STEPS ? !canSubmit : !stepValid) || isLoading || submitting} isLoading={step === TOTAL_STEPS && (isLoading || submitting)} /></View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeScreen>;
}

function Summary({ label, value }: { label: string; value: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mb-3 last:mb-0"><Text className="text-xs" style={{ color: colors.textSecondary }}>{label}</Text><Text className="mt-1 font-semibold" style={{ color: colors.text }}>{value}</Text></View>;
}
