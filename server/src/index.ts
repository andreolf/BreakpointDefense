/**
 * Breakpoint Defense - Live Spectate Server
 * 
 * Lightweight WebSocket server for:
 * - Session management (runners go live, spectators watch)
 * - Snapshot streaming (200-500ms updates)
 * - Prediction aggregation (optional)
 * 
 * Run: npm run dev
 */

import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

// =============================================================================
// TYPES
// =============================================================================

interface EnemySnapshot {
  id: string;
  type: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
}

interface TowerSnapshot {
  id: string;
  type: string;
  x: number;
  y: number;
  level: number;
  rangeLevel: number;
}

interface GameSnapshot {
  time: number;           // Elapsed seconds
  wave: number;
  baseHp: number;
  maxBaseHp: number;
  kills: number;
  sol: number;
  enemies: EnemySnapshot[];
  towers: TowerSnapshot[];
  gameSpeed: number;
  gameOver: boolean;
  finalTier?: string;
}

interface Session {
  id: string;
  alias: string;
  biome: string;
  startedAt: number;
  lastUpdateAt: number;
  lastSnapshot: GameSnapshot | null;
  status: 'live' | 'ended';
  viewerCount: number;
  predictions: Map<string, string>;  // viewerId -> predicted tier
  finalTier?: string;
}

interface ClientMessage {
  type: 'create_session' | 'update_snapshot' | 'end_session' | 
        'join_spectate' | 'leave_spectate' | 'get_sessions' |
        'submit_prediction';
  sessionId?: string;
  alias?: string;
  snapshot?: GameSnapshot;
  viewerId?: string;
  prediction?: string;
}

interface ServerMessage {
  type: 'session_created' | 'sessions_list' | 'snapshot_update' | 
        'session_ended' | 'prediction_submitted' | 'predictions_summary' |
        'error';
  sessionId?: string;
  sessions?: SessionInfo[];
  snapshot?: GameSnapshot;
  finalTier?: string;
  predictions?: Record<string, number>;  // tier -> count
  message?: string;
}

interface SessionInfo {
  id: string;
  alias: string;
  biome: string;
  time: number;
  wave: number;
  baseHp: number;
  viewerCount: number;
  status: 'live' | 'ended';
}

// =============================================================================
// IN-MEMORY STORE
// =============================================================================

const sessions = new Map<string, Session>();
const sessionViewers = new Map<string, Set<WebSocket>>();  // sessionId -> viewers
const runnerSockets = new Map<string, WebSocket>();        // sessionId -> runner ws

// Generate random session ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Clean up ended sessions after 5 minutes
function cleanupSessions() {
  const now = Date.now();
  const CLEANUP_AFTER = 5 * 60 * 1000; // 5 minutes
  
  for (const [id, session] of sessions.entries()) {
    if (session.status === 'ended' && now - session.lastUpdateAt > CLEANUP_AFTER) {
      sessions.delete(id);
      sessionViewers.delete(id);
      runnerSockets.delete(id);
      console.log(`[Cleanup] Removed session ${id}`);
    }
  }
}

setInterval(cleanupSessions, 60000); // Run every minute

// =============================================================================
// HELPERS
// =============================================================================

function getSessionInfo(session: Session): SessionInfo {
  return {
    id: session.id,
    alias: session.alias,
    biome: session.biome,
    time: session.lastSnapshot?.time || 0,
    wave: session.lastSnapshot?.wave || 1,
    baseHp: session.lastSnapshot?.baseHp || 100,
    viewerCount: session.viewerCount,
    status: session.status,
  };
}

function broadcastToViewers(sessionId: string, message: ServerMessage) {
  const viewers = sessionViewers.get(sessionId);
  if (!viewers) return;
  
  const msgStr = JSON.stringify(message);
  for (const ws of viewers) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msgStr);
    }
  }
}

function getPredictionsSummary(session: Session): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const tier of session.predictions.values()) {
    summary[tier] = (summary[tier] || 0) + 1;
  }
  return summary;
}

// =============================================================================
// EXPRESS SERVER (for health check)
// =============================================================================

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    sessions: sessions.size,
    uptime: process.uptime()
  });
});

app.get('/sessions', (req, res) => {
  const list: SessionInfo[] = [];
  for (const session of sessions.values()) {
    list.push(getSessionInfo(session));
  }
  res.json(list);
});

