import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IconLibrary = 'ionicons' | 'material' | 'material-community' | 'feather';

type IconProps = {
  library?: IconLibrary;
  name: string;
  size?: number;
  color?: string;
};

const iconLibraries = {
  ionicons: Ionicons,
  material: MaterialIcons,
  'material-community': MaterialCommunityIcons,
  feather: Feather,
};

export function Icon({ library = 'ionicons', name, size = 24, color = '#FFFFFF' }: IconProps) {
  const IconComponent = iconLibraries[library];
  return <IconComponent name={name as any} size={size} color={color} />;
}
