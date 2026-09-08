import { useCallback, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import ENV from '@/config/env';

WebBrowser.maybeCompleteAuthSession();

/** Requests an OpenID Connect ID token: the backend exchanges this exact token with Google. */
export function useGoogleIdToken() {
  const [error, setError] = useState<string | null>(null);
  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID || undefined,
    iosClientId: ENV.GOOGLE_IOS_CLIENT_ID || undefined,
    androidClientId: ENV.GOOGLE_ANDROID_CLIENT_ID || undefined,
    selectAccount: true,
  });

  const requestIdToken = useCallback(async (): Promise<string | null> => {
    setError(null);
    const result = await promptAsync();
    if (result.type === 'cancel' || result.type === 'dismiss') return null;
    if (result.type !== 'success') {
      setError('Connexion Google indisponible. Réessayez plus tard.');
      return null;
    }
    const idToken = result.params.id_token;
    if (!idToken) {
      setError('Google n’a pas fourni le jeton de connexion attendu.');
      return null;
    }
    return idToken;
  }, [promptAsync]);

  return { googleRequest: request, requestGoogleIdToken: requestIdToken, googleError: error };
}
