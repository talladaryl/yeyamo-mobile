import type { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';

interface OnboardingLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  currentStep?: number;
  totalSteps?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  nextButtonText?: string;
  showSkip?: boolean;
  showProgress?: boolean;
  backgroundColor?: string;
}

export function OnboardingLayout({
  children,
  title,
  subtitle,
  currentStep = 1,
  totalSteps = 4,
  onNext,
  onPrevious,
  onSkip,
  nextButtonText,
  showSkip = true,
  showProgress = true,
  backgroundColor = '#FFFFFF',
}: OnboardingLayoutProps) {
  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="h-14 flex-row items-center justify-between px-5">
          <TouchableOpacity
            onPress={onPrevious}
            disabled={currentStep === 1}
            className="h-10 w-10 items-center justify-center rounded-full"
            activeOpacity={0.75}
          >
            {currentStep > 1 ? <Icon name="chevron-back" size={24} color="#18181B" /> : null}
          </TouchableOpacity>
          {showSkip ? (
            <TouchableOpacity onPress={onSkip} className="rounded-full bg-white/90 px-4 py-2" activeOpacity={0.75}>
              <Text className="text-sm font-semibold text-[#52525B]">Passer</Text>
            </TouchableOpacity>
          ) : <View className="w-10" />}
        </View>

        <View className="flex-1">{children}</View>

        <View className="rounded-t-[32px] bg-white px-6 pb-3 pt-6">
          {title ? (
            <>
              <Text className="text-[28px] font-extrabold leading-8 text-[#18181B]">{title}</Text>
              {subtitle ? <Text className="mt-3 text-[15px] leading-6 text-[#52525B]">{subtitle}</Text> : null}
            </>
          ) : null}

          <View className="mt-6 flex-row items-center justify-between">
            {showProgress ? (
              <View className="flex-row items-center gap-2">
                {Array.from({ length: totalSteps }).map((_, index) => {
                  const active = index === currentStep - 1;
                  return (
                    <View
                      key={index}
                      className="h-2 rounded-full"
                      style={{ width: active ? 24 : 8, backgroundColor: active ? '#EF4444' : '#D4D4D8' }}
                    />
                  );
                })}
              </View>
            ) : <View />}

            {onNext ? (
              <TouchableOpacity
                onPress={onNext}
                className="h-14 min-w-14 flex-row items-center justify-center rounded-full bg-[#EF4444] px-5"
                activeOpacity={0.85}
                accessibilityLabel={nextButtonText ?? 'Continuer'}
              >
                {nextButtonText ? <Text className="mr-2 font-bold text-white">{nextButtonText}</Text> : null}
                <Icon name="arrow-forward" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
