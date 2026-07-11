import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Toggle } from '@/components/ui/Toggle';
import { ParticipantItem } from '@/components/create/ParticipantItem';
import { CTAButton } from '@/components/ui/CTAButton';
import { useCreateStore } from '@/features/create/create.store';

// Mock participants
const mockParticipants = [
  { id: '1', name: 'Laura Wang', avatar_url: null },
  { id: '2', name: 'Norni Legrand', avatar_url: null },
  { id: '3', name: 'Dina Eboa', avatar_url: null },
  { id: '4', name: 'Patrick Mballa', avatar_url: null },
  { id: '5', name: 'Sophie Kamdem', avatar_url: null },
  { id: '6', name: 'Henri Talla', avatar_url: null },
];

export default function EventSettingsScreen() {
  const router = useRouter();
  const { eventSettings, setEventSettings } = useCreateStore();
  
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'close_friends'>('public');
  const [allowStrangers, setAllowStrangers] = useState(true);
  const [allowCommentsParticipants, setAllowCommentsParticipants] = useState(false);
  const [showParticipantsList, setShowParticipantsList] = useState(true);
  const [allowShareOutside, setAllowShareOutside] = useState(false);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [enableWaitlist, setEnableWaitlist] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleInviteToggle = (userId: string) => {
    setInvitedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handlePublish = () => {
    setEventSettings({
      visibility,
      allow_strangers: allowStrangers,
      allow_comments_participants_only: allowCommentsParticipants,
      show_participants_list: showParticipantsList,
      allow_share_outside: allowShareOutside,
      enable_waitlist: enableWaitlist,
      invited_users: invitedUsers,
    });
    console.log('Publishing event with settings');
    router.back();
    router.back();
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Inviter à sortie sortie',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* Visibility Section */}
          <View className="mb-6">
            <Text className="text-white text-base font-semibold mb-4">
              Qui peut voir votre sortie ?
            </Text>
            
            <TouchableOpacity
              onPress={() => setVisibility('public')}
              className="flex-row items-center justify-between py-3"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                  visibility === 'public' ? 'border-[#EF4444]' : 'border-[#52525B]'
                }`}>
                  {visibility === 'public' && (
                    <View className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  )}
                </View>
                <Text className="text-white text-sm">Tout le monde</Text>
              </View>
              {visibility === 'public' && (
                <Icon library="ionicons" name="checkmark-circle" size={20} color="#EF4444" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVisibility('friends')}
              className="flex-row items-center justify-between py-3"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                  visibility === 'friends' ? 'border-[#EF4444]' : 'border-[#52525B]'
                }`}>
                  {visibility === 'friends' && (
                    <View className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  )}
                </View>
                <Text className="text-white text-sm">Amis</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVisibility('close_friends')}
              className="flex-row items-center justify-between py-3"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center flex-1">
                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                  visibility === 'close_friends' ? 'border-[#EF4444]' : 'border-[#52525B]'
                }`}>
                  {visibility === 'close_friends' && (
                    <View className="w-3 h-3 rounded-full bg-[#EF4444]" />
                  )}
                </View>
                <Text className="text-white text-sm">Amis proches</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Options Section */}
          <View className="mb-6">
            <Text className="text-white text-base font-semibold mb-2">Options</Text>
            <View className="bg-[#161616] rounded-xl px-4 divide-y divide-[#27272A]">
              <Toggle
                label="Autoriser les participants étrangers"
                value={allowStrangers}
                onValueChange={setAllowStrangers}
              />
              <Toggle
                label="Commenter pour les participants"
                value={allowCommentsParticipants}
                onValueChange={setAllowCommentsParticipants}
              />
              <Toggle
                label="Afficher la liste des participants"
                value={showParticipantsList}
                onValueChange={setShowParticipantsList}
              />
              <Toggle
                label="Partager hors du groupe"
                value={allowShareOutside}
                onValueChange={setAllowShareOutside}
              />
              <Toggle
                label="Activer la liste d'attente"
                value={enableWaitlist}
                onValueChange={setEnableWaitlist}
              />
            </View>
          </View>

          {/* Participants Section */}
          <View className="mb-6">
            <Text className="text-white text-base font-semibold mb-3">Participants</Text>
            
            {/* Search */}
            <View className="bg-[#161616] rounded-xl px-4 py-3 flex-row items-center mb-4 border border-[#27272A]">
              <Icon library="ionicons" name="search" size={18} color="#A1A1AA" />
              <TextInput
                className="flex-1 text-white text-sm ml-2"
                placeholder="Rechercher un ami..."
                placeholderTextColor="#A1A1AA"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Participants List */}
            <View className="bg-[#161616] rounded-xl px-4">
              {(showAllParticipants ? mockParticipants : mockParticipants.slice(0, 3)).map((participant, index) => (
                <View key={participant.id}>
                  <ParticipantItem
                    {...participant}
                    isInvited={invitedUsers.includes(participant.id)}
                    onInviteToggle={() => handleInviteToggle(participant.id)}
                  />
                  {index < (showAllParticipants ? mockParticipants : mockParticipants.slice(0, 3)).length - 1 && (
                    <View className="h-px bg-[#27272A]" />
                  )}
                </View>
              ))}
            </View>

            {mockParticipants.length > 3 ? (
              <TouchableOpacity
                onPress={() => setShowAllParticipants((value) => !value)}
                className="mt-3"
                activeOpacity={0.7}
              >
                <Text className="text-[#EF4444] text-sm font-semibold text-center">
                  {showAllParticipants ? 'Voir moins' : 'Voir plus'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#27272A] px-4 py-4">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 bg-[#27272A] rounded-xl py-4 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white text-sm font-semibold">Annuler</Text>
          </TouchableOpacity>
          
          <View className="flex-1">
            <CTAButton
              title="Publier"
              variant="primary"
              onPress={handlePublish}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
