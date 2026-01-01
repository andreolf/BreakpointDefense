# ⚡ Solana Breakpoint Defense

A hypercasual tower defense game built with Expo React Native, themed around the Solana Breakpoint conference.

![Solana Breakpoint Defense](https://img.shields.io/badge/Solana-Breakpoint-14F195?style=for-the-badge&logo=solana)
![Expo](https://img.shields.io/badge/Expo-SDK_52-000020?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript)

## 🎮 Gameplay

Defend your base from waves of enemies traveling along an S-curved path! Place towers strategically, upgrade them, and survive as long as possible to climb the tier ranks.

### Features

- **S-Curve Path**: Enemies follow a winding path through the conference venue
- **3 Tower Types**: Fast Turret, Chain Tower, Splash Tower
- **3 Enemy Types**: Swarm (fast), Tank (tough), MiniBoss (every 60s)
- **Future-Only Placement**: A time marker progresses along the path - place towers before it passes!
- **Upgrade System**: Level up towers to max level 3
- **Tier System**: Earn ranks from Attendee to Conference Legend
- **Local Leaderboard**: Top 10 scores saved locally
- **Share Card**: Generate and share your scores (mobile only)
- **Solana Theming**: Purple/green gradients, conference branding

### Tower Types

| Tower | Cost | Damage | Fire Rate | Special |
|-------|------|--------|-----------|---------|
| ⚡ Fast Turret | 50 | 8/12/18 | 3-5/s | High fire rate |
| 🔗 Chain Tower | 80 | 15/22/32 | 1.2-1.8/s | Chains to 2 enemies |
| 💥 Splash Tower | 100 | 25/40/60 | 0.7-1/s | Area damage |

### Enemy Types

| Enemy | HP | Speed | Reward |
|-------|-----|-------|--------|
| 🔴 Swarm | 25 | Fast | 10 |
| 🟥 Tank | 120 | Slow | 30 |
| 🟣 MiniBoss | 300 | Medium | 100 |

### Tier Thresholds

| Tier | Time Survived |
|------|---------------|
| ⬜ Attendee | 0-90s |
| 🟩 Builder | 90-180s |
| 🟦 Core Contributor | 180-300s |
| 🟪 Infra Guardian | 300-420s |
| 🟨 Conference Legend | 420s+ |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/breakpoint-defense.git
cd breakpoint-defense

# Install dependencies
npm install

# Start development server
npx expo start

# Run on specific platform
npx expo start --ios      # iOS Simulator
npx expo start --android  # Android Emulator
npx expo start --web      # Web Browser
```

## 📱 Running on Device

1. Install **Expo Go** from App Store / Play Store
2. Run `npx expo start`
3. Scan the QR code with your phone

## 🏗 Project Structure

```
breakpoint-defense/
├── App.tsx                    # Main app with navigation
├── index.js                   # Entry point
├── src/
│   ├── game/
│   │   ├── types.ts          # TypeScript interfaces
│   │   ├── config.ts         # Game constants, path waypoints
│   │   └── engine.ts         # Core game loop, path movement
│   ├── screens/
│   │   ├── HomeScreen.tsx    # Main menu
│   │   ├── GameScreen.tsx    # Gameplay
│   │   ├── GameOverScreen.tsx# Results + share
│   │   └── LeaderboardScreen.tsx
│   ├── components/
│   │   ├── Lane.tsx          # S-curve path rendering
│   │   ├── TowerSlotView.tsx # Tower placement
│   │   ├── EnemyView.tsx     # Enemy rendering
│   │   ├── ProjectileView.tsx
│   │   ├── BaseView.tsx      # Player base
│   │   ├── TowerSelectPopup.tsx
│   │   ├── HUD.tsx           # Game stats
│   │   ├── ShareCard.tsx     # Social share card
│   │   └── SafeArea.tsx      # Cross-platform safe area
│   ├── hooks/
│   │   ├── useGameLoop.ts    # requestAnimationFrame loop
│   │   ├── useHaptics.ts     # Haptic feedback
│   │   └── useSound.ts       # Audio (stubbed)
│   ├── storage/
│   │   ├── leaderboard.ts    # AsyncStorage scores
│   │   └── settings.ts       # User preferences
│   └── utils/
│       └── formatTime.ts     # Time formatting
├── assets/
│   └── icon.png
└── package.json
```

## 🎯 Game Architecture

### Game Loop
- **Fixed timestep** at 60fps with delta time accumulation
- **Deterministic** behavior for consistent gameplay
- Systems run in order: Spawn → Movement → Targeting → Shooting → Damage

### Path System
- Enemies follow waypoints defined in `PATH_WAYPOINTS`
- Smooth bezier curve interpolation between points
- Path progress tracked as 0-1 value

### Collision Detection
- Simple distance-based checks
- Towers target nearest enemy in range
- Projectiles home toward target position

## 🎨 Theming

The game uses Solana's brand colors:
- **Primary**: `#14F195` (Solana Green)
- **Secondary**: `#9945FF` (Solana Purple)
- **Tertiary**: `#DC1FFF` (Solana Pink)

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| expo | Development platform |
| react-native-svg | Vector graphics |
| @react-native-async-storage/async-storage | Local storage |
| react-native-view-shot | Screenshot capture |
| expo-sharing | Native share sheet |
| expo-haptics | Haptic feedback |
| expo-av | Audio (stubbed) |

## 🔧 Configuration

Key game parameters in `src/game/config.ts`:

```typescript
// Adjust difficulty
export const BASE_SPAWN_INTERVAL = 2000;  // ms between spawns
export const SPAWN_INTERVAL_DECAY = 0.92; // faster each wave
export const HP_SCALE_PER_WAVE = 1.08;    // enemies get tougher

// Biome modifiers
export const BIOME = {
  spawnRateMultiplier: 1.25,  // 25% faster spawns
  enemySpeedMultiplier: 1.1,  // 10% faster enemies
};
```

## 📝 TODO

- [ ] Add actual sound effects
- [ ] Add background music
- [ ] More biomes (Hacker House, Main Stage, etc.)
- [ ] Achievements system
- [ ] Tutorial mode
- [ ] More tower types
- [ ] Special abilities
- [ ] Online leaderboard

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ for the Solana community
