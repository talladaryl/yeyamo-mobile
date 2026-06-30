import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Stepper } from '@/components/ui/Stepper';
import { CTAButton } from '@/components/ui/CTAButton';
import { usePartnerStore } from '@/features/partner/partner.store';

export default function AddEventStep4Screen() {
  const router = useRouter();
  const { eventForm, resetEventForm } = usePartnerStore();

  const handlePublish = () => {
    // TODO: API call to create event
    console.log('Publishing event:', eventForm);
    
    // Reset form and navigate
    resetEventForm();
    router.push('/(tabs)/explore');
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
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
          <Stepper currentStep={4} totalSteps={4} />

          {/* Icon Illustration */}
          <View className="items-center mb-6 mt-4">
            <View className="w-24 h-24 bg-[#EF4444]/20 rounded-full items-center justify-center mb-4">
              <Icon library="ionicons" name="checkmark-circle" size={48} color="#EF4444" />
            </View>
            <Text className="text-white text-lg font-bold mb-2">Aperçu</Text>
            <Text className="text-[#A1A1AA] text-sm text-center">
              Vérifiez les informations avant publication
            </Text>
          </View>

          {/* Preview Card */}
          <View className="bg-[#161616] rounded-2xl overflow-hidden border border-[#27272A] mb-6">
            {/* Cover Image */}
            <View className="bg-[#27272A] h-48 items-center justify-center">
              <Icon library="ionicons" name="image-outline" size={48} color="#52525B" />
              <Text className="text-[#52525B] text-xs mt-2">Image de l'événement</Text>
            </View>

            {/* Content */}
            <View className="p-4">
              {/* Name & Date Badge */}
              <View className="mb-3">
                <Text className="text-white text-lg font-bold mb-2">
                  {eventForm.name || 'Festival Ngundo 2026'}
                </Text>
                
                {/* Date Badge */}
                <View className="flex-row items-center bg-[#EF4444]/10 self-start px-3 py-1.5 rounded-full">
                  <Icon library="ionicons" name="calendar" size={14} color="#EF4444" />
                  <Text className="text-[#EF4444] text-xs font-medium ml-1.5">
                    {eventForm.start_date || '20 - 25 Mar'} • {eventForm.start_time || '10:00'}
                  </Text>
                </View>
              </View>

              {/* Tarif Badge */}
              {eventForm.ticket_price_enabled && eventForm.ticket_price && (
                <View className="bg-[#0A0A0A] px-3 py-2 rounded-lg mb-3 self-start">
                  <Text className="text-white text-sm font-semibold">
                    {eventForm.ticket_price} FCFA
                  </Text>
                </View>
              )}

              {/* Info Sections */}
              <View className="space-y-3">
                {/* Location */}
                <View>
                  <Text className="text-[#A1A1AA] text-xs font-medium mb-1">Lieu</Text>
                  <Text className="text-white text-sm">
                    {eventForm.location || 'La Falaise Resort, Douala'}
                  </Text>
                </View>

                {/* Description */}
                <View>
                  <Text className="text-[#A1A1AA] text-xs font-medium mb-1">Description</Text>
                  <Text className="text-white text-sm leading-5">
                    {eventForm.description || 'La Ngondo est un plus grand festival dans la ville culturelle du Sénégal, où les traditions se mêlent à la modernité. Ce moment unique rassemble 4 musiques, 4 danses et de la gastronomie locale.'}
                  </Text>
                </View>

                {/* Capacity */}
                {eventForm.max_seats && (
                  <View>
                    <Text className="text-[#A1A1AA] text-xs font-medium mb-1">Capacité</Text>
                    <Text className="text-white text-sm">{eventForm.max_seats} personnes</Text>
                  </View>
                )}
              </View>

              {/* Voir plus button */}
              <TouchableOpacity className="mt-4">
                <Text className="text-[#EF4444] text-sm font-medium">Voir plus</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Message */}
          <View className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 flex-row">
            <Icon library="ionicons" name="information-circle" size={20} color="#EF4444" />
            <Text className="text-[#A1A1AA] text-xs ml-3 flex-1 leading-5">
              Votre événement sera vérifié par notre équipe avant publication. Vous recevrez une notification dans les 24-48h.
            </Text>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] px-4 py-4">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <CTAButton
              title="Retour"
              variant="secondary"
              onPress={() => router.back()}
            />
          </View>
          <View className="flex-1">
            <CTAButton
              title="Publier l'événement"
              variant="primary"
              onPress={handlePublish}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