// =============================================================================
// WEBSOCKET SERVER
// =============================================================================

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  console.log('[WS] Client connected');
  
  let clientSessionId: string | null = null;
  let isRunner = false;
  let viewerId = generateId();
  
  ws.on('message', (data: Buffer) => {
    try {
      const msg: ClientMessage = JSON.parse(data.toString());
      
      switch (msg.type) {
        // ===================
        // RUNNER MESSAGES
        // ===================
        
        case 'create_session': {
          const sessionId = generateId();
          const session: Session = {
            id: sessionId,
            alias: msg.alias || `anon_${sessionId.slice(0, 4)}`,
            biome: 'Breakpoint',
            startedAt: Date.now(),
            lastUpdateAt: Date.now(),
            lastSnapshot: null,
            status: 'live',
            viewerCount: 0,
            predictions: new Map(),
          };
          
          sessions.set(sessionId, session);
          sessionViewers.set(sessionId, new Set());
          runnerSockets.set(sessionId, ws);
          
          clientSessionId = sessionId;
          isRunner = true;
          
          console.log(`[Session] Created: ${sessionId} by ${session.alias}`);
          
          ws.send(JSON.stringify({
            type: 'session_created',
            sessionId,
          } as ServerMessage));
          break;
        }
        
        case 'update_snapshot': {
          if (!clientSessionId || !isRunner) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not a runner' }));
            return;
          }
          
          const session = sessions.get(clientSessionId);
          if (!session || session.status !== 'live') return;
          
          session.lastSnapshot = msg.snapshot || null;
          session.lastUpdateAt = Date.now();
          
          // Broadcast to all viewers
          broadcastToViewers(clientSessionId, {
            type: 'snapshot_update',
            sessionId: clientSessionId,
            snapshot: msg.snapshot,
          });
          break;
        }
        
        case 'end_session': {
          if (!clientSessionId || !isRunner) return;
          
          const session = sessions.get(clientSessionId);
          if (!session) return;
          
          session.status = 'ended';
          session.lastUpdateAt = Date.now();
          session.finalTier = msg.snapshot?.finalTier;
          
          if (msg.snapshot) {
            session.lastSnapshot = msg.snapshot;
          }
          
          console.log(`[Session] Ended: ${clientSessionId}, tier: ${session.finalTier}`);
          
          // Notify all viewers
          broadcastToViewers(clientSessionId, {
            type: 'session_ended',
            sessionId: clientSessionId,
            snapshot: session.lastSnapshot || undefined,
            finalTier: session.finalTier,
            predictions: getPredictionsSummary(session),
          });
          break;
        }
        
        // ===================
        // SPECTATOR MESSAGES
        // ===================
        
        case 'get_sessions': {
          const list: SessionInfo[] = [];
          for (const session of sessions.values()) {
            list.push(getSessionInfo(session));
          }
          
          ws.send(JSON.stringify({
            type: 'sessions_list',
            sessions: list,
          } as ServerMessage));
          break;
        }
        
        case 'join_spectate': {
          const sessionId = msg.sessionId;
          if (!sessionId) return;
          
          const session = sessions.get(sessionId);
          if (!session) {
            ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
            return;
          }
          
          // Leave previous session if any
          if (clientSessionId && !isRunner) {
            const prevViewers = sessionViewers.get(clientSessionId);
            if (prevViewers) {
              prevViewers.delete(ws);
              const prevSession = sessions.get(clientSessionId);
              if (prevSession) prevSession.viewerCount--;
            }
          }
          
          // Join new session
          clientSessionId = sessionId;
          isRunner = false;
          
          let viewers = sessionViewers.get(sessionId);
          if (!viewers) {
            viewers = new Set();
            sessionViewers.set(sessionId, viewers);
          }
          viewers.add(ws);
          session.viewerCount++;
          
          console.log(`[Spectate] Viewer joined ${sessionId}, total: ${session.viewerCount}`);
          
          // Send current snapshot immediately
          if (session.lastSnapshot) {
            ws.send(JSON.stringify({
              type: 'snapshot_update',
              sessionId,
              snapshot: session.lastSnapshot,
            } as ServerMessage));
          }
          
          // Send predictions summary
          ws.send(JSON.stringify({
            type: 'predictions_summary',
            sessionId,
            predictions: getPredictionsSummary(session),
          } as ServerMessage));
          break;
        }
        
        case 'leave_spectate': {
          if (!clientSessionId || isRunner) return;
          
          const viewers = sessionViewers.get(clientSessionId);
          if (viewers) {
            viewers.delete(ws);
            const session = sessions.get(clientSessionId);
            if (session) session.viewerCount--;
          }
          
          clientSessionId = null;
          break;
        }
        
        case 'submit_prediction': {
          if (!clientSessionId) return;
          
          const session = sessions.get(clientSessionId);
          if (!session || session.status !== 'live') {
            ws.send(JSON.stringify({ type: 'error', message: 'Session not live' }));
            return;
          }
          
          // Only allow prediction in first 20 seconds
          const elapsedTime = session.lastSnapshot?.time || 0;
          if (elapsedTime > 20) {
            ws.send(JSON.stringify({ type: 'error', message: 'Prediction window closed' }));
            return;
          }
          
          // Store prediction
          if (msg.prediction && msg.viewerId) {
            session.predictions.set(msg.viewerId, msg.prediction);
            
            console.log(`[Prediction] ${msg.viewerId} predicts ${msg.prediction} for ${clientSessionId}`);
            
            ws.send(JSON.stringify({
              type: 'prediction_submitted',
              sessionId: clientSessionId,
            } as ServerMessage));
            
            // Broadcast updated predictions to all viewers
            broadcastToViewers(clientSessionId, {
              type: 'predictions_summary',
              sessionId: clientSessionId,
              predictions: getPredictionsSummary(session),
            });
          }
          break;
        }
      }
    } catch (err) {
      console.error('[WS] Message parse error:', err);
    }
  });
  
  ws.on('close', () => {
    console.log('[WS] Client disconnected');
    
    if (clientSessionId) {
      if (isRunner) {
        // Runner disconnected - end their session
        const session = sessions.get(clientSessionId);
        if (session && session.status === 'live') {
          session.status = 'ended';
          session.lastUpdateAt = Date.now();
          
          broadcastToViewers(clientSessionId, {
            type: 'session_ended',
            sessionId: clientSessionId,
            snapshot: session.lastSnapshot || undefined,
            predictions: getPredictionsSummary(session),
          });
        }
        runnerSockets.delete(clientSessionId);
      } else {
        // Viewer disconnected
        const viewers = sessionViewers.get(clientSessionId);
        if (viewers) {
          viewers.delete(ws);
          const session = sessions.get(clientSessionId);
          if (session) session.viewerCount--;
        }
      }
    }
  });
  
  ws.on('error', (err) => {
    console.error('[WS] Error:', err);
  });
});

// =============================================================================
// START SERVER
// =============================================================================

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Breakpoint Defense Live Server running on port ${PORT}`);
  console.log(`   HTTP: http://localhost:${PORT}/health`);
  console.log(`   WS:   ws://localhost:${PORT}`);
});

