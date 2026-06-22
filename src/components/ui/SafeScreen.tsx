import { SafeAreaView } from 'react-native';
import { cssInterop } from 'nativewind';

// Make SafeAreaView NativeWind-compatible
cssInterop(SafeAreaView, { className: 'style' });

interface SafeScreenProps {
  children: React.ReactNode;
  className?: string;
}

export function SafeScreen({ children, className = '' }: SafeScreenProps) {
  return (
    <SafeAreaView className={`flex-1 bg-[#0A0A0A] ${className}`}>
      {children}
    </SafeAreaView>
  );
}
