import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';
import ENV from '@/config/env';

export type TurnstileAction = 'register' | 'request_otp' | 'resend_otp' | 'forgot_password' | 'login';

type TurnstileMessage = {
  type: 'TURNSTILE_SUCCESS' | 'TURNSTILE_ERROR' | 'TURNSTILE_EXPIRED';
  action: TurnstileAction;
  token?: string;
};

interface Props {
  action: TurnstileAction;
  visible: boolean;
  onSuccess(token: string): void;
  onCancel(): void;
  onError(error: Error): void;
}

const allowedHosts = new Set(['yeyamo.com', 'challenges.cloudflare.com']);

export function TurnstileChallenge({ action, visible, onSuccess, onCancel, onError }: Props) {
  const source = `${ENV.TURNSTILE_CHALLENGE_URL}?action=${encodeURIComponent(action)}`;

  const allowNavigation = (request: WebViewNavigation) => {
    try {
      const url = new URL(request.url);
      return url.protocol === 'https:' && allowedHosts.has(url.hostname);
    } catch {
      return request.url === 'about:blank';
    }
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as TurnstileMessage;
      if (message.action !== action) throw new Error('Action Turnstile inattendue');
      if (message.type === 'TURNSTILE_SUCCESS' && typeof message.token === 'string' && message.token) {
        onSuccess(message.token);
      } else if (message.type === 'TURNSTILE_EXPIRED') {
        onError(new Error('Le challenge a expiré. Réessayez.'));
      } else if (message.type === 'TURNSTILE_ERROR') {
        onError(new Error('La vérification de sécurité a échoué.'));
      }
    } catch {
      onError(new Error('Réponse de sécurité invalide.'));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="h-80 rounded-t-3xl bg-white p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold">Vérification de sécurité</Text>
            <TouchableOpacity onPress={onCancel}><Text className="font-semibold">Annuler</Text></TouchableOpacity>
          </View>
          <WebView
            source={{ uri: source }}
            javaScriptEnabled
            domStorageEnabled={false}
            originWhitelist={['https://yeyamo.com', 'https://challenges.cloudflare.com']}
            onShouldStartLoadWithRequest={allowNavigation}
            onMessage={handleMessage}
            onError={() => onError(new Error('Challenge indisponible.'))}
            setSupportMultipleWindows={false}
          />
        </View>
      </View>
    </Modal>
  );
}
