import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';

interface OnboardingLayoutProps {
  children: React.ReactNode;
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
  nextButtonText = 'Suivant',
  showSkip = true,
  showProgress = true,
  backgroundColor = '#0A0A0A',
}: OnboardingLayoutProps) {
  const buttonLabel = currentStep >= totalSteps ? 'Commencer' : nextButtonText;

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <SafeAreaView className="flex-1">
        <View className="flex-row justify-between items-center px-6 py-4">
          <TouchableOpacity onPress={onPrevious} className="w-10 h-10 items-center justify-center" activeOpacity={0.7}>
            {currentStep > 1 ? <Icon name="arrow-back" size={20} color="#FFFFFF" /> : null}
          </TouchableOpacity>

          {showSkip ? (
            <TouchableOpacity onPress={onSkip} activeOpacity={0.7}>
              <Text className="text-[#A1A1AA] text-base">Passer</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {showProgress ? (
          <View className="flex-row justify-center items-center mb-8">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentStep - 1
                    ? 'bg-[#EF4444]'
                    : index < currentStep - 1
                      ? 'bg-[#EF4444]/60'
                      : 'bg-[#27272A]'
                }`}
              />
            ))}
          </View>
        ) : null}

        <View className="flex-1">{children}</View>

        {(title || onNext) ? (
          <View className="px-6 pb-8">
            {title ? (
              <View className="mb-8">
                <Text className="text-white text-2xl font-bold mb-2">{title}</Text>
                {subtitle ? <Text className="text-[#A1A1AA] text-base leading-6">{subtitle}</Text> : null}
              </View>
            ) : null}

            {onNext ? (
              <TouchableOpacity
                onPress={onNext}
                className="bg-[#EF4444] rounded-full py-4 px-6 flex-row items-center justify-center gap-2"
                style={{ minWidth: 150, height: 56, alignSelf: 'flex-end' }}
                activeOpacity={0.85}
              >
                <Text className="text-white text-base font-semibold">{buttonLabel}</Text>
                <Icon name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}
