import { useRef, useState } from 'react';
import { TurnstileChallenge, type TurnstileAction } from '@/components/security/TurnstileChallenge';

type Pending = { resolve(token: string): void; reject(error: Error): void };

export function useTurnstileChallenge() {
  const [action, setAction] = useState<TurnstileAction | null>(null);
  const pending = useRef<Pending | null>(null);

  const requestToken = (nextAction: TurnstileAction) => new Promise<string>((resolve, reject) => {
    pending.current?.reject(new Error('Challenge remplacé'));
    pending.current = { resolve, reject };
    setAction(nextAction);
  });

  const finish = (callback: (pendingRequest: Pending) => void) => {
    const request = pending.current;
    pending.current = null;
    setAction(null);
    if (request) callback(request);
  };

  const challenge = action ? (
    <TurnstileChallenge
      action={action}
      visible
      onSuccess={(token) => finish((request) => request.resolve(token))}
      onCancel={() => finish((request) => request.reject(new Error('TURNSTILE_CANCELLED')))}
      onError={(error) => finish((request) => request.reject(error))}
    />
  ) : null;

  return { requestToken, challenge };
}
