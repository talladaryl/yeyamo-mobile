import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text } from 'react-native';
import { useThemeStore } from '@/features/theme/theme.store';

interface CodeInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
}

export function CodeInput({ 
  length = 6, 
  value, 
  onChangeText, 
  error,
  disabled = false 
}: CodeInputProps) {
  const colors = useThemeStore((state) => state.colors);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const inputRefs = useRef<(TextInput | null)[]>(Array(length).fill(null));

  const handleTextChange = (text: string, index: number) => {
    // Remove non-numeric characters
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length <= 1) {
      const newValue = value.split('');
      newValue[index] = numericText;
      const updatedValue = newValue.join('').slice(0, length);
      onChangeText(updatedValue);

      // Auto-focus next input
      if (numericText && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="items-center">
      <View className="flex-row gap-3 mb-2">
        {Array.from({ length }, (_, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={value[index] || ''}
            onChangeText={(text) => handleTextChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(-1)}
            keyboardType="numeric"
            maxLength={1}
            editable={!disabled}
            className="h-14 w-12 rounded-xl border-2 text-center text-xl font-bold"
            style={{
              color: colors.text,
              backgroundColor: error ? '#FEF2F2' : focusedIndex === index ? colors.card : colors.elevated,
              borderColor: error ? colors.primary : focusedIndex === index ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
      {error && (
        <Text className="text-red-500 text-sm text-center mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
