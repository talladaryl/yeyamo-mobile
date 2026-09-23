import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { FormSelect } from '@/components/ui/FormSelect';
import { Input } from '@/components/ui/Input';
import { YeyamoModal } from '@/components/ui/YeyamoModal';
import { Icon } from '@/components/ui/Icon';
import { useCreateModerationReport } from '@/features/interactions/moderation.hooks';
import type { ReportReason } from '@/features/interactions/moderation.api';
import { useBlockedUsers, useMutedUsers, useSocialSafetyActions } from '@/features/social/useSocial';
import { useThemeStore } from '@/features/theme/theme.store';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: 'Spam ou publicité indésirable' },
  { value: 'HARASSMENT', label: 'Harcèlement' },
  { value: 'HATE_SPEECH', label: 'Discours haineux' },
  { value: 'VIOLENCE', label: 'Violence ou menace' },
  { value: 'FRAUD', label: 'Fraude ou escroquerie' },
  { value: 'MISINFORMATION', label: 'Désinformation' },
  { value: 'PERSONAL_DATA', label: 'Données personnelles' },
  { value: 'OTHER', label: 'Autre motif' },
];

export function ProfileSafetySheet({ visible, onClose, profileId, displayName }: { visible: boolean; onClose: () => void; profileId: string; displayName: string }) {
  const mutedUsers = useMutedUsers();
  const blockedUsers = useBlockedUsers();
  const safety = useSocialSafetyActions();
  const report = useCreateModerationReport();
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<ReportReason>();
  const [details, setDetails] = useState('');
  const muted = mutedUsers.data?.some((user) => String(user.id) === profileId) ?? false;
  const blocked = blockedUsers.data?.some((user) => String(user.id) === profileId) ?? false;
  const pending = safety.mute.isPending || safety.unmute.isPending || safety.block.isPending || safety.unblock.isPending;

  const runSafetyAction = async (kind: 'mute' | 'unmute' | 'block' | 'unblock') => {
    try {
      await safety[kind].mutateAsync(profileId);
      onClose();
    } catch {
      Alert.alert('Action impossible', 'Cette modification n’a pas pu être enregistrée. Réessayez.');
    }
  };

  const submitReport = async () => {
    if (!reason || report.isPending) return;
    try {
      await report.mutateAsync({ targetType: 'USER', targetId: profileId, reason, ...(details.trim() ? { details: details.trim() } : {}) });
      setReason(undefined); setDetails(''); setReporting(false); onClose();
      Alert.alert('Signalement envoyé', 'Merci. Le signalement a été transmis à la modération.');
    } catch {
      Alert.alert('Signalement impossible', 'Le signalement n’a pas pu être envoyé. Réessayez.');
    }
  };

  return <YeyamoModal visible={visible} onClose={() => { setReporting(false); onClose(); }} title={reporting ? 'Signaler ce profil' : `Options pour ${displayName}`}>
    {reporting ? <View><FormSelect label="Motif" value={reason} options={REPORT_REASONS} placeholder="Choisir un motif" onChange={(value) => setReason(value as ReportReason)} required /><Input label="Détails (facultatif)" value={details} onChangeText={setDetails} placeholder="Ajoutez un contexte utile" multiline containerClassName="mt-3" /><View className="mt-4 flex-row gap-3"><View className="flex-1"><Button label="Retour" variant="secondary" onPress={() => setReporting(false)} /></View><View className="flex-1"><Button label="Envoyer" onPress={() => void submitReport()} disabled={!reason || report.isPending} isLoading={report.isPending} /></View></View></View> : <View className="gap-2"><SheetAction icon={muted ? 'volume-high-outline' : 'volume-mute-outline'} label={muted ? 'Réactiver ce profil' : 'Masquer ce profil'} description={muted ? 'Son contenu pourra de nouveau apparaître dans votre fil.' : 'Masque discrètement son contenu de votre fil personnalisé.'} disabled={pending} onPress={() => void runSafetyAction(muted ? 'unmute' : 'mute')} /><SheetAction icon={blocked ? 'lock-open-outline' : 'ban-outline'} label={blocked ? 'Débloquer ce profil' : 'Bloquer ce profil'} description={blocked ? 'Rétablit la possibilité d’interagir.' : 'Retire aussi les abonnements dans les deux sens.'} disabled={pending} onPress={() => void runSafetyAction(blocked ? 'unblock' : 'block')} /><SheetAction icon="flag-outline" label="Signaler ce profil" description="Choisissez un motif pour la modération." disabled={pending} onPress={() => setReporting(true)} danger /></View>}
  </YeyamoModal>;
}

function SheetAction({ icon, label, description, onPress, disabled, danger = false }: { icon: string; label: string; description: string; onPress: () => void; disabled: boolean; danger?: boolean }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} disabled={disabled} className="min-h-16 flex-row items-center rounded-2xl border p-3" style={{ backgroundColor: colors.surface, borderColor: colors.border, opacity: disabled ? 0.55 : 1 }} accessibilityRole="button" accessibilityLabel={label}><View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: danger ? `${colors.primary}18` : colors.elevated }}><Icon name={icon} size={20} color={danger ? colors.primary : colors.text} /></View><View className="ml-3 flex-1"><Text className="font-bold" style={{ color: danger ? colors.primary : colors.text }}>{label}</Text><Text className="mt-0.5 text-xs leading-4" style={{ color: colors.textSecondary }}>{description}</Text></View></TouchableOpacity>;
}
