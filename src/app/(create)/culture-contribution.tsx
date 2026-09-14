import { useState, type ReactNode } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import type { Control, FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { FormSelect } from '@/components/ui/FormSelect';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { useCountryFeature } from '@/features/country/country.hooks';
import { useCountryStore } from '@/features/country/country.store';
import { useCreateCultureContribution, useCultureLanguages, useSubmitContribution } from '@/features/culture/culture.hooks';
import type { CultureContentType, CultureContributionInput } from '@/features/culture/culture.types';
import { useThemeStore } from '@/features/theme/theme.store';
import { normalizeApiError } from '@/services/api/errors';

type ContributionType = Extract<CultureContentType, 'STORY' | 'TRADITION' | 'PROVERB' | 'EXPRESSION' | 'RECIPE' | 'SONG'>;
const TYPES: { value: ContributionType; label: string; description: string }[] = [
  { value: 'STORY', label: 'Récit', description: 'Une histoire, un souvenir ou une transmission orale.' },
  { value: 'TRADITION', label: 'Tradition', description: 'Une pratique ou un savoir-faire transmis.' },
  { value: 'PROVERB', label: 'Proverbe', description: 'Une parole et son sens culturel.' },
  { value: 'EXPRESSION', label: 'Expression', description: 'Une expression locale ou une formule.' },
  { value: 'RECIPE', label: 'Recette', description: 'Un plat, ses ingrédients et sa préparation.' },
  { value: 'SONG', label: 'Chant', description: 'Un chant et son contexte de transmission.' },
];

const contributionSchema = z.object({
  type: z.enum(['STORY', 'TRADITION', 'PROVERB', 'EXPRESSION', 'RECIPE', 'SONG']),
  title: z.string().trim().min(1, 'Le titre est requis.'),
  primaryLanguageCode: z.string().min(1, 'Choisissez une langue.'),
  communityName: z.string(), summary: z.string(), body: z.string().trim().min(1, 'Le contenu est requis.'),
  ingredients: z.array(z.object({ name: z.string().trim().min(1, 'Indiquez un ingrédient.'), quantity: z.string(), unit: z.string() })),
  steps: z.array(z.object({ instruction: z.string().trim().min(1, 'Indiquez une étape.') })),
  literalTranslation: z.string(), meaning: z.string(), originLanguageCode: z.string(), audioUrl: z.string().url('L’URL audio doit être valide.').or(z.literal('')),
}).superRefine((value, context) => {
  if (value.type === 'RECIPE' && value.ingredients.length === 0) context.addIssue({ code: 'custom', path: ['ingredients'], message: 'Ajoutez au moins un ingrédient.' });
  if (value.type === 'RECIPE' && value.steps.length === 0) context.addIssue({ code: 'custom', path: ['steps'], message: 'Ajoutez au moins une étape.' });
  if (value.type === 'PROVERB' && !value.meaning.trim()) context.addIssue({ code: 'custom', path: ['meaning'], message: 'Le sens du proverbe est requis.' });
});
type ContributionValues = z.infer<typeof contributionSchema>;

export default function CultureContributionScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const countryCode = useCountryStore((state) => state.selectedCountryCode);
  const languageCode = useCountryStore((state) => state.preferredLanguageCode);
  const cultureEnabled = useCountryFeature('cultureModuleEnabled');
  const contentPublishingEnabled = useCountryFeature('contentPublishingEnabled');
  const languages = useCultureLanguages();
  const create = useCreateCultureContribution();
  const submit = useSubmitContribution();
  const [step, setStep] = useState(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const { control, handleSubmit, setError, setValue, trigger, getValues, formState: { errors, isDirty } } = useForm<ContributionValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: { type: 'STORY', title: '', primaryLanguageCode: languageCode ?? '', communityName: '', summary: '', body: '', ingredients: [], steps: [], literalTranslation: '', meaning: '', originLanguageCode: '', audioUrl: '' },
  });
  const ingredients = useFieldArray({ control, name: 'ingredients' });
  const recipeSteps = useFieldArray({ control, name: 'steps' });
  const type = useWatch({ control, name: 'type' });
  const selectedLanguage = useWatch({ control, name: 'primaryLanguageCode' });

  const exit = () => {
    if (!isDirty) { router.back(); return; }
    Alert.alert('Quitter la contribution ?', 'Les informations saisies ne seront pas enregistrées.', [
      { text: 'Continuer', style: 'cancel' },
      { text: 'Quitter', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const next = async () => {
    if (step === 2 && !(await trigger(['primaryLanguageCode']))) return;
    if (step === 3 && !(await trigger(['title', 'body']))) return;
    if (step === 4) {
      const values = getValues();
      if (type === 'RECIPE' && values.ingredients.length === 0) { setError('ingredients', { message: 'Ajoutez au moins un ingrédient.' }); return; }
      if (type === 'RECIPE' && values.steps.length === 0) { setError('steps', { message: 'Ajoutez au moins une étape.' }); return; }
      if (type === 'PROVERB' && !(await trigger(['meaning', 'audioUrl']))) return;
    }
    setStep((current) => Math.min(5, current + 1));
  };

  const publish = handleSubmit(async (values) => {
    if (!acknowledged) { setSubmissionError('Confirmez que vous pouvez partager ce savoir avant de l’envoyer.'); return; }
    if (!cultureEnabled || !contentPublishingEnabled) { setSubmissionError('La publication culturelle n’est pas activée pour ce pays.'); return; }
    if (!countryCode) { setSubmissionError('Choisissez un pays dans vos préférences avant de publier.'); return; }
    setSubmissionError(null);
    const input: CultureContributionInput = {
      type: values.type,
      slug: values.title.toLocaleLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, ''),
      primaryLanguageCode: values.primaryLanguageCode,
      countryCode,
      communityName: values.communityName.trim() || undefined,
      sourceType: 'PERSONAL_CONTRIBUTION',
      sensitivityLevel: 'PUBLIC',
      title: values.title.trim(),
      summary: values.summary.trim() || undefined,
      body: values.body.trim(),
    };
    if (values.type === 'RECIPE') input.recipeDetails = { ingredients: values.ingredients.map((item) => ({ name: item.name.trim(), quantity: item.quantity.trim() || null, unit: item.unit.trim() || null })), steps: values.steps.map((item) => ({ instruction: item.instruction.trim() })), prepTimeMinutes: null, servings: null };
    if (values.type === 'PROVERB') input.proverbDetails = { literalTranslation: values.literalTranslation.trim() || null, meaning: values.meaning.trim(), originLanguageCode: values.originLanguageCode.trim() || null, audioUrl: values.audioUrl || null };
    try {
      const content = await create.mutateAsync(input);
      await submit.mutateAsync(content.id);
      setComplete(true);
    } catch (error) {
      setSubmissionError(normalizeApiError(error).message);
    }
  }, () => setSubmissionError('Complétez les champs indiqués avant d’envoyer votre contribution.'));

  if (complete) return <YeyamoFormScreen><View className="flex-1 items-center justify-center px-6"><View className="w-full rounded-3xl border p-6" style={{ borderColor: colors.border, backgroundColor: colors.surface }}><Text className="text-center text-3xl">🌿</Text><Text className="mt-4 text-center text-2xl font-extrabold" style={{ color: colors.text }}>Contribution envoyée</Text><Text className="mt-3 text-center text-sm leading-6" style={{ color: colors.textSecondary }}>Votre savoir sera vérifié par l’équipe éditoriale avant publication.</Text><View className="mt-6"><YeyamoFormFooter onContinue={() => router.back()} continueLabel="Fermer" /></View></View></View></YeyamoFormScreen>;

  const isPublishing = create.isPending || submit.isPending;
  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={step === 1 ? exit : () => setStep((current) => current - 1)} onContinue={step === 5 ? () => void publish() : () => void next()} continueLabel={step === 5 ? 'Envoyer pour vérification' : 'Continuer'} loading={isPublishing} disabled={isPublishing} />}>
    <YeyamoFormProgress currentStep={step} totalSteps={5} label="Transmettre un savoir" />
    {step === 1 ? <TypeStep type={type} onSelect={(value) => setValue('type', value, { shouldDirty: true })} /> : null}
    {step === 2 ? <OriginStep control={control} countryCode={countryCode} languages={languages.data ?? []} selectedLanguage={selectedLanguage} onLanguageChange={(value) => setValue('primaryLanguageCode', value, { shouldValidate: true, shouldDirty: true })} error={errors.primaryLanguageCode?.message} /> : null}
    {step === 3 ? <ContentStep control={control} type={type} errors={errors} /> : null}
    {step === 4 ? <DetailsStep control={control} type={type} ingredients={ingredients} recipeSteps={recipeSteps} errors={errors} /> : null}
    {step === 5 ? <ReviewStep values={getValues()} acknowledged={acknowledged} onAcknowledgedChange={setAcknowledged} countryCode={countryCode} error={submissionError} onEdit={setStep} /> : null}
  </YeyamoFormScreen>;
}

function TypeStep({ type, onSelect }: { type: ContributionType; onSelect: (value: ContributionType) => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <YeyamoFormStep title="Quel savoir souhaitez-vous transmettre ?" description="Choisissez le format qui correspond le mieux à votre contribution."><View className="gap-3">{TYPES.map((item) => {
    const active = type === item.value;
    return <TouchableOpacity key={item.value} onPress={() => onSelect(item.value)} accessibilityRole="radio" accessibilityState={{ selected: active }} className="rounded-2xl border p-4" style={{ borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.accentSoft : colors.surface }}><Text className="text-base font-bold" style={{ color: colors.text }}>{item.label}</Text><Text className="mt-1 text-sm leading-5" style={{ color: colors.textSecondary }}>{item.description}</Text></TouchableOpacity>;
  })}</View></YeyamoFormStep>;
}

function OriginStep({ control, countryCode, languages, selectedLanguage, onLanguageChange, error }: { control: Control<ContributionValues>; countryCode: string | null; languages: { code: string; nativeName: string; name: string }[]; selectedLanguage: string; onLanguageChange: (value: string) => void; error?: string }) {
  return <YeyamoFormStep title="Quelle est son origine ?" description="Ces informations permettent de situer votre contribution avec respect."><View className="gap-5"><Input label="Pays" value={countryCode ?? ''} placeholder="Pays défini dans votre profil" editable={false} /><FormSelect label="Langue principale *" value={selectedLanguage} options={languages.map((language) => ({ label: language.nativeName || language.name, value: language.code, description: language.name }))} placeholder="Choisir une langue" onChange={onLanguageChange} error={error} required /><ControlledInput control={control} name="communityName" label="Peuple ou communauté (facultatif)" placeholder="Ex. Bassa, Sawa…" autoCapitalize="words" /></View></YeyamoFormStep>;
}

function ContentStep({ control, type, errors }: { control: Control<ContributionValues>; type: ContributionType; errors: ReturnType<typeof useForm<ContributionValues>>['formState']['errors'] }) {
  return <YeyamoFormStep title="Partagez le contenu" description={type === 'RECIPE' ? 'Présentez la recette avant de détailler sa préparation.' : 'Expliquez ce savoir avec vos propres mots.'}><View className="gap-5"><ControlledInput control={control} name="title" label="Titre *" placeholder={type === 'RECIPE' ? 'Ex. Ndolé aux crevettes' : 'Donnez un titre à ce savoir'} error={errors.title?.message} autoCapitalize="sentences" /><ControlledInput control={control} name="summary" label="Résumé (facultatif)" placeholder="Quelques lignes pour introduire ce savoir" multiline /><ControlledInput control={control} name="body" label={type === 'RECIPE' ? 'Contexte de la recette *' : 'Récit ou explication *'} placeholder="Expliquez le contexte, la transmission et ce qu’il est utile de comprendre." multiline error={errors.body?.message} /></View></YeyamoFormStep>;
}

function DetailsStep({ control, type, ingredients, recipeSteps, errors }: { control: Control<ContributionValues>; type: ContributionType; ingredients: ReturnType<typeof useFieldArray<ContributionValues, 'ingredients'>>; recipeSteps: ReturnType<typeof useFieldArray<ContributionValues, 'steps'>>; errors: ReturnType<typeof useForm<ContributionValues>>['formState']['errors'] }) {
  const colors = useThemeStore((state) => state.colors);
  if (type === 'RECIPE') return <YeyamoFormStep title="Détaillez la recette" description="Ajoutez uniquement les ingrédients et les étapes nécessaires."><View className="gap-5"><Section title="Ingrédients" action="Ajouter" onAction={() => ingredients.append({ name: '', quantity: '', unit: '' })}>{ingredients.fields.map((field, index) => <View key={field.id} className="rounded-xl border p-3" style={{ borderColor: colors.border }}><ControlledInput control={control} name={`ingredients.${index}.name`} label="Ingrédient *" placeholder="Ex. Feuilles de ndolé" error={errors.ingredients?.[index]?.name?.message} /><View className="mt-3 flex-row gap-3"><View className="flex-1"><ControlledInput control={control} name={`ingredients.${index}.quantity`} label="Quantité" placeholder="500" /></View><View className="flex-1"><ControlledInput control={control} name={`ingredients.${index}.unit`} label="Unité" placeholder="g" /></View></View><TouchableOpacity onPress={() => ingredients.remove(index)} className="mt-3 self-start" accessibilityRole="button"><Text className="text-sm font-semibold" style={{ color: colors.primary }}>Retirer</Text></TouchableOpacity></View>)}</Section>{errors.ingredients?.message ? <Text style={{ color: colors.primary }}>{errors.ingredients.message}</Text> : null}<Section title="Préparation" action="Ajouter une étape" onAction={() => recipeSteps.append({ instruction: '' })}>{recipeSteps.fields.map((field, index) => <View key={field.id} className="rounded-xl border p-3" style={{ borderColor: colors.border }}><ControlledInput control={control} name={`steps.${index}.instruction`} label={`Étape ${index + 1} *`} placeholder="Décrivez cette étape" multiline error={errors.steps?.[index]?.instruction?.message} /><TouchableOpacity onPress={() => recipeSteps.remove(index)} className="mt-3 self-start" accessibilityRole="button"><Text className="text-sm font-semibold" style={{ color: colors.primary }}>Retirer</Text></TouchableOpacity></View>)}</Section>{errors.steps?.message ? <Text style={{ color: colors.primary }}>{errors.steps.message}</Text> : null}</View></YeyamoFormStep>;
  if (type === 'PROVERB') return <YeyamoFormStep title="Expliquez le proverbe" description="Ajoutez son sens et les précisions qui aident à le transmettre correctement."><View className="gap-5"><ControlledInput control={control} name="literalTranslation" label="Traduction littérale (facultatif)" placeholder="Traduction mot à mot" /><ControlledInput control={control} name="meaning" label="Sens du proverbe *" placeholder="Expliquez le sens et le contexte" multiline error={errors.meaning?.message} /><ControlledInput control={control} name="originLanguageCode" label="Code de la langue d’origine (facultatif)" placeholder="Ex. bas" autoCapitalize="none" /><ControlledInput control={control} name="audioUrl" label="Lien audio (facultatif)" placeholder="https://…" autoCapitalize="none" keyboardType="url" error={errors.audioUrl?.message} /></View></YeyamoFormStep>;
  return <YeyamoFormStep title="Aucun détail supplémentaire" description="Le contrat actuel ne demande pas de champ spécifique pour ce type de contribution."><View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.accentSoft }}><Text className="text-sm" style={{ color: colors.text }}>Vous pourrez vérifier le contenu avant de l’envoyer à l’équipe éditoriale.</Text></View></YeyamoFormStep>;
}

