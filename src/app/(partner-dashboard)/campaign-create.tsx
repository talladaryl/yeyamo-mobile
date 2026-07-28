import axios from 'axios';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { campaignDraftToCreateRequest } from '@/features/campaigns/campaigns.mapper';
import {
  type CampaignDraft,
  useCampaignDraftStore,
} from '@/features/campaigns/campaign-draft.store';
import { useCreateCampaign } from '@/features/campaigns/useCampaigns';
import { useThemeStore } from '@/features/theme/theme.store';

type FieldErrors = Partial<Record<keyof CampaignDraft, string>>;

export default function CampaignCreateScreen() {
  const colors = useThemeStore((state) => state.colors);
  const router = useRouter();
  const { draft, step, update, setStep, reset } = useCampaignDraftStore();
  const createCampaign = useCreateCampaign();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = () => {
    setFieldErrors({});
    setFormError(null);
    let payload;
    try {
      payload = campaignDraftToCreateRequest(draft);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Formulaire invalide.');
      return;
    }
    createCampaign.mutate(payload, {
      onSuccess: (campaign) => {
        reset();
        Alert.alert('Campagne créée', 'La campagne a été enregistrée comme brouillon.');
        router.replace(`/(partner-dashboard)/campaign/${campaign.id}`);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          const body = error.response?.data as {
            detail?: string;
            message?: string;
            validationErrors?: Record<string, string>;
          } | undefined;
          if (error.response?.status === 422 || error.response?.status === 400) {
            const backendFields = body?.validationErrors ?? {};
            setFieldErrors(backendFields as FieldErrors);
          }
          setFormError(body?.detail ?? body?.message ?? `Erreur serveur (${error.response?.status ?? 'réseau'}).`);
          return;
        }
        setFormError(error instanceof Error ? error.message : 'Création impossible.');
      },
    });
  };

  return (
    <PartnerPage title="Créer une campagne" subtitle={`Étape ${step} sur 6`}>
      <View className="mt-3 rounded-2xl border p-5" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        {step === 1 ? (
          <>
            <Field label="Nom" value={draft.name} onChangeText={(name) => update({ name })} error={fieldErrors.name} />
            <Field label="ID du contenu promu" value={draft.promotedEntityId} onChangeText={(promotedEntityId) => update({ promotedEntityId })} error={fieldErrors.promotedEntityId} />
            <Choice label="Objectif" value={draft.objective} values={['AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'EVENT_TICKET_SALES', 'BOOKING', 'STORE_VISIT', 'FOLLOW_PARTNER']} onChange={(objective) => update({ objective })} />
          </>
        ) : null}
        {step === 2 ? (
          <>
            <Choice label="Type de contenu" value={draft.promotedEntityType} values={['PLACE', 'EVENT', 'POST', 'PARTNER_PROFILE', 'EXPERIENCE']} onChange={(promotedEntityType) => update({ promotedEntityType })} />
            <Choice label="Facturation" value={draft.billingModel} values={['CPM', 'CPC', 'CPA', 'FIXED_BUDGET']} onChange={(billingModel) => update({ billingModel })} />
          </>
        ) : null}
        {step === 3 ? (
          <>
            <Field label="Budget total (XAF)" value={draft.totalBudget} onChangeText={(totalBudget) => update({ totalBudget })} keyboardType="numeric" error={fieldErrors.totalBudget} />
            <Field label="Budget journalier (XAF)" value={draft.dailyBudget} onChangeText={(dailyBudget) => update({ dailyBudget })} keyboardType="numeric" error={fieldErrors.dailyBudget} />
            <Field label="Début (AAAA-MM-JJ)" value={draft.startAt} onChangeText={(startAt) => update({ startAt })} error={fieldErrors.startAt} />
            <Field label="Fin (AAAA-MM-JJ)" value={draft.endAt} onChangeText={(endAt) => update({ endAt })} error={fieldErrors.endAt} />
          </>
        ) : null}
        {step === 4 ? (
          <>
            <Field label="Pays (codes séparés par des virgules)" value={draft.countryCodes} onChangeText={(countryCodes) => update({ countryCodes })} />
            <Field label="IDs villes" value={draft.cityIds} onChangeText={(cityIds) => update({ cityIds })} />
            <Field label="Âge minimum" value={draft.minimumAge} onChangeText={(minimumAge) => update({ minimumAge })} keyboardType="numeric" />
            <Field label="Âge maximum" value={draft.maximumAge} onChangeText={(maximumAge) => update({ maximumAge })} keyboardType="numeric" />
            <Field label="IDs centres d'intérêt" value={draft.interestIds} onChangeText={(interestIds) => update({ interestIds })} />
          </>
        ) : null}
        {step === 5 ? (
          <>
            <Field label="Titre créatif" value={draft.title} onChangeText={(title) => update({ title })} />
            <Field label="Description" value={draft.description} onChangeText={(description) => update({ description })} multiline />
            <Field label="URL de l'image" value={draft.imageUrl} onChangeText={(imageUrl) => update({ imageUrl })} autoCapitalize="none" />
            <Field label="Call to action" value={draft.callToAction} onChangeText={(callToAction) => update({ callToAction })} />
            <Field label="URL de destination" value={draft.destinationUrl} onChangeText={(destinationUrl) => update({ destinationUrl })} autoCapitalize="none" />
          </>
        ) : null}
        {step === 6 ? (
          <View>
            <Text className="text-lg font-extrabold" style={{ color: colors.text }}>Aperçu</Text>
            <Preview label="Campagne" value={draft.name} />
            <Preview label="Contenu" value={`${draft.promotedEntityType} · ${draft.promotedEntityId}`} />
            <Preview label="Budget" value={`${draft.totalBudget || '0'} XAF · ${draft.dailyBudget || '0'} XAF/jour`} />
            <Preview label="Période" value={`${draft.startAt} — ${draft.endAt}`} />
            <Preview label="Ciblage" value={draft.countryCodes || 'Non renseigné'} />
          </View>
        ) : null}

        {formError ? <Text className="mt-3 text-sm font-semibold text-red-500">{formError}</Text> : null}
        <View className="mt-6 flex-row gap-3">
          {step > 1 ? <Action label="Retour" secondary onPress={() => setStep(step - 1)} disabled={createCampaign.isPending} /> : null}
          <Action
            label={step === 6 ? 'Créer le brouillon' : 'Continuer'}
            onPress={step === 6 ? submit : () => setStep(step + 1)}
            disabled={createCampaign.isPending}
            pending={step === 6 && createCampaign.isPending}
          />
        </View>
      </View>
    </PartnerPage>
  );
}

function Field({ label, error, ...props }: React.ComponentProps<typeof TextInput> & { label: string; error?: string }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-xs font-bold" style={{ color: colors.textSecondary }}>{label}</Text>
      <TextInput {...props} placeholderTextColor={colors.textMuted} className="rounded-xl border px-4 py-3" style={{ color: colors.text, borderColor: error ? '#EF4444' : colors.border, backgroundColor: colors.elevated }} />
      {error ? <Text className="mt-1 text-xs text-red-500">{error}</Text> : null}
    </View>
  );
}

