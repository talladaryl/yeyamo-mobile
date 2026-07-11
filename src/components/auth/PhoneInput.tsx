import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Icon } from '@/components/ui/Icon';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

const COUNTRIES = [
  { code: '+237', name: 'Cameroon' },
  { code: '+33', name: 'France' },
  { code: '+1', name: 'USA' },
];

export function PhoneInput({
  value,
  onChangeText,
  countryCode,
  onCountryCodeChange,
  label = 'Téléphone',
  error,
  placeholder = '6XX XX XX XX',
  disabled = false,
}: PhoneInputProps) {
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];

  const handlePhoneChange = (text: string) => {
    // Remove non-numeric characters except spaces
    const cleaned = text.replace(/[^\d\s]/g, '');
    onChangeText(cleaned);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-[#374151] text-sm font-medium mb-2">
          {label}
        </Text>
      )}
      
      <View className="flex-row">
        {/* Country Code Selector */}
        <TouchableOpacity
          onPress={() => setShowCountryPicker(!showCountryPicker)}
          disabled={disabled}
          className={`flex-row items-center px-3 py-3 border-2 border-r-0 rounded-l-xl ${
            error ? 'border-red-500' : 'border-[#E4E4E7]'
          } bg-[#F4F4F5]`}
        >
          <View className="mr-1">
            <Icon name="globe-outline" size={16} color="#71717A" />
          </View>
          <Text className="text-[#18181B] font-medium">{countryCode}</Text>
          <View className="ml-1">
            <Icon name="chevron-down" size={14} color="#A1A1AA" />
          </View>
        </TouchableOpacity>

        {/* Phone Number Input */}
        <TextInput
          value={value}
          onChangeText={handlePhoneChange}
          placeholder={placeholder}
          keyboardType="phone-pad"
          editable={!disabled}
          className={`flex-1 px-4 py-3 border-2 border-l-0 rounded-r-xl text-base ${
            error ? 'border-red-500' : 'border-[#E4E4E7]'
          } bg-white text-[#18181B]`}
          placeholderTextColor="#A1A1AA"
        />
      </View>

      {/* Simple Country Picker */}
      {showCountryPicker && (
        <View className="absolute top-16 left-0 right-0 z-10 bg-white border border-[#E4E4E7] rounded-xl shadow-lg">
          {COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country.code}
              onPress={() => {
                onCountryCodeChange(country.code);
                setShowCountryPicker(false);
              }}
              className="flex-row items-center px-4 py-3 border-b border-[#F4F4F5] last:border-b-0"
            >
              <View className="mr-3">
                <Icon name="globe-outline" size={16} color="#71717A" />
              </View>
              <Text className="text-[#18181B] font-medium mr-2">{country.code}</Text>
              <Text className="text-[#71717A] flex-1">{country.name}</Text>
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
