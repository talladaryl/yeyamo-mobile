import { AppErrorScreen } from '@/components/ui/AppErrorScreen';

export default function NotFoundScreen() {
  return (
    <AppErrorScreen
      title="Page introuvable"
      message="Cette page n'existe pas ou son adresse a changé. Revenez en arrière ou continuez vers l'accueil."
      showContinue
    />
  );
}
