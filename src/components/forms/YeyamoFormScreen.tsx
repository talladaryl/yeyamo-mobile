import { useEffect, type ReactNode, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const [iosKeyboardHeight, setIosKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const subscription = Keyboard.addListener('keyboardWillChangeFrame', (event) => {
      setIosKeyboardHeight(event.endCoordinates.height);
    });
    return () => subscription.remove();
  }, []);

  // SafeAreaView already reserves the home-indicator area. Remove that part
  // from the keyboard frame so the sticky action sits exactly above iOS keys.
  const footerKeyboardOffset = Platform.OS === 'ios'
    ? Math.max(0, iosKeyboardHeight - insets.bottom)
    : 0;
  const content = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerStyle={[{ flexGrow: 1, paddingBottom: footer ? 32 : 32 }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      // iOS has no dedicated keyboard-dismiss key. Interactive dismissal makes
      // a downward scroll close it while leaving the footer pressable.
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      keyboardShouldPersistTaps="always"
    >
      {children}
    </ScrollView>
  ) : <View className="flex-1">{children}</View>;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'android' ? 'height' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <SafeAreaView edges={['bottom']} className="flex-1" style={[{ backgroundColor: colors.background }, style]}>
        {content}
        {footer ? <View style={{ backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1, marginBottom: footerKeyboardOffset }}>{footer}</View> : null}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
