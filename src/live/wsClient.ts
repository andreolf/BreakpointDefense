/**
 * WebSocket Client
 * Handles connection to live spectate server
 */

import { ClientMessage, ServerMessage, GameSnapshot, SessionInfo } from './types';

// Server URL - use localhost for dev, configure for production
const WS_URL = 'ws://localhost:3001';

type MessageHandler = (msg: ServerMessage) => void;
type ConnectionHandler = (connected: boolean) => void;

class LiveClient {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private sessionId: string | null = null;
  private viewerId: string;
  private isRunner: boolean = false;

  constructor() {
    // Generate a unique viewer ID
    this.viewerId = 'v_' + Math.random().toString(36).substring(2, 10);
  }

  // ===========================================================================
  // CONNECTION MANAGEMENT
  // ===========================================================================

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve(true);
        return;
      }

      try {
        this.ws = new WebSocket(WS_URL);

        this.ws.onopen = () => {
          console.log('[WS] Connected to live server');
          this.notifyConnectionHandlers(true);
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const msg: ServerMessage = JSON.parse(event.data);
            this.notifyMessageHandlers(msg);
          } catch (err) {
            console.error('[WS] Message parse error:', err);
          }
        };

        this.ws.onclose = () => {
          console.log('[WS] Disconnected');
          this.ws = null;
          this.sessionId = null;
          this.isRunner = false;
          this.notifyConnectionHandlers(false);
        };

        this.ws.onerror = (err) => {
          console.error('[WS] Error:', err);
          this.ws = null;
          this.notifyConnectionHandlers(false);
          resolve(false);
        };

        // Timeout for connection
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close();
            resolve(false);
          }
        }, 5000);

      } catch (err) {
        console.error('[WS] Connection error:', err);
        resolve(false);
      }
    });
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.sessionId = null;
    this.isRunner = false;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getViewerId(): string {
    return this.viewerId;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  // ===========================================================================
  // EVENT HANDLERS
  // ===========================================================================

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  private notifyMessageHandlers(msg: ServerMessage) {
    for (const handler of this.messageHandlers) {
      try {
        handler(msg);
      } catch (err) {
        console.error('[WS] Handler error:', err);
      }
    }
  }

  private notifyConnectionHandlers(connected: boolean) {
    for (const handler of this.connectionHandlers) {
      try {
        handler(connected);
      } catch (err) {
        console.error('[WS] Connection handler error:', err);
      }
    }
  }

  // ===========================================================================
  // RUNNER METHODS
  // ===========================================================================

  /**
   * Create a new live session (called by runner)
   */
  async createSession(alias: string): Promise<string | null> {
    const connected = await this.connect();
    if (!connected) return null;

    return new Promise((resolve) => {
      const handler = (msg: ServerMessage) => {
        if (msg.type === 'session_created' && msg.sessionId) {
          this.sessionId = msg.sessionId;
          this.isRunner = true;
          this.messageHandlers.delete(handler);
          resolve(msg.sessionId);
        } else if (msg.type === 'error') {
          this.messageHandlers.delete(handler);
          resolve(null);
        }
      };

      this.messageHandlers.add(handler);
      this.send({ type: 'create_session', alias });

      // Timeout
      setTimeout(() => {
        this.messageHandlers.delete(handler);
        if (!this.sessionId) resolve(null);
      }, 5000);
    });
  }

  /**
   * Send a game snapshot (called by runner every 200-500ms)
   */
  sendSnapshot(snapshot: GameSnapshot) {
    if (!this.isConnected() || !this.isRunner) return;
    this.send({ type: 'update_snapshot', snapshot });
  }

  /**
   * End the session (called when game over)
   */
  endSession(finalSnapshot?: GameSnapshot) {
    if (!this.isConnected() || !this.isRunner) return;
    this.send({ type: 'end_session', snapshot: finalSnapshot });
    this.isRunner = false;
  }

  // ===========================================================================
  // SPECTATOR METHODS
  // ===========================================================================

  /**
   * Get list of active sessions
   */
  async getSessions(): Promise<SessionInfo[]> {
    const connected = await this.connect();
    if (!connected) return [];

    return new Promise((resolve) => {
      const handler = (msg: ServerMessage) => {
        if (msg.type === 'sessions_list') {
          this.messageHandlers.delete(handler);
          resolve(msg.sessions || []);
        }
      };

      this.messageHandlers.add(handler);
      this.send({ type: 'get_sessions' });

      // Timeout
      setTimeout(() => {
        this.messageHandlers.delete(handler);
        resolve([]);
      }, 5000);
    });
  }

  /**
   * Join a session as spectator
   */
  async joinSession(sessionId: string): Promise<boolean> {
    const connected = await this.connect();
    if (!connected) return false;

    this.sessionId = sessionId;
    this.isRunner = false;
    this.send({ type: 'join_spectate', sessionId });
    return true;
  }

  /**
   * Leave current spectating session
   */
  leaveSession() {
    if (!this.isConnected() || !this.sessionId || this.isRunner) return;
    this.send({ type: 'leave_spectate', sessionId: this.sessionId });
    this.sessionId = null;
  }

  /**
   * Submit a tier prediction
   */
  submitPrediction(prediction: string) {
    if (!this.isConnected() || !this.sessionId) return;
    this.send({
      type: 'submit_prediction',
      sessionId: this.sessionId,
      viewerId: this.viewerId,
      prediction,
    });
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  private send(msg: ClientMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }
}

// Singleton instance
export const liveClient = new LiveClient();

