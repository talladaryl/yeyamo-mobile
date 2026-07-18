import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Stepper } from '@/components/ui/Stepper';
import { CTAButton } from '@/components/ui/CTAButton';
import { usePartnerStore } from '@/features/partner/partner.store';

export default function AddEventStep1Screen() {
  const router = useRouter();
  const { eventForm, setEventForm, setEventStep } = usePartnerStore();
  
  const [name, setName] = useState(eventForm.name || '');
  const [location, setLocation] = useState(eventForm.location || '');
  const [category, setCategory] = useState(eventForm.category || 'Musique');
  const [place, setPlace] = useState(eventForm.place || '');
  const [type, setType] = useState(eventForm.type || '');
  const [startDate, setStartDate] = useState(eventForm.start_date || '');
  const [startTime, setStartTime] = useState(eventForm.start_time || '');

  const handleContinue = () => {
    setEventForm({
      name,
      location,
      category,
      place,
      type,
      start_date: startDate,
      start_time: startTime,
    });
    setEventStep(2);
    router.push('/(partner)/add-event-step2');
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Ajouter un événement',
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
          {/* Stepper */}
          <Stepper currentStep={1} totalSteps={2} />

          {/* Icon Illustration */}
          <View className="items-center mb-6 mt-4">
            <View className="w-24 h-24 bg-[#EF4444]/20 rounded-full items-center justify-center mb-4">
              <Icon library="ionicons" name="calendar" size={48} color="#EF4444" />
            </View>
          </View>

          {/* Section: Informations de base */}
          <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-4">
            Informations de base
          </Text>

          {/* Nom de l'événement */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Nom de l'événement <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="Ex: Concert de musique live"
              placeholderTextColor="#A1A1AA"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Lieu */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Lieu <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
              placeholder="Ex: La Falaise Yaoundé"
              placeholderTextColor="#A1A1AA"
              value={location}
              onChangeText={setLocation}
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
              <Text className="text-[#18181B] dark:text-white text-sm">{category}</Text>
              <Icon library="ionicons" name="chevron-down" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Lieu (dropdown) */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Lieu
            </Text>
            <TouchableOpacity
              className="bg-white dark:bg-[#161616] rounded-xl px-4 py-3 flex-row items-center justify-between border border-[#E4E4E7] dark:border-[#27272A]"
              activeOpacity={0.7}
            >
              <Text className={place ? 'text-[#18181B] dark:text-white text-sm' : 'text-[#52525B] dark:text-[#A1A1AA] text-sm'}>
                {place || 'Sélectionner un lieu'}
              </Text>
              <Icon library="ionicons" name="chevron-down" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Type de lieu */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Type de lieu
            </Text>
            <TouchableOpacity
              className="bg-white dark:bg-[#161616] rounded-xl px-4 py-3 flex-row items-center justify-between border border-[#E4E4E7] dark:border-[#27272A]"
              activeOpacity={0.7}
            >
              <Text className={type ? 'text-[#18181B] dark:text-white text-sm' : 'text-[#52525B] dark:text-[#A1A1AA] text-sm'}>
                {type || 'Sélectionner un type'}
              </Text>
              <Icon library="ionicons" name="chevron-down" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Date de début */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Date de début <Text className="text-[#EF4444]">*</Text>
            </Text>
            <View className="flex-row items-center bg-white dark:bg-[#161616] rounded-xl px-4 py-3 border border-[#E4E4E7] dark:border-[#27272A]">
              <Icon library="ionicons" name="calendar-outline" size={20} color="#A1A1AA" />
              <TextInput
                className="flex-1 text-[#18181B] dark:text-white text-sm ml-3"
                placeholder="10 Déc 2025"
                placeholderTextColor="#A1A1AA"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
          </View>

          {/* Heure */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Heure <Text className="text-[#EF4444]">*</Text>
            </Text>
            <View className="flex-row items-center bg-white dark:bg-[#161616] rounded-xl px-4 py-3 border border-[#E4E4E7] dark:border-[#27272A]">
              <Icon library="ionicons" name="time-outline" size={20} color="#A1A1AA" />
              <TextInput
                className="flex-1 text-[#18181B] dark:text-white text-sm ml-3"
                placeholder="18:00"
                placeholderTextColor="#A1A1AA"
                value={startTime}
                onChangeText={setStartTime}
              />
            </View>
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
          disabled={!name || !location || !startDate || !startTime}
        />
      </View>
    </View>
  );
}
