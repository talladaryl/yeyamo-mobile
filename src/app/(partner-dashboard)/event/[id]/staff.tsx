import { useRef } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { StaffInviteSheet, type StaffInviteSheetHandle } from '@/components/partner-dashboard/staff/StaffInviteSheet';
import { useEventStaff, useResendStaffInvitation, useRevokeStaff, useUpdateStaffRole } from '@/features/partner-staff/usePartnerStaff';
import { useEventTicketing } from '@/features/ticketing/useTicketing';
import { useThemeStore } from '@/features/theme/theme.store';
import type { StaffMember, StaffRole } from '@/features/partner-staff/types';

const ROLE: Record<StaffRole, string> = { EVENT_MANAGER: 'Gestionnaire', ACCESS_CONTROLLER: 'Contrôleur d’accès', CASHIER: 'Caissier', SUPERVISOR: 'Superviseur' };

export default function EventStaffScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const sheet = useRef<StaffInviteSheetHandle>(null);
  const event = useEventTicketing(id);
  const staff = useEventStaff(id);
  const updateRole = useUpdateStaffRole(id);
  const revoke = useRevokeStaff(id);
  const resend = useResendStaffInvitation(id);
  const active = staff.data?.filter((member) => member.status === 'ACTIVE') ?? [];
  const actions = (member: StaffMember) => Alert.alert(member.displayName, undefined, [
    { text: 'Modifier le rôle', onPress: () => Alert.alert('Choisir le rôle', undefined, (Object.keys(ROLE) as StaffRole[]).map((role) => ({ text: ROLE[role], onPress: () => updateRole.mutate({ memberId: member.id, role }) }))) },
    ...(member.status === 'INVITED' ? [{ text: 'Renvoyer l’invitation', onPress: () => resend.mutate(member.id) }] : []),
    { text: 'Révoquer', style: 'destructive' as const, onPress: () => revoke.mutate(member.id) },
    { text: 'Annuler', style: 'cancel' as const },
  ]);
  return (
    <SafeScreen>
      <View className="flex-row items-center px-4 pb-3 pt-2"><TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><View className="flex-1"><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Équipe de l’événement</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>{event.data?.eventName ?? 'Événement'}</Text></View></View>
      <FlatList data={staff.data ?? []} keyExtractor={(item) => item.id} renderItem={({ item }) => <StaffRow member={item} onActions={() => actions(item)} />} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }} refreshing={staff.isRefetching} onRefresh={staff.refetch} ListHeaderComponent={<><View className="my-3 flex-row gap-3"><Summary label="Actifs" value={active.length} /><Summary label="Contrôleurs" value={active.filter((item) => item.role === 'ACCESS_CONTROLLER').length} /><Summary label="Managers" value={active.filter((item) => item.role === 'EVENT_MANAGER').length} /></View><TouchableOpacity onPress={() => sheet.current?.open()} className="mb-5 flex-row items-center justify-center gap-2 rounded-xl bg-[#EF4444] py-3.5"><Icon name="person-add-outline" size={20} color="#FFFFFF" /><Text className="font-bold text-white">Ajouter un membre</Text></TouchableOpacity></>} />
      <StaffInviteSheet ref={sheet} eventId={id} />
    </SafeScreen>
  );
}

function Summary({ label, value }: { label: string; value: number }) { return <View className="flex-1 rounded-xl bg-[#EF4444] p-3"><Text className="text-xl font-extrabold text-white">{value}</Text><Text className="text-[10px] text-white/75">{label}</Text></View>; }
function StaffRow({ member, onActions }: { member: StaffMember; onActions: () => void }) { const colors = useThemeStore((state) => state.colors); const statusColor = member.status === 'ACTIVE' ? '#22C55E' : member.status === 'INVITED' ? '#F59E0B' : '#71717A'; const statusLabel = member.status === 'ACTIVE' ? 'Actif' : member.status === 'INVITED' ? 'Invitation envoyée' : 'Révoqué'; return <View className="mb-3 flex-row items-center rounded-2xl border p-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Avatar uri={member.avatarUrl} displayName={member.displayName} size={46} /><View className="ml-3 min-w-0 flex-1"><View className="flex-row items-center gap-2"><Text className="font-bold" style={{ color: colors.text }}>{member.displayName}</Text><Text className="text-[10px] font-semibold" style={{ color: statusColor }}>{statusLabel}</Text></View><Text className="mt-0.5 text-xs text-[#EF4444]">{ROLE[member.role]}</Text><Text className="mt-1 text-[10px]" numberOfLines={1} style={{ color: colors.textSecondary }}>{member.permissions.join(' · ')}</Text></View><TouchableOpacity onPress={onActions} className="h-10 w-10 items-center justify-center"><Icon name="ellipsis-vertical" size={19} color={colors.textSecondary} /></TouchableOpacity></View>; }
