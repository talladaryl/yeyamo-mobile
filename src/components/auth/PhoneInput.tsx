import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  countryOptions?: { code: string; name: string }[];
}

export function PhoneInput({
  value,
  onChangeText,
  countryCode,
  onCountryCodeChange,
  label = 'Téléphone',
  error,
  placeholder = '6XX XX XX XX',
  disabled = false,
  countryOptions = [],
}: PhoneInputProps) {
  const colors = useThemeStore((state) => state.colors);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handlePhoneChange = (text: string) => {
    // Remove non-numeric characters except spaces
    const cleaned = text.replace(/[^\d\s]/g, '');
    onChangeText(cleaned);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-2 text-sm font-medium" style={{ color: colors.textSecondary }}>
          {label}
        </Text>
      )}
      
      <View className="flex-row">
        {/* Country Code Selector */}
        <TouchableOpacity
          onPress={() => setShowCountryPicker(!showCountryPicker)}
          disabled={disabled || countryOptions.length === 0}
          className="flex-row items-center rounded-l-xl border-2 border-r-0 px-3 py-3"
          style={{ backgroundColor: colors.elevated, borderColor: error ? colors.primary : colors.border }}
        >
          <View className="mr-1">
            <Icon name="globe-outline" size={16} color={colors.textMuted} />
          </View>
          <Text className="font-medium" style={{ color: colors.text }}>{countryCode}</Text>
          <View className="ml-1">
            <Icon name="chevron-down" size={14} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Phone Number Input */}
        <TextInput
          value={value}
          onChangeText={handlePhoneChange}
          placeholder={placeholder}
          keyboardType="phone-pad"
          editable={!disabled}
          className="flex-1 rounded-r-xl border-2 border-l-0 px-4 py-3 text-base"
          style={{ backgroundColor: colors.card, borderColor: error ? colors.primary : colors.border, color: colors.text }}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Simple Country Picker */}
      {showCountryPicker && (
        <View className="absolute left-0 right-0 top-16 z-10 rounded-xl border shadow-lg" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          {countryOptions.map((country) => (
            <TouchableOpacity
              key={country.code}
              onPress={() => {
                onCountryCodeChange(country.code);
                setShowCountryPicker(false);
              }}
              className="flex-row items-center border-b px-4 py-3 last:border-b-0"
              style={{ borderColor: colors.border }}
            >
              <View className="mr-3">
                <Icon name="globe-outline" size={16} color={colors.textMuted} />
              </View>
              <Text className="mr-2 font-medium" style={{ color: colors.text }}>{country.code}</Text>
              <Text className="flex-1" style={{ color: colors.textSecondary }}>{country.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error && (
        <Text className="text-red-500 text-sm mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
