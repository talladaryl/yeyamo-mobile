import { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { FormSelect } from '@/components/ui/FormSelect';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { useCountries } from '@/features/country/country.hooks';
import { useCountryStore } from '@/features/country/country.store';
import { usePreviewAdventurePlan } from '@/features/explore/adventure.hooks';
import { useAdventureStore } from '@/features/explore/adventure.store';
import type { AdventureBudgetTier, AdventurePartyType, AdventurePlanRequest } from '@/features/explore/adventure.types';
import { useCategories } from '@/features/explore/useExplore';
import { useThemeStore } from '@/features/theme/theme.store';

const PARTICIPANTS: { value: AdventurePartyType; label: string; description: string; icon: string }[] = [
  { value: 'SOLO', label: 'Solo', description: 'Pour vous seul(e)', icon: 'person-outline' },
  { value: 'FAMILY', label: 'En famille', description: 'Avec vos proches', icon: 'people-outline' },
  { value: 'FRIENDS', label: 'Entre amis', description: 'À plusieurs', icon: 'happy-outline' },
  { value: 'COUPLE', label: 'En couple', description: 'À deux', icon: 'heart-outline' },
];

const BUDGETS: { value: AdventureBudgetTier; label: string; description: string }[] = [
  { value: 'STANDARD', label: 'Standard', description: '5 000 – 20 000' },
  { value: 'MEDIUM', label: 'Medium', description: '20 000 – 50 000' },
  { value: 'PREMIUM', label: 'Premium', description: '50 000 et plus' },
  { value: 'CUSTOM', label: 'Montant personnalisé', description: 'Définir votre plafond' },
];

const todayIso = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const isoToDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const timeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

export default function CreateAdventureScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const profileCountryCode = useCountryStore((state) => state.selectedCountryCode) ?? '';
  const countries = useCountries();
  const categories = useCategories();
  const setPreviewDraft = useAdventureStore((state) => state.setPreviewDraft);
  const previewAdventurePlan = usePreviewAdventurePlan();
  const [step, setStep] = useState(1);
  const [countryCode, setCountryCode] = useState(profileCountryCode);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [partyType, setPartyType] = useState<AdventurePartyType>();
  const [interestCodes, setInterestCodes] = useState<string[]>([]);
  const [budgetTier, setBudgetTier] = useState<AdventureBudgetTier>();
  const [customBudget, setCustomBudget] = useState('');

  const availableCountries = useMemo(
    () => [...(countries.data ?? [])]
      .filter((country) => country.status === 'LIVE' || country.status === 'BETA')
      .sort((left, right) => (left.code === 'CM' ? -1 : right.code === 'CM' ? 1 : left.name.localeCompare(right.name))),
    [countries.data],
  );
  const selectedCountry = availableCountries.find((country) => country.code === countryCode);
  const currencyCode = selectedCountry?.defaultCurrencyCode || undefined;
  const customBudgetValue = customBudget.trim() === '' ? undefined : Number(customBudget.replace(',', '.'));
  const dateRangeValid = Boolean(startDate && endDate && endDate >= startDate);
  const timeRangeValid = Boolean(startTime && endTime && timeToMinutes(endTime) > timeToMinutes(startTime));
  const customBudgetValid = customBudgetValue !== undefined && Number.isFinite(customBudgetValue) && customBudgetValue > 0;
  // Do not trap a complete form behind a disabled CTA when the catalogue is
  // temporarily empty or unavailable. The plan then shows its real empty state.
  const interestRequirementSatisfied = categories.isError || (!categories.isLoading && (categories.data?.length ?? 0) === 0)
    ? true
    : interestCodes.length > 0;
  const canContinue = step === 1
    ? Boolean(selectedCountry)
    : step === 2
      ? dateRangeValid
      : step === 3
        ? Boolean(partyType) && timeRangeValid
        : interestRequirementSatisfied && Boolean(budgetTier) && (budgetTier !== 'CUSTOM' || customBudgetValid);

  const continueForm = async () => {
    if (!canContinue) return;
    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }
    if (!selectedCountry || !partyType || !budgetTier) return;
    const budget = budgetTier === 'STANDARD'
      ? { tier: budgetTier, minimumAmount: 5000, maximumAmount: 20000, currencyCode }
      : budgetTier === 'MEDIUM'
        ? { tier: budgetTier, minimumAmount: 20000, maximumAmount: 50000, currencyCode }
        : budgetTier === 'PREMIUM'
          ? { tier: budgetTier, minimumAmount: 50000, currencyCode }
          : { tier: budgetTier, maximumAmount: customBudgetValue, currencyCode };
    const request: AdventurePlanRequest = {
      countryCode,
      startDate,
      endDate,
      startTime,
      endTime,
      partyType,
      interestCodes,
      budget,
    };
    try {
      const preview = await previewAdventurePlan.mutateAsync(request);
      setPreviewDraft({
        request,
        countryName: selectedCountry.name,
        interestLabels: (categories.data ?? []).filter((category) => interestCodes.includes(category.id)).map((category) => category.label),
        preview,
      });
      router.push('/(explore)/adventure-plan');
    } catch {
      // The next screen never fabricates a planning: keep the form open so the
      // user can retry the real server preview.
    }
  };

  const back = () => {
    if (step === 1) {
      router.back();
      return;
    }
    setStep((current) => current - 1);
  };

  return (
    <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center border-b px-3 py-2" style={{ borderColor: colors.border }}>
        <TouchableOpacity onPress={back} className="h-11 w-11 items-center justify-center" accessibilityRole="button" accessibilityLabel="Retour"><Icon name="chevron-back" size={26} color={colors.text} /></TouchableOpacity>
        <View className="ml-1 flex-1"><Text className="text-lg font-extrabold" style={{ color: colors.text }}>Nouvelle aventure</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>Préparez vos activités jour par jour</Text></View>
      </View>
      <YeyamoFormScreen footer={<YeyamoFormFooter onBack={step > 1 ? back : undefined} onContinue={() => void continueForm()} continueLabel={step === 4 ? 'Voir mon planning' : 'Continuer'} disabled={!canContinue || previewAdventurePlan.isPending} loading={previewAdventurePlan.isPending} />}>
        <View className="px-4 pt-5"><YeyamoFormProgress currentStep={step} totalSteps={4} label="Créer une aventure" /></View>

        {step === 1 ? <YeyamoFormStep title="Dans quel pays partez-vous ?" description="Ce choix ne modifie pas votre pays principal dans Explorer.">
          <FormSelect label="Pays" value={countryCode} required options={availableCountries.map((country) => ({ label: `${country.flag} ${country.name}`, value: country.code, description: country.defaultCurrencyCode || undefined }))} placeholder={countries.isLoading ? 'Chargement des pays…' : 'Choisir un pays'} onChange={setCountryCode} error={countries.isError ? 'Les pays ne sont pas disponibles. Réessayez plus tard.' : undefined} />
        </YeyamoFormStep> : null}

        {step === 2 ? <YeyamoFormStep title="Quand partez-vous ?" description="Les deux dates sont incluses. Pour une aventure d’un jour, choisissez la même date.">
          <DateTimeField label="Date de début" value={startDate} onChange={(value) => { setStartDate(value); if (!endDate || endDate < value) setEndDate(value); }} minimumDate={isoToDate(todayIso())} required />
          <DateTimeField label="Date de fin" value={endDate} onChange={setEndDate} minimumDate={startDate ? isoToDate(startDate) : isoToDate(todayIso())} required error={endDate && startDate && endDate < startDate ? 'La fin doit être le même jour ou après le début.' : undefined} />
        </YeyamoFormStep> : null}

        {step === 3 ? <YeyamoFormStep title="À quel rythme et avec qui ?" description="Cette plage horaire servira à sélectionner les activités de chaque journée.">
          <View className="flex-row gap-3"><View className="flex-1"><DateTimeField label="Début" mode="time" value={startTime} onChange={setStartTime} required /></View><View className="flex-1"><DateTimeField label="Fin" mode="time" value={endTime} onChange={setEndTime} required error={!timeRangeValid ? 'Après le début' : undefined} /></View></View>
          <Text className="mb-2 mt-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>Participants *</Text>
          <View className="gap-3">{PARTICIPANTS.map((option) => <ParticipantChoice key={option.value} {...option} selected={partyType === option.value} onPress={() => setPartyType(option.value)} />)}</View>
        </YeyamoFormStep> : null}

        {step === 4 ? <YeyamoFormStep title="Qu’avez-vous envie de faire ?" description="Choisissez les types d’activité et votre enveloppe de budget.">
          <Text className="mb-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>Centres d’intérêt *</Text>
          {categories.isLoading ? <Text className="py-3 text-sm" style={{ color: colors.textSecondary }}>Chargement des activités…</Text> : null}
          {categories.isError ? <Text className="py-3 text-sm" style={{ color: colors.textSecondary }}>Les activités sont indisponibles. Réessayez plus tard.</Text> : null}
          <View className="flex-row flex-wrap gap-2">{(categories.data ?? []).map((category) => <InterestChoice key={category.id} label={category.label} selected={interestCodes.includes(category.id)} onPress={() => setInterestCodes((current) => current.includes(category.id) ? current.filter((id) => id !== category.id) : [...current, category.id])} />)}</View>
          <Text className="mb-2 mt-7 text-sm font-semibold" style={{ color: colors.textSecondary }}>Budget *</Text>
          <View className="gap-3">{BUDGETS.map((option) => <BudgetChoice key={option.value} {...option} currencyCode={currencyCode} selected={budgetTier === option.value} onPress={() => setBudgetTier(option.value)} />)}</View>
          {budgetTier === 'CUSTOM' ? <Input label={currencyCode ? `Budget maximum (${currencyCode})` : 'Budget maximum'} value={customBudget} onChangeText={setCustomBudget} keyboardType="decimal-pad" placeholder="Ex. 35000" containerClassName="mt-4" error={customBudget && !customBudgetValid ? 'Saisissez un montant positif.' : undefined} /> : null}
          {previewAdventurePlan.isError ? <Text className="mt-4 text-sm" style={{ color: colors.primary }}>La prévisualisation n’a pas pu être générée. Réessayez.</Text> : null}
        </YeyamoFormStep> : null}
      </YeyamoFormScreen>
    </SafeAreaView>
  );
}

