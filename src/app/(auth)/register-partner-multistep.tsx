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
  commerce_register: string | null;
  id_document: string | null;
  cover_photo: string | null;
  gallery_photos: string[];
  // Step 4
  accept_terms: boolean;
}

export default function RegisterPartnerMultiStepScreen() {
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
    commerce_register: null,
    id_document: null,
    cover_photo: null,
    gallery_photos: [],
    accept_terms: false,
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // TODO: Call API
      console.log('Submitting partner registration:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.replace('/(auth)/verify-code');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return formData.category && formData.company_name && formData.responsible_name && 
               formData.phone && formData.email;
      case 2:
        return formData.address && formData.region && formData.city && formData.description;
      case 3:
        return formData.commerce_register && formData.id_document && formData.cover_photo && 
               formData.gallery_photos.length >= 3;
      case 4:
        return formData.accept_terms;
      default:
        return false;
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header fixed */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity onPress={handlePrevious}>
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

        {/* Scrollable content */}
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && (
            <Step1
              formData={formData}
              updateFormData={updateFormData}
              countryCode={countryCode}
              setCountryCode={setCountryCode}
            />
          )}
          
          {currentStep === 2 && (
            <Step2
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 3 && (
            <Step3
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          
          {currentStep === 4 && (
            <Step4
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
        </ScrollView>

        {/* Button fixed at bottom */}
        <View className="px-6 pb-6 pt-2 border-t border-[#27272A]">
          <Button
            label={currentStep === 4 ? "Créer mon compte" : "Continuer"}
            onPress={handleNext}
            isLoading={isLoading}
            disabled={!canContinue()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

// STEP 1
function Step1({ formData, updateFormData, countryCode, setCountryCode }: any) {
  return (
    <View>
      <View className="items-center mb-8">
        <Text className="text-6xl mb-4">🏪</Text>
        <Text className="text-white text-2xl font-bold mb-2 text-center">
          Informations de base
        </Text>
        <Text className="text-[#A1A1AA] text-sm text-center">
          Commencez par les informations essentielles{'\n'}de votre activité.
        </Text>
      </View>

      <View className="gap-4">
        <CategoryPicker
          value={formData.category}
          onValueChange={(value) => updateFormData('category', value)}
        />

        <Input
          label="Nom de l'établissement / de la structure"
          value={formData.company_name}
          onChangeText={(value) => updateFormData('company_name', value)}
          placeholder="Ex: Hôtel La Fabrise Douala"
        />

        <Input
          label="Nom du responsable"
          value={formData.responsible_name}
          onChangeText={(value) => updateFormData('responsible_name', value)}
          placeholder="Ex: Jean Dupont"
        />

        <PhoneInput
          label="Téléphone professionnel"
          value={formData.phone}
          onChangeText={(value) => updateFormData('phone', value)}
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
          placeholder="6XX XX XX XX"
        />

        <Input
          label="Email professionnel"
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          placeholder="Ex: contact@monentreprise.com"
          keyboardType="email-address"
        />
      </View>
    </View>
  );
}

// STEP 2
function Step2({ formData, updateFormData }: any) {
  return (
    <View>
      <View className="items-center mb-8">
        <Text className="text-6xl mb-4">🏨</Text>
        <Text className="text-white text-2xl font-bold mb-2 text-center">
          Détails de l'établissement
        </Text>
        <Text className="text-[#A1A1AA] text-sm text-center">
          Parlez-nous davantage de votre entreprise{'\n'}et de ses services.
        </Text>
      </View>

      <View className="gap-4">
        <Input
          label="Adresse complète"
          value={formData.address}
          onChangeText={(value) => updateFormData('address', value)}
          placeholder="Ex: Bonanjo, Douala, Cameroun"
        />

        <RegionPicker
          value={formData.region}
          onValueChange={(value) => updateFormData('region', value)}
        />

        <CityPicker
          value={formData.city}
          onValueChange={(value) => updateFormData('city', value)}
          region={formData.region}
        />

        <View className="gap-1">
          <Text className="text-sm text-[#A1A1AA] font-medium">
            Description de votre activité
          </Text>
          <TextInput
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            placeholder="Présentez votre établissement, vos services, votre histoire..."
            placeholderTextColor="#52525B"
            multiline
            numberOfLines={5}
            maxLength={500}
            textAlignVertical="top"
            className="bg-[#1F1F1F] text-white rounded-xl px-4 py-3 text-base border border-[#27272A] min-h-[120px]"
          />
          <Text className="text-xs text-[#52525B] text-right">
            {formData.description.length}/500
          </Text>
        </View>
      </View>
    </View>
  );
}

// STEP 3
function Step3({ formData, updateFormData }: any) {
  return (
    <View>
      <View className="items-center mb-8">
        <Text className="text-6xl mb-4">📸</Text>
        <Text className="text-white text-2xl font-bold mb-2 text-center">
          Documents & Médias
        </Text>
        <Text className="text-[#A1A1AA] text-sm text-center">
          Ajoutez vos documents et visuels{'\n'}de votre établissement.
        </Text>
      </View>

      <View className="gap-4">
        <Text className="text-white text-lg font-semibold mb-2">
          Documents obligatoires
        </Text>

        <DocumentPicker
          label="Registre de commerce"
          value={formData.commerce_register}
          onValueChange={(value) => updateFormData('commerce_register', value)}
          acceptedFormats="PDF, JPG ou PNG"
          maxSize="5 Mo"
        />

        <DocumentPicker
          label="Pièce d'identité du responsable"
          value={formData.id_document}
          onValueChange={(value) => updateFormData('id_document', value)}
          acceptedFormats="PDF, JPG ou PNG"
          maxSize="5 Mo"
        />

        <Text className="text-white text-lg font-semibold mb-2 mt-4">
          Médias de votre établissement
        </Text>

        <DocumentPicker
          label="Photo de couverture"
          value={formData.cover_photo}
          onValueChange={(value) => updateFormData('cover_photo', value)}
          acceptedFormats="JPG ou PNG"
          maxSize="5 Mo"
        />

        <GalleryPicker
          label="Galerie photos (min. 3)"
          values={formData.gallery_photos}
          onValuesChange={(value) => updateFormData('gallery_photos', value)}
          minPhotos={3}
        />
      </View>
    </View>
  );
}

// STEP 4
function Step4({ formData, updateFormData }: any) {
  return (
    <View>
      <View className="items-center mb-8">
        <Text className="text-6xl mb-4">✅</Text>
        <Text className="text-white text-2xl font-bold mb-2 text-center">
          Vérification & Finalisation
        </Text>
        <Text className="text-[#A1A1AA] text-sm text-center">
          Vérifiez vos informations avant la création{'\n'}de votre demande.
        </Text>
      </View>

      <View className="gap-4">
        <View className="bg-[#1F1F1F] rounded-xl p-4 border border-[#27272A]">
          <SummaryRow icon="🏷️" label="Catégorie" value={formData.category} />
          <SummaryRow icon="🏢" label="Nom" value={formData.company_name} />
          <SummaryRow icon="👤" label="Responsable" value={formData.responsible_name} />
          <SummaryRow icon="📞" label="Téléphone" value={formData.phone} />
          <SummaryRow icon="📧" label="Email" value={formData.email} />
          <SummaryRow icon="📍" label="Adresse" value={formData.address} />
          <SummaryRow icon="🗺️" label="Région" value={formData.region} />
          <SummaryRow icon="🏙️" label="Ville" value={formData.city} />
          <SummaryRow icon="📄" label="Documents" value={`${formData.commerce_register ? '✓' : '✗'} Registre • ${formData.id_document ? '✓' : '✗'} Pièce ID`} />
          <SummaryRow icon="📸" label="Médias" value={`${formData.gallery_photos.length} photos`} isLast />
        </View>

        <TouchableOpacity
          className="flex-row items-start"
          onPress={() => updateFormData('accept_terms', !formData.accept_terms)}
        >
          <View className={`w-5 h-5 border-2 rounded mr-3 mt-0.5 items-center justify-center ${
            formData.accept_terms ? 'bg-[#EF4444] border-[#EF4444]' : 'border-[#A1A1AA]'
          }`}>
            {formData.accept_terms && (
              <Text className="text-white text-xs">✓</Text>
            )}
          </View>
          <Text className="text-[#A1A1AA] text-sm flex-1 leading-5">
            En créant votre compte partenaire, vous acceptez les{' '}
            <Text className="text-[#EF4444]">Conditions d'utilisation</Text>
            {' '}et la{' '}
            <Text className="text-[#EF4444]">Politique de confidentialité</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SummaryRow({ icon, label, value, isLast = false }: any) {
  return (
    <View className={`flex-row items-center py-3 ${!isLast ? 'border-b border-[#27272A]' : ''}`}>
      <Text className="text-lg mr-3">{icon}</Text>
      <View className="flex-1">
        <Text className="text-[#A1A1AA] text-xs mb-1">{label}</Text>
        <Text className="text-white text-sm">{value}</Text>
      </View>
      <TouchableOpacity className="w-8 h-8 items-center justify-center">
        <Text className="text-[#A1A1AA]">✎</Text>
      </TouchableOpacity>
    </View>
  );
}