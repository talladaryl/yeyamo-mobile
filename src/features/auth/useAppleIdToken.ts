import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

function messageForAppleError(error: unknown): string | null {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
  if (code === 'ERR_REQUEST_CANCELED') return null;
  return 'Connexion Apple impossible. Réessayez.';
}

/** Native Apple Sign In is intentionally offered only on supported iOS devices. */
export function useAppleIdToken() {
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [appleError, setAppleError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (Platform.OS !== 'ios') return () => { active = false; };

    void AppleAuthentication.isAvailableAsync()
      .then((available) => { if (active) setAppleAvailable(available); })
      .catch(() => { if (active) setAppleAvailable(false); });

    return () => { active = false; };
  }, []);

  const requestAppleIdToken = useCallback(async (): Promise<string | null> => {
    setAppleError(null);
    if (Platform.OS !== 'ios' || !appleAvailable) {
      setAppleError('La connexion Apple est disponible uniquement sur un appareil iOS compatible.');
      return null;
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        setAppleError('Apple n’a pas retourné de jeton de connexion.');
        return null;
      }
      return credential.identityToken;
    } catch (error) {
      const message = messageForAppleError(error);
      if (message) setAppleError(message);
      return null;
    }
  }, [appleAvailable]);

  return { appleAvailable, appleError, requestAppleIdToken };
}
