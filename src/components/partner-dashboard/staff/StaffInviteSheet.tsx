import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useInviteStaff, useStaffUserSearch } from '@/features/partner-staff/usePartnerStaff';
import { useThemeStore } from '@/features/theme/theme.store';
import type { StaffRole, StaffUserSearchResult } from '@/features/partner-staff/types';

export type StaffInviteSheetHandle = { open: () => void; close: () => void };
const ROLES: Array<{ value: StaffRole; label: string }> = [
  { value: 'EVENT_MANAGER', label: 'Gestionnaire' }, { value: 'ACCESS_CONTROLLER', label: 'Contrôleur d’accès' },
  { value: 'CASHIER', label: 'Caissier' }, { value: 'SUPERVISOR', label: 'Superviseur' },
];

export const StaffInviteSheet = forwardRef<StaffInviteSheetHandle, { eventId: string }>(({ eventId }, ref) => {
  const sheet = useRef<BottomSheet>(null);
  const colors = useThemeStore((state) => state.colors);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<StaffUserSearchResult | null>(null);
  const [role, setRole] = useState<StaffRole>('ACCESS_CONTROLLER');
  const search = useStaffUserSearch(query);
  const invite = useInviteStaff(eventId);
  useImperativeHandle(ref, () => ({ open: () => sheet.current?.expand(), close: () => sheet.current?.close() }));
  const backdrop = (props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
  const submit = async () => {
    if (!selected) return;
    try {
      await invite.mutateAsync({ userId: selected.userId, role });
      sheet.current?.close();
      setQuery('');
      setSelected(null);
    } catch {
      // The mutation state keeps the sheet open so the invitation can be retried.
    }
  };
  return <BottomSheet ref={sheet} index={-1} snapPoints={useMemo(() => ['88%'], [])} enablePanDownToClose backdropComponent={backdrop} backgroundStyle={{ backgroundColor: colors.card }} handleIndicatorStyle={{ backgroundColor: colors.textMuted }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Ajouter un membre</Text><Text className="mb-5 mt-1 text-xs" style={{ color: colors.textSecondary }}>Invitez un utilisateur YeYamo existant.</Text><Input label="Rechercher" placeholder="Username, téléphone ou email" value={query} onChangeText={(value) => { setQuery(value); setSelected(null); }} />{search.data?.map((user) => <TouchableOpacity key={user.userId} onPress={() => setSelected(user)} className="mt-3 flex-row items-center rounded-xl border p-3" style={{ borderColor: selected?.userId === user.userId ? '#EF4444' : colors.border, backgroundColor: colors.elevated }}><Avatar uri={user.avatarUrl} displayName={user.displayName} /><View className="ml-3 flex-1"><Text className="font-bold" style={{ color: colors.text }}>{user.displayName}</Text><Text className="text-xs" style={{ color: colors.textSecondary }}>@{user.username} · {user.contactHint}</Text></View></TouchableOpacity>)}<Text className="mb-2 mt-5 text-sm font-semibold" style={{ color: colors.textSecondary }}>Rôle</Text><View className="flex-row flex-wrap gap-2">{ROLES.map((item) => <TouchableOpacity key={item.value} onPress={() => setRole(item.value)} className="rounded-full border px-3 py-2" style={{ borderColor: role === item.value ? '#EF4444' : colors.border, backgroundColor: role === item.value ? '#EF444420' : colors.elevated }}><Text className="text-xs font-semibold" style={{ color: role === item.value ? '#EF4444' : colors.text }}>{item.label}</Text></TouchableOpacity>)}</View>{invite.isError ? <Text className="mt-3 text-xs text-[#EF4444]">Invitation impossible. Réessayez.</Text> : null}<View className="mt-6"><Button label="Envoyer l’invitation" onPress={submit} disabled={!selected} isLoading={invite.isPending} /></View></ScrollView></BottomSheet>;
});
StaffInviteSheet.displayName = 'StaffInviteSheet';
