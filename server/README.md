# Breakpoint Defense - Live Server

Lightweight WebSocket server for live spectating and predictions.

## Features

- **Session Management**: Runners can create live sessions
- **Snapshot Streaming**: Real-time game state updates (300ms intervals)
- **Spectator Support**: Multiple viewers per session
- **Predictions**: Tier-based predictions with aggregation
- **Auto-Cleanup**: Ended sessions are removed after 5 minutes

## Quick Start

```bash
# Install dependencies
cd server
npm install

# Start development server
npm run dev
```

The server runs on port 3001 by default:
- **HTTP**: http://localhost:3001/health
- **WebSocket**: ws://localhost:3001

## API

### REST Endpoints

- `GET /health` - Server health check
- `GET /sessions` - List all active sessions

### WebSocket Messages

#### Runner → Server

```json
{ "type": "create_session", "alias": "player123" }
{ "type": "update_snapshot", "snapshot": { ... } }
{ "type": "end_session", "snapshot": { ... } }
```

#### Spectator → Server

```json
{ "type": "get_sessions" }
{ "type": "join_spectate", "sessionId": "abc123" }
{ "type": "leave_spectate", "sessionId": "abc123" }
{ "type": "submit_prediction", "sessionId": "abc123", "viewerId": "v_xyz", "prediction": "Builder" }
```

#### Server → Client

```json
{ "type": "session_created", "sessionId": "abc123" }
{ "type": "sessions_list", "sessions": [...] }
{ "type": "snapshot_update", "sessionId": "abc123", "snapshot": { ... } }
{ "type": "session_ended", "sessionId": "abc123", "finalTier": "Builder", "predictions": { ... } }
{ "type": "predictions_summary", "sessionId": "abc123", "predictions": { "Attendee": 3, "Builder": 5 } }
```

## Testing

1. Start the server: `npm run dev`
2. Start Expo: `cd .. && npx expo start --web`
3. Open two browser tabs
4. Tab A: Enable "Go Live" and start playing
5. Tab B: Click "LIVE" → select session → watch & predict

## Configuration

- `PORT`: Server port (default: 3001)
- Snapshot interval: 300ms (configured in GameScreen.tsx)
- Session cleanup: 5 minutes after ending

