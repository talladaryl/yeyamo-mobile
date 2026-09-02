import { useRef } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { StaffInviteSheet, type StaffInviteSheetHandle } from '@/components/partner-dashboard/staff/StaffInviteSheet';
import { useEventStaff, useRevokeEventStaff, useUpdateEventStaffRole } from '@/features/partner-staff/usePartnerStaff';
import { useEventTicketing } from '@/features/ticketing/useTicketing';
import { useThemeStore } from '@/features/theme/theme.store';
import type { EventStaffAssignment, StaffRole } from '@/features/partner-staff/types';

const ROLE: Record<StaffRole, string> = { EVENT_MANAGER: 'Gestionnaire', ACCESS_CONTROLLER: 'Contrôleur d’accès', CASHIER: 'Caissier', SUPERVISOR: 'Superviseur' };

export default function EventStaffScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const sheet = useRef<StaffInviteSheetHandle>(null);
  const event = useEventTicketing(id);
  const staff = useEventStaff(id);
  const updateRole = useUpdateEventStaffRole(id);
  const revoke = useRevokeEventStaff(id);
  const active = staff.data?.filter((member) => member.status === 'ACTIVE') ?? [];
  const confirmRevoke = (member: EventStaffAssignment) => Alert.alert('Révoquer ce membre ?', `${member.displayName} perdra immédiatement son accès à cet événement.`, [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Révoquer', style: 'destructive', onPress: () => revoke.mutate(member.id) },
  ]);
  const actions = (member: EventStaffAssignment) => Alert.alert(member.displayName, undefined, [
    { text: 'Modifier le rôle', onPress: () => Alert.alert('Choisir le rôle', undefined, (Object.keys(ROLE) as StaffRole[]).map((role) => ({ text: ROLE[role], onPress: () => updateRole.mutate({ assignmentId: member.id, role }) }))) },
    { text: 'Révoquer', style: 'destructive', onPress: () => confirmRevoke(member) },
    { text: 'Annuler', style: 'cancel' },
  ]);
  return <SafeScreen>
    <View className="flex-row items-center px-4 pb-3 pt-2"><TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}><Icon name="arrow-back" size={22} color={colors.text} /></TouchableOpacity><View className="flex-1"><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Équipe de l’événement</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>{event.data?.eventName ?? 'Événement'}</Text></View></View>
    <FlatList data={staff.data ?? []} keyExtractor={(item) => item.id} renderItem={({ item }) => <StaffRow member={item} onActions={() => actions(item)} />} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }} refreshing={staff.isRefetching} onRefresh={staff.refetch} ListHeaderComponent={<><View className="my-3 flex-row gap-3"><Summary label="Actifs" value={active.length} /><Summary label="Contrôleurs" value={active.filter((item) => item.role === 'ACCESS_CONTROLLER').length} /><Summary label="Managers" value={active.filter((item) => item.role === 'EVENT_MANAGER').length} /></View><TouchableOpacity onPress={() => sheet.current?.open()} className="mb-5 flex-row items-center justify-center gap-2 rounded-xl bg-[#EF4444] py-3.5"><Icon name="person-add-outline" size={20} color="#FFFFFF" /><Text className="font-bold text-white">Inviter un membre</Text></TouchableOpacity></>} />
    <StaffInviteSheet ref={sheet} eventId={id} />
  </SafeScreen>;
}

function Summary({ label, value }: { label: string; value: number }) { return <View className="flex-1 rounded-xl bg-[#EF4444] p-3"><Text className="text-xl font-extrabold text-white">{value}</Text><Text className="text-[10px] text-white/75">{label}</Text></View>; }
function StaffRow({ member, onActions }: { member: EventStaffAssignment; onActions: () => void }) { const colors = useThemeStore((state) => state.colors); const labels: Record<string, string> = { PENDING: 'En attente', ACTIVE: 'Actif', REVOKED: 'Révoqué', EXPIRED: 'Expiré' }; const active = member.status === 'ACTIVE'; return <View className="mb-3 flex-row items-center rounded-2xl border p-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Avatar uri={member.avatarUrl} displayName={member.displayName} size={46} /><View className="ml-3 min-w-0 flex-1"><View className="flex-row items-center gap-2"><Text className="flex-1 font-bold" numberOfLines={1} style={{ color: colors.text }}>{member.displayName}</Text><Text className="text-[10px] font-semibold" style={{ color: active ? '#22C55E' : '#71717A' }}>{labels[member.status] ?? member.status}</Text></View><Text className="mt-0.5 text-xs text-[#EF4444]">{ROLE[member.role]}</Text><Text className="mt-1 text-[10px]" style={{ color: colors.textSecondary }}>Du {new Date(member.validFrom).toLocaleDateString('fr-FR')} au {new Date(member.validUntil).toLocaleDateString('fr-FR')}</Text></View><TouchableOpacity onPress={onActions} className="h-10 w-10 items-center justify-center"><Icon name="ellipsis-vertical" size={19} color={colors.textSecondary} /></TouchableOpacity></View>; }
