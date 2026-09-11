import { useCallback, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import ENV from '@/config/env';

WebBrowser.maybeCompleteAuthSession();

const platformClientId = Platform.select({
  android: ENV.GOOGLE_ANDROID_CLIENT_ID,
  ios: ENV.GOOGLE_IOS_CLIENT_ID,
  default: ENV.GOOGLE_WEB_CLIENT_ID,
});
const missingClientIdMessage = `Connexion Google non configurée pour ${Platform.OS}.`;

/** Requests an OpenID Connect ID token: the backend exchanges this exact token with Google. */
export function useGoogleIdToken() {
  const [error, setError] = useState<string | null>(null);
  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID || undefined,
    iosClientId: ENV.GOOGLE_IOS_CLIENT_ID || undefined,
    androidClientId: ENV.GOOGLE_ANDROID_CLIENT_ID || undefined,
    clientId: platformClientId || 'google-auth-not-configured',
    selectAccount: true,
  });

  const requestIdToken = useCallback(async (): Promise<string | null> => {
    setError(null);
    if (!platformClientId) {
      setError(missingClientIdMessage);
      return null;
    }

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

  return {
    googleRequest: platformClientId ? request : null,
    requestGoogleIdToken: requestIdToken,
    googleError: error,
  };
}
