import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const { width } = Dimensions.get('window');

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
  backgroundColor = '#0A0A0A'
}: OnboardingLayoutProps) {
  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <SafeAreaView className="flex-1">
        {/* Header avec Skip */}
        <View className="flex-row justify-between items-center px-6 py-4">
          <TouchableOpacity onPress={onPrevious} className="w-8 h-8 items-center justify-center">
            {currentStep > 1 && (
              <Text className="text-white text-lg">←</Text>
            )}
          </TouchableOpacity>
          
          {showSkip && (
            <TouchableOpacity onPress={onSkip}>
              <Text className="text-[#A1A1AA] text-base">Passer</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress dots */}
        {showProgress && (
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
        )}

        {/* Content */}
        <View className="flex-1">
          {children}
        </View>

        {/* Bottom section avec titre et bouton */}
        {(title || onNext) && (
          <View className="px-6 pb-8">
            {title && (
              <View className="mb-8">
                <Text className="text-white text-2xl font-bold mb-2">
                  {title}
                </Text>
                {subtitle && (
                  <Text className="text-[#A1A1AA] text-base leading-6">
                    {subtitle}
                  </Text>
                )}
              </View>
            )}
            
            {onNext && (
              <TouchableOpacity
                onPress={onNext}
                className="bg-[#EF4444] rounded-full py-4 px-8 items-center justify-center"
                style={{ width: 72, height: 72, alignSelf: 'flex-end' }}
              >
                <Text className="text-white text-lg font-semibold">→</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}