import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import ENV from '@/config/env';

type TurnstileAction = 'login' | 'register';

type TurnstileWidgetProps = {
  action: TurnstileAction;
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError: (message: string) => void;
};

function documentFor(siteKey: string, action: TurnstileAction): string {
  const configuration = JSON.stringify({
    sitekey: siteKey,
    action,
    theme: 'auto',
    size: 'flexible',
    appearance: 'interaction-only',
    callback: 'onTurnstileSuccess',
    'expired-callback': 'onTurnstileExpired',
    'error-callback': 'onTurnstileError',
  });

  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"><script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script><style>html,body,#turnstile{margin:0;padding:0;background:transparent;width:100%;min-height:70px;overflow:hidden}</style></head><body><div id="turnstile"></div><script>function send(type,payload){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify({type:type,...payload}));}window.onTurnstileSuccess=function(token){send('verified',{token:token});};window.onTurnstileExpired=function(){send('expired',{});};window.onTurnstileError=function(){send('error',{message:'La vérification anti-robot a échoué.'});};window.onload=function(){if(!window.turnstile){send('error',{message:'Le service de vérification est indisponible.'});return;}window.turnstile.render('#turnstile',${configuration});};</script></body></html>`;
}

/** Native bridge for Cloudflare Turnstile. The site key is public and injected by Expo at build time. */
export function TurnstileWidget({ action, onVerify, onExpire, onError }: TurnstileWidgetProps) {
  const siteKey = ENV.TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return <View className="rounded-xl border border-[#F59E0B] bg-[#FEF3C7] p-3"><Text className="text-xs text-[#92400E]">La vérification anti-robot n’est pas configurée pour cette application.</Text></View>;
  }

  return (
    <View className="h-[76px] overflow-hidden">
      <WebView
        originWhitelist={['https://challenges.cloudflare.com']}
        source={{ html: documentFor(siteKey, action), baseUrl: 'https://challenges.cloudflare.com/' }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        onMessage={(event) => {
          try {
            const message: unknown = JSON.parse(event.nativeEvent.data);
            if (!message || typeof message !== 'object') return;
            const payload = message as { type?: string; token?: string; message?: string };
            if (payload.type === 'verified' && payload.token) onVerify(payload.token);
            if (payload.type === 'expired') onExpire();
            if (payload.type === 'error') onError(payload.message ?? 'La vérification anti-robot a échoué.');
          } catch {
            onError('La vérification anti-robot a retourné une réponse invalide.');
          }
        }}
      />
    </View>
  );
}
