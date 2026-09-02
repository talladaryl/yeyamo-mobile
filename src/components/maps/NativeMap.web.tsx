import type { ReactNode } from 'react';
import { View } from 'react-native';

type FallbackProps = { children?: ReactNode; style?: object; className?: string; [key: string]: unknown };
const Fallback = ({ children, style, className }: FallbackProps) => <View className={className} style={style}>{children}</View>;

/** react-native-maps is native-only. This platform fallback keeps routes exportable on web. */
export const NativeMap = Fallback;
export const NativeMarker = Fallback;
export const NativePolyline = Fallback;
export const PROVIDER_GOOGLE = undefined;
export type NativeMapRef = { animateToRegion: (_region: unknown, _duration?: number) => void };
