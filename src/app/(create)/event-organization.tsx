import { useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { useCreateStore } from '@/features/create/create.store';
import { useThemeStore } from '@/features/theme/theme.store';

export default function EventOrganizationScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const initialForm = useRef(useCreateStore.getState().eventForm).current;
  const initialSettings = useRef(useCreateStore.getState().eventSettings).current;
  const setEventForm = useCreateStore((state) => state.setEventForm);
  const setEventSettings = useCreateStore((state) => state.setEventSettings);
  const [capacity, setCapacity] = useState(String(initialForm.max_participants ?? 20));
  const [allowStrangers, setAllowStrangers] = useState(initialSettings.allow_strangers ?? true);

  const adjustCapacity = (amount: number) => {
    const next = Math.max(1, Math.min(999, (Number(capacity) || 1) + amount));
    setCapacity(String(next));
  };

  const continueToVisibility = () => {
    const parsedCapacity = Number(capacity);
    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1 || parsedCapacity > 999) {
      Alert.alert('Capacité invalide', 'Choisissez un nombre de participants compris entre 1 et 999.');
      return;
    }
    setEventForm({ max_participants: parsedCapacity });
    setEventSettings({ allow_strangers: allowStrangers });
    router.push('/(create)/event-settings');
  };

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={continueToVisibility} />}>
    <YeyamoFormProgress currentStep={3} totalSteps={5} label="Créer une sortie" />
    <YeyamoFormStep title="Organisez votre sortie" description="Définissez simplement combien de personnes peuvent participer.">
      <View className="gap-5">
        <View className="rounded-2xl border p-5" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          <Text className="text-base font-bold" style={{ color: colors.text }}>Nombre maximum de participants</Text>
          <Text className="mt-1 text-sm leading-5" style={{ color: colors.textSecondary }}>Lorsque cette limite est atteinte, les nouvelles inscriptions ne sont plus acceptées.</Text>
          <View className="mt-5 flex-row items-center justify-between gap-3">
            <Button label="−" variant="secondary" size="lg" fullWidth={false} onPress={() => adjustCapacity(-1)} accessibilityHint="Réduire la capacité" />
            <View className="w-28"><Input label="Capacité" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" textAlign="center" maxLength={3} /></View>
            <Button label="+" variant="secondary" size="lg" fullWidth={false} onPress={() => adjustCapacity(1)} accessibilityHint="Augmenter la capacité" />
          </View>
        </View>
        <View className="rounded-2xl border px-4" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          <Toggle label="Autoriser les personnes non invitées à rejoindre" value={allowStrangers} onValueChange={setAllowStrangers} />
          <Text className="pb-4 text-xs leading-5" style={{ color: colors.textSecondary }}>{allowStrangers ? 'Les personnes qui découvrent la sortie pourront demander à participer.' : 'Seules les personnes que vous inviterez pourront rejoindre la sortie.'}</Text>
        </View>
        <View className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: colors.accentSoft }}>
          <Text className="text-sm font-semibold" style={{ color: colors.text }}>Les critères d’âge, les groupes automatiques et les tickets ne sont pas configurés ici car le contrat de création de sortie ne les prend pas encore en charge.</Text>
        </View>
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}
