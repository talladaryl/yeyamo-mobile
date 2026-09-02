import ENV from '@/config/env';
import { isDemoSession } from '@/features/auth/auth.store';

type MessageHandler = (event: string, data: unknown) => void;

interface MessagingEnvelope {
  eventType: string;
  payload: unknown;
}

class StompMessagingClient {
  private socket: WebSocket | null = null;
  private handlers = new Map<string, Set<MessageHandler>>();
  private token: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private manuallyClosed = false;

  connect(userToken: string): void {
    if (isDemoSession()) return;
    if (this.token === userToken && this.socket?.readyState === WebSocket.OPEN) return;
    this.token = userToken;
    this.manuallyClosed = false;
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
    }
    this.open();
  }

  subscribe(channel: string, onMessage: MessageHandler): () => void {
    if (isDemoSession()) return () => {};
    const handlers = this.handlers.get(channel) ?? new Set<MessageHandler>();
    handlers.add(onMessage);
    this.handlers.set(channel, handlers);
    return () => this.unsubscribe(channel, onMessage);
  }

  unsubscribe(channel: string, handler?: MessageHandler): void {
    const handlers = this.handlers.get(channel);
    if (!handlers) return;
    if (handler) handlers.delete(handler);
    else handlers.clear();
    if (handlers.size === 0) this.handlers.delete(channel);
  }

  sendMessage(_channel: string, _event: string, _payload: unknown): void {
    console.warn('[STOMP] Les messages applicatifs doivent être envoyés via l’API REST.');
  }

  disconnect(): void {
    this.manuallyClosed = true;
    this.clearReconnectTimer();
    this.clearHeartbeat();
    this.handlers.clear();
    this.token = null;
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send('DISCONNECT\nreceipt:mobile-disconnect\n\n\0');
    }
    this.socket?.close();
    this.socket = null;
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private open(): void {
    if (!this.token || this.manuallyClosed) return;
    const socket = new WebSocket(ENV.MESSAGING_WS_URL, ['v12.stomp', 'v11.stomp']);
    this.socket = socket;

    socket.onopen = () => {
      socket.send(
        [
          'CONNECT',
          'accept-version:1.2,1.1',
          'heart-beat:10000,10000',
          `Authorization:Bearer ${this.token}`,
          '',
          '\0',
        ].join('\n'),
      );
    };

    socket.onmessage = (message: MessageEvent<string>) => {
      this.handleFrames(String(message.data));
    };

    socket.onerror = () => {
      // onclose effectue la reconnexion.
    };

    socket.onclose = () => {
      this.clearHeartbeat();
      this.scheduleReconnect();
    };
  }

  private handleFrames(raw: string): void {
    for (const rawFrame of raw.split('\0')) {
      const frame = rawFrame.replace(/^\n+/, '');
      if (!frame.trim()) continue;
      const separator = frame.indexOf('\n\n');
      const headerBlock = separator >= 0 ? frame.slice(0, separator) : frame;
      const body = separator >= 0 ? frame.slice(separator + 2) : '';
      const [command] = headerBlock.split('\n');

      if (command === 'CONNECTED') {
        this.reconnectAttempts = 0;
        this.socket?.send(
          [
            'SUBSCRIBE',
            'id:mobile-messaging',
            'destination:/user/queue/messaging',
            'ack:auto',
            '',
            '\0',
          ].join('\n'),
        );
        this.startHeartbeat();
      } else if (command === 'MESSAGE') {
        try {
          const envelope = JSON.parse(body) as MessagingEnvelope;
          this.handlers.forEach((handlers) => {
            handlers.forEach((handler) =>
              handler(envelope.eventType, envelope.payload),
            );
          });
        } catch {
          // Une frame invalide est ignorée ; le rattrapage se fait par REST.
        }
      } else if (command === 'ERROR') {
        this.socket?.close();
      }
    }
  }

  private startHeartbeat(): void {
    this.clearHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) this.socket.send('\n');
    }, 10_000);
  }

  private scheduleReconnect(): void {
    if (this.manuallyClosed || !this.token || this.reconnectAttempts >= 8) return;
    this.clearReconnectTimer();
    const delay = Math.min(30_000, 1_000 * 2 ** this.reconnectAttempts);
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => this.open(), delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }
}

// Nom conservé pour ne pas casser les imports existants ; le protocole est désormais STOMP.
export const reverbClient = new StompMessagingClient();
