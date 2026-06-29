import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Icon } from '@/components/ui/Icon';
import { CTAButton } from '@/components/ui/CTAButton';
import type { SearchFilters } from '@/features/explore/types';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

export type FilterBottomSheetHandle = {
  open: () => void;
  close: () => void;
};

type FilterBottomSheetProps = {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onApply: () => void;
};

export const FilterBottomSheet = forwardRef<FilterBottomSheetHandle, FilterBottomSheetProps>(
  ({ filters, onFiltersChange, onApply }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['90%'], []);

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#161616' }}
        handleIndicatorStyle={{ backgroundColor: '#52525B' }}
      >
        <ScrollView className="flex-1 px-4">
          {/* Header */}
          <View className="pb-4 border-b border-[#27272A]">
            <Text className="text-white text-xl font-bold">Filtres</Text>
          </View>

          {/* Catégorie */}
          <View className="py-4 border-b border-[#27272A]">
            <Text className="text-white font-semibold mb-3">Catégorie</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between py-3"
              activeOpacity={0.7}
            >
              <Text className="text-[#A1A1AA]">Toutes les catégories</Text>
              <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Région */}
          <View className="py-4 border-b border-[#27272A]">
            <Text className="text-white font-semibold mb-3">Région</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between py-3"
              activeOpacity={0.7}
            >
              <Text className="text-[#A1A1AA]">Toutes les régions</Text>
              <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Note minimale */}
          <View className="py-4 border-b border-[#27272A]">
            <Text className="text-white font-semibold mb-3">Note minimale</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between py-3"
              activeOpacity={0.7}
            >
              <Text className="text-[#A1A1AA]">Toutes</Text>
              <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Distance */}
          <View className="py-4 border-b border-[#27272A]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-semibold">Distance</Text>
              <Text className="text-[#A1A1AA] text-sm">Max : {filters.max_distance_km} km</Text>
            </View>
            {/* Slider placeholder - implement with @react-native-community/slider */}
            <View className="bg-[#27272A] h-1 rounded-full" />
          </View>

          {/* Trier les résultats */}
          <View className="py-4 border-b border-[#27272A]">
            <Text className="text-white font-semibold mb-3">Trier les résultats</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between py-3"
              activeOpacity={0.7}
            >
              <Text className="text-[#A1A1AA]">Pertinence</Text>
              <Icon library="ionicons" name="chevron-forward" size={20} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Date */}
          <View className="py-4 border-b border-[#27272A]">
            <Text className="text-white font-semibold mb-3">Date</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between bg-[#0A0A0A] rounded-xl px-4 py-3"
              activeOpacity={0.7}
            >
              <Text className="text-[#A1A1AA]">Choisir une date</Text>
              <Icon library="ionicons" name="calendar-outline" size={20} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* Prix */}
          <View className="py-4">
            <Text className="text-white font-semibold mb-3">Prix</Text>
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="text-[#A1A1AA] text-xs mb-2">Min</Text>
                <View className="bg-[#0A0A0A] rounded-xl px-4 py-3">
                  <Text className="text-white">{filters.min_price} XAF</Text>
                </View>
              </View>
              <Text className="text-[#A1A1AA] mt-6">—</Text>
              <View className="flex-1">
                <Text className="text-[#A1A1AA] text-xs mb-2">Max</Text>
                <View className="bg-[#0A0A0A] rounded-xl px-4 py-3">
                  <Text className="text-white">{filters.max_price} XAF</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Apply Button */}
          <View className="py-6">
            <CTAButton
              title="Voir les résultats"
              variant="primary"
              onPress={() => {
                onApply();
                bottomSheetRef.current?.close();
              }}
            />
          </View>

          <View className="h-10" />
        </ScrollView>
      </BottomSheet>
    );
  }
);

FilterBottomSheet.displayName = 'FilterBottomSheet';
