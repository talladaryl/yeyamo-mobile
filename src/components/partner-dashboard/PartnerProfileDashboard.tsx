import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';
import { recentActivities } from '@/features/partner-dashboard/mockData';

const QUICK_ACTIONS = [
  { label: 'Établissements', subtitle: 'Gérez vos lieux', icon: 'business-outline', route: '/(partner-dashboard)/establishments' },
  { label: 'Événements', subtitle: 'Créez et publiez', icon: 'calendar-outline', route: '/(partner-dashboard)/events' },
  { label: 'Réservations', subtitle: 'Suivez les demandes', icon: 'ticket-outline', route: '/(partner-dashboard)/reservations' },
  { label: 'Avis clients', subtitle: 'Répondez aux clients', icon: 'star-outline', route: '/(partner-dashboard)/reviews' },
] as const;

const BUSINESS_TOOLS = [
  { label: 'Publicité', subtitle: 'Développez votre audience', icon: 'megaphone-outline', route: '/(partner-dashboard)/campaigns' },
  { label: 'Promotions', subtitle: 'Animez vos offres', icon: 'pricetag-outline', route: '/(partner-dashboard)/promotions' },
  { label: 'Finances', subtitle: 'Suivez vos revenus', icon: 'wallet-outline', route: '/(partner-dashboard)/finance' },
  { label: 'Statistiques', subtitle: 'Analysez vos résultats', icon: 'stats-chart-outline', route: '/(partner-dashboard)/statistics' },
] as const;

const SECONDARY_ACTIONS = [
  { label: 'Mes billets', subtitle: 'Billets achetés', icon: 'ticket-outline', route: '/(profile)/tickets' },
  { label: 'Passeport YeYamo', subtitle: 'Badges et aventures', icon: 'airplane-outline', route: '/(social-graph)/passport' },
  { label: 'Notifications', subtitle: '3 nouvelles activités', icon: 'notifications-outline', route: '/(partner-dashboard)/notifications' },
  { label: 'Paramètres', subtitle: 'Compte professionnel', icon: 'settings-outline', route: '/(partner-dashboard)/settings' },
] as const;

type DashboardItem = {
  readonly label: string;
  readonly subtitle: string;
  readonly icon: string;
  readonly route: Href;
};

export function PartnerProfileDashboard() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between px-5 pb-4 pt-3">
          <View>
            <Text className="text-2xl font-extrabold" style={{ color: colors.text }}>Dashboard</Text>
            <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>Pilotez votre activité YeYamo</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(partner-dashboard)/notifications')} className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: colors.elevated }}>
            <Icon name="notifications-outline" size={23} color={colors.text} />
            <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#EF4444]" />
          </TouchableOpacity>
        </View>

        <View className="mx-5 flex-row items-center rounded-2xl border p-3" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300' }} style={{ width: 64, height: 64, borderRadius: 14 }} contentFit="cover" />
          <View className="ml-3 flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-base font-bold" style={{ color: colors.text }}>La Falaise Resort</Text>
              <Icon name="checkmark-circle" size={16} color="#16A34A" />
            </View>
            <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>Hôtel & Resort • Partenaire vérifié</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.textMuted} />
        </View>

        <View className="mx-5 mt-4 rounded-2xl bg-[#EF4444] p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-bold text-white">Aperçu aujourd’hui</Text>
            <Text className="text-xs text-white/80">Aujourd’hui⌄</Text>
          </View>
          <View className="flex-row">
            <Metric label="Vues" value="1 248" change="+12%" />
            <Metric label="Interactions" value="356" change="+8%" divided />
            <Metric label="Réservations" value="24" change="+15%" divided />
          </View>
        </View>

        <DashboardSection title="Accès rapides" items={QUICK_ACTIONS} />
        <DashboardSection title="Outils business" items={BUSINESS_TOOLS} />
        <DashboardSection title="Plus d’outils" items={SECONDARY_ACTIONS} />

        <SectionTitle title="Activité récente" />
        <View className="mx-5 overflow-hidden rounded-2xl border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          {recentActivities.map((activity, index) => (
            <View key={activity.id} className="flex-row items-center p-3.5" style={{ borderBottomWidth: index === recentActivities.length - 1 ? 0 : 1, borderColor: colors.border }}>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#FEE2E2]">
                <Icon name={activity.icon} size={19} color="#EF4444" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold" style={{ color: colors.text }}>{activity.title}</Text>
                <Text className="mt-0.5 text-xs" style={{ color: colors.textSecondary }}>{activity.subtitle}</Text>
              </View>
              <Icon name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

function DashboardSection({ title, items }: { title: string; items: readonly DashboardItem[] }) {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);

  return (
    <>
      <SectionTitle title={title} />
      <View className="mx-5 flex-row flex-wrap justify-between">
        {items.map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={() => router.push(item.route)}
            className="mb-3 w-[48.5%] rounded-2xl border p-3.5"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-[#FEE2E2]">
              <Icon name={item.icon} size={21} color="#EF4444" />
            </View>
            <Text className="text-sm font-bold" style={{ color: colors.text }}>{item.label}</Text>
            <Text className="mt-1 text-[11px]" style={{ color: colors.textSecondary }}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

function Metric({ label, value, change, divided = false }: { label: string; value: string; change: string; divided?: boolean }) {
  return (
    <View className={`flex-1 ${divided ? 'border-l border-white/25 pl-3' : ''}`}>
      <Text className="text-xs text-white/80">{label}</Text>
      <Text className="mt-1 text-xl font-extrabold text-white">{value}</Text>
      <Text className="mt-1 text-[10px] font-semibold text-white">↗ {change}</Text>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <Text className="mb-3 mt-6 px-5 text-base font-extrabold" style={{ color: colors.text }}>{title}</Text>;
}
