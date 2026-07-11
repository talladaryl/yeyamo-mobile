import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Icon } from '@/components/ui/Icon';

interface SocialButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  disabled?: boolean;
}

export function SocialButton({ provider, onPress, disabled = false }: SocialButtonProps) {
  const getProviderDetails = () => {
    switch (provider) {
      case 'google':
        return {
          icon: 'logo-google',
          text: 'Google',
          bgColor: '#FFFFFF',
          textColor: '#1F1F1F',
          borderColor: '#E4E4E7'
        };
      case 'apple':
        return {
          icon: 'logo-apple',
          text: 'Apple',
          bgColor: '#000000',
          textColor: '#FFFFFF',
          borderColor: '#000000'
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
