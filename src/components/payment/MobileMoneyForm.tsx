import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { FormSelect } from '@/components/ui/FormSelect';
import { Input } from '@/components/ui/Input';
import { useCountryStore } from '@/features/country/country.store';
import { cashInOperatorLabel, cashInOperatorsForCountry, type CashInOperator } from '@/features/payments/cash-in';
import { useThemeStore } from '@/features/theme/theme.store';

const mobileMoneySchema = z.object({
  operator: z.string().min(1, 'Choisissez un opérateur Mobile Money.'),
  phoneNumber: z.string().regex(/^\d{6,15}$/, 'Saisissez le numéro Mobile Money sans indicatif pays.'),
});

type MobileMoneyFormValues = z.infer<typeof mobileMoneySchema>;

export interface MobileMoneyPaymentValues {
  operator: CashInOperator;
  phoneNumber: string;
}

interface MobileMoneyFormProps {
  amount?: number | null;
  currency?: string | null;
  submitLabel: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  onSubmit: (values: MobileMoneyPaymentValues) => Promise<void> | void;
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function MobileMoneyForm({ amount, currency, submitLabel, isSubmitting = false, disabled = false, onSubmit }: MobileMoneyFormProps) {
  const colors = useThemeStore((state) => state.colors);
  const country = useCountryStore((state) => state.countryConfiguration);
  const callingCode = country?.callingCode?.trim() || null;
  const operators = cashInOperatorsForCountry(country?.code);
  const { control, handleSubmit, formState: { errors } } = useForm<MobileMoneyFormValues>({
    resolver: zodResolver(mobileMoneySchema),
    defaultValues: { operator: operators[0] ?? '', phoneNumber: '' },
  });

  const unavailable = !callingCode || operators.length === 0;
  return <View className="gap-4 rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
    <View className="gap-1">
      <Text className="text-base font-semibold" style={{ color: colors.text }}>Paiement Mobile Money</Text>
      {amount != null && currency ? <Text className="text-sm" style={{ color: colors.textSecondary }}>Montant à payer : {formatAmount(amount, currency)}</Text> : <Text className="text-sm" style={{ color: colors.textSecondary }}>Le montant final est confirmé par le serveur.</Text>}
      <Text className="text-xs" style={{ color: colors.textSecondary }}>{country && callingCode ? `Pays de paiement : ${country.name} (${callingCode})` : 'Choisissez un pays actif dans vos préférences avant de payer.'}</Text>
      {callingCode && operators.length === 0 ? <Text className="text-xs text-[#B91C1C]">Le cash-in n’est pas encore disponible pour ce pays.</Text> : null}
    </View>
    <Controller control={control} name="operator" render={({ field: { onChange, value } }) => <FormSelect label="Opérateur" value={value} onChange={onChange} options={operators.map((operator) => ({ label: cashInOperatorLabel(operator), value: operator }))} error={errors.operator?.message} />} />
    <Controller control={control} name="phoneNumber" render={({ field: { onChange, onBlur, value } }) => <View className="gap-1"><Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>Numéro Mobile Money</Text><View className="flex-row items-center gap-2"><View className="rounded-xl border px-3 py-3" style={{ borderColor: colors.borderSoft, backgroundColor: colors.surface }}><Text style={{ color: colors.textSecondary }}>{callingCode ?? '—'}</Text></View><Input containerClassName="flex-1" value={value} onBlur={onBlur} onChangeText={(nextValue) => onChange(nextValue.replace(/\D/g, '').slice(0, 15))} keyboardType="phone-pad" placeholder="Numéro sans indicatif" error={errors.phoneNumber?.message} editable={!unavailable && !disabled && !isSubmitting} /></View></View>} />
    <Text className="text-xs" style={{ color: colors.textSecondary }}>Saisissez le numéro sans l’indicatif pays.</Text>
    <Button label={submitLabel} onPress={handleSubmit(async (values) => { if (unavailable || !operators.includes(values.operator as CashInOperator)) return; await onSubmit({ operator: values.operator as CashInOperator, phoneNumber: `${callingCode}${values.phoneNumber.replace(/^0+/, '')}` }); })} isLoading={isSubmitting} disabled={unavailable || disabled || isSubmitting} />
  </View>;
}
