import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/ui/Icon';

interface ParticipantItemProps {
  id: string;
  name: string;
  avatar_url: string | null;
  isInvited: boolean;
  onInviteToggle: () => void;
}

export function ParticipantItem({
  name,
  avatar_url,
  isInvited,
  onInviteToggle,
}: ParticipantItemProps) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center flex-1">
        {avatar_url ? (
          <Image
            source={{ uri: avatar_url }}
            style={{ width: 40, height: 40 }}
            className="rounded-full mr-3"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-[#F4F4F5] dark:bg-[#27272A] items-center justify-center mr-3">
            <Icon library="ionicons" name="person" size={20} color="#A1A1AA" />
          </View>
        )}
        <Text className="text-[#18181B] dark:text-white text-sm font-medium">{name}</Text>
      </View>
      
      <TouchableOpacity
        onPress={onInviteToggle}
        className={`px-4 py-2 rounded-full ${
          isInvited ? 'bg-[#F4F4F5] dark:bg-[#27272A]' : 'bg-[#EF4444]'
        }`}
        activeOpacity={0.7}
      >
        <Text className={`text-xs font-semibold ${isInvited ? 'text-[#18181B] dark:text-white' : 'text-white'}`}>
          {isInvited ? 'Invité' : 'Inviter'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
