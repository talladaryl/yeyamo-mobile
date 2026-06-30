import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { Avatar } from '@/components/ui/Avatar';
import { useConversations } from '@/features/chat/useChat';

export default function ChatInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const conversationId = Number(id);

  const { data: conversations } = useConversations();
  const conversation = conversations?.find((c) => c.id === conversationId);

  if (!conversation) {
    return (
      <View className="flex-1 bg-[#0A0A0A] items-center justify-center">
        <Text className="text-[#A1A1AA]">Conversation introuvable</Text>
      </View>
    );
  }

  const isGroup = conversation.type === 'group';
  const isPartner = conversation.type === 'partner';
  const displayName = isGroup ? conversation.group_name : conversation.participant?.display_name;

  const handleBlock = () => {
    Alert.alert(
      'Bloquer ce partenaire',
      'Vous ne recevrez plus de messages de ce partenaire.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Bloquer', 
          style: 'destructive',
          onPress: () => {
            // TODO: API call
            console.log('Block partner');
          }
        },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert(
      'Signaler ce partenaire',
      'Voulez-vous signaler un comportement inapproprié ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Signaler', 
          style: 'destructive',
          onPress: () => {
            // TODO: API call
            console.log('Report partner');
          }
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer la conversation',
      'Cette action est irréversible. Tous les messages seront supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            // TODO: API call
            console.log('Delete conversation');
            router.back();
          }
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Infos conversation',
          headerTitleStyle: { fontSize: 18, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="ml-4">
              <Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Avatar & Name */}
        <View className="items-center py-6 border-b border-[#27272A]">
          {isGroup && conversation.participants.length > 1 ? (
            <View className="relative w-20 h-20 mb-3">
              <Avatar
                uri={conversation.participants[0]?.avatar_url}
                displayName={conversation.participants[0]?.display_name}
                size={56}
                className="absolute top-0 left-0"
              />
              <Avatar
                uri={conversation.participants[1]?.avatar_url}
                displayName={conversation.participants[1]?.display_name}
                size={56}
                className="absolute bottom-0 right-0 border-2 border-[#0A0A0A]"
              />
            </View>
          ) : (
            <Avatar
              uri={conversation.participant?.avatar_url}
              displayName={displayName || ''}
              size={80}
            />
          )}
          
          <Text className="text-white text-xl font-bold mt-3">{displayName}</Text>
          <Text className="text-[#A1A1AA] text-sm mt-1">
            {isGroup 
              ? `Groupe • ${conversation.participants.length} participants`
              : isPartner 
                ? 'Partenaire • En ligne'
                : 'En ligne'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-around py-6 px-4 border-b border-[#27272A]">
          <TouchableOpacity className="items-center">
            <View className="w-14 h-14 bg-[#27272A] rounded-full items-center justify-center mb-2">
              <Icon library="ionicons" name="call" size={24} color="#FFFFFF" />
            </View>
            <Text className="text-white text-xs">Audio</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <View className="w-14 h-14 bg-[#27272A] rounded-full items-center justify-center mb-2">
              <Icon library="ionicons" name="videocam" size={24} color="#FFFFFF" />
            </View>
            <Text className="text-white text-xs">Vidéo</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <View className="w-14 h-14 bg-[#27272A] rounded-full items-center justify-center mb-2">
              <Icon library="ionicons" name="search" size={24} color="#FFFFFF" />
            </View>
            <Text className="text-white text-xs">Rechercher</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <View className="w-14 h-14 bg-[#27272A] rounded-full items-center justify-center mb-2">
              <Icon library="ionicons" name="ellipsis-horizontal" size={24} color="#FFFFFF" />
            </View>
            <Text className="text-white text-xs">Plus</Text>
          </TouchableOpacity>
        </View>

        {/* Sections with chevrons */}
        <View className="py-2">
          <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center gap-3">
              <Icon library="ionicons" name="document-text-outline" size={22} color="#FFFFFF" />
              <View>
                <Text className="text-white text-sm font-medium">
                  Médias, liens et documents
                </Text>
                <Text className="text-[#A1A1AA] text-xs mt-0.5">2 éléments</Text>
              </View>
            </View>
            <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center gap-3">
              <Icon library="ionicons" name="pin-outline" size={22} color="#FFFFFF" />
              <Text className="text-white text-sm font-medium">Messages épinglés</Text>
            </View>
            <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center gap-3">
              <Icon library="ionicons" name="notifications-outline" size={22} color="#FFFFFF" />
              <View>
                <Text className="text-white text-sm font-medium">Notifications</Text>
                <Text className="text-[#A1A1AA] text-xs mt-0.5">Personnalisées</Text>
              </View>
            </View>
            <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
            <View className="flex-row items-center gap-3">
              <Icon library="ionicons" name="image-outline" size={22} color="#FFFFFF" />
              <Text className="text-white text-sm font-medium">Fond d'écran</Text>
            </View>
            <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
          </TouchableOpacity>
        </View>

        {/* Partner Info (only for partners) */}
        {isPartner && (
          <View className="mx-4 my-4 bg-[#161616] rounded-2xl p-4 border border-[#27272A]">
            <Text className="text-white text-sm font-semibold mb-3">
              Information du partenaire
            </Text>
            
            <View className="mb-3">
              <Text className="text-[#A1A1AA] text-xs mb-1">Catégorie</Text>
              <Text className="text-white text-sm">Hôtel & Resort</Text>
            </View>

            <View>
              <Text className="text-[#A1A1AA] text-xs mb-1">Adresse</Text>
              <Text className="text-white text-sm">Bonapriso, Douala, Littoral</Text>
            </View>
          </View>
        )}

        {/* Danger Actions */}
        {isPartner && (
          <View className="py-2 border-t border-[#27272A] mt-2">
            <TouchableOpacity
              onPress={handleBlock}
              className="flex-row items-center gap-3 px-4 py-4"
            >
              <Icon library="ionicons" name="ban-outline" size={22} color="#EF4444" />
              <Text className="text-[#EF4444] text-sm font-medium">
                Bloquer le partenaire
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReport}
              className="flex-row items-center gap-3 px-4 py-4"
            >
              <Icon library="ionicons" name="flag-outline" size={22} color="#EF4444" />
              <Text className="text-[#EF4444] text-sm font-medium">
                Signaler le partenaire
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Conversation */}
        <View className="py-2 border-t border-[#27272A]">
          <TouchableOpacity
            onPress={handleDelete}
            className="flex-row items-center gap-3 px-4 py-4"
          >
            <Icon library="ionicons" name="trash-outline" size={22} color="#EF4444" />
            <Text className="text-[#EF4444] text-sm font-medium">
              Supprimer la conversation
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
