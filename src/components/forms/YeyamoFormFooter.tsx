import { View } from 'react-native';
import { Button } from '@/components/ui/Button';

type YeyamoFormFooterProps = {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  backLabel?: string;
  disabled?: boolean;
  loading?: boolean;
};

/** Shared, keyboard-safe action row for guided forms. */
export function YeyamoFormFooter({ onBack, onContinue, continueLabel = 'Continuer', backLabel = 'Retour', disabled, loading }: YeyamoFormFooterProps) {
  return <View className="flex-row gap-3 px-4 py-3">
    {onBack ? <View className="flex-1"><Button label={backLabel} variant="secondary" onPress={onBack} /></View> : null}
    <View className="flex-1"><Button label={continueLabel} onPress={onContinue} disabled={disabled} isLoading={loading} /></View>
  </View>;
}