function Choice<T extends string>({ label, value, values, onChange }: { label: string; value: T; values: readonly T[]; onChange: (value: T) => void }) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-bold" style={{ color: colors.textSecondary }}>{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {values.map((item) => <TouchableOpacity key={item} onPress={() => onChange(item)} className="rounded-full border px-3 py-2" style={{ borderColor: item === value ? '#EF4444' : colors.border, backgroundColor: item === value ? '#EF444420' : colors.elevated }}><Text className="text-xs font-semibold" style={{ color: item === value ? '#EF4444' : colors.text }}>{item}</Text></TouchableOpacity>)}
      </View>
    </View>
  );
}

function Preview({ label, value }: { label: string; value: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mt-4"><Text className="text-xs" style={{ color: colors.textMuted }}>{label}</Text><Text className="mt-1 font-semibold" style={{ color: colors.text }}>{value}</Text></View>;
}

function Action({ label, secondary, pending, ...props }: { label: string; secondary?: boolean; pending?: boolean; onPress: () => void; disabled?: boolean }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity {...props} className="flex-1 items-center rounded-xl px-4 py-3.5" style={{ backgroundColor: secondary ? colors.elevated : '#EF4444', opacity: props.disabled ? 0.6 : 1 }}>{pending ? <ActivityIndicator color="#FFFFFF" /> : <Text className="font-bold" style={{ color: secondary ? colors.text : '#FFFFFF' }}>{label}</Text>}</TouchableOpacity>;
}
