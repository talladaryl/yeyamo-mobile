import { useEffect, useRef, useState } from 'react';
import { Alert, ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { SafeScreen } from '@/components/ui/SafeScreen';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TICKETING_API_AVAILABLE } from '@/features/ticketing/ticketing.api';
import { useScannerAccess, useValidateTicketScan } from '@/features/ticketing/useTicketing';
import { useThemeStore } from '@/features/theme/theme.store';
import type { ScanResultCode } from '@/features/ticketing/types';

const RESULT: Record<ScanResultCode, { title: string; color: string; icon: string }> = {
  VALID: { title: 'Billet valide', color: '#22C55E', icon: 'checkmark-circle' },
  ALREADY_USED: { title: 'Déjà utilisé', color: '#F59E0B', icon: 'warning' },
  INVALID: { title: 'Billet invalide', color: '#EF4444', icon: 'close-circle' },
  WRONG_EVENT: { title: 'Billet d’un autre événement', color: '#EF4444', icon: 'swap-horizontal' },
  REFUNDED: { title: 'Billet remboursé', color: '#EF4444', icon: 'return-down-back' },
  CANCELLED: { title: 'Billet annulé', color: '#EF4444', icon: 'ban' },
  NETWORK_ERROR: { title: 'Connexion indisponible — validation impossible', color: '#EF4444', icon: 'cloud-offline' },
};

export default function TicketScansScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeStore((state) => state.colors);
  const [permission, requestPermission] = useCameraPermissions();
  const requestedPermission = useRef(false);
  const access = useScannerAccess(id);
  const validation = useValidateTicketScan(id);
  const [torch, setTorch] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [result, setResult] = useState<ScanResultCode | null>(null);
  const [history, setHistory] = useState<ScanResultCode[]>([]);
  const [gate, setGate] = useState('Porte principale');
  const [checkedInCount, setCheckedInCount] = useState(0);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain && !requestedPermission.current) {
      requestedPermission.current = true;
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (access.data) setCheckedInCount(access.data.checkedIn);
  }, [access.data]);

  const handleScan = async ({ data }: BarcodeScanningResult) => {
    if (blocked || !access.isAuthorized) return;
    setBlocked(true);
    const clientScanReference = uuidv4();
    let code: ScanResultCode = 'NETWORK_ERROR';
    try {
      const response = await validation.mutateAsync({ qrPayload: data, clientScanReference, gate });
      code = response.code;
      if (code === 'VALID') setCheckedInCount(response.checkedInCount ?? ((count) => count + 1));
    } catch {
      code = 'NETWORK_ERROR';
    }
    setResult(code);
    setHistory((items) => [code, ...items].slice(0, 20));
    setTimeout(() => {
      setResult(null);
      setBlocked(false);
    }, 1800);
  };

  const changeGate = () => Alert.alert('Changer de porte', undefined, [
    { text: 'Porte principale', onPress: () => setGate('Porte principale') },
    { text: 'Entrée VIP', onPress: () => setGate('Entrée VIP') },
    { text: 'Annuler', style: 'cancel' },
  ]);

  if (!permission || access.isLoading) {
    return <SafeScreen><View className="flex-1 items-center justify-center"><ActivityIndicator color="#EF4444" /></View></SafeScreen>;
  }

  if (!permission.granted) {
    return <SafeScreen><ScannerHeader eventName={access.data?.eventName ?? 'Événement'} count={checkedInCount} onBack={() => router.back()} /><View className="flex-1 items-center justify-center px-8"><Icon name="camera-outline" size={44} color={colors.textMuted} /><Text className="mt-4 text-center font-bold" style={{ color: colors.text }}>Accès caméra nécessaire</Text><Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>Autorisez la caméra pour scanner les billets à l’entrée.</Text><View className="mt-5"><Button label="Autoriser la caméra" onPress={requestPermission} /></View></View></SafeScreen>;
  }

  if (!access.isAuthorized) {
    return <SafeScreen><ScannerHeader eventName={access.data?.eventName ?? 'Événement'} count={checkedInCount} onBack={() => router.back()} /><View className="flex-1 items-center justify-center px-8"><Icon name="shield-outline" size={44} color="#EF4444" /><Text className="mt-4 text-center font-bold" style={{ color: colors.text }}>Accès non autorisé</Text><Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>Votre compte ne possède pas l’autorisation staff pour cet événement.</Text></View></SafeScreen>;
  }

  return (
    <SafeScreen style={{ backgroundColor: '#000000' }}>
      <ScannerHeader eventName={access.data?.eventName ?? 'Événement'} count={checkedInCount} onBack={() => router.back()} />
      <View className="flex-1 overflow-hidden">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={blocked ? undefined : handleScan}
        />
        <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
          <View className="h-64 w-64 rounded-3xl border-4 border-white/90" />
          <Text className="mt-5 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white">Cadrez le QR YeYamo</Text>
        </View>
        {result ? <ScanResultOverlay code={result} /> : null}
      </View>
      <View className="border-t border-white/10 bg-black px-4 pb-4 pt-3">
        <View className="mb-3 flex-row items-center justify-between"><Text className="text-xs text-white/60">{gate}</Text><View className="flex-row items-center gap-1"><View className={`h-2 w-2 rounded-full ${TICKETING_API_AVAILABLE ? 'bg-[#22C55E]' : 'bg-[#EF4444]'}`} /><Text className="text-xs text-white/70">{TICKETING_API_AVAILABLE ? 'Connecté' : 'Hors connexion'}</Text></View></View>
        <View className="flex-row justify-around">
          <ScannerAction icon={torch ? 'flash' : 'flash-outline'} label="Flash" active={torch} onPress={() => setTorch((value) => !value)} />
          <ScannerAction icon="time-outline" label="Historique" onPress={() => Alert.alert('Historique', history.length ? `${history.length} scan(s) durant cette session` : 'Aucun scan pour le moment')} />
          {access.canChangeGate ? <ScannerAction icon="enter-outline" label="Changer porte" onPress={changeGate} /> : null}
        </View>
      </View>
    </SafeScreen>
  );
}

