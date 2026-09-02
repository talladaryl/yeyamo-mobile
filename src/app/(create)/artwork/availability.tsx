import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { useCreateStore } from '@/features/create/create.store';
import { useCountryFeature } from '@/features/country/country.hooks';
import { useCountryStore } from '@/features/country/country.store';
import { useThemeStore } from '@/features/theme/theme.store';

const statuses = [['DISPLAY_ONLY', 'Exposition seulement'], ['AVAILABLE', 'Disponible à la vente'], ['ON_ORDER', 'Sur commande']] as const;
const sales = [['FIXED_PRICE', 'Prix fixe'], ['ON_REQUEST', 'Prix sur demande'], ['CUSTOM_ORDER', 'Commande personnalisée']] as const;

export default function ArtworkAvailability() {
  const router = useRouter(); const colors = useThemeStore((state) => state.colors);
  const draft = useCreateStore((state) => state.artworkDraft); const setDraft = useCreateStore((state) => state.setArtworkDraft);
  const currency = useCountryStore((state) => state.countryConfiguration?.defaultCurrencyCode);
  const commerceEnabled = useCountryFeature('artisanCommerceEnabled'); const paymentsEnabled = useCountryFeature('paymentsEnabled');
  const commercialEnabled = Boolean(currency && commerceEnabled && paymentsEnabled);
  const selectStatus = (value: typeof statuses[number][0]) => { if (value !== 'DISPLAY_ONLY' && !commercialEnabled) { Alert.alert('Vente indisponible', 'La vente d’œuvres n’est pas activée pour ce pays.'); return; } setDraft({ availabilityStatus: value }); };
  return <SafeScreen><ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled"><Stepper currentStep={6} totalSteps={7}/><Text className="text-3xl font-extrabold" style={{ color: colors.text }}>Disponibilité et vente</Text><Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>La publication reste possible sans offre commerciale.</Text>{!commercialEnabled ? <Text className="mt-3 text-sm text-[#B91C1C]">Les options commerciales sont indisponibles pour la configuration pays actuelle.</Text> : null}<Text className="mb-2 mt-7 text-sm font-medium" style={{ color: colors.textSecondary }}>Statut</Text><View className="gap-2">{statuses.map(([value, label]) => <TouchableOpacity key={value} onPress={() => selectStatus(value)} className="rounded-xl border p-4" style={{ borderColor: draft.availabilityStatus === value ? colors.primary : colors.border, backgroundColor: draft.availabilityStatus === value ? `${colors.primary}12` : colors.card, opacity: value === 'DISPLAY_ONLY' || commercialEnabled ? 1 : 0.5 }}><Text className="font-semibold" style={{ color: colors.text }}>{label}</Text></TouchableOpacity>)}</View>{commercialEnabled && (draft.availabilityStatus === 'AVAILABLE' || draft.availabilityStatus === 'ON_ORDER') ? <><Text className="mb-2 mt-6 text-sm font-medium" style={{ color: colors.textSecondary }}>Offre</Text><View className="flex-row flex-wrap gap-2">{sales.map(([value, label]) => <TouchableOpacity key={value} onPress={() => setDraft({ saleType: value })} className="rounded-full border px-3 py-2" style={{ borderColor: draft.saleType === value ? colors.primary : colors.border }}><Text style={{ color: colors.text }}>{label}</Text></TouchableOpacity>)}</View>{draft.saleType === 'FIXED_PRICE' ? <View className="mt-4 flex-row gap-3"><Input containerClassName="flex-1" label={`Prix (${currency})`} value={draft.amount ?? ''} onChangeText={(value) => setDraft({ amount: value, currencyCode: currency })} keyboardType="decimal-pad"/><Input containerClassName="flex-1" label="Quantité" value={draft.availableQuantity ? String(draft.availableQuantity) : '1'} onChangeText={(value) => setDraft({ availableQuantity: Math.max(1, Number(value) || 1) })} keyboardType="number-pad"/></View> : null}</> : null}<Button label="Vérifier le récapitulatif" onPress={() => { if (draft.availabilityStatus !== 'DISPLAY_ONLY' && draft.saleType === 'FIXED_PRICE' && !draft.amount) { Alert.alert('Prix requis', 'Renseignez le prix de vente.'); return; } router.push('/(create)/artwork/review'); }} className="mt-8"/></ScrollView></SafeScreen>;
}
