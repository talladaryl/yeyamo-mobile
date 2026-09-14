import type { ReactNode } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

type YeyamoModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** Shared keyboard-safe sheet foundation for selectors and simple dialogs. */
export function YeyamoModal({ visible, onClose, title, children }: YeyamoModalProps) {
  const colors = useThemeStore((state) => state.colors);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0" style={{ backgroundColor: colors.overlay }} onPress={onClose} accessibilityLabel="Fermer" />
        <View className="max-h-[70%] rounded-t-[28px] border-t px-4 pb-8 pt-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="mb-4 h-1 w-10 self-center rounded-full" style={{ backgroundColor: colors.textMuted }} />
          <View className="mb-3 flex-row items-center">
            <Text className="flex-1 text-xl font-extrabold" style={{ color: colors.text }}>{title}</Text>
            <TouchableOpacity onPress={onClose} className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }} accessibilityRole="button" accessibilityLabel="Fermer">
              <Icon name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