function ScannerHeader({ eventName, count, onBack }: { eventName: string; count: number; onBack: () => void }) {
  return <View className="flex-row items-center bg-black px-4 py-2"><TouchableOpacity onPress={onBack} className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-white/10"><Icon name="arrow-back" size={21} color="#FFFFFF" /></TouchableOpacity><View className="min-w-0 flex-1"><Text className="text-sm font-bold text-white" numberOfLines={1}>{eventName}</Text><Text className="text-[10px] text-white/60">Scanner billetterie</Text></View><View className="items-end"><Text className="text-lg font-extrabold text-white">{count}</Text><Text className="text-[9px] text-white/60">entrées</Text></View></View>;
}

function ScannerAction({ icon, label, active = false, onPress }: { icon: string; label: string; active?: boolean; onPress: () => void }) {
  return <TouchableOpacity onPress={onPress} className="items-center px-3"><View className={`h-10 w-10 items-center justify-center rounded-full ${active ? 'bg-[#EF4444]' : 'bg-white/10'}`}><Icon name={icon} size={20} color="#FFFFFF" /></View><Text className="mt-1 text-[10px] text-white/70">{label}</Text></TouchableOpacity>;
}

function ScanResultOverlay({ code }: { code: ScanResultCode }) {
  const item = RESULT[code];
  return <View className="absolute inset-0 items-center justify-center bg-black/75 px-8"><View className="h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: item.color }}><Icon name={item.icon} size={44} color="#FFFFFF" /></View><Text className="mt-5 text-center text-xl font-extrabold text-white">{item.title}</Text>{code === 'NETWORK_ERROR' ? <Text className="mt-2 text-center text-sm text-white/70">Le billet n’a pas été validé. Réessayez une fois la connexion rétablie.</Text> : null}</View>;
}
