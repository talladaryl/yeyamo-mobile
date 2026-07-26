import { useLocalSearchParams } from 'expo-router';
import { TicketingPageState } from '@/components/partner-dashboard/ticketing/TicketingPageState';
import { useEventTicketing } from '@/features/ticketing/useTicketing';

export default function EventAnalyticsScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { data } = useEventTicketing(id);
  return <TicketingPageState title="Analytics billetterie" eventName={data?.eventName ?? 'Événement'} icon="stats-chart-outline" description="Analysez les ventes, les revenus et le rythme des entrées." />;
}
