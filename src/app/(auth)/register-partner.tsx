import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { CategoryPicker } from '@/components/auth/CategoryPicker';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/useAuth';
import { partnerRegisterSchema, type PartnerRegisterForm } from '@/utils/validation';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 4;

// ─── Types ────────────────────────────────────────────────────────────────────
interface MediaFile {
  uri: string;
  name: string;
  type: string;
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function StepProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <View className="px-6 pb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[#A1A1AA] text-xs">Étape {current} sur {total}</Text>
      </View>
      <View className="h-1 bg-[#27272A] rounded-full w-full">
        <View
          className="h-1 bg-[#EF4444] rounded-full"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </View>
    </View>
  );
}

// ─── Upload Button ─────────────────────────────────────────────────────────────
function UploadButton({
  label,
  subtitle,
  file,
  onPress,
}: {
  label: string;
  subtitle: string;
  file: MediaFile | null;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between bg-[#1F1F1F] border border-[#27272A] rounded-xl px-4 py-4 mb-3"
    >
      <View className="flex-1 mr-3">
        <Text className="text-white text-sm font-medium">{label}</Text>
        <Text className="text-[#52525B] text-xs mt-0.5">
          {file ? file.name : subtitle}
        </Text>
      </View>
      <View className={`w-9 h-9 rounded-lg items-center justify-center ${file ? 'bg-[#EF4444]/20' : 'bg-[#27272A]'}`}>
        <Text className="text-base">{file ? '✓' : '⬆'}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Summary Row ──────────────────────────────────────────────────────────────
function SummaryRow({
  icon,
  label,
  value,
  onEdit,
}: {
  icon: string;
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <View className="flex-row items-center py-3 border-b border-[#27272A]">
      <Text className="text-base mr-3">{icon}</Text>
      <View className="flex-1">
        <Text className="text-[#A1A1AA] text-xs">{label}</Text>
        <Text className="text-white text-sm font-medium mt-0.5">{value || '—'}</Text>
      </View>
      <TouchableOpacity onPress={onEdit}>
        <Text className="text-[#A1A1AA] text-base">✏️</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function RegisterPartnerScreen() {
  const router = useRouter();
  const { isLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [countryCode, setCountryCode] = useState('+237');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Step 3 — media files
  const [registreCommerce, setRegistreCommerce] = useState<MediaFile | null>(null);
  const [pieceIdentite, setPieceIdentite] = useState<MediaFile | null>(null);
  const [photoCouverture, setPhotoCouverture] = useState<MediaFile | null>(null);
  const [galerie, setGalerie] = useState<MediaFile[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PartnerRegisterForm>({
    resolver: zodResolver(partnerRegisterSchema),
    defaultValues: {
      company_name: '',
      category: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      accept_terms: false,
    },
  });

  const watchAll = watch();
  const phoneValue = watchAll.phone || '';
  const categoryValue = watchAll.category || '';

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const handleBack = () => {
    if (currentStep === 1) {
      router.back();
    } else {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleNext = () => {
    setCurrentStep((s) => s + 1);
  };

  // ─── Image Picker ────────────────────────────────────────────────────────────
  const pickSingleFile = async (setter: (f: MediaFile) => void) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission requise', 'Accès à la galerie requis.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setter({
        uri: asset.uri,
        name: asset.fileName ?? 'fichier.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      });
    }
  };

  const pickMultipleFiles = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission requise', 'Accès à la galerie requis.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const files: MediaFile[] = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName ?? 'photo.jpg',
        type: a.mimeType ?? 'image/jpeg',
      }));
      setGalerie(files);
    }
  };

  // ─── Final Submit ────────────────────────────────────────────────────────────
  const onSubmit = async (data: PartnerRegisterForm) => {
    try {
      const fullPhone = `${countryCode}${data.phone}`;
      console.log('Partner registration:', { ...data, phone: fullPhone });
      router.replace('/(auth)/verify-code');
    } catch {
      // handled by useAuth
    }
  };

  // ─── Step Labels ─────────────────────────────────────────────────────────────
  const STEP_LABELS = [
    'Informations de base',
    "Détails de l'établissement",
    'Documents & Médias',
    'Vérification & Finalisation',
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* ── Top bar ── */}
        <View className="flex-row items-center px-6 pt-2 pb-3">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <Text className="text-white text-xl">←</Text>
          </TouchableOpacity>
          <View className="flex-1" />
        </View>

        {/* ── Progress bar ── */}
        <StepProgressBar current={currentStep} total={TOTAL_STEPS} />

        {/* ── Scrollable content ── */}
        <ScrollView
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* ═══════════ STEP 1 ═══════════ */}
          {currentStep === 1 && (
            <View>
              {/* Logo + titre */}
              <View className="items-center mb-8">
                <Logo size="medium" />
                <Text className="text-white text-2xl font-bold mb-2 text-center mt-3">
                  Développez votre activité{'\n'}avec YEYAMO
                </Text>
                <Text className="text-[#A1A1AA] text-sm text-center">
                  Présentez votre établissement,{'\n'}publiez vos produits et services et{'\n'}connectez-vous avec vos clients.
                </Text>
              </View>

              {/* Champs */}
              <View className="gap-4">
                <CategoryPicker
                  value={categoryValue}
                  onValueChange={(v) => setValue('category', v)}
                  error={errors.category?.message}
                />

                <Controller
                  control={control}
                  name="company_name"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <Input
                      label="Nom de l'établissement / de la structure"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Ex: Hôtel La Falaise Douala"
                      error={errors.company_name?.message}
                    />
                  )}
                />

                <Input
                  label="Nom du responsable"
                  value=""
                  onChangeText={() => {}}
                  placeholder="Ex: Jean Dupont"
                />

                <PhoneInput
                  label="Téléphone professionnel"
                  value={phoneValue}
                  onChangeText={(t) => setValue('phone', t)}
                  countryCode={countryCode}
                  onCountryCodeChange={setCountryCode}
                  placeholder="6 12 34 56 78"
                  error={errors.phone?.message}
                />

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <Input
                      label="Email professionnel"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Ex: contact@monetablissement.com"
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      autoComplete="email"
                      error={errors.email?.message}
                    />
                  )}
                />
              </View>
            </View>
          )}

          {/* ═══════════ STEP 2 ═══════════ */}
          {currentStep === 2 && (
            <View>
              <View className="mb-8">
                <Text className="text-white text-2xl font-bold mb-2">
                  Détails de l'établissement
                </Text>
                <Text className="text-[#A1A1AA] text-sm">
                  Parlez-nous davantage de votre établissement et de vos services.
                </Text>
              </View>

              <View className="gap-4">
                <Input
                  label="Adresse complète"
                  value=""
                  onChangeText={() => {}}
                  placeholder="Ex: Bonapriso, Douala, Cameroun"
                />

                {/* Région dropdown simulé */}
                <View className="gap-1">
                  <Text className="text-sm text-[#A1A1AA] font-medium">Région</Text>
                  <TouchableOpacity className="bg-[#1F1F1F] border border-[#27272A] rounded-xl px-4 py-3 flex-row items-center justify-between">
                    <Text className="text-[#52525B] text-base">Sélectionnez la région</Text>
                    <Text className="text-[#52525B]">▼</Text>
                  </TouchableOpacity>
                </View>

                {/* Ville dropdown simulé */}
                <View className="gap-1">
                  <Text className="text-sm text-[#A1A1AA] font-medium">Ville</Text>
                  <TouchableOpacity className="bg-[#1F1F1F] border border-[#27272A] rounded-xl px-4 py-3 flex-row items-center justify-between">
                    <Text className="text-[#52525B] text-base">Sélectionnez la ville</Text>
                    <Text className="text-[#52525B]">▼</Text>
                  </TouchableOpacity>
                </View>

                {/* Description */}
                <View className="gap-1">
                  <Text className="text-sm text-[#A1A1AA] font-medium">Description de l'activité</Text>
                  <View className="bg-[#1F1F1F] border border-[#27272A] rounded-xl px-4 pt-3 pb-2">
                    <Text
                      className="text-[#52525B] text-base"
                      style={{ minHeight: 100 }}
                    >
                      Présentez votre établissement, vos services,{'\n'}votre histoire...
                    </Text>
                    <Text className="text-[#52525B] text-xs text-right mt-1">0/500</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ═══════════ STEP 3 ═══════════ */}
          {currentStep === 3 && (
            <View>
              <View className="mb-8">
                <Text className="text-white text-2xl font-bold mb-2">
                  Documents & Médias
                </Text>
                <Text className="text-[#A1A1AA] text-sm">
                  Ajoutez vos documents légaux et photos de votre établissement.
                </Text>
              </View>

              {/* Documents obligatoires */}
              <Text className="text-white text-base font-semibold mb-3">
                Documents obligatoires
              </Text>

              <UploadButton
                label="Registre de commerce"
                subtitle="PDF, JPG ou PNG – Max 5 Mo"
                file={registreCommerce}
                onPress={() => pickSingleFile(setRegistreCommerce)}
              />

              <UploadButton
                label="Pièce d'identité du responsable"
                subtitle="PDF, JPG ou PNG – Max 5 Mo"
                file={pieceIdentite}
                onPress={() => pickSingleFile(setPieceIdentite)}
              />

              {/* Médias */}
              <Text className="text-white text-base font-semibold mt-4 mb-3">
                Médias de votre établissement
              </Text>

              <UploadButton
                label="Photo de couverture"
                subtitle="JPG ou PNG – Max 5 Mo"
                file={photoCouverture}
                onPress={() => pickSingleFile(setPhotoCouverture)}
              />

              <TouchableOpacity
                onPress={pickMultipleFiles}
                className="flex-row items-center justify-between bg-[#1F1F1F] border border-[#27272A] rounded-xl px-4 py-4 mb-3"
              >
                <View className="flex-1 mr-3">
                  <Text className="text-white text-sm font-medium">Galerie photos (min. 3)</Text>
                  <Text className="text-[#52525B] text-xs mt-0.5">
                    {galerie.length > 0
                      ? `${galerie.length} photo(s) sélectionnée(s)`
                      : 'Sélectionnez plusieurs photos'}
                  </Text>
                </View>
                <View className={`w-9 h-9 rounded-lg items-center justify-center ${galerie.length >= 3 ? 'bg-[#EF4444]/20' : 'bg-[#27272A]'}`}>
                  <Text className="text-base">{galerie.length >= 3 ? '✓' : '⬆'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* ═══════════ STEP 4 ═══════════ */}
          {currentStep === 4 && (
            <View>
              <View className="mb-8">
                <Text className="text-white text-2xl font-bold mb-2">
                  Vérification & Finalisation
                </Text>
                <Text className="text-[#A1A1AA] text-sm">
                  Vérifiez vos informations avant de soumettre votre demande.
                </Text>
              </View>

              {/* Récapitulatif */}
              <View className="bg-[#1F1F1F] border border-[#27272A] rounded-xl px-4 mb-6">
                <SummaryRow
                  icon="🏷️"
                  label="Catégorie d'activité"
                  value={watchAll.category}
                  onEdit={() => setCurrentStep(1)}
                />
                <SummaryRow
                  icon="🏢"
                  label="Nom de l'établissement"
                  value={watchAll.company_name}
                  onEdit={() => setCurrentStep(1)}
                />
                <SummaryRow
                  icon="👤"
                  label="Responsable"
                  value="—"
                  onEdit={() => setCurrentStep(1)}
                />
                <SummaryRow
                  icon="📞"
                  label="Téléphone"
                  value={watchAll.phone ? `${countryCode} ${watchAll.phone}` : '—'}
                  onEdit={() => setCurrentStep(1)}
                />
                <SummaryRow
                  icon="📧"
                  label="Email"
                  value={watchAll.email}
                  onEdit={() => setCurrentStep(1)}
                />
                <SummaryRow
                  icon="📍"
                  label="Adresse"
                  value="—"
                  onEdit={() => setCurrentStep(2)}
                />
                <View className="flex-row items-center py-3">
                  <Text className="text-base mr-3">📄</Text>
                  <View className="flex-1">
                    <Text className="text-[#A1A1AA] text-xs">Documents & Médias</Text>
                    <Text className="text-white text-sm font-medium mt-0.5">
                      {[registreCommerce, pieceIdentite, photoCouverture].filter(Boolean).length} document(s) • {galerie.length} photo(s)
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setCurrentStep(3)}>
                    <Text className="text-[#A1A1AA] text-base">✏️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* CGU */}
              <TouchableOpacity
                className="flex-row items-start mb-6"
                onPress={() => setAcceptTerms(!acceptTerms)}
              >
                <View className={`w-5 h-5 border-2 rounded mr-3 mt-0.5 items-center justify-center ${
                  acceptTerms ? 'bg-[#EF4444] border-[#EF4444]' : 'border-[#A1A1AA]'
                }`}>
                  {acceptTerms && <Text className="text-white text-xs">✓</Text>}
                </View>
                <Text className="text-[#A1A1AA] text-sm flex-1 leading-5">
                  En créant votre compte, vous acceptez les{' '}
                  <Text className="text-[#EF4444]">Conditions d'utilisation</Text>
                  {' '}et la{' '}
                  <Text className="text-[#EF4444]">Politique de confidentialité</Text>.
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* ── Bouton fixe en bas ── */}
        <View className="px-6 pt-3 pb-6 border-t border-[#27272A]">
          {currentStep < TOTAL_STEPS ? (
            <Button
              label="Continuer"
              onPress={handleNext}
              size="lg"
            />
          ) : (
            <Button
              label="Créer mon compte"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              disabled={!acceptTerms}
              size="lg"
            />
          )}

          {currentStep === 1 && (
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              className="items-center mt-4"
            >
              <Text className="text-[#A1A1AA] text-sm">
                Vous êtes un utilisateur ?{' '}
                <Text className="text-[#EF4444]">Créer un compte utilisateur</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
