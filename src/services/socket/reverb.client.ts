import ENV from '@/config/env';

type MessageHandler = (event: string, data: unknown) => void;
type SubscriptionMap = Map<string, Set<MessageHandler>>;

interface ReverbMessage {
  event: string;
  channel: string;
  data: unknown;
}

// ─── Reverb WebSocket Client ──────────────────────────────────────────────────
// Architecture-ready abstraction for Laravel Reverb.
// Does NOT depend on Pusher JS — uses raw WebSocket for React Native compatibility.
class ReverbClient {
  private socket: WebSocket | null = null;
  private subscriptions: SubscriptionMap = new Map();
  private token: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT = 5;
  private readonly RECONNECT_DELAY_MS = 2_000;

  // ─── Public API ─────────────────────────────────────────────────────────────

  connect(userToken: string): void {
    this.token = userToken;
    this._open();
  }

  subscribe(channel: string, onMessage: MessageHandler): () => void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
      this._sendSubscribe(channel);
    }
    this.subscriptions.get(channel)!.add(onMessage);

    // Return unsubscribe function
    return () => this.unsubscribe(channel, onMessage);
  }

  unsubscribe(channel: string, handler?: MessageHandler): void {
    if (!handler) {
      this.subscriptions.delete(channel);
      this._sendUnsubscribe(channel);
      return;
    }
    const handlers = this.subscriptions.get(channel);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.subscriptions.delete(channel);
        this._sendUnsubscribe(channel);
      }
    }
  }

  sendMessage(channel: string, event: string, payload: unknown): void {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.warn('[Reverb] Socket not open, message dropped');
      return;
    }
    this.socket.send(
      JSON.stringify({ event, channel, data: payload }),
    );
  }

  disconnect(): void {
    this._clearReconnectTimer();
    this.subscriptions.clear();
    this.token = null;
    this.reconnectAttempts = 0;
    this.socket?.close();
    this.socket = null;
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // ─── Private internals ──────────────────────────────────────────────────────

  private _open(): void {
    if (!this.token) return;

    const url = `${ENV.REVERB_SCHEME}://${ENV.REVERB_HOST}:${ENV.REVERB_PORT}/app/yeyamo?protocol=7&client=js&version=8.4.0&flash=false`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      // Re-subscribe to all channels after reconnect
      this.subscriptions.forEach((_, channel) => this._sendSubscribe(channel));
    };

    this.socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const msg: ReverbMessage = JSON.parse(event.data) as ReverbMessage;
        const handlers = this.subscriptions.get(msg.channel);
        handlers?.forEach((fn) => fn(msg.event, msg.data));
      } catch {
        // Malformed frame — ignore
      }
    };

    this.socket.onerror = () => {
      // onerror is always followed by onclose, handle in onclose
    };

    this.socket.onclose = () => {
      this._scheduleReconnect();
    };
  }

  private _sendSubscribe(channel: string): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.socket.send(
      JSON.stringify({
        event: 'pusher:subscribe',
        data: { channel, auth: this.token ?? '' },
      }),
    );
  }

  private _sendUnsubscribe(channel: string): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.socket.send(
      JSON.stringify({ event: 'pusher:unsubscribe', data: { channel } }),
    );
  }

  private _scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT || !this.token) return;
    this._clearReconnectTimer();
    const delay = this.RECONNECT_DELAY_MS * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => this._open(), delay);
  }

  private _clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// Singleton — one socket per app session
export const reverbClient = new ReverbClient();
