import { Text, View } from 'react-native';
import { PartnerPage } from '@/components/partner-dashboard/PartnerPage';
import { Icon } from '@/components/ui/Icon';
import { useThemeStore } from '@/features/theme/theme.store';

export function TicketingPageState({ title, eventName, icon, description }: { title: string; eventName: string; icon: string; description: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <PartnerPage title={title} subtitle={eventName}><View className="mt-3 items-center rounded-2xl border px-6 py-10" style={{ backgroundColor: colors.card, borderColor: colors.border }}><Icon name={icon} size={36} color="#EF4444" /><Text className="mt-4 text-center text-base font-extrabold" style={{ color: colors.text }}>{title}</Text><Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>{description}</Text></View></PartnerPage>;
}
