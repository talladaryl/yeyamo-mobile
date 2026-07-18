import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Stepper } from '@/components/ui/Stepper';
import { CTAButton } from '@/components/ui/CTAButton';
import { usePartnerStore } from '@/features/partner/partner.store';

export default function AddPlaceStep4Screen() {
  const router = useRouter();
  const { placeForm, resetPlaceForm } = usePartnerStore();

  const handlePublish = () => {
    // TODO: API call to create place
    console.log('Publishing place:', placeForm);
    
    // Reset form and navigate
    resetPlaceForm();
    router.push('/(tabs)/explore');
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
          {/* Stepper */}
          <Stepper currentStep={4} totalSteps={4} />

          {/* Icon Illustration */}
          <View className="items-center mb-6 mt-4">
            <View className="w-24 h-24 bg-[#EF4444]/20 rounded-full items-center justify-center mb-4">
              <Icon library="ionicons" name="checkmark-circle" size={48} color="#EF4444" />
            </View>
            <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-2">Aperçu</Text>
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm text-center">
              Vérifiez les informations avant publication
            </Text>
          </View>

          {/* Preview Card */}
          <View className="bg-white dark:bg-[#161616] rounded-2xl overflow-hidden border border-[#E4E4E7] dark:border-[#27272A] mb-6">
            {/* Cover Image */}
            <View className="bg-[#F4F4F5] dark:bg-[#27272A] h-48 items-center justify-center">
              <Icon library="ionicons" name="image-outline" size={48} color="#52525B" />
              <Text className="text-[#52525B] text-xs mt-2">Image de couverture</Text>
            </View>

            {/* Content */}
            <View className="p-4">
              {/* Name & Rating */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-1">
                    {placeForm.name || 'La Falaise Resort'}
                  </Text>
                  <View className="flex-row items-center">
                    <Icon library="ionicons" name="star" size={14} color="#EAB308" />
                    <Text className="text-[#18181B] dark:text-white text-sm ml-1">4.8</Text>
                    <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm ml-1">(78 avis)</Text>
                  </View>
                </View>
              </View>

              {/* Info Sections */}
              <View className="space-y-3">
                {/* Address */}
                <View>
                  <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-medium mb-1">Adresse</Text>
                  <Text className="text-[#18181B] dark:text-white text-sm">
                    {placeForm.exact_address || 'Bonapriso, Rue des Mangroves, Douala'}
                  </Text>
                </View>

                {/* Category */}
                <View>
                  <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-medium mb-1">Catégorie</Text>
                  <Text className="text-[#18181B] dark:text-white text-sm">
                    {placeForm.category || 'Hôtel • Resort'}
                  </Text>
                </View>

                {/* Phone */}
                {placeForm.phone && (
                  <View>
                    <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-medium mb-1">Téléphone</Text>
                    <Text className="text-[#18181B] dark:text-white text-sm">{placeForm.phone}</Text>
                  </View>
                )}

                {/* Email */}
                {placeForm.contact_email && (
                  <View>
                    <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-medium mb-1">Email</Text>
                    <Text className="text-[#18181B] dark:text-white text-sm">{placeForm.contact_email}</Text>
                  </View>
                )}

                {/* Website */}
                {placeForm.website && (
                  <View>
                    <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-medium mb-1">Site web</Text>
                    <Text className="text-[#EF4444] text-sm">{placeForm.website}</Text>
                  </View>
                )}

                {/* Description */}
                <View>
                  <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-medium mb-1">Description</Text>
                  <Text className="text-[#18181B] dark:text-white text-sm leading-5">
                    Un cadre exceptionnel face à l'eau avec une vue magnifique, une expérience culinaire unique et un service irréprochable.
                  </Text>
                </View>
              </View>

              {/* Social Media Links */}
              {(placeForm.facebook || placeForm.instagram || placeForm.twitter) && (
                <View className="mt-4 pt-4 border-t border-[#E4E4E7] dark:border-[#27272A]">
                  <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs font-medium mb-2">Réseaux sociaux</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {placeForm.facebook && (
                      <View className="flex-row items-center bg-white dark:bg-[#0A0A0A] px-3 py-2 rounded-lg">
                        <Icon library="ionicons" name="logo-facebook" size={16} color="#1877F2" />
                        <Text className="text-[#18181B] dark:text-white text-xs ml-2">{placeForm.facebook}</Text>
                      </View>
                    )}
                    {placeForm.instagram && (
                      <View className="flex-row items-center bg-white dark:bg-[#0A0A0A] px-3 py-2 rounded-lg">
                        <Icon library="ionicons" name="logo-instagram" size={16} color="#E4405F" />
                        <Text className="text-[#18181B] dark:text-white text-xs ml-2">{placeForm.instagram}</Text>
                      </View>
                    )}
                    {placeForm.twitter && (
                      <View className="flex-row items-center bg-white dark:bg-[#0A0A0A] px-3 py-2 rounded-lg">
                        <Icon library="ionicons" name="logo-twitter" size={16} color="#1DA1F2" />
                        <Text className="text-[#18181B] dark:text-white text-xs ml-2">{placeForm.twitter}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Info Message */}
          <View className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 flex-row">
            <Icon library="ionicons" name="information-circle" size={20} color="#EF4444" />
            <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs ml-3 flex-1 leading-5">
              Votre lieu sera vérifié par notre équipe avant publication. Vous recevrez une notification dans les 24-48h.
            </Text>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0A0A0A] border-t border-[#E4E4E7] dark:border-[#27272A] px-4 py-4">
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
              title="Publier le lieu"
              variant="primary"
              onPress={handlePublish}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
