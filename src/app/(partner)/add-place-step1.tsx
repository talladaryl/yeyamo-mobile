import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { CTAButton } from '@/components/ui/CTAButton';
import { usePartnerStore } from '@/features/partner/partner.store';

export default function AddPlaceStep1Screen() {
  const router = useRouter();
  const { placeForm, setPlaceForm, setPlaceStep } = usePartnerStore();
  
  const [name, setName] = useState(placeForm.name || '');
  const [email, setEmail] = useState(placeForm.email || '');
  const [category, setCategory] = useState(placeForm.category || '');
  const [subcategory, setSubcategory] = useState(placeForm.subcategory || '');
  const [type, setType] = useState(placeForm.type || 'Restaurant');
  const [location, setLocation] = useState(placeForm.location || '');
  const [contactEmail, setContactEmail] = useState(placeForm.contact_email || '');

  const handleContinue = () => {
    setPlaceForm({
      name,
      email,
      category,
      subcategory,
      type,
      location,
      contact_email: contactEmail,
    });
    setPlaceStep(2);
    router.push('/(partner)/add-place-step2');
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Ajouter un lieu',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* Icon Illustration */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-[#EF4444]/20 rounded-full items-center justify-center mb-4">
              <Icon library="ionicons" name="business" size={48} color="#EF4444" />
            </View>
          </View>

          {/* Section: Informations de base */}
          <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-4">
            Informations de base
          </Text>

          {/* Nom de l'établissement */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Nom de l'établissement <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="Ex: La Falaise Hotel"
              placeholderTextColor="#A1A1AA"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Email <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="Ex: info@lafalaisehotel.com"
              placeholderTextColor="#A1A1AA"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Catégorie */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Catégorie <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TouchableOpacity
              className="bg-white dark:bg-[#161616] rounded-xl px-4 py-3 flex-row items-center justify-between border border-[#E4E4E7] dark:border-[#27272A]"
              activeOpacity={0.7}
            >
              <Text className={category ? 'text-[#18181B] dark:text-white text-sm' : 'text-[#52525B] dark:text-[#A1A1AA] text-sm'}>
                {category || 'Hôtels'}
              </Text>
              <Icon library="ionicons" name="chevron-down" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Sous-catégorie */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Sous-catégorie
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="Ex: Hôtel 4 étoiles"
              placeholderTextColor="#A1A1AA"
              value={subcategory}
              onChangeText={setSubcategory}
            />
          </View>

          {/* Type de lieu */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Type de lieu <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TouchableOpacity
              className="bg-white dark:bg-[#161616] rounded-xl px-4 py-3 flex-row items-center justify-between border border-[#E4E4E7] dark:border-[#27272A]"
              activeOpacity={0.7}
            >
              <Text className="text-[#18181B] dark:text-white text-sm">{type}</Text>
              <Icon library="ionicons" name="chevron-down" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Localisation */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Localisation
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="Ex: Douala, Cameroun"
              placeholderTextColor="#A1A1AA"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Email (contact) */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Email
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="contact@exemple.com"
              placeholderTextColor="#A1A1AA"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0A0A0A] border-t border-[#E4E4E7] dark:border-[#27272A] px-4 py-4">
        <CTAButton
          title="Continuer"
          variant="primary"
          onPress={handleContinue}
          disabled={!name || !email}
        />
      </View>
    </View>
  );
}
