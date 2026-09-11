import { Redirect, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';

/**
 * Legacy deep-link compatibility only. Ticket purchases must use the Ticket
 * V1 checkout, which creates and observes a server order before it confirms
 * anything to the user.
 */
export default function LegacyEventParticipationRedirect() {
  const { id = '', ticketId } = useLocalSearchParams<{ id: string; ticketId?: string }>();
  const href = ticketId
    ? ({ pathname: '/(events)/[id]/checkout', params: { id, ticketId } } as Href)
    : ({ pathname: '/(events)/[id]/tickets', params: { id } } as Href);

  return <Redirect href={href} />;
}
