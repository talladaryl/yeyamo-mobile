import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type NotificationPreferences } from '@/features/notifications/notifications.api';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';
import { ErrorState, LoadingState } from '@/components/ui/ViewStates';

export default function NotificationSettingsScreen() {
  const colors = useThemeStore((state) => state.colors);
  const viewerId = useAuthStore((state) => String(state.user?.id ?? 'anonymous'));
  const email = useAuthStore((state) => state.user?.email ?? null);
  const queryClient = useQueryClient();
  const key = ['notification-preferences', viewerId] as const;
  const query = useQuery({ queryKey: key, queryFn: notificationsApi.getPreferences });
  const mutation = useMutation({
    mutationFn: notificationsApi.updatePreferences,
    onSuccess: (value) => queryClient.setQueryData(key, value),
    onError: () => Alert.alert('Modification impossible', 'Vos préférences précédentes sont conservées.'),
  });

  const update = (field: keyof NotificationPreferences, value: boolean) => {
    if (!query.data || mutation.isPending) return;
    if (field === 'emailEnabled' && value && !email) {
      Alert.alert('Adresse e-mail requise', 'Ajoutez une adresse e-mail à votre compte avant d’activer les e-mails.');
      return;
    }
    if (field === 'pushEnabled' && value && !query.data.pushToken) {
      Alert.alert('Notifications push indisponibles', 'Autorisez d’abord les notifications dans les réglages de votre appareil.');
      return;
    }
    mutation.mutate({ ...query.data, [field]: value, emailAddress: query.data.emailAddress ?? email });
  };

  if (query.isLoading) return <LoadingState label="Chargement des préférences…" />;
  if (!query.data || query.isError) return <ErrorState title="Préférences indisponibles" message="Réessayez plus tard." retry={() => void query.refetch()} />;

  const rows: [keyof NotificationPreferences, string, string][] = [
    ['inAppEnabled', 'Dans l’application', 'Afficher les notifications dans Yeyamo'],
    ['pushEnabled', 'Notifications push', 'Recevoir les alertes sur cet appareil'],
    ['emailEnabled', 'E-mails', 'Recevoir les notifications autorisées par e-mail'],
  ];
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>Choisissez les canaux utilisés pour votre compte actuel.</Text>
      {rows.map(([field, label, description]) => <View key={field} style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, paddingRight: 12 }}><Text style={{ color: colors.text, fontWeight: '600' }}>{label}</Text><Text style={{ color: colors.textSecondary, marginTop: 3 }}>{description}</Text></View>
        <Switch value={Boolean(query.data[field])} disabled={mutation.isPending} onValueChange={(value) => update(field, value)} trackColor={{ true: colors.primary }} />
      </View>)}
    </ScrollView>
  </SafeAreaView>;
}
