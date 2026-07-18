import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import type { Attachment } from '@/features/chat/types';

interface MessageAttachmentProps {
  attachment: Attachment;
  onPress?: () => void;
}

export function MessageAttachment({ attachment, onPress }: MessageAttachmentProps) {
  const colors = useThemeStore((state) => state.colors);
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
      className="rounded-xl border p-3 flex-row items-center gap-3"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-lg items-center justify-center" style={{ backgroundColor: colors.elevated }}>
        <Icon library="ionicons" name={getIcon()} size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium" style={{ color: colors.text }} numberOfLines={1}>
          {attachment.name}
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
          {formatSize(attachment.size)} • {attachment.type.toUpperCase()}
        </Text>
      </View>
      <Icon library="ionicons" name="download-outline" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}
