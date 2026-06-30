import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import type { Attachment } from '@/features/chat/types';

interface MessageAttachmentProps {
  attachment: Attachment;
  onPress?: () => void;
}

export function MessageAttachment({ attachment, onPress }: MessageAttachmentProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getIcon = () => {
    switch (attachment.type) {
      case 'pdf':
        return 'document-text';
      case 'image':
        return 'image';
      case 'video':
        return 'videocam';
      default:
        return 'document';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-[#1F1F1F] rounded-xl p-3 flex-row items-center gap-3 border border-[#27272A]"
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 bg-[#27272A] rounded-lg items-center justify-center">
        <Icon library="ionicons" name={getIcon()} size={20} color="#EF4444" />
      </View>
      <View className="flex-1">
        <Text className="text-white text-sm font-medium" numberOfLines={1}>
          {attachment.name}
        </Text>
        <Text className="text-[#A1A1AA] text-xs mt-0.5">
          {formatSize(attachment.size)} • {attachment.type.toUpperCase()}
        </Text>
      </View>
      <Icon library="ionicons" name="download-outline" size={20} color="#A1A1AA" />
    </TouchableOpacity>
  );
}
