import React from 'react';
import { View, Image } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'light' | 'dark' | 'color';
}

const SIZES = {
  small: 32,
  medium: 48,
  large: 80,
  xlarge: 128,
};

export function Logo({ size = 'medium', variant = 'color' }: LogoProps) {
  const logoSize = SIZES[size];

  return (
    <View 
      className="items-center justify-center"
      style={{ width: logoSize, height: logoSize }}
    >
      <Image
        source={require('../../../assets/logo.png')}
        style={{ 
          width: logoSize, 
          height: logoSize,
          resizeMode: 'contain'
        }}
      />
    </View>
  );
}