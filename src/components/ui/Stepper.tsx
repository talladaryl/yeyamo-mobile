import { YeyamoFormProgress } from '@/components/forms/YeyamoFormProgress';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

/** @deprecated Use YeyamoFormProgress in new forms. Existing forms inherit the same visual system. */
export function Stepper({ currentStep, totalSteps }: StepperProps) {
  return <YeyamoFormProgress currentStep={currentStep} totalSteps={totalSteps} />;
}
