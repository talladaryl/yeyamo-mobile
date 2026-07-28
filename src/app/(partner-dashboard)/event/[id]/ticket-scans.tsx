import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useScanTicket } from '@/features/ticketing/useTicketing';
import { useThemeStore } from '@/features/theme/theme.store';
import type { ScanResult } from '@/features/ticketing/types';
import { normalizeApiError } from '@/services/api/errors';

type UiScanResult = ScanResult | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'STAFF_FORBIDDEN';
const SCAN_RESET_DELAY_MS = 1800;
const RESULT: Record<UiScanResult, { title: string; color: string; icon: string; feedback: Haptics.NotificationFeedbackType }> = {
  VALID: { title: 'Billet valide', color: '#22C55E', icon: 'checkmark-circle', feedback: Haptics.NotificationFeedbackType.Success },
  ALREADY_USED: { title: 'Déjà utilisé', color: '#F59E0B', icon: 'warning', feedback: Haptics.NotificationFeedbackType.Warning },
  INVALID: { title: 'Billet invalide', color: '#EF4444', icon: 'close-circle', feedback: Haptics.NotificationFeedbackType.Error },
  EXPIRED: { title: 'Billet expiré', color: '#EF4444', icon: 'time', feedback: Haptics.NotificationFeedbackType.Error },
  CANCELLED: { title: 'Billet annulé', color: '#EF4444', icon: 'ban', feedback: Haptics.NotificationFeedbackType.Error },
  REFUNDED: { title: 'Billet remboursé', color: '#EF4444', icon: 'return-down-back', feedback: Haptics.NotificationFeedbackType.Error },
  WRONG_EVENT: { title: 'Billet d’un autre événement', color: '#EF4444', icon: 'swap-horizontal', feedback: Haptics.NotificationFeedbackType.Error },
  WRONG_GATE: { title: 'Mauvaise porte d’accès', color: '#F59E0B', icon: 'enter-outline', feedback: Haptics.NotificationFeedbackType.Warning },
  NOT_YET_VALID: { title: 'Billet pas encore valide', color: '#F59E0B', icon: 'hourglass-outline', feedback: Haptics.NotificationFeedbackType.Warning },
  ACCESS_DENIED: { title: 'Accès refusé', color: '#EF4444', icon: 'shield-outline', feedback: Haptics.NotificationFeedbackType.Error },
  NETWORK_ERROR: { title: 'Connexion indisponible', color: '#EF4444', icon: 'cloud-offline', feedback: Haptics.NotificationFeedbackType.Error },
  SERVER_ERROR: { title: 'Service de validation indisponible', color: '#EF4444', icon: 'server-outline', feedback: Haptics.NotificationFeedbackType.Error },
  STAFF_FORBIDDEN: { title: 'Accès staff non autorisé', color: '#EF4444', icon: 'shield-outline', feedback: Haptics.NotificationFeedbackType.Error },
};

