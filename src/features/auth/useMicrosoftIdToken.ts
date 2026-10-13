import { useCallback, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import ENV from '@/config/env';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({ scheme: 'yeyamo', path: 'oauth/microsoft' });

export function useMicrosoftIdToken() {
  const [microsoftError, setMicrosoftError] = useState<string | null>(null);
  const authority = `https://login.microsoftonline.com/${ENV.MICROSOFT_TENANT_ID}/v2.0`;
  const discovery = AuthSession.useAutoDiscovery(authority);
  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: ENV.MICROSOFT_CLIENT_ID || 'microsoft-auth-not-configured',
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      scopes: ['openid', 'profile', 'email', 'offline_access'],
      usePKCE: true,
    },
    discovery,
  );

  const requestMicrosoftIdToken = useCallback(async (): Promise<string | null> => {
    setMicrosoftError(null);
    if (!ENV.MICROSOFT_CLIENT_ID || !request || !discovery) {
      setMicrosoftError('Connexion Microsoft non configurée pour cet environnement.');
      return null;
    }

    const authorization = await promptAsync();
    if (authorization.type === 'cancel' || authorization.type === 'dismiss') return null;
    if (authorization.type !== 'success' || !authorization.params.code || !request.codeVerifier) {
      setMicrosoftError('Connexion Microsoft indisponible. Réessayez plus tard.');
      return null;
    }

    try {
      const token = await AuthSession.exchangeCodeAsync(
        {
          clientId: ENV.MICROSOFT_CLIENT_ID,
          code: authorization.params.code,
          redirectUri,
          extraParams: { code_verifier: request.codeVerifier },
        },
        discovery,
      );
      if (!token.idToken) {
        setMicrosoftError("Microsoft n’a pas fourni le jeton de connexion attendu.");
        return null;
      }
      return token.idToken;
    } catch {
      setMicrosoftError('Connexion Microsoft impossible. Réessayez.');
      return null;
    }
  }, [discovery, promptAsync, request]);

  return {
    microsoftRequest: ENV.MICROSOFT_CLIENT_ID ? request : null,
    requestMicrosoftIdToken,
    microsoftError,
    microsoftRedirectUri: redirectUri,
  };
}
