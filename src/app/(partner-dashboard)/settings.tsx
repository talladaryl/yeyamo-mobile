import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/Icon';
import { SettingsItem } from '@/components/partner-dashboard/SettingsItem';
import { settingsSections } from '@/features/partner-dashboard/mockData';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleItemPress = (itemId: string) => {
    console.log('Settings item pressed:', itemId);
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0A0A0A]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="px-4 pt-3 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Icon library="ionicons" name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text className="text-[#18181B] dark:text-white text-2xl font-bold">PARAMÈTRES</Text>
          <Text className="text-[#52525B] dark:text-[#A1A1AA] text-sm">Gérez votre compte et préférences</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-6">
            <Text className="text-[#18181B] dark:text-white font-semibold text-base mb-3">
              {section.title}
            </Text>
            {section.items.map((item) => (
              <SettingsItem
                key={item.id}
                item={item}
                onPress={() => handleItemPress(item.id)}
              />
            ))}
          </View>
        ))}

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