export default function TicketScansScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const eventId = Array.isArray(params.id) ? params.id[0] ?? '' : params.id ?? '';
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [permission, requestPermission] = useCameraPermissions();
  const requestedPermission = useRef(false);
  const scan = useScanTicket();
  const [torch, setTorch] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<UiScanResult | null>(null);
  const [history, setHistory] = useState<UiScanResult[]>([]);
  const [gate, setGate] = useState('Porte principale');
  const [checkedInCount, setCheckedInCount] = useState(0);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain && !requestedPermission.current) {
      requestedPermission.current = true;
      void requestPermission();
    }
  }, [permission, requestPermission]);

  const handleScan = async ({ data }: BarcodeScanningResult) => {
    if (blocked || scan.isPending || !eventId) return;
    setBlocked(true);
    let code: UiScanResult;
    try {
      const response = await scan.mutateAsync({
        qrToken: data,
        eventId,
        gateId: gate,
        deviceId: 'expo-camera',
        clientScanReference: uuidv4(),
        scannedAtClient: new Date().toISOString(),
      });
      code = response.result;
      if (code === 'VALID') setCheckedInCount((count) => count + 1);
    } catch (error) {
      const apiError = normalizeApiError(error);
      if (!apiError.status) code = 'NETWORK_ERROR';
      else if (apiError.status === 403) code = 'STAFF_FORBIDDEN';
      else if (apiError.status === 409 && apiError.code && apiError.code in RESULT) code = apiError.code as ScanResult;
      else code = 'SERVER_ERROR';
    }
    void Haptics.notificationAsync(RESULT[code].feedback);
    setResult(code);
    setHistory((items) => [code, ...items].slice(0, 20));
    setTimeout(() => { setResult(null); setBlocked(false); }, SCAN_RESET_DELAY_MS);
  };

  const changeGate = () => Alert.alert('Changer de porte', undefined, [
    { text: 'Porte principale', onPress: () => setGate('Porte principale') },
    { text: 'Entrée VIP', onPress: () => setGate('Entrée VIP') },
    { text: 'Annuler', style: 'cancel' },
  ]);

  if (!permission) return <SafeScreen><View className="flex-1 items-center justify-center"><ActivityIndicator color="#EF4444" /></View></SafeScreen>;
  if (!permission.granted) return <SafeScreen><Header eventId={eventId} count={checkedInCount} onBack={() => router.back()} /><View className="flex-1 items-center justify-center px-8"><Icon name="camera-outline" size={44} color={colors.textMuted} /><Text className="mt-4 text-center font-bold" style={{ color: colors.text }}>Accès caméra nécessaire</Text><View className="mt-5"><Button label="Autoriser la caméra" onPress={requestPermission} /></View></View></SafeScreen>;

  return <SafeScreen style={{ backgroundColor: '#000000' }}><Header eventId={eventId} count={checkedInCount} onBack={() => router.back()} /><View className="flex-1 overflow-hidden"><CameraView style={{ flex: 1 }} facing="back" enableTorch={torch} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={blocked || scan.isPending ? undefined : handleScan} /><View pointerEvents="none" className="absolute inset-0 items-center justify-center"><View className="h-64 w-64 rounded-3xl border-4 border-white/90" /><Text className="mt-5 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white">Cadrez le QR YeYamo</Text></View>{result ? <ResultOverlay code={result} /> : null}</View><View className="border-t border-white/10 bg-black px-4 pb-4 pt-3"><Text className="mb-3 text-xs text-white/60">{gate}</Text><View className="flex-row justify-around"><Action icon={torch ? 'flash' : 'flash-outline'} label="Flash" onPress={() => setTorch((value) => !value)} /><Action icon="time-outline" label="Historique" onPress={() => Alert.alert('Historique', history.length ? `${history.length} scan(s) durant cette session` : 'Aucun scan')} /><Action icon="enter-outline" label="Changer porte" onPress={changeGate} /></View></View></SafeScreen>;
}

function Header({ eventId, count, onBack }: { eventId: string; count: number; onBack: () => void }) { return <View className="flex-row items-center bg-black px-4 py-2"><TouchableOpacity onPress={onBack} className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white/10"><Icon name="arrow-back" size={21} color="#FFFFFF" /></TouchableOpacity><View className="flex-1"><Text className="text-sm font-bold text-white">Événement {eventId}</Text><Text className="text-[10px] text-white/60">Scanner billetterie</Text></View><Text className="text-lg font-extrabold text-white">{count}</Text></View>; }
function Action({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) { return <TouchableOpacity onPress={onPress} className="items-center px-3"><View className="h-10 w-10 items-center justify-center rounded-full bg-white/10"><Icon name={icon} size={20} color="#FFFFFF" /></View><Text className="mt-1 text-[10px] text-white/70">{label}</Text></TouchableOpacity>; }
function ResultOverlay({ code }: { code: UiScanResult }) { const item = RESULT[code]; return <View className="absolute inset-0 items-center justify-center bg-black/75 px-8"><View className="h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: item.color }}><Icon name={item.icon} size={44} color="#FFFFFF" /></View><Text className="mt-5 text-center text-xl font-extrabold text-white">{item.title}</Text>{code === 'NETWORK_ERROR' || code === 'SERVER_ERROR' ? <Text className="mt-2 text-center text-sm text-white/70">Le billet n’a pas été validé. Réessayez plus tard.</Text> : null}</View>; }
