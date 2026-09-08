import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import Svg, { Path } from 'react-native-svg';

interface SocialButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  disabled?: boolean;
}

export function SocialButton({ provider, onPress, disabled = false }: SocialButtonProps) {
  const colors = useThemeStore((state) => state.colors);
  const getProviderDetails = () => {
    switch (provider) {
      case 'google':
        return {
          icon: null,
          text: 'Continuer avec Google',
          bgColor: colors.card,
          textColor: colors.text,
          borderColor: colors.border,
        };
      case 'apple':
        return {
          icon: 'logo-apple',
          text: 'Apple',
          bgColor: colors.card,
          textColor: colors.text,
          borderColor: colors.border,
        };
    }
  };

  const { icon, text, bgColor, textColor, borderColor } = getProviderDetails();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center py-3 px-4 rounded-xl border ${disabled ? 'opacity-50' : ''}`}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: 1,
      }}
    >
      <View className="mr-2">
        {provider === 'google' ? <GoogleMark /> : <Icon name={icon ?? 'logo-apple'} size={18} color={textColor} />}
      </View>
      <Text
        className="font-medium text-base"
        style={{ color: textColor }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

/** Official four-colour Google “G” brand mark, rendered locally without a remote asset. */
function GoogleMark() {
  return <Svg width={18} height={18} viewBox="0 0 18 18" accessibilityLabel="Google"><Path fill="#EA4335" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.483h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.909c1.703-1.568 2.683-3.876 2.683-6.617Z"/><Path fill="#4285F4" d="M9 18c2.43 0 4.467-.806 5.956-2.178l-2.909-2.258c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.037-3.71H.956v2.332A9 9 0 0 0 9 18Z"/><Path fill="#FBBC05" d="M3.963 10.714A5.41 5.41 0 0 1 3.681 9c0-.595.102-1.173.282-1.714V4.954H.956A9 9 0 0 0 0 9c0 1.453.348 2.83.956 4.046l3.007-2.332Z"/><Path fill="#34A853" d="M9 3.58c1.321 0 2.508.454 3.442 1.345l2.582-2.581C13.463.89 11.426 0 9 0a9 9 0 0 0-8.044 4.954l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58Z"/></Svg>;
}
