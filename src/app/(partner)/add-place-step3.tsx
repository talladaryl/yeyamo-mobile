import { useState } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Stepper } from '@/components/ui/Stepper';
import { CTAButton } from '@/components/ui/CTAButton';
import { usePartnerStore } from '@/features/partner/partner.store';
import { useThemeStore } from '@/features/theme/theme.store';
import { formValidation } from '@/utils/formValidation';

export default function AddPlaceStep3Screen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { placeForm, setPlaceForm, setPlaceStep } = usePartnerStore();
  
  const [phone, setPhone] = useState(placeForm.phone || '');
  const [email, setEmail] = useState(placeForm.contact_email || '');
  const [website, setWebsite] = useState(placeForm.website || '');
  const [facebook, setFacebook] = useState(placeForm.facebook || '');
  const [instagram, setInstagram] = useState(placeForm.instagram || '');
  const [twitter, setTwitter] = useState(placeForm.twitter || '');

  const handleContinue = () => {
    const error = formValidation.phone(phone, true) ?? formValidation.email(email) ?? formValidation.url(website);
    if (error) { Alert.alert('Coordonnées à vérifier', error); return; }
    setPlaceForm({
      phone,
      contact_email: email,
      website,
      facebook,
      instagram,
      twitter,
    });
    setPlaceStep(4);
    router.push('/(partner)/add-place-step4');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Ajouter un lieu',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <Icon library="ionicons" name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* Stepper */}
          <Stepper currentStep={3} totalSteps={4} />

          {/* Icon Illustration */}
          <View className="items-center mb-6 mt-4">
            <View className="w-24 h-24 bg-[#EF4444]/20 rounded-full items-center justify-center mb-4">
              <Icon library="ionicons" name="call" size={48} color="#EF4444" />
            </View>
          </View>

          {/* Section: Détails du lieu */}
          <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-4">
            Détails du lieu
          </Text>

          {/* Téléphone */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Téléphone <Text className="text-[#EF4444]">*</Text>
            </Text>
            <View className="flex-row items-center bg-white dark:bg-[#161616] rounded-xl px-4 py-3 border border-[#E4E4E7] dark:border-[#27272A]">
              <Icon library="ionicons" name="call-outline" size={20} color="#A1A1AA" />
              <TextInput
                className="flex-1 text-[#18181B] dark:text-white text-sm ml-3"
                placeholder="+237 6 74 38 50 76"
                placeholderTextColor="#A1A1AA"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Email
            </Text>
            <View className="flex-row items-center bg-white dark:bg-[#161616] rounded-xl px-4 py-3 border border-[#E4E4E7] dark:border-[#27272A]">
              <Icon library="ionicons" name="mail-outline" size={20} color="#A1A1AA" />
              <TextInput
                className="flex-1 text-[#18181B] dark:text-white text-sm ml-3"
                placeholder="contact@lafalaiseresort.com"
                placeholderTextColor="#A1A1AA"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Site web */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Site web (optionnel)
            </Text>
            <View className="flex-row items-center bg-white dark:bg-[#161616] rounded-xl px-4 py-3 border border-[#E4E4E7] dark:border-[#27272A]">
              <Icon library="ionicons" name="globe-outline" size={20} color="#A1A1AA" />
              <TextInput
                className="flex-1 text-[#18181B] dark:text-white text-sm ml-3"
                placeholder="www.lafalaiseresort.com"
                placeholderTextColor="#A1A1AA"
                value={website}
                onChangeText={setWebsite}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Section: Réseaux sociaux */}
          <Text className="text-[#18181B] dark:text-white text-base font-semibold mb-3 mt-4">
            Site web et réseaux sociaux
          </Text>
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mb-4">
            Ex: www.exemple.com ou @exemple
          </Text>

          {/* Facebook */}
          <View className="mb-4">
            <View className="flex-row items-center bg-white dark:bg-[#161616] rounded-xl px-4 py-3 border border-[#E4E4E7] dark:border-[#27272A]">
              <Icon library="ionicons" name="logo-facebook" size={20} color="#1877F2" />
              <TextInput
                className="flex-1 text-[#18181B] dark:text-white text-sm ml-3"
                placeholder="Facebook"
                placeholderTextColor="#A1A1AA"
                value={facebook}
                onChangeText={setFacebook}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Instagram */}
          <View className="mb-4">
            <View className="flex-row items-center bg-white dark:bg-[#161616] rounded-xl px-4 py-3 border border-[#E4E4E7] dark:border-[#27272A]">
              <Icon library="ionicons" name="logo-instagram" size={20} color="#E4405F" />
              <TextInput
                className="flex-1 text-[#18181B] dark:text-white text-sm ml-3"
                placeholder="Instagram"
                placeholderTextColor="#A1A1AA"
                value={instagram}
                onChangeText={setInstagram}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Twitter */}
          <View className="mb-4">
            <View className="flex-row items-center bg-white dark:bg-[#161616] rounded-xl px-4 py-3 border border-[#E4E4E7] dark:border-[#27272A]">
              <Icon library="ionicons" name="logo-twitter" size={20} color="#1DA1F2" />
              <TextInput
                className="flex-1 text-[#18181B] dark:text-white text-sm ml-3"
                placeholder="Twitter"
                placeholderTextColor="#A1A1AA"
                value={twitter}
                onChangeText={setTwitter}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 border-t px-4 py-4" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
        <CTAButton
          title="Continuer"
          variant="primary"
          onPress={handleContinue}
          disabled={!phone}
        />
      </View>
    </View>
  );
}
