import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/features/theme/theme.store';

type YeyamoFormScreenProps = {
  children: ReactNode;
  footer?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
  scroll?: boolean;
};

/** Stable keyboard-safe shell used by authenticated screens with a Stack header. */
export function YeyamoFormScreen({
  children,
  footer,
  contentContainerStyle,
  style,
  keyboardVerticalOffset = 0,
  scroll = true,
}: YeyamoFormScreenProps) {
  const colors = useThemeStore((state) => state.colors);
  const content = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerStyle={[{ paddingBottom: footer ? 24 : 32 }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="none"
      keyboardShouldPersistTaps="always"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
    >
      {children}
    </ScrollView>
  ) : <View className="flex-1">{children}</View>;

  return (
    <SafeAreaView edges={['bottom']} className="flex-1" style={[{ backgroundColor: colors.background }, style]}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={keyboardVerticalOffset}>
        {content}
        {footer ? <View style={{ backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1 }}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
