import { useState, type ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { ToggleItem } from '@/components/settings/ToggleItem';
import { RadioItem } from '@/components/settings/RadioItem';
import { MOCK_USER_SETTINGS } from '@/features/settings/mockData';
import { useAuthStore } from '@/features/auth/auth.store';
import { useThemeStore } from '@/features/theme/theme.store';

export default function PrivacyScreen() {
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const isDemo = useAuthStore((state) => state.sessionMode?.startsWith('demo-') ?? false);
  const [settings, setSettings] = useState(() => isDemo ? MOCK_USER_SETTINGS.privacy : {
    account_visibility: 'public' as const,
    show_online_status: false,
    who_can_message: 'no_one' as const,
    who_can_see_posts: 'everyone' as const,
    who_can_tag_me: 'no_one' as const,
    show_location_in_posts: false,
    show_city_in_profile: false,
    show_in_search: true,
    show_in_suggestions: false,
  });

  return <SafeScreen>
    <Header title="Confidentialité" onBack={() => router.back()} />
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <PrivacySection title="Visibilité du compte"><Card><RadioItem label="Public" description="Tout le monde peut voir votre profil" selected={settings.account_visibility === 'public'} onPress={() => setSettings({ ...settings, account_visibility: 'public' })} showBorder={false} /><RadioItem label="Privé" description="Seuls vos abonnés peuvent voir vos publications" selected={settings.account_visibility === 'private'} onPress={() => setSettings({ ...settings, account_visibility: 'private' })} /><RadioItem label="Amis uniquement" description="Seuls vos amis peuvent voir votre profil" selected={settings.account_visibility === 'friends_only'} onPress={() => setSettings({ ...settings, account_visibility: 'friends_only' })} /></Card><Card className="mt-3"><ToggleItem label="Afficher mon statut en ligne" description="Les autres peuvent voir si vous êtes en ligne" value={settings.show_online_status} onValueChange={(value) => setSettings({ ...settings, show_online_status: value })} showBorder={false} /></Card></PrivacySection>
      <PrivacySection title="Interactions"><Question title="Qui peut m’envoyer des messages"><RadioItem label="Tout le monde" selected={settings.who_can_message === 'everyone'} onPress={() => setSettings({ ...settings, who_can_message: 'everyone' })} showBorder={false} /><RadioItem label="Mes amis" selected={settings.who_can_message === 'friends'} onPress={() => setSettings({ ...settings, who_can_message: 'friends' })} /><RadioItem label="Personne" selected={settings.who_can_message === 'no_one'} onPress={() => setSettings({ ...settings, who_can_message: 'no_one' })} /></Question><Question title="Qui peut voir mes publications"><RadioItem label="Tout le monde" selected={settings.who_can_see_posts === 'everyone'} onPress={() => setSettings({ ...settings, who_can_see_posts: 'everyone' })} showBorder={false} /><RadioItem label="Mes amis" selected={settings.who_can_see_posts === 'friends'} onPress={() => setSettings({ ...settings, who_can_see_posts: 'friends' })} /><RadioItem label="Personne" selected={settings.who_can_see_posts === 'no_one'} onPress={() => setSettings({ ...settings, who_can_see_posts: 'no_one' })} /></Question><Question title="Qui peut me taguer dans les publications"><RadioItem label="Tout le monde" selected={settings.who_can_tag_me === 'everyone'} onPress={() => setSettings({ ...settings, who_can_tag_me: 'everyone' })} showBorder={false} /><RadioItem label="Mes amis" selected={settings.who_can_tag_me === 'friends'} onPress={() => setSettings({ ...settings, who_can_tag_me: 'friends' })} /><RadioItem label="Personne" selected={settings.who_can_tag_me === 'no_one'} onPress={() => setSettings({ ...settings, who_can_tag_me: 'no_one' })} /></Question></PrivacySection>
      <PrivacySection title="Localisation"><Card><ToggleItem label="Afficher ma ville sur mon profil" value={settings.show_city_in_profile} onValueChange={(value) => setSettings({ ...settings, show_city_in_profile: value })} showBorder={false} /><ToggleItem label="Inclure ma localisation dans les publications" value={settings.show_location_in_posts} onValueChange={(value) => setSettings({ ...settings, show_location_in_posts: value })} /><ToggleItem label="Apparaître dans les recherches" value={settings.show_in_search} onValueChange={(value) => setSettings({ ...settings, show_in_search: value })} /><ToggleItem label="Apparaître dans les suggestions" value={settings.show_in_suggestions} onValueChange={(value) => setSettings({ ...settings, show_in_suggestions: value })} /></Card></PrivacySection>
    </ScrollView>
  </SafeScreen>;
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="flex-row items-center border-b px-4 py-3" style={{ borderColor: colors.border }}><TouchableOpacity onPress={onBack} className="-ml-2 p-2" accessibilityRole="button" accessibilityLabel="Retour"><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity><Text className="ml-2 text-xl font-bold" style={{ color: colors.text }}>{title}</Text></View>;
}

function PrivacySection({ title, children }: { title: string; children: ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className="mt-6 px-4"><Text className="mb-3 text-xs font-semibold uppercase" style={{ color: colors.textSecondary }}>{title}</Text>{children}</View>;
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  const colors = useThemeStore((state) => state.colors);
  return <View className={`overflow-hidden rounded-xl ${className}`} style={{ backgroundColor: colors.surface }}>{children}</View>;
}

function Question({ title, children }: { title: string; children: ReactNode }) {
  const colors = useThemeStore((state) => state.colors);
  return <Card className="mb-3"><Text className="px-4 pb-2 pt-3 text-sm font-medium" style={{ color: colors.text }}>{title}</Text>{children}</Card>;
}
