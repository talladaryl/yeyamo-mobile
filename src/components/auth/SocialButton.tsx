import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

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
          icon: 'logo-google',
          text: 'Google',
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
        <Icon name={icon} size={18} color={textColor} />
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
