import { Text, View } from 'react-native';
import { PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

export default function CampaignCreateScreen() {
  const colors = useThemeStore((state) => state.colors);
  return (
    <PartnerPage title="Créer une campagne" subtitle="Configurez votre prochaine publicité">
      <View className="mt-3 items-center rounded-2xl border px-6 py-10" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <Icon name="construct-outline" size={36} color="#EF4444" />
        <Text className="mt-4 text-center text-base font-extrabold" style={{ color: colors.text }}>Assistant de création à venir</Text>
        <Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>Le parcours de création sera connecté au contrat API Publicité.</Text>
      </View>
    </PartnerPage>
  );
}
