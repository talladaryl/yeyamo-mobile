import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SocialButton } from '@/components/auth/SocialButton';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeStore } from '@/features/theme/theme.store';
import { loginSchema, type LoginForm } from '@/utils/validation';
import { useInterestsStore } from '@/features/interests/interests.store';
import { TurnstileWidget } from '@/components/security/TurnstileWidget';
import { useGoogleIdToken } from '@/features/auth/useGoogleIdToken';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginDemo, googleLogin, isLoading, error } = useAuth();
  const colors = useThemeStore((state) => state.colors);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileVersion, setTurnstileVersion] = useState(0);
  const [turnstileMessage, setTurnstileMessage] = useState<string | null>(null);
  const { googleRequest, requestGoogleIdToken, googleError } = useGoogleIdToken();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signIn = async (data: LoginForm) => {
    try {
      if (!turnstileToken) return;
      await login(data, turnstileToken);
      router.replace('/interests');
    } catch (requestError: unknown) {
      const code = typeof requestError === 'object' && requestError !== null && 'code' in requestError
        ? String(requestError.code)
        : undefined;
      if (code === 'TURNSTILE_VERIFICATION_FAILED' || code === 'TURNSTILE_REQUIRED') {
        setTurnstileToken(null);
        setTurnstileVersion((value) => value + 1);
        setTurnstileMessage('La vérification a expiré. Veuillez la recommencer.');
        return;
      }
      if (code === 'EMAIL_NOT_VERIFIED') {
        router.push({
          pathname: '/(auth)/verify-code',
          params: { email: data.email.trim() },
        });
      } else Alert.alert('Connexion impossible', 'Veuillez vérifier vos informations puis réessayer.');
    }
  };

  const demoLogin = async () => {
    try {
      await loginDemo('user');
      router.replace('/interests');
    } catch {
      // The request error is exposed by useAuth.
    }
  };

  const handleGoogleLogin = async () => {
    const idToken = await requestGoogleIdToken();
    if (idToken && await googleLogin(idToken)) router.replace('/interests');
  };

  const partnerDemoLogin = async () => {
    try {
      const interests = useInterestsStore.getState();
      if (!interests.selectedInterestIds.length) {
        ['sorties', 'gastronomie', 'voyage'].forEach(interests.toggleInterest);
      }
      await useInterestsStore.getState().saveInterests();
      await loginDemo('partner');
      router.replace('/(tabs)');
    } catch {
      // The request error is exposed by useAuth.
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <LinearGradient colors={['#EF4444', '#DC2626', '#991B1B']} className="h-48 overflow-hidden px-6 pt-3">
            <View className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />
            <View className="absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-white/10" />
            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-white/90">Bienvenue sur Yeyamo</Text>
              <View className="h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <Icon name="compass-outline" size={20} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>

          <View
            className="-mt-9 flex-1 rounded-t-[34px] px-6 pb-8 pt-5"
            style={{ backgroundColor: colors.background }}
          >
            <View className="items-center">
              <View className="h-20 w-20 items-center justify-center rounded-full border-4 shadow-sm" style={{ backgroundColor: colors.card, borderColor: colors.background }}>
                <Logo size="medium" />
              </View>
              <Text className="mt-3 text-2xl font-extrabold" style={{ color: colors.text }}>Bon retour sur Yeyamo !</Text>
              <Text className="mt-2 text-center text-sm leading-5" style={{ color: colors.textSecondary }}>
                Continuez à découvrir, partager et vivre des expériences.
              </Text>
            </View>

            <View className="mt-7 gap-4">
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Email ou numéro de téléphone"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    leftIcon={<Icon name="person-outline" size={19} color={colors.textMuted} />}
                    error={errors.email?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Mot de passe"
                    secureTextEntry
                    textContentType="password"
                    autoComplete="current-password"
                    leftIcon={<Icon name="lock-closed-outline" size={19} color={colors.textMuted} />}
                    error={errors.password?.message}
                  />
                )}
              />

              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} className="self-end">
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
              <TurnstileWidget
                key={turnstileVersion}
                action="login"
                onVerify={(token) => { setTurnstileToken(token); setTurnstileMessage(null); }}
                onExpire={() => { setTurnstileToken(null); setTurnstileMessage('La vérification a expiré. Veuillez la recommencer.'); }}
                onError={(message) => { setTurnstileToken(null); setTurnstileMessage(message); }}
              />
              {turnstileMessage ? <Text className="text-center text-xs text-[#B45309]">{turnstileMessage}</Text> : null}
              {error || googleError ? <Text className="text-center text-sm" style={{ color: colors.primary }}>{error ?? googleError}</Text> : null}
              <Button label="Se connecter" onPress={handleSubmit(signIn)} isLoading={isLoading} disabled={!turnstileToken || isLoading} />
              <TouchableOpacity
                onPress={demoLogin}
                disabled={isLoading}
                activeOpacity={0.8}
                className="items-center rounded-xl border py-3"
                style={{ backgroundColor: colors.elevated, borderColor: colors.border }}
              >
                <Text className="font-semibold" style={{ color: colors.text }}>Entrer en mode démo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={partnerDemoLogin}
                disabled={isLoading}
                activeOpacity={0.8}
                className="flex-row items-center justify-center gap-2 rounded-xl border py-3"
                style={{ backgroundColor: '#7C3AED14', borderColor: '#7C3AED55' }}
              >
                <Icon name="business" size={19} color="#7C3AED" />
                <Text className="font-semibold" style={{ color: colors.text }}>
                  Se connecter en tant que partenaire démo
                </Text>
              </TouchableOpacity>
            </View>

            <View className="my-6 flex-row items-center">
              <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
              <Text className="mx-4 text-xs" style={{ color: colors.textSecondary }}>ou continuer avec</Text>
              <View className="h-px flex-1" style={{ backgroundColor: colors.border }} />
            </View>
            <View className="gap-3">
              <SocialButton provider="google" onPress={() => void handleGoogleLogin()} disabled={isLoading || !googleRequest} />
              <SocialButton provider="apple" onPress={() => undefined} disabled={isLoading} />
            </View>

            <View className="mt-7 flex-row items-center justify-center">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Pas encore de compte ? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/account-type')}>
                <Text className="text-sm font-bold" style={{ color: colors.primary }}>Créer un compte</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
