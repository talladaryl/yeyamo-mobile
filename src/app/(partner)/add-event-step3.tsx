import { useState } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Stepper } from '@/components/ui/Stepper';
import { CTAButton } from '@/components/ui/CTAButton';
import { usePartnerStore } from '@/features/partner/partner.store';
import { useThemeStore } from '@/features/theme/theme.store';
import { formValidation } from '@/utils/formValidation';

export default function AddEventStep3Screen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const { eventForm, setEventForm, setEventStep } = usePartnerStore();
  
  const [description, setDescription] = useState(eventForm.description || '');
  const [isPaid, setIsPaid] = useState(eventForm.ticket_price_enabled || false);
  const [ticketPrice, setTicketPrice] = useState(eventForm.ticket_price?.toString() || '');
  const [maxSeats, setMaxSeats] = useState(eventForm.max_seats?.toString() || '');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'paypal' | null>(null);

  const handleContinue = () => {
    const error = formValidation.required(description, 'Description')
      ?? (isPaid ? formValidation.positiveNumber(ticketPrice, 'Prix du billet', true) : undefined)
      ?? formValidation.positiveNumber(maxSeats, 'Nombre de places');
    if (error) { Alert.alert('Informations à vérifier', error); return; }
    setEventForm({
      description,
      ticket_price_enabled: isPaid,
      ticket_price: isPaid ? parseFloat(ticketPrice) : undefined,
      max_seats: maxSeats ? parseInt(maxSeats) : undefined,
    });
    setEventStep(4);
    router.push('/(partner)/add-event-step4');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitle: 'Ajouter un événement',
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
              <Icon library="ionicons" name="ticket" size={48} color="#EF4444" />
            </View>
          </View>

          {/* Section: Détails & Billetterie */}
          <Text className="text-[#18181B] dark:text-white text-lg font-bold mb-4">
            Détails & Billetterie
          </Text>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
              Description <Text className="text-[#EF4444]">*</Text>
            </Text>
            <TextInput
              className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A] min-h-[120px]"
              placeholder="Présentez votre événement, le programme, les artistes..."
              placeholderTextColor="#A1A1AA"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              maxLength={1000}
              textAlignVertical="top"
            />
            <Text className="text-xs text-[#52525B] dark:text-[#A1A1AA] mt-1 text-right">
              {description.length}/1000
            </Text>
          </View>

          {/* Tarifs Section */}
          <Text className="text-[#18181B] dark:text-white text-base font-semibold mb-3 mt-4">
            Tarifs
          </Text>

          {/* Toggle Paid/Free */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[#18181B] dark:text-white text-sm">Événement payant</Text>
            <TouchableOpacity
              onPress={() => setIsPaid(!isPaid)}
              className={`w-14 h-8 rounded-full p-1 ${isPaid ? 'bg-[#EF4444]' : 'bg-[#F4F4F5] dark:bg-[#27272A]'}`}
            >
              <View className={`w-6 h-6 rounded-full bg-white ${isPaid ? 'ml-auto' : ''}`} />
            </TouchableOpacity>
          </View>

          {/* Price Input (if paid) */}
          {isPaid && (
            <>
              <View className="mb-4">
                <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
                  Prix du billet (FCFA) <Text className="text-[#EF4444]">*</Text>
                </Text>
                <TextInput
                  className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
                  placeholder="Ex: 5000"
                  placeholderTextColor="#A1A1AA"
                  value={ticketPrice}
                  onChangeText={setTicketPrice}
                  keyboardType="numeric"
                />
              </View>

              {/* Payment Method */}
              <View className="mb-4">
                <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
                  Capacité (optionnel)
                </Text>
                <TextInput
                  className="bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]"
                  placeholder="Ex: 200 personnes"
                  placeholderTextColor="#A1A1AA"
                  value={maxSeats}
                  onChangeText={setMaxSeats}
                  keyboardType="numeric"
                />
              </View>

              {/* Payment Options */}
              <Text className="text-[#18181B] dark:text-white text-sm font-medium mb-2">
                Mode de paiement
              </Text>
              
              <View className="flex-row gap-3 mb-4">
                {/* Credit Card */}
                <TouchableOpacity
                  onPress={() => setPaymentMethod('credit')}
                  className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border ${
                    paymentMethod === 'credit' 
                      ? 'bg-[#EF4444]/10 border-[#EF4444]' 
                      : 'bg-white dark:bg-[#161616] border-[#E4E4E7] dark:border-[#27272A]'
                  }`}
                >
                  <Icon 
                    library="ionicons" 
                    name="card" 
                    size={20} 
                    color={paymentMethod === 'credit' ? '#EF4444' : '#A1A1AA'} 
                  />
                  <Text className={`text-sm ml-2 ${
                    paymentMethod === 'credit' ? 'text-[#EF4444]' : 'text-[#52525B] dark:text-[#A1A1AA]'
                  }`}>
                    Crédit
                  </Text>
                  {paymentMethod === 'credit' && (
                    <View className="ml-auto">
                      <Icon library="ionicons" name="checkmark-circle" size={20} color="#EF4444" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* PayPal */}
                <TouchableOpacity
                  onPress={() => setPaymentMethod('paypal')}
                  className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border ${
                    paymentMethod === 'paypal' 
                      ? 'bg-[#EF4444]/10 border-[#EF4444]' 
                      : 'bg-white dark:bg-[#161616] border-[#E4E4E7] dark:border-[#27272A]'
                  }`}
                >
                  <Icon 
                    library="ionicons" 
                    name="logo-paypal" 
                    size={20} 
                    color={paymentMethod === 'paypal' ? '#EF4444' : '#A1A1AA'} 
                  />
                  <Text className={`text-sm ml-2 ${
                    paymentMethod === 'paypal' ? 'text-[#EF4444]' : 'text-[#52525B] dark:text-[#A1A1AA]'
                  }`}>
                    Paypal
                  </Text>
                  {paymentMethod === 'paypal' && (
                    <View className="ml-auto">
                      <Icon library="ionicons" name="checkmark-circle" size={20} color="#EF4444" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mb-4">
                Frais de paiement : 0%
              </Text>
            </>
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 border-t px-4 py-4" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
        <CTAButton
          title="Continuer"
          variant="primary"
          onPress={handleContinue}
          disabled={!description || (isPaid && (!ticketPrice || !paymentMethod))}
        />
      </View>
    </View>
  );
}