function ReviewStep({ values, acknowledged, onAcknowledgedChange, countryCode, error, onEdit }: { values: ContributionValues; acknowledged: boolean; onAcknowledgedChange: (value: boolean) => void; countryCode: string | null; error: string | null; onEdit: (step: number) => void }) {
  const colors = useThemeStore((state) => state.colors);
  const typeLabel = TYPES.find((item) => item.value === values.type)?.label ?? values.type;
  return <YeyamoFormStep title="Vérifiez avant l’envoi" description="Votre contribution sera vérifiée avant d’être publiée."><View className="gap-4">{error ? <View className="rounded-xl border p-4" style={{ borderColor: colors.primary, backgroundColor: colors.accentSoft }}><Text className="text-sm" style={{ color: colors.text }}>{error}</Text></View> : null}<ReviewSection title="Type et origine" onEdit={() => onEdit(1)}><ReviewRow label="Type" value={typeLabel} /><ReviewRow label="Pays" value={countryCode ?? 'Non défini'} /><ReviewRow label="Langue" value={values.primaryLanguageCode || 'Non choisie'} /><ReviewRow label="Communauté" value={values.communityName || 'Non précisée'} /></ReviewSection><ReviewSection title="Contenu" onEdit={() => onEdit(3)}><ReviewRow label="Titre" value={values.title || '—'} /><ReviewRow label="Résumé" value={values.summary || 'Aucun résumé'} /><ReviewRow label="Texte" value={values.body || '—'} /></ReviewSection>{values.type === 'RECIPE' || values.type === 'PROVERB' ? <ReviewSection title="Détails" onEdit={() => onEdit(4)}><ReviewRow label={values.type === 'RECIPE' ? 'Ingrédients' : 'Sens'} value={values.type === 'RECIPE' ? `${values.ingredients.length} ingrédient(s), ${values.steps.length} étape(s)` : values.meaning || '—'} /></ReviewSection> : null}<TouchableOpacity onPress={() => onAcknowledgedChange(!acknowledged)} accessibilityRole="checkbox" accessibilityState={{ checked: acknowledged }} className="flex-row rounded-2xl border p-4" style={{ borderColor: acknowledged ? colors.primary : colors.border, backgroundColor: acknowledged ? colors.accentSoft : colors.surface }}><Icon name={acknowledged ? 'checkbox' : 'square-outline'} size={22} color={acknowledged ? colors.primary : colors.textMuted} /><Text className="ml-3 flex-1 text-sm leading-5" style={{ color: colors.text }}>Je confirme pouvoir partager ce savoir et comprends qu’il sera examiné avant publication.</Text></TouchableOpacity></View></YeyamoFormStep>;
}

