import { View, Text } from 'react-native';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

export function Stepper({ currentStep, totalSteps }: StepperProps) {
  return (
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-white text-sm font-medium">
        Étape {currentStep} sur {totalSteps}
      </Text>
      
      <View className="flex-row gap-1">
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            className={`h-1 rounded-full ${
              i < currentStep ? 'bg-[#EF4444]' : 'bg-[#27272A]'
            }`}
            style={{ width: 24 }}
          />
        ))}
      </View>
    </View>
  );
}
