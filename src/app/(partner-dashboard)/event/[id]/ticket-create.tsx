import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { useCreateTicket } from '@/features/ticketing/useTicketing';
import { useThemeStore } from '@/features/theme/theme.store';
import type { CreateTicketTypeInput } from '@/features/ticketing/types';

const isValidDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.getUTCFullYear() === Number(year)
    && date.getUTCMonth() === Number(month) - 1
    && date.getUTCDate() === Number(day);
};
const schema = z.object({
  name: z.string().trim().min(1, 'Le nom est obligatoire'),
  description: z.string().trim(),
  price: z.string().trim().refine((value) => value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0, 'Le prix doit être supérieur ou égal à 0'),
  quantity: z.string().trim().refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, 'La quantité doit être supérieure à 0'),
  salesStartDate: z.string().trim().refine(isValidDate, 'Date invalide (AAAA-MM-JJ)'),
  salesEndDate: z.string().trim().refine(isValidDate, 'Date invalide (AAAA-MM-JJ)'),
  maxPerBuyer: z.string().trim().refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1, 'Le maximum doit être supérieur ou égal à 1'),
  accessZone: z.string().trim(),
  entryInstructions: z.string().trim(),
}).superRefine((values, context) => {
  if (isValidDate(values.salesStartDate) && isValidDate(values.salesEndDate) && values.salesEndDate < values.salesStartDate) {
    context.addIssue({ code: 'custom', path: ['salesEndDate'], message: 'La fin des ventes doit suivre le début' });
  }
});
type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  name: '', description: '', price: '', quantity: '', salesStartDate: '', salesEndDate: '',
  maxPerBuyer: '1', accessZone: '', entryInstructions: '',
};

export default function TicketCreateScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const mutation = useCreateTicket(id);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });
  const preview = watch();
  const goBack = () => router.canGoBack() ? router.back() : router.replace(`/(partner-dashboard)/event/${id}/tickets` as never);

  const submit = handleSubmit(async (values) => {
    const input: CreateTicketTypeInput = {
      ...values,
      price: Number(values.price),
      quantity: Number(values.quantity),
      maxPerBuyer: Number(values.maxPerBuyer),
    };
    try {
      await mutation.mutateAsync(input);
      router.back();
    } catch {
      // The mutation state renders the error without leaving the form.
    }
  });

  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 pb-3 pt-2">
        <TouchableOpacity onPress={goBack} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity>
        <View><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Créer un billet</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>Billetterie de l’événement</Text></View>
      </View>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
          <View className="gap-4 pt-2">
            <Field control={control} name="name" label="Nom du billet" placeholder="Ex. Pass terrasse" error={errors.name?.message} />
            <Field control={control} name="description" label="Description" placeholder="Décrivez les avantages de ce billet" error={errors.description?.message} multiline />
            <Field control={control} name="price" label="Prix (FCFA)" placeholder="0" error={errors.price?.message} keyboardType="numeric" />
            <Field control={control} name="quantity" label="Quantité" placeholder="100" error={errors.quantity?.message} keyboardType="number-pad" />
            <View className="flex-row gap-3">
              <View className="flex-1"><Field control={control} name="salesStartDate" label="Début des ventes" placeholder="AAAA-MM-JJ" error={errors.salesStartDate?.message} /></View>
              <View className="flex-1"><Field control={control} name="salesEndDate" label="Fin des ventes" placeholder="AAAA-MM-JJ" error={errors.salesEndDate?.message} /></View>
            </View>
            <Field control={control} name="maxPerBuyer" label="Maximum par acheteur" placeholder="1" error={errors.maxPerBuyer?.message} keyboardType="number-pad" />
            <Field control={control} name="accessZone" label="Zone d’accès" placeholder="Ex. Terrasse, Carré VIP…" error={errors.accessZone?.message} />
            <Field control={control} name="entryInstructions" label="Instructions d’entrée" placeholder="Informations à présenter à l’entrée" error={errors.entryInstructions?.message} multiline />
          </View>

          <Text className="mb-3 mt-7 text-base font-extrabold" style={{ color: colors.text }}>Aperçu</Text>
          <TicketPreview name={preview.name} description={preview.description} price={preview.price} zone={preview.accessZone} />
          {mutation.isError ? <Text className="mt-3 text-center text-sm text-[#EF4444]">Impossible de créer le billet. Réessayez.</Text> : null}
          <View className="mt-5"><Button label="Créer le billet" onPress={submit} isLoading={mutation.isPending} /></View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}

function Field({ control, name, label, error, ...props }: { control: ReturnType<typeof useForm<FormValues>>['control']; name: keyof FormValues; label: string; error?: string } & React.ComponentProps<typeof Input>) {
  return <Controller control={control} name={name} render={({ field: { value, onChange, onBlur } }) => <Input label={label} value={value} onChangeText={onChange} onBlur={onBlur} error={error} autoCapitalize="sentences" {...props} />} />;
}

function TicketPreview({ name, description, price, zone }: { name: string; description: string; price: string; zone: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="overflow-hidden rounded-2xl bg-[#EF4444]"><View className="p-5"><View className="flex-row items-center justify-between"><Text className="text-xs font-bold uppercase tracking-widest text-white/80">YeYamo Ticket</Text><Icon name="qr-code-outline" size={28} color="#FFFFFF" /></View><Text className="mt-5 text-xl font-extrabold text-white">{name.trim() || 'Nom du billet'}</Text><Text className="mt-1 text-sm text-white/80" numberOfLines={2}>{description.trim() || 'Description de votre billet'}</Text><View className="mt-5 flex-row justify-between border-t border-white/25 pt-4"><View><Text className="text-[10px] text-white/70">PRIX</Text><Text className="mt-1 font-bold text-white">{Number(price || 0).toLocaleString('fr-FR')} FCFA</Text></View><View className="items-end"><Text className="text-[10px] text-white/70">ACCÈS</Text><Text className="mt-1 font-bold text-white">{zone.trim() || 'Zone libre'}</Text></View></View></View><View className="h-2" style={{ backgroundColor: colors.card }} /></View>;
}
