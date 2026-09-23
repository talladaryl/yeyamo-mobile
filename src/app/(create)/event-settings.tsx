import { useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { YeyamoFormFooter } from '@/components/forms/YeyamoFormFooter';
import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';
import { YeyamoFormScreen } from '@/components/forms/YeyamoFormScreen';
import { YeyamoFormStep } from '@/components/forms/YeyamoFormStep';
import { Toggle } from '@/components/ui/Toggle';
import { useCreateStore } from '@/features/create/create.store';
import { useThemeStore } from '@/features/theme/theme.store';

type Visibility = 'public' | 'friends';

export default function EventSettingsScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const initialForm = useRef(useCreateStore.getState().eventForm).current;
  const initialSettings = useRef(useCreateStore.getState().eventSettings).current;
  const setEventForm = useCreateStore((state) => state.setEventForm);
  const setEventSettings = useCreateStore((state) => state.setEventSettings);
  const [visibility, setVisibility] = useState<Visibility>(initialSettings.visibility === 'friends' ? 'friends' : 'public');
  const [commentsParticipantsOnly, setCommentsParticipantsOnly] = useState(initialSettings.allow_comments_participants_only ?? false);
  const [showParticipants, setShowParticipants] = useState(initialSettings.show_participants_list ?? true);
  const [sharingEnabled, setSharingEnabled] = useState(initialSettings.allow_share_outside ?? false);
  const [shareToFeed, setShareToFeed] = useState(initialForm.share_to_feed ?? false);
  const [shareToStory, setShareToStory] = useState(initialForm.share_to_story ?? false);

  const continueToReview = () => {
    setEventSettings({
      visibility,
      allow_comments_participants_only: commentsParticipantsOnly,
      show_participants_list: showParticipants,
      allow_share_outside: sharingEnabled,
    });
    setEventForm({ share_to_feed: shareToFeed, share_to_story: shareToStory });
    router.push('/(create)/event-review');
  };

  return <YeyamoFormScreen footer={<YeyamoFormFooter onBack={() => router.back()} onContinue={continueToReview} continueLabel="Vérifier la sortie" />}>
    <YeyamoFormProgress currentStep={4} totalSteps={5} label="Créer une sortie" />
    <YeyamoFormStep title="Qui peut voir votre sortie ?" description="Les deux niveaux ci-dessous correspondent aux seules visibilités actuellement prises en charge.">
      <View className="gap-5">
        <View className="gap-3">
          <VisibilityCard active={visibility === 'public'} title="Public" description="Toute personne sur Yeyamo peut découvrir cette sortie." onPress={() => setVisibility('public')} />
          <VisibilityCard active={visibility === 'friends'} title="Sur invitation" description="La sortie est privée. Les personnes non invitées ne la verront pas." onPress={() => setVisibility('friends')} />
        </View>
        <View className="rounded-2xl border px-4" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          <Toggle label="Afficher la liste des participants" value={showParticipants} onValueChange={setShowParticipants} />
          <Toggle label="Réserver les commentaires aux participants" value={commentsParticipantsOnly} onValueChange={setCommentsParticipantsOnly} />
          <Toggle label="Autoriser le partage de la sortie" value={sharingEnabled} onValueChange={setSharingEnabled} />
        </View>
        <View className="rounded-2xl border px-4" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
          <Toggle label="Partager aussi dans le Feed" value={shareToFeed} onValueChange={setShareToFeed} />
          <Toggle label="Partager aussi en Story" value={shareToStory} onValueChange={setShareToStory} />
          <Text className="pb-4 text-xs leading-5" style={{ color: colors.textSecondary }}>Le serveur recevra ces intentions. La diffusion démarre seulement après publication de la sortie et ses statuts restent asynchrones.</Text>
        </View>
      </View>
    </YeyamoFormStep>
  </YeyamoFormScreen>;
}

function VisibilityCard({ active, title, description, onPress }: { active: boolean; title: string; description: string; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: active }} className="rounded-2xl border p-4" style={{ borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.accentSoft : colors.surface }}>
    <Text className="text-base font-bold" style={{ color: colors.text }}>{title}</Text>
    <Text className="mt-1 text-sm leading-5" style={{ color: colors.textSecondary }}>{description}</Text>
  </TouchableOpacity>;
}
