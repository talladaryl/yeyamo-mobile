import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useTicket, useTicketQrCredential } from '@/features/ticketing/useTicketing';
import { useEventDetail } from '@/features/events/useEvents';
import { useThemeStore } from '@/features/theme/theme.store';
import type { TicketStatus } from '@/features/ticketing/types';

const STATUS: Record<TicketStatus, string> = {
  PENDING_PAYMENT: 'Paiement en attente', VALID: 'Valide', USED: 'Utilisé', CANCELLED: 'Annulé',
  REFUNDED: 'Remboursé', EXPIRED: 'Expiré', REVOKED: 'Révoqué',
};

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const ticketQuery = useTicket(id);
  const ticket = ticketQuery.data;
  const eventQuery = useEventDetail(ticket?.eventId ?? '');
  const qrQuery = useTicketQrCredential(ticket?.status === 'VALID' ? id : '');
  const credential = qrQuery.data?.qrToken;

  if (ticketQuery.isLoading) return <SafeScreen><ActivityIndicator className="mt-20" color={colors.primary} /></SafeScreen>;
  if (ticketQuery.isError || !ticket) return <SafeScreen><State title="Billet introuvable" onRetry={() => void ticketQuery.refetch()} /></SafeScreen>;

  return <SafeScreen><View className="flex-row items-center px-4 pb-3 pt-2"><TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Mon billet</Text></View><ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 36 }}><View className="overflow-hidden rounded-3xl bg-[#EF4444] p-5"><Text className="text-xs font-bold uppercase tracking-widest text-white/70">YeYamo Ticket</Text><Text className="mt-2 text-2xl font-extrabold text-white">{eventQuery.data?.title ?? 'Billet d’événement'}</Text><Text className="mt-1 font-bold text-white/90">{STATUS[ticket.status]}</Text><View className="mt-5 gap-3"><Line label="Référence" value={ticket.serialNumber} /><Line label="Émis le" value={ticket.issuedAt ? new Date(ticket.issuedAt).toLocaleDateString('fr-FR') : 'En attente'} />{ticket.usedAt ? <Line label="Utilisé le" value={new Date(ticket.usedAt).toLocaleDateString('fr-FR')} /> : null}{ticket.cancelledAt ? <Line label="Annulé le" value={new Date(ticket.cancelledAt).toLocaleDateString('fr-FR')} /> : null}{ticket.refundedAt ? <Line label="Remboursé le" value={new Date(ticket.refundedAt).toLocaleDateString('fr-FR')} /> : null}</View><View className="mt-6 items-center rounded-2xl bg-white p-5">{ticket.status !== 'VALID' ? <><Icon name="qr-code-outline" size={80} color="#71717A" /><Text className="mt-3 text-center text-xs text-[#52525B]">QR indisponible pour ce statut.</Text></> : qrQuery.isLoading ? <ActivityIndicator color="#18181B" /> : credential ? <QRCode value={credential} size={190} backgroundColor="#FFFFFF" color="#18181B" /> : <><Icon name="alert-circle-outline" size={54} color="#EF4444" /><Text className="mt-3 text-center text-xs text-[#52525B]">Le credential sécurisé n’a pas pu être chargé.</Text><TouchableOpacity onPress={() => void qrQuery.refetch()} className="mt-3 rounded-lg bg-[#EF4444] px-4 py-2"><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity></>}</View></View></ScrollView></SafeScreen>;
}

function Line({ label, value }: { label: string; value: string }) { return <View className="flex-row justify-between gap-3"><Text className="text-sm text-white/70">{label}</Text><Text className="flex-1 text-right font-bold text-white">{value}</Text></View>; }
function State({ title, onRetry }: { title: string; onRetry: () => void }) { const colors = useThemeStore((state) => state.colors); return <View className="flex-1 items-center justify-center px-8"><Text style={{ color: colors.text }}>{title}</Text><TouchableOpacity onPress={onRetry} className="mt-4 rounded-xl bg-[#EF4444] px-4 py-3"><Text className="font-bold text-white">Réessayer</Text></TouchableOpacity></View>; }
