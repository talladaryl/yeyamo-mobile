import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { CategoryPicker } from '@/components/auth/CategoryPicker';
import { RegionPicker } from '@/components/auth/RegionPicker';
import { CityPicker } from '@/components/auth/CityPicker';
import { DocumentPicker } from '@/components/auth/DocumentPicker';
import { GalleryPicker } from '@/components/auth/GalleryPicker';
import { Logo } from '@/components/ui/Logo';

interface FormData {
  // Step 1
  category: string;
  company_name: string;
  responsible_name: string;
  phone: string;
  email: string;
  // Step 2
  address: string;
  region: string;
  city: string;
  description: string;
  // Step 3
  commerce_document: string | null;
  id_document: string | null;
  cover_photo: string | null;
  gallery_photos: string[];
  // Step 4
  accept_terms: boolean;
}

export default function RegisterPartnerScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [countryCode, setCountryCode] = useState('+237');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    category: '',
    company_name: '',
    responsible_name: '',
    phone: '',
    email: '',
    address: '',
    region: '',
    city: '',
    description: '',
    commerce_document: null,
    id_document: null,
    cover_photo: null,
    gallery_photos: [],
    accept_terms: false,
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      console.log('Partner registration:', formData);
      // TODO: API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.replace('/(auth)/verify-code');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.category && formData.company_name && formData.responsible_name && formData.phone && formData.email;
      case 2:
        return formData.address && formData.region && formData.city && formData.description;
      case 3:
        return formData.commerce_document && formData.id_document && formData.cover_photo && formData.gallery_photos.length >= 3;
      case 4:
        return formData.accept_terms;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {/* Illustration */}
            <View className="items-center mb-6">
              <Text className="text-6xl mb-3">🏪</Text>
              <Text className="text-white text-xl font-bold mb-2">Informations de base</Text>
              <Text className="text-[#A1A1AA] text-sm text-center">
                Commencez par les informations essentielles{'\n'}de votre activité.
              </Text>
            </View>

            <CategoryPicker
              value={formData.category}
              onValueChange={(value) => updateField('category', value)}
            />

            <Input
              label="Nom de l'établissement / de la structure"
              value={formData.company_name}
              onChangeText={(value) => updateField('company_name', value)}
              placeholder="Ex : Hôtel Le Fabian Douala"
            />

            <Input
              label="Nom du responsable"
              value={formData.responsible_name}
              onChangeText={(value) => updateField('responsible_name', value)}
              placeholder="Ex: Jean Dupont"
            />

            <PhoneInput
              label="Téléphone professionnel"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              placeholder="6XX XX XX XX"
            />

            <Input
              label="Email professionnel"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="Ex: contact@monentreprise.com"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
            />
          </>
        );

      case 2:
        return (
          <>
            {/* Illustration */}
            <View className="items-center mb-6">
              <Text className="text-6xl mb-3">🏨</Text>
              <Text className="text-white text-xl font-bold mb-2">Détails de l'établissement</Text>
              <Text className="text-[#A1A1AA] text-sm text-center">
                Parlez-nous davantage de votre emplacement{'\n'}et de vos services.
              </Text>
            </View>

            <Input
              label="Adresse complète"
              value={formData.address}
              onChangeText={(value) => updateField('address', value)}
              placeholder="Ex: 10, Rue Joss, Douala, Cameroun"
            />

            <RegionPicker
              value={formData.region}
              onValueChange={(value) => {
                updateField('region', value);
                updateField('city', ''); // Reset city when region changes
              }}
            />

            <CityPicker
              value={formData.city}
              onValueChange={(value) => updateField('city', value)}
              region={formData.region}
            />

            <View className="mb-4">
              <Text className="text-sm text-[#A1A1AA] font-medium mb-1">
                Description de votre activité
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                placeholder="Présentez votre établissement, vos services, votre histoire..."
                placeholderTextColor="#52525B"
                multiline
                numberOfLines={6}
                maxLength={500}
                textAlignVertical="top"
                className="bg-[#1F1F1F] text-white rounded-xl px-4 py-3 text-base border border-[#27272A] min-h-[120px]"
              />
              <Text className="text-xs text-[#A1A1AA] mt-1 text-right">
                {formData.description.length}/500
              </Text>
            </View>
          </>
        );

      case 3:
        return (
          <>
            {/* Illustration */}
            <View className="items-center mb-6">
              <Text className="text-6xl mb-3">📄</Text>
              <Text className="text-white text-xl font-bold mb-2">Documents & Médias</Text>
              <Text className="text-[#A1A1AA] text-sm text-center">
                Ajoutez vos documents officiels et visuels{'\n'}de votre établissement.
              </Text>
            </View>

            <Text className="text-white text-base font-semibold mb-3">Documents obligatoires</Text>

            <DocumentPicker
              label="Registre de commerce"
              value={formData.commerce_document}
              onValueChange={(value) => updateField('commerce_document', value)}
            />

            <DocumentPicker
              label="Pièce d'identité du responsable"
              value={formData.id_document}
              onValueChange={(value) => updateField('id_document', value)}
            />

            <Text className="text-white text-base font-semibold mb-3 mt-4">Médias de votre établissement</Text>

            <DocumentPicker
              label="Photo de couverture"
              value={formData.cover_photo}
              onValueChange={(value) => updateField('cover_photo', value)}
              acceptedFormats="JPG ou PNG - Max 5 Mo"
            />

            <GalleryPicker
              value={formData.gallery_photos}
              onValueChange={(value) => updateField('gallery_photos', value)}
              minPhotos={3}
            />
          </>
        );

      case 4:
        return (
          <>
            {/* Illustration */}
            <View className="items-center mb-6">
              <Text className="text-6xl mb-3">✅</Text>
              <Text className="text-white text-xl font-bold mb-2">Vérification & Finalisation</Text>
              <Text className="text-[#A1A1AA] text-sm text-center">
                Vérifiez vos informations avant de{'\n'}finaliser votre demande.
              </Text>
            </View>

            {/* Summary */}
            <View className="bg-[#1F1F1F] rounded-xl p-4 border border-[#27272A] mb-4">
              <Text className="text-white font-semibold mb-3">Récapitulatif</Text>
              
              <View className="mb-3">
                <Text className="text-[#A1A1AA] text-xs mb-1">🏪 Nom</Text>
                <Text className="text-white">{formData.company_name}</Text>
              </View>

              <View className="mb-3">
                <Text className="text-[#A1A1AA] text-xs mb-1">👤 Responsable</Text>
                <Text className="text-white">{formData.responsible_name}</Text>
              </View>

              <View className="mb-3">
                <Text className="text-[#A1A1AA] text-xs mb-1">📞 Téléphone</Text>
                <Text className="text-white">{countryCode} {formData.phone}</Text>
              </View>

              <View className="mb-3">
                <Text className="text-[#A1A1AA] text-xs mb-1">📧 Email</Text>
                <Text className="text-white">{formData.email}</Text>
              </View>

              <View className="mb-3">
                <Text className="text-[#A1A1AA] text-xs mb-1">📍 Adresse</Text>
                <Text className="text-white">{formData.address}</Text>
              </View>

              <View>
                <Text className="text-[#A1A1AA] text-xs mb-1">📄 Documents & Médias</Text>
                <Text className="text-white">
                  {formData.gallery_photos.length} photos • 2 documents
                </Text>
              </View>
            </View>

            {/* CGU */}
            <TouchableOpacity 
              className="flex-row items-start mb-4"
              onPress={() => updateField('accept_terms', !formData.accept_terms)}
            >
              <View className={`w-5 h-5 border-2 rounded mr-3 mt-0.5 items-center justify-center ${
                formData.accept_terms ? 'bg-[#EF4444] border-[#EF4444]' : 'border-[#A1A1AA]'
              }`}>
                {formData.accept_terms && (
                  <Text className="text-white text-xs">✓</Text>
                )}
              </View>
              <Text className="text-[#A1A1AA] text-sm flex-1 leading-5">
                En créant votre compte, vous acceptez les{' '}
                <Text className="text-[#EF4444]">Conditions d'utilisation</Text>
                {' '}et la{' '}
                <Text className="text-[#EF4444]">Politique de confidentialité</Text>
              </Text>
            </TouchableOpacity>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeScreen>
      <View className="flex-1">
        {/* Header avec navigation */}
        <View className="px-6 pt-4 pb-3 border-b border-[#27272A]">
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity onPress={handleBack}>
              <Text className="text-white text-2xl">←</Text>
            </TouchableOpacity>
            <Text className="text-[#A1A1AA] text-sm">Étape {currentStep} sur 4</Text>
          </View>

          {/* Progress bar */}
          <View className="h-1 bg-[#27272A] rounded-full overflow-hidden">
            <View 
              className="h-full bg-[#EF4444] rounded-full"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </View>
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="flex-grow px-6 py-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {renderStepContent()}
          </ScrollView>

          {/* Fixed button at bottom */}
          <View className="px-6 py-4 border-t border-[#27272A] bg-[#0A0A0A]">
            <Button
              label={currentStep === 4 ? 'Créer mon compte' : 'Continuer'}
              onPress={handleNext}
              isLoading={isLoading}
              disabled={!canProceed()}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeScreen>
  );
}