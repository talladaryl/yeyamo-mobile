import { useLocalSearchParams } from 'expo-router';
import { TicketingPageState } from '@/components/partner-dashboard/ticketing/TicketingPageState';
import { useEventTicketing } from '@/features/ticketing/useTicketing';

export default function TicketOrdersScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { data } = useEventTicketing(id);
  return <TicketingPageState title="Commandes" eventName={data?.eventName ?? 'Événement'} icon="receipt-outline" description="Retrouvez les commandes agrégées et leur statut de paiement." />;
}
