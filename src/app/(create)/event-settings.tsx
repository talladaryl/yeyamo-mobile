import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Toggle } from '@/components/ui/Toggle';
import { CTAButton } from '@/components/ui/CTAButton';
import { useCreateStore } from '@/features/create/create.store';
import { eventsApi } from '@/features/events/events.api';
import { postApi } from '@/features/post/post.api';

export default function EventSettingsScreen() {
  const router = useRouter();
  const { eventForm, setEventSettings, resetEventForm } = useCreateStore();
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [allowStrangers, setAllowStrangers] = useState(true);
  const [commentsParticipantsOnly, setCommentsParticipantsOnly] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [enableWaitlist, setEnableWaitlist] = useState(false);
  const [userId, setUserId] = useState('');
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  const addInvite = () => {
    const normalized = userId.trim();
    if (!normalized) return;
    if (invitedUsers.includes(normalized)) {
      Alert.alert('Déjà ajouté', 'Cet utilisateur figure déjà parmi les invitations.');
      return;
    }
    setInvitedUsers((current) => [...current, normalized]);
    setUserId('');
  };

  const publish = async () => {
    if (!eventForm.date || !eventForm.time || !eventForm.end_time || !eventForm.title || !eventForm.location || !eventForm.max_participants) {
      Alert.alert('Informations incomplètes', 'Revenez à l’étape précédente pour compléter la sortie.');
      return;
    }
    const startAt = new Date(`${eventForm.date}T${eventForm.time}:00`);
    const endAt = new Date(`${eventForm.date}T${eventForm.end_time}:00`);
    const isCanonicalPlace = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventForm.location);
    setPublishing(true);
    try {
      let coverMediaId: string | undefined;
      if (eventForm.cover_image_url) {
        const cover = new FormData();
        cover.append('file', {
          uri: eventForm.cover_image_url,
          name: 'event-cover',
          type: eventForm.cover_image_mime_type ?? 'image/jpeg',
        } as unknown as Blob);
        coverMediaId = String((await postApi.uploadMedia(cover)).data.id);
      }
      const event = await eventsApi.createEvent({
        ...(isCanonicalPlace ? { placeId: eventForm.location } : {
          locationName: eventForm.location,
          locationAddress: eventForm.location,
          locationLatitude: Number(eventForm.latitude),
          locationLongitude: Number(eventForm.longitude),
        }),
        title: eventForm.title,
        description: eventForm.description || undefined,
        coverMediaId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        capacity: eventForm.max_participants,
        visibility: visibility === 'public' ? 'PUBLIC' : 'PRIVATE',
        allowUninvitedParticipants: allowStrangers,
        commentsParticipantsOnly,
        showParticipants,
        sharingEnabled,
      });
      const invitations = await Promise.allSettled(invitedUsers.map((invitee) => eventsApi.invite(String(event.id), invitee)));
      const failedInvitations = invitations.filter((result) => result.status === 'rejected').length;
      setEventSettings({
        visibility: visibility === 'public' ? 'public' : 'friends',
        allow_strangers: allowStrangers,
        allow_comments_participants_only: commentsParticipantsOnly,
        show_participants_list: showParticipants,
        allow_share_outside: sharingEnabled,
        enable_waitlist: enableWaitlist,
        invited_users: invitedUsers,
      });
      resetEventForm();
      const detail = [
        'La sortie a été créée et attend sa modération avant sa publication publique.',
        failedInvitations ? `${failedInvitations} invitation(s) n’ont pas pu être envoyées.` : null,
        enableWaitlist ? 'La liste d’attente reste visible mais n’est pas encore prise en charge par une route V1.' : null,
      ].filter(Boolean).join(' ');
      Alert.alert('Sortie créée', detail, [{ text: 'OK', onPress: () => router.replace('/(tabs)/explore') }]);
    } catch (error) {
      Alert.alert('Publication impossible', error instanceof Error ? error.message : 'Réessayez dans quelques instants.');
    } finally {
      setPublishing(false);
    }
  };

  return <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
    <Stack.Screen options={{ headerShown: true, headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: '#FFFFFF', headerTitle: 'Paramètres de sortie', headerTitleStyle: { fontSize: 18, fontWeight: '600' }, headerLeft: () => <TouchableOpacity onPress={() => router.back()} className="ml-4"><Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" /></TouchableOpacity> }} />
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled"><View className="px-4 py-6">
      <Section title="Qui peut voir votre sortie ?">
        <Choice selected={visibility === 'public'} label="Tout le monde" onPress={() => setVisibility('public')} />
        <Choice selected={visibility === 'private'} label="Sur invitation" onPress={() => setVisibility('private')} />
      </Section>
      <Section title="Options">
        <View className="bg-white dark:bg-[#161616] rounded-xl px-4 divide-y divide-[#27272A]">
          <Toggle label="Autoriser les inscriptions sans invitation" value={allowStrangers} onValueChange={setAllowStrangers} />
          <Toggle label="Commentaires réservés aux participants" value={commentsParticipantsOnly} onValueChange={setCommentsParticipantsOnly} />
          <Toggle label="Afficher la liste des participants" value={showParticipants} onValueChange={setShowParticipants} />
          <Toggle label="Autoriser le partage" value={sharingEnabled} onValueChange={setSharingEnabled} />
          <Toggle label="Activer la liste d’attente (route V1 absente)" value={enableWaitlist} onValueChange={setEnableWaitlist} />
        </View>
      </Section>
      <Section title="Invitations">
        <Text className="text-[#52525B] dark:text-[#A1A1AA] text-xs mb-3">Saisissez l’identifiant utilisateur connu. La recherche d’amis n’est pas exposée par l’API actuelle.</Text>
        <View className="flex-row gap-2"><TextInput className="flex-1 bg-white dark:bg-[#161616] text-[#18181B] dark:text-white rounded-xl px-4 py-3 text-sm border border-[#E4E4E7] dark:border-[#27272A]" placeholder="Identifiant utilisateur" placeholderTextColor="#A1A1AA" value={userId} onChangeText={setUserId} autoCapitalize="none" /><TouchableOpacity onPress={addInvite} className="bg-[#EF4444] rounded-xl px-4 items-center justify-center"><Text className="text-white font-semibold">Ajouter</Text></TouchableOpacity></View>
        {invitedUsers.length ? <View className="mt-3 gap-2">{invitedUsers.map((id) => <View key={id} className="flex-row items-center justify-between rounded-xl bg-[#F4F4F5] dark:bg-[#27272A] px-3 py-3"><Text className="flex-1 text-[#18181B] dark:text-white text-xs" numberOfLines={1}>{id}</Text><TouchableOpacity onPress={() => setInvitedUsers((current) => current.filter((candidate) => candidate !== id))}><Icon library="ionicons" name="close-circle" size={20} color="#EF4444" /></TouchableOpacity></View>)}</View> : <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm mt-4">Aucune invitation ajoutée.</Text>}
      </Section>
    </View><View className="h-24" /></ScrollView>
    <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0A0A0A] border-t border-[#E4E4E7] dark:border-[#27272A] px-4 py-4"><View className="flex-row gap-3"><TouchableOpacity onPress={() => router.back()} className="flex-1 bg-[#F4F4F5] dark:bg-[#27272A] rounded-xl py-4 items-center"><Text className="text-[#18181B] dark:text-white text-sm font-semibold">Annuler</Text></TouchableOpacity><View className="flex-1"><CTAButton title={publishing ? 'Publication…' : 'Publier'} variant="primary" onPress={publish} disabled={publishing} /></View></View></View>
  </View>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View className="mb-6"><Text className="text-[#18181B] dark:text-white text-base font-semibold mb-3">{title}</Text>{children}</View>; }
function Choice({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) { return <TouchableOpacity onPress={onPress} className="flex-row items-center justify-between py-3"><View className="flex-row items-center"><View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${selected ? 'border-[#EF4444]' : 'border-[#52525B]'}`}>{selected ? <View className="w-3 h-3 rounded-full bg-[#EF4444]" /> : null}</View><Text className="text-[#18181B] dark:text-white text-sm">{label}</Text></View>{selected ? <Icon library="ionicons" name="checkmark-circle" size={20} color="#EF4444" /> : null}</TouchableOpacity>; }