function ParticipantChoice({ label, description, icon, selected, onPress }: { value: AdventurePartyType; label: string; description: string; icon: string; selected: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="min-h-16 flex-row items-center rounded-2xl border p-4" style={{ backgroundColor: selected ? `${colors.primary}10` : colors.surface, borderColor: selected ? colors.primary : colors.border }} accessibilityRole="radio" accessibilityState={{ selected }}><View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: selected ? `${colors.primary}1C` : colors.elevated }}><Icon name={icon} size={20} color={selected ? colors.primary : colors.textSecondary} /></View><View className="ml-3 flex-1"><Text className="font-bold" style={{ color: colors.text }}>{label}</Text><Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{description}</Text></View>{selected ? <Icon name="checkmark-circle" size={22} color={colors.primary} /> : null}</TouchableOpacity>;
}

function InterestChoice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="min-h-10 flex-row items-center rounded-full border px-3 py-2" style={{ backgroundColor: selected ? `${colors.primary}10` : colors.surface, borderColor: selected ? colors.primary : colors.border }} accessibilityRole="checkbox" accessibilityState={{ checked: selected }}><Text className="text-xs font-semibold" style={{ color: selected ? colors.primary : colors.text }}>{label}</Text>{selected ? <Icon name="checkmark" size={15} color={colors.primary} /> : null}</TouchableOpacity>;
}

function BudgetChoice({ label, description, currencyCode, selected, onPress }: { value: AdventureBudgetTier; label: string; description: string; currencyCode?: string; selected: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="min-h-16 flex-row items-center rounded-2xl border p-4" style={{ backgroundColor: selected ? `${colors.primary}10` : colors.surface, borderColor: selected ? colors.primary : colors.border }} accessibilityRole="radio" accessibilityState={{ selected }}><View className="flex-1"><Text className="font-bold" style={{ color: colors.text }}>{label}</Text><Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{description}{currencyCode ? ` ${currencyCode}` : ''}</Text></View>{selected ? <Icon name="checkmark-circle" size={22} color={colors.primary} /> : null}</TouchableOpacity>;
}
