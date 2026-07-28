import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useInviteEventStaff } from '@/features/partner-staff/usePartnerStaff';
import { useThemeStore } from '@/features/theme/theme.store';

export type StaffInviteSheetHandle = { open: () => void; close: () => void };

export const StaffInviteSheet = forwardRef<StaffInviteSheetHandle, { eventId: string }>(({ eventId }, ref) => {
  const sheet = useRef<BottomSheet>(null);
  const colors = useThemeStore((state) => state.colors);
  const [contact, setContact] = useState('');
  const [roleId, setRoleId] = useState('');
  const invite = useInviteEventStaff(eventId);
  useImperativeHandle(ref, () => ({ open: () => sheet.current?.expand(), close: () => sheet.current?.close() }));
  const backdrop = (props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
  const submit = async () => {
    if (!contact.trim() || !roleId.trim()) return;
    try {
      await invite.mutateAsync({ contact: contact.trim(), roleId: roleId.trim() });
      sheet.current?.close();
      setContact('');
      setRoleId('');
    } catch {
      // Mutation state keeps the form visible and exposes the retry state.
    }
  };
  return <BottomSheet ref={sheet} index={-1} snapPoints={useMemo(() => ['65%'], [])} enablePanDownToClose backdropComponent={backdrop} backgroundStyle={{ backgroundColor: colors.card }} handleIndicatorStyle={{ backgroundColor: colors.textMuted }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}><Text className="text-xl font-extrabold" style={{ color: colors.text }}>Ajouter un membre</Text><Text className="mb-5 mt-1 text-xs" style={{ color: colors.textSecondary }}>Une invitation expirant sous 48 heures sera envoyée au contact.</Text><Input label="E-mail ou téléphone" placeholder="contact@exemple.com" value={contact} onChangeText={setContact} /><View className="mt-3"><Input label="Identifiant du rôle partenaire" placeholder="UUID du rôle" value={roleId} onChangeText={setRoleId} /></View><Text className="mt-2 text-xs" style={{ color: colors.textSecondary }}>L’affectation à cet événement sera possible après acceptation de l’invitation.</Text>{invite.isError ? <Text className="mt-3 text-xs text-[#EF4444]">Invitation impossible. Vérifiez le contact, le rôle et vos permissions.</Text> : null}<View className="mt-6"><Button label="Envoyer l’invitation" onPress={submit} disabled={!contact.trim() || !roleId.trim()} isLoading={invite.isPending} /></View></ScrollView></BottomSheet>;
});
StaffInviteSheet.displayName = 'StaffInviteSheet';
