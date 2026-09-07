import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { FormSelect } from '@/components/ui/FormSelect';
import { Input } from '@/components/ui/Input';
import { useThemeStore } from '@/features/theme/theme.store';

const mobileMoneySchema = z.object({
  operator: z.enum(['mtn', 'orange'], {
    error: 'Choisissez un opérateur Mobile Money.',
  }),
  phoneNumber: z
    .string()
    .regex(/^\d{9}$/, 'Saisissez les 9 chiffres de votre numéro camerounais.'),
});

type MobileMoneyFormValues = z.infer<typeof mobileMoneySchema>;

export interface MobileMoneyPaymentValues {
  operator: 'mtn' | 'orange';
  phoneNumber: string;
}

interface MobileMoneyFormProps {
  amount: number;
  currency: string;
  submitLabel: string;
  isSubmitting?: boolean;
  disabled?: boolean;
  onSubmit: (values: MobileMoneyPaymentValues) => Promise<void> | void;
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MobileMoneyForm({
  amount,
  currency,
  submitLabel,
  isSubmitting = false,
  disabled = false,
  onSubmit,
}: MobileMoneyFormProps) {
  const colors = useThemeStore((state) => state.colors);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MobileMoneyFormValues>({
    resolver: zodResolver(mobileMoneySchema),
    defaultValues: {
      operator: 'mtn',
      phoneNumber: '',
    },
  });

  return (
    <View
      className="gap-4 rounded-2xl border p-4"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <View className="gap-1">
        <Text className="text-base font-semibold" style={{ color: colors.text }}>
          Paiement Mobile Money
        </Text>
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          Montant à payer : {formatAmount(amount, currency)}
        </Text>
      </View>

      <Controller
        control={control}
        name="operator"
        render={({ field: { onChange, value } }) => (
          <FormSelect
            label="Opérateur"
            value={value}
            onChange={onChange}
            options={[
              { label: 'MTN Mobile Money', value: 'mtn' },
              { label: 'Orange Money', value: 'orange' },
            ]}
            error={errors.operator?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="phoneNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="gap-1">
            <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Numéro Mobile Money
            </Text>
            <View className="flex-row items-center gap-2">
              <View
                className="rounded-xl border px-3 py-3"
                style={{ borderColor: colors.borderSoft, backgroundColor: colors.surface }}
              >
                <Text style={{ color: colors.textSecondary }}>+237</Text>
              </View>
              <Input
                containerClassName="flex-1"
                value={value}
                onBlur={onBlur}
                onChangeText={(nextValue) => onChange(nextValue.replace(/\D/g, '').slice(0, 9))}
                keyboardType="phone-pad"
                placeholder="690123456"
                error={errors.phoneNumber?.message}
                editable={!disabled && !isSubmitting}
              />
            </View>
          </View>
        )}
      />

      <Text className="text-xs" style={{ color: colors.textSecondary }}>
        Saisissez les 9 chiffres après +237.
      </Text>

      <Button
        label={submitLabel}
        onPress={handleSubmit(async (values) => {
          await onSubmit({
            operator: values.operator,
            phoneNumber: `+237${values.phoneNumber}`,
          });
        })}
        isLoading={isSubmitting}
        disabled={disabled || isSubmitting}
      />
    </View>
  );
}
