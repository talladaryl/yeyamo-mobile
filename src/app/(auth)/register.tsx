import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/useAuth';
import { registerSchema, type RegisterForm } from '@/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();

  const {
    control,
    handleSubmit,
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
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await register(data);
    } catch {
      // error displayed via useAuth state
    }
  };

  const fields: Array<{
    name: keyof RegisterForm;
    label: string;
    placeholder: string;
    secure?: boolean;
    keyboard?: 'email-address' | 'default';
  }> = [
    { name: 'display_name', label: 'Full Name', placeholder: 'Your Name' },
    { name: 'username', label: 'Username', placeholder: 'your_username' },
    { name: 'email', label: 'Email', placeholder: 'you@example.com', keyboard: 'email-address' },
    { name: 'city', label: 'City', placeholder: 'Paris, Dakar...' },
    { name: 'password', label: 'Password', placeholder: '••••••••', secure: true },
    { name: 'password_confirmation', label: 'Confirm Password', placeholder: '••••••••', secure: true },
  ];

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="px-6 py-12"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-10">
            <Text className="text-white text-4xl font-extrabold tracking-tight">
              Create account
            </Text>
            <Text className="text-[#A1A1AA] text-base mt-2">
              Join the Yeyamo community
            </Text>
          </View>

          <View className="gap-4">
            {fields.map(({ name, label, placeholder, secure, keyboard }) => (
              <Controller
                key={name}
                control={control}
                name={name}
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label={label}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    secureTextEntry={secure}
                    keyboardType={keyboard ?? 'default'}
                    error={errors[name]?.message}
                  />
                )}
              />
            ))}

            {error ? (
              <Text className="text-[#EF4444] text-sm text-center">{error}</Text>
            ) : null}

            <Button
              label="Create Account"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              className="mt-2"
            />
          </View>

          <View className="flex-row justify-center items-center mt-8 gap-1">
            <Text className="text-[#A1A1AA] text-sm">Already have an account?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-[#7C3AED] text-sm font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
