# ⚡ Solana Breakpoint Defense

A hypercasual tower defense game built with Expo React Native, themed around the Solana Breakpoint conference. Defend the network from FUD, Rug Pulls, and Network Congestion!

![Solana Breakpoint Defense](https://img.shields.io/badge/Solana-Breakpoint-14F195?style=for-the-badge&logo=solana)
![Expo](https://img.shields.io/badge/Expo-SDK_52-000020?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript)

## 🎮 Gameplay

Defend the Solana network from waves of crypto threats traveling along an S-curved path! Deploy ecosystem project towers, upgrade them, and survive as long as possible to climb the tier ranks.

### Features

- **S-Curve Path**: Enemies follow a winding path with Solana-themed gradients
- **Solana Ecosystem Towers**: Validator Node, Jupiter Aggregator, Tensor Marketplace
- **Crypto-Themed Enemies**: FUD, Rug Pulls, Network Congestion
- **SOL Currency**: Earn SOL by defeating enemies
- **Future-Only Placement**: Time marker mechanic - place towers before it passes!
- **Upgrade System**: Level up towers to max level 3
- **Crypto Tier Ranks**: Paper Hands → Diamond Hands → Degen → Whale → Satoshi
- **Local Leaderboard**: Top 10 scores saved locally
- **Share Card**: Generate and share your scores
- **Solana Branding**: Purple/green gradients, ecosystem iconography

### Tower Types (Solana Ecosystem)

| Tower | Icon | Cost | Damage | Special |
|-------|------|------|--------|---------|
| ⚡ Validator Node | ⚡ | 50 SOL | 8/12/18 | High TPS (fast fire rate) |
| 🪐 Jupiter Aggregator | 🪐 | 80 SOL | 15/22/32 | Routes damage (chains to 2 enemies) |
| 💎 Tensor Marketplace | 💎 | 100 SOL | 25/40/60 | Floor sweep (splash damage) |

### Enemy Types (Crypto Threats)

| Enemy | Icon | HP | Speed | Description |
|-------|------|-----|-------|-------------|
| 😱 FUD | 😱 | 25 | Fast | Fear, Uncertainty, Doubt |
| 🧹 Rug Pull | 🧹 | 120 | Slow | Tanky scam attempts |
| 🚧 Network Congestion | 🚧 | 300 | Medium | Mini-boss (every 60s) |

### Tier Ranks

| Tier | Icon | Time Survived | Description |
|------|------|---------------|-------------|
| 📄 Paper Hands | 📄 | 0-90s | Just getting started |
| 💎 Diamond Hands | 💎 | 90-180s | Holding strong |
| 🎰 Degen | 🎰 | 180-300s | True believer |
| 🐋 Whale | 🐋 | 300-420s | Major player |
| 👑 Satoshi | 👑 | 420s+ | Legendary status |

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/andreolf/BreakpointDefense.git
cd BreakpointDefense

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
│   │   ├── config.ts         # Game constants, path waypoints, Solana theming
│   │   └── engine.ts         # Core game loop, path movement
│   ├── screens/
│   │   ├── HomeScreen.tsx    # Main menu with Solana branding
│   │   ├── GameScreen.tsx    # Gameplay
│   │   ├── GameOverScreen.tsx# Results + share
│   │   └── LeaderboardScreen.tsx
│   ├── components/
│   │   ├── Lane.tsx          # S-curve path with gradients
│   │   ├── TowerSlotView.tsx # Tower placement
│   │   ├── EnemyView.tsx     # Crypto-themed enemies
│   │   ├── ProjectileView.tsx
│   │   ├── BaseView.tsx      # Solana Network node
│   │   ├── TowerSelectPopup.tsx
│   │   ├── HUD.tsx           # Game stats with SOL display
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
- Smooth interpolation between points
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
- **Blue**: `#00D1FF` (Solana Blue)

### Visual Features
- Gradient backgrounds with grid patterns
- Glowing effects on towers and projectiles
- Animated S-curve path with pulsing time marker
- Solana logos as decorative elements
- Crypto-themed enemy designs (spiky FUD, carpet rug pulls, warning triangles)

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| expo | Development platform |
| react-native-svg | Vector graphics for all game elements |
| @react-native-async-storage/async-storage | Local storage for leaderboard |
| react-native-view-shot | Screenshot capture for sharing |
| expo-sharing | Native share sheet |
| expo-haptics | Haptic feedback |
| expo-av | Audio (stubbed for now) |

## 🔧 Configuration

Key game parameters in `src/game/config.ts`:

```typescript
// Adjust difficulty
export const GAME_CONFIG = {
  baseSpawnInterval: 2000,    // ms between spawns
  spawnIntervalDecay: 0.92,   // faster each wave
  hpScalePerWave: 1.08,       // enemies get tougher
  startingSOL: 150,           // starting currency
  startingBaseHP: 100,        // network health
};

// Biome modifiers
export const BIOME = {
  name: 'Solana Breakpoint',
  spawnRateMultiplier: 1.25,  // 25% faster spawns
  enemySpeedMultiplier: 1.1,  // 10% faster enemies
};
```

## 📝 TODO

- [ ] Add actual sound effects
- [ ] Add background music
- [ ] More biomes (Hacker House, Main Stage, etc.)
- [ ] More tower types (Phantom, Marinade, Jito)
- [ ] More enemy types (Exploits, Bear Markets)
- [ ] Achievements system
- [ ] Tutorial mode
- [ ] Special abilities
- [ ] Online leaderboard
- [ ] NFT integration for scores

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ for the Solana community

**#SolanaBreakpoint #TowerDefense #Web3Gaming**
