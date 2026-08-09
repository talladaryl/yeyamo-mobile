import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Input } from '@/components/ui/Input';
import { CTAButton } from '@/components/ui/CTAButton';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import type { Region } from '@/features/explore/types';
import type { CultureLanguage } from '@/features/culture/culture.types';
import { i18n } from '@/i18n';

export type ExploreAdvancedFilters = {
  countryCode?: string;
  regionCode?: string;
  cityId?: string;
  distanceKm?: number;
  type?: string;
  categoryCode?: string;
  languageCode?: string;
  cultureType?: string;
  availability?: boolean;
  verified?: boolean;
  availableForSale?: boolean;
};

export type ExploreAdvancedFiltersSheetHandle = {
  open: () => void;
  close: () => void;
};

type Props = {
  filters: ExploreAdvancedFilters;
  regions: Region[];
  languages: CultureLanguage[];
  onChange: (filters: ExploreAdvancedFilters) => void;
  onReset: () => void;
  onApply: () => void;
};

export const ExploreAdvancedFiltersSheet = forwardRef<ExploreAdvancedFiltersSheetHandle, Props>(
  ({ filters, regions, languages, onChange, onReset, onApply }, ref) => {
    const colors = useThemeStore((state) => state.colors);
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['78%', '92%'], []);
    const update = (patch: Partial<ExploreAdvancedFilters>) => onChange({ ...filters, ...patch });
    const renderBackdrop = (props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.38} pressBehavior="close" />;

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.snapToIndex(0),
      close: () => sheetRef.current?.close(),
    }));

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}
        handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-extrabold" style={{ color: colors.text }}>{i18n.t('explore.advanced.title')}</Text>
              <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>{i18n.t('explore.advanced.subtitle')}</Text>
            </View>
            <TouchableOpacity onPress={onReset} className="h-11 items-center justify-center rounded-xl px-3" accessibilityRole="button" accessibilityLabel={i18n.t('explore.advanced.reset')}>
              <Text className="text-xs font-bold" style={{ color: colors.primary }}>{i18n.t('explore.advanced.reset')}</Text>
            </TouchableOpacity>
          </View>

          <Input label={i18n.t('explore.advanced.country')} value={filters.countryCode ?? ''} onChangeText={(value) => update({ countryCode: value.toUpperCase() || undefined })} placeholder={i18n.t('explore.advanced.countryPlaceholder')} maxLength={2} autoCapitalize="characters" />
          <View className="mt-4">
            <Text className="mb-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>{i18n.t('explore.advanced.region')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              <Choice label={i18n.t('explore.advanced.allRegions')} selected={!filters.regionCode} onPress={() => update({ regionCode: undefined })} />
              {regions.map((region) => <Choice key={region.id} label={region.name} selected={filters.regionCode === (region.code ?? String(region.id))} onPress={() => update({ regionCode: region.code ?? String(region.id) })} />)}
            </ScrollView>
          </View>

          <View className="mt-4">
            <Input label={i18n.t('explore.advanced.city')} value={filters.cityId ?? ''} onChangeText={(value) => update({ cityId: value || undefined })} placeholder={i18n.t('explore.advanced.cityPlaceholder')} />
          </View>
          <View className="mt-4">
            <Input label={i18n.t('explore.advanced.distance')} value={filters.distanceKm ? String(filters.distanceKm) : ''} onChangeText={(value) => update({ distanceKm: Number(value.replace(/[^0-9]/g, '')) || undefined })} placeholder={i18n.t('explore.advanced.distancePlaceholder')} keyboardType="number-pad" />
          </View>

          <SectionTitle title={i18n.t('explore.advanced.typeAndCategory')} />
          <View className="flex-row flex-wrap gap-2">
            {['PLACE', 'EVENT', 'EXPERIENCE', 'CULTURE', 'ARTWORK', 'ARTISAN'].map((type) => <Choice key={type} label={i18n.t(`explore.types.${type.toLowerCase()}`)} selected={filters.type === type} onPress={() => update({ type: filters.type === type ? undefined : type })} />)}
          </View>
          <View className="mt-3">
            <Input label={i18n.t('explore.advanced.categoryCode')} value={filters.categoryCode ?? ''} onChangeText={(value) => update({ categoryCode: value || undefined })} placeholder={i18n.t('explore.advanced.categoryCodePlaceholder')} autoCapitalize="characters" />
          </View>

          <SectionTitle title={i18n.t('explore.advanced.languageAndCulture')} />
          <View className="flex-row flex-wrap gap-2">
            <Choice label={i18n.t('explore.advanced.allLanguages')} selected={!filters.languageCode} onPress={() => update({ languageCode: undefined })} />
            {languages.slice(0, 12).map((language) => <Choice key={language.code} label={language.nativeName || language.name} selected={filters.languageCode === language.code} onPress={() => update({ languageCode: filters.languageCode === language.code ? undefined : language.code })} />)}
          </View>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {['STORY', 'TRADITION', 'EXPRESSION', 'PROVERB'].map((cultureType) => <Choice key={cultureType} label={cultureType} selected={filters.cultureType === cultureType} onPress={() => update({ cultureType: filters.cultureType === cultureType ? undefined : cultureType })} />)}
          </View>

          <SectionTitle title={i18n.t('explore.advanced.availability')} />
          <ToggleChoice label={i18n.t('explore.advanced.availableNow')} icon="time-outline" selected={Boolean(filters.availability)} onPress={() => update({ availability: !filters.availability })} />
          <ToggleChoice label={i18n.t('explore.advanced.verified')} icon="checkmark-circle-outline" selected={Boolean(filters.verified)} onPress={() => update({ verified: !filters.verified })} />
          <ToggleChoice label={i18n.t('explore.advanced.forSale')} icon="pricetag-outline" selected={Boolean(filters.availableForSale)} onPress={() => update({ availableForSale: !filters.availableForSale })} />

          <View className="mt-6">
            <CTAButton title={i18n.t('explore.advanced.apply')} onPress={() => { onApply(); sheetRef.current?.close(); }} />
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  },
);

ExploreAdvancedFiltersSheet.displayName = 'ExploreAdvancedFiltersSheet';

function SectionTitle({ title }: { title: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <Text className="mb-2 mt-5 text-sm font-extrabold" style={{ color: colors.text }}>{title}</Text>;
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="rounded-xl border px-3 py-2" style={{ backgroundColor: selected ? `${colors.primary}14` : 'transparent', borderColor: selected ? colors.primary : colors.border }} accessibilityRole="button" accessibilityState={{ selected }}><Text className="text-xs font-semibold" style={{ color: selected ? colors.primary : colors.textSecondary }}>{label}</Text></TouchableOpacity>;
}

function ToggleChoice({ label, icon, selected, onPress }: { label: string; icon: string; selected: boolean; onPress: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <TouchableOpacity onPress={onPress} className="mb-2 min-h-11 flex-row items-center rounded-xl border px-3" style={{ backgroundColor: selected ? `${colors.primary}12` : 'transparent', borderColor: selected ? colors.primary : colors.border }} accessibilityRole="checkbox" accessibilityState={{ checked: selected }}><Icon name={icon} size={18} color={selected ? colors.primary : colors.textSecondary} /><Text className="ml-2 flex-1 text-sm font-semibold" style={{ color: selected ? colors.primary : colors.text }}>{label}</Text>{selected ? <Icon name="checkmark-circle" size={19} color={colors.primary} /> : null}</TouchableOpacity>;
}