function ControlledInput({ control, name, label, placeholder, error, multiline, ...inputProps }: { control: Control<ContributionValues>; name: FieldPath<ContributionValues>; label: string; placeholder: string; error?: string; multiline?: boolean; [key: string]: unknown }) {
  return <Controller control={control} name={name} render={({ field: { value, onChange, onBlur } }) => <Input label={label} value={typeof value === 'string' ? value : ''} onChangeText={onChange} onBlur={onBlur} placeholder={placeholder} error={error} multiline={multiline} blurOnSubmit={multiline ? false : undefined} returnKeyType={multiline ? 'default' : 'next'} {...inputProps} />} />;
}

function Section({ title, action, onAction, children }: { title: string; action: string; onAction: () => void; children: ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="gap-3"><View className="flex-row items-center justify-between"><Text className="text-base font-bold" style={{ color: colors.text }}>{title}</Text><TouchableOpacity onPress={onAction} accessibilityRole="button"><Text className="text-sm font-semibold" style={{ color: colors.primary }}>{action}</Text></TouchableOpacity></View>{children}</View>;
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="rounded-2xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.surface }}><View className="mb-3 flex-row items-center justify-between"><Text className="text-base font-bold" style={{ color: colors.text }}>{title}</Text><TouchableOpacity onPress={onEdit} accessibilityRole="button"><Text className="text-sm font-semibold" style={{ color: colors.primary }}>Modifier</Text></TouchableOpacity></View>{children}</View>;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mb-2"><Text className="text-xs" style={{ color: colors.textMuted }}>{label}</Text><Text className="text-sm" style={{ color: colors.text }}>{value}</Text></View>;
}
