import { Platform } from 'react-native';
import ENV from '@/config/env';

type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

let googleSignInConfigured = false;

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super('Google Sign-In cancelled');
    this.name = 'GoogleSignInCancelledError';
  }
}

export class GoogleSignInUnavailableError extends Error {
  constructor() {
    super(
      'Google Login nécessite une nouvelle development build contenant le module natif. ' +
        'Recréez puis réinstallez le client EAS development.',
    );
    this.name = 'GoogleSignInUnavailableError';
  }
}

async function loadGoogleSignIn(): Promise<GoogleSignInModule> {
  try {
    const googleSignIn = await import('@react-native-google-signin/google-signin');

    if (!googleSignInConfigured) {
      googleSignIn.GoogleSignin.configure({
        webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
        iosClientId: ENV.GOOGLE_IOS_CLIENT_ID,
        offlineAccess: false,
      });
      googleSignInConfigured = true;
    }

    return googleSignIn;
  } catch {
    throw new GoogleSignInUnavailableError();
  }
}

export async function signInWithGoogle(): Promise<{ idToken: string }> {
  if (!ENV.GOOGLE_WEB_CLIENT_ID) {
    throw new Error("Google Login n'est pas configuré pour cet environnement.");
  }

  const { GoogleSignin, isCancelledResponse } = await loadGoogleSignIn();

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const response = await GoogleSignin.signIn();
  if (isCancelledResponse(response)) throw new GoogleSignInCancelledError();

  const idToken = response.data.idToken;
  if (!idToken) throw new Error("Google n'a retourné aucun jeton d'identité.");
  return { idToken };
}

export function googleSignInErrorMessage(error: unknown): string | null {
  if (error instanceof GoogleSignInCancelledError) return null;
  if (typeof error === 'object' && error !== null && 'code' in error) {
    if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      return 'Google Play Services est indisponible ou doit être mis à jour.';
    }
    if (error.code === 'IN_PROGRESS') return 'Une connexion Google est déjà en cours.';
  }
  return error instanceof Error ? error.message : 'Connexion Google impossible. Réessayez.';
}
